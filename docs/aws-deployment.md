# ProspShop AWS 部署指南

本文档说明如何将 ProspShop（Next.js 15 + PostgreSQL + NextAuth）部署到 AWS。

> **当前推荐方案：单台 EC2 + 本机 PostgreSQL（Docker）**  
> 不使用 RDS，以控制成本。应用与数据库运行在同一台服务器上，数据库仅监听 `127.0.0.1`，不对外暴露。

---

## 1. 概述

### 应用特点

| 项目 | 说明 |
|------|------|
| 框架 | Next.js 15 App Router（SSR + API Routes） |
| 数据库 | PostgreSQL 16（本机 Docker 容器） |
| 认证 | NextAuth.js v5（Credentials + JWT） |
| 构建 | `npm run build` 生成约 597 个静态/预渲染页面 |
| 运行时 | 连接本机 PostgreSQL；无 DB 时回退到 JSON 商品数据 |

### 推荐架构（低成本）

```
  用户 ──HTTPS──▶  Nginx（443）
                      │
                      ▼
                 Next.js（PM2，:3000）
                      │
                      ▼ 127.0.0.1:5432
                 PostgreSQL（Docker）
                      │
                      ▼
                 EBS 卷持久化数据
```

**一台 EC2 搞定：** Web 应用 + 数据库 + 反向代理，无需 RDS、ALB、ECS。

| 方案 | 适用场景 | 月成本（约） |
|------|----------|--------------|
| **[方案 A：EC2 + 本机 PostgreSQL](#方案-aec2--本机-postgresql推荐)** | 正式运营、成本优先 | ~$15–25 |
| [方案 B：GitHub Actions 自动部署](#方案-bgithub-actions-自动部署到-ec2) | 同上 + 自动发布 | ~$15–25 |
| [附录：RDS / Amplify / ECS](#附录其他方案不推荐) | 预算充足时再考虑 | $50+ |

---

## 2. 前置准备

### 2.1 AWS 账号与工具

- AWS 账号（建议区域：`ap-south-1` 孟买）
- SSH 密钥对
- 代码仓库：https://github.com/Allan-Pan9889/Prospshop

### 2.2 环境变量

| 变量 | 说明 | 生产示例 |
|------|------|----------|
| `DATABASE_URL` | 本机 PostgreSQL 连接串 | `postgresql://prospshop:<密码>@127.0.0.1:5432/prospshop` |
| `POSTGRES_PASSWORD` | Docker 数据库密码（与上面一致） | 强密码 |
| `AUTH_SECRET` | NextAuth 签名密钥 | `openssl rand -base64 32` |
| `AUTH_URL` | 站点完整 URL | `https://www.prospshop.com` |
| `NODE_ENV` | 生产环境 | `production` |

生成密钥：

```bash
openssl rand -base64 32   # AUTH_SECRET
openssl rand -base64 24   # POSTGRES_PASSWORD（示例）
```

> **重要：** `AUTH_URL` 必须与用户浏览器地址栏完全一致（含 `https`）。

> **本机数据库无需** `?sslmode=require`（仅 RDS 等远程托管数据库需要）。

---

## 方案 A：EC2 + 本机 PostgreSQL（推荐）

### A.1 创建 EC2 实例

| 配置 | 建议 |
|------|------|
| AMI | Amazon Linux 2023 或 Ubuntu 22.04 |
| 实例类型 | `t3.small`（2 vCPU / 2GB，构建 + DB 够用） |
| 存储 | **40GB gp3**（系统 + 数据库 + 构建缓存） |
| 安全组入站 | 22（SSH，仅限运维 IP）、80、443 |
| 安全组入站 | **不要开放 5432** |
| 弹性 IP | 建议绑定，避免重启换 IP |

### A.2 安装依赖

```bash
# Amazon Linux 2023
sudo dnf update -y
sudo dnf install -y docker git nginx
sudo systemctl enable --now docker
sudo usermod -aG docker ec2-user
# 重新登录 SSH 使 docker 组生效

# Docker Compose 插件
sudo dnf install -y docker-compose-plugin

# Node.js 22
curl -fsSL https://rpm.nodesource.com/setup_22.x | sudo bash -
sudo dnf install -y nodejs
```

Ubuntu 22.04 将 `dnf` 换为 `apt`，Docker 安装方式参考 [Docker 官方文档](https://docs.docker.com/engine/install/ubuntu/)。

### A.3 拉取代码

```bash
git clone https://github.com/Allan-Pan9889/Prospshop.git
cd Prospshop
```

### A.4 启动本机 PostgreSQL

创建 `.env`（供 Docker Compose 读取，**不要提交 Git**）：

```bash
cat > .env <<'EOF'
POSTGRES_PASSWORD=你的强密码
EOF
```

启动数据库（使用生产 compose 文件，仅绑定本机）：

```bash
docker compose -f docker-compose.prod.yml up -d
docker compose -f docker-compose.prod.yml ps
```

验证：

```bash
docker exec prospshop-db pg_isready -U prospshop -d prospshop
```

### A.5 配置应用环境变量

```bash
cp .env.example .env.local
```

编辑 `.env.local`：

```bash
DATABASE_URL=postgresql://prospshop:你的强密码@127.0.0.1:5432/prospshop
AUTH_SECRET=你的AUTH_SECRET
AUTH_URL=https://www.prospshop.com
NODE_ENV=production
```

### A.6 初始化数据库

```bash
npm ci
npm run db:push
npm run db:seed
npm run build
```

初始化完成后：

- 管理员：`admin@prospshop.in` / `admin123456`
- **部署后务必修改管理员密码**

### A.7 使用 PM2 守护 Next.js

```bash
sudo npm install -g pm2
pm2 start npm --name prospshop -- start
pm2 save
pm2 startup    # 按提示执行输出的 sudo 命令
```

应用监听 **3000** 端口。

### A.8 Nginx 反向代理 + HTTPS

```bash
sudo dnf install -y certbot python3-certbot-nginx
```

`/etc/nginx/conf.d/prospshop.conf`：

```nginx
server {
    listen 80;
    server_name www.prospshop.com prospshop.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo nginx -t && sudo systemctl enable --now nginx
sudo certbot --nginx -d www.prospshop.com -d prospshop.com
```

证书签发后，确认 `.env.local` 中 `AUTH_URL` 与域名一致，重启应用：

```bash
pm2 restart prospshop
```

### A.9 日常运维命令

```bash
# 应用
pm2 status
pm2 logs prospshop
pm2 restart prospshop

# 数据库
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs postgres
docker compose -f docker-compose.prod.yml restart postgres

# 更新代码
cd ~/Prospshop
git pull
npm ci
npm run build
pm2 restart prospshop
```

---

## 3. 数据库备份（必做）

本机数据库没有 RDS 自动备份，需自行配置。

### 3.1 手动备份

```bash
mkdir -p ~/backups
docker exec prospshop-db pg_dump -U prospshop prospshop \
  | gzip > ~/backups/prospshop-$(date +%F).sql.gz
```

### 3.2 定时备份（cron，每天 3:00）

```bash
crontab -e
```

添加：

```cron
0 3 * * * docker exec prospshop-db pg_dump -U prospshop prospshop | gzip > /home/ec2-user/backups/prospshop-$(date +\%F).sql.gz
```

### 3.3 上传到 S3（推荐）

```bash
# 安装 AWS CLI 后
aws s3 cp ~/backups/prospshop-$(date +%F).sql.gz s3://你的备份桶/prospshop/
```

cron 示例（备份 + 上传 + 保留本地 7 天）：

```cron
0 3 * * * docker exec prospshop-db pg_dump -U prospshop prospshop | gzip > /home/ec2-user/backups/prospshop-$(date +\%F).sql.gz && aws s3 cp /home/ec2-user/backups/prospshop-$(date +\%F).sql.gz s3://你的备份桶/prospshop/ && find /home/ec2-user/backups -name "*.sql.gz" -mtime +7 -delete
```

### 3.4 恢复备份

```bash
gunzip -c ~/backups/prospshop-2026-07-08.sql.gz | docker exec -i prospshop-db psql -U prospshop -d prospshop
```

---

## 4. 部署后检查清单

- [ ] 首页、Shop、商品详情正常加载
- [ ] 用户注册 / 登录 / 登出正常
- [ ] 登录用户下单后 `/my-account` 可见订单
- [ ] `/admin` 仅 admin 可访问
- [ ] 已修改默认管理员密码
- [ ] **5432 未对公网开放**（`ss -tlnp | grep 5432` 应只看到 `127.0.0.1`）
- [ ] `AUTH_URL` 与浏览器地址栏一致
- [ ] 定时备份 cron 已配置
- [ ] PM2、Docker 均设置开机自启

---

## 方案 B：GitHub Actions 自动部署到 EC2

在方案 A 服务器就绪后，push 到 `main` 自动部署。

`.github/workflows/deploy-ec2.yml`：

```yaml
name: Deploy to EC2

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Deploy via SSH
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.EC2_HOST }}
          username: ec2-user
          key: ${{ secrets.EC2_SSH_KEY }}
          script: |
            cd ~/Prospshop
            git pull origin main
            npm ci
            npm run build
            pm2 restart prospshop
```

GitHub Secrets：

| Secret | 说明 |
|--------|------|
| `EC2_HOST` | EC2 公网 IP 或域名 |
| `EC2_SSH_KEY` | SSH 私钥全文 |

> 数据库迁移（`db:push` / `db:seed`）仅在 schema 变更时手动执行，不要每次 deploy 都 seed。

---

## 5. 域名与 HTTPS

- DNS：`www.prospshop.com` → EC2 弹性 IP（A 记录）
- HTTPS：Certbot + Nginx（见 A.8）
- 证书自动续期：`certbot renew` 由 systemd timer 处理

---

## 6. 常见问题

### 构建内存不足

`npm run build` 需预渲染 597 页，至少 **2GB RAM**。若 OOM，临时加 swap：

```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

### 登录后 Session 丢失

- 检查 `AUTH_URL` 是否与访问域名一致
- Nginx 需转发 `X-Forwarded-Proto` 和 `Host`（见 A.8 配置）

### 数据库连接失败

```bash
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs postgres
```

确认 `DATABASE_URL` 使用 `127.0.0.1`，密码与 `.env` 中 `POSTGRES_PASSWORD` 一致。

### 磁盘空间不足

```bash
df -h
docker system df
```

定期清理旧备份、`.next` 缓存；商品图片走 CDN，不占本地盘。

### 商品数据与 Admin 不一致

```bash
npm run db:seed    # 仅首次或空库时
npm run db:patch
npm run db:sync-json
```

---

## 7. 成本参考（ap-south-1，本机数据库方案）

| 资源 | 月成本（约） |
|------|--------------|
| EC2 t3.small | ~$15 |
| EBS 40GB gp3 | ~$4 |
| 弹性 IP（绑定实例时免费） | $0 |
| S3 备份（少量） | ~$1 |
| **合计** | **~$20/月** |

对比 RDS db.t4g.micro 单独约 **$15/月**，且不含 EC2。本方案一台机器全部搞定，适合当前预算。

---

## 8. 相关命令速查

```bash
# 本地开发
npm run dev -- -p 3005
npm run db:up                    # docker-compose.yml（开发用）

# 生产数据库
docker compose -f docker-compose.prod.yml up -d
docker compose -f docker-compose.prod.yml down

# 数据库维护
npm run db:push
npm run db:seed
npm run db:patch
npm run db:sync-json

# 生产运行
npm run build && npm start       # 或由 PM2 管理
```

---

## 9. 安全建议

1. **立即修改** seed 创建的默认管理员密码
2. PostgreSQL **仅监听 127.0.0.1**，安全组不开放 5432
3. 使用强 `POSTGRES_PASSWORD` 和 `AUTH_SECRET`
4. SSH 仅允许运维 IP，禁用密码登录、使用密钥
5. 配置数据库定时备份并上传 S3
6. 可选：Nginx 对 `/admin` 做 IP 白名单
7. 定期 `dnf update` / `apt upgrade` 和 `npm audit`

---

## 附录：其他方案（不推荐）

### 为什么不推荐 RDS？

- 最小实例约 $15/月，与应用 EC2 叠加后成本高
- 当前流量与数据量，本机 PostgreSQL 完全够用
- 通过 Docker 卷 + 定时 pg_dump 可满足备份需求

若未来流量显著增长，再考虑迁移到 RDS：用 `pg_dump` 导出 → RDS 导入 → 修改 `DATABASE_URL` 即可。

### Amplify / ECS Fargate

- **Amplify**：托管前端，仍需外部数据库；无法在本机跑 PostgreSQL，需 RDS 或第二台 EC2
- **ECS Fargate**：容器编排 + ALB，成本高，数据库仍需 RDS 或独立 EC2

当前阶段 **不建议** 使用以上方案。

---

**仓库：** https://github.com/Allan-Pan9889/Prospshop  
**文档版本：** 2026-07-08（本机 PostgreSQL 方案）
