# ProspShop AWS 部署指南

本文档说明如何将 ProspShop（Next.js 15 + PostgreSQL + NextAuth）部署到 AWS。

---

## 1. 概述

### 应用特点

| 项目 | 说明 |
|------|------|
| 框架 | Next.js 15 App Router（SSR + API Routes） |
| 数据库 | PostgreSQL（Drizzle ORM） |
| 认证 | NextAuth.js v5（Credentials + JWT） |
| 构建 | `npm run build` 生成约 597 个静态/预渲染页面 |
| 运行时 | 需连接 PostgreSQL；无 DB 时回退到 JSON 商品数据 |

### 推荐架构

```
                    ┌─────────────┐
  用户 ──HTTPS──▶  │ CloudFront  │（可选）
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │  ALB /      │
                    │  Amplify    │  Next.js 应用
                    └──────┬──────┘
                           │ 5432（VPC 内网）
                    ┌──────▼──────┐
                    │  RDS        │  PostgreSQL 16
                    │  PostgreSQL │
                    └─────────────┘
```

**方案选择：**

| 方案 | 适用场景 | 复杂度 |
|------|----------|--------|
| [方案 A：Amplify](#方案-aaws-amplify推荐快速上线) | 快速上线、自动 CI/CD | ⭐⭐ |
| [方案 B：EC2 + Docker](#方案-bec2--docker) | 与本地环境一致、成本可控 | ⭐⭐⭐ |
| [方案 C：ECS Fargate](#方案-cecs-fargate--rds生产推荐) | 生产环境、可扩展 | ⭐⭐⭐⭐ |

---

## 2. 前置准备

### 2.1 AWS 账号与工具

- AWS 账号（建议区域：`ap-south-1` 孟买，离 Chennai 较近）
- 已安装 [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html) 并完成 `aws configure`
- 代码已在 GitHub：`https://github.com/Allan-Pan9889/Prospshop`

### 2.2 环境变量

生产环境必须配置以下变量（**不要**提交到 Git）：

| 变量 | 说明 | 示例 |
|------|------|------|
| `DATABASE_URL` | PostgreSQL 连接串 | `postgresql://user:pass@host:5432/prospshop?sslmode=require` |
| `AUTH_SECRET` | NextAuth 签名密钥 | `openssl rand -base64 32` 生成 |
| `AUTH_URL` | 站点完整 URL（含协议） | `https://www.prospshop.com` |
| `NODE_ENV` | 固定为 `production` | `production` |

生成 `AUTH_SECRET`：

```bash
openssl rand -base64 32
```

> **重要：** `AUTH_URL` 必须与用户访问的域名完全一致（含 `https`），否则登录回调会失败。

---

## 3. 创建 RDS PostgreSQL

三种方案共用此步骤。

### 3.1 控制台创建

1. 打开 **RDS → Create database**
2. 引擎：**PostgreSQL 16**
3. 模板：**Free tier**（测试）或 **Production**
4. 设置：
   - DB identifier：`prospshop-db`
   - Master username：`prospshop`
   - Master password：强密码（记录备用）
   - DB name：`prospshop`
5. 实例：`db.t4g.micro`（测试）/ `db.t4g.small`（生产）
6. **Storage**：默认 20GB gp3
7. **Connectivity**：
   - VPC：默认或专用 VPC
   - **Public access**：测试可 Yes；生产建议 No，应用与 DB 同 VPC
   - VPC security group：新建 `prospshop-db-sg`
8. **Additional configuration → Initial database name**：`prospshop`

### 3.2 安全组规则

`prospshop-db-sg` 入站规则：

| 类型 | 端口 | 来源 | 说明 |
|------|------|------|------|
| PostgreSQL | 5432 | 应用安全组 ID | 生产推荐 |
| PostgreSQL | 5432 | 你的公网 IP/32 | 仅本地初始化 DB 时临时开放 |

### 3.3 连接串格式

```bash
DATABASE_URL=postgresql://prospshop:<PASSWORD>@<RDS_ENDPOINT>:5432/prospshop?sslmode=require
```

RDS 控制台 → 数据库 → **Connectivity & security** → **Endpoint** 即为 `<RDS_ENDPOINT>`。

---

## 4. 初始化数据库

在**能访问 RDS 的机器**上执行（本地电脑、EC2、CloudShell 均可）：

```bash
git clone https://github.com/Allan-Pan9889/Prospshop.git
cd Prospshop
npm install

# 写入生产环境变量
cp .env.example .env.local
# 编辑 .env.local，填入 DATABASE_URL、AUTH_SECRET、AUTH_URL

# 推送表结构
npm run db:push

# 导入商品数据 + 创建管理员（约 570 个商品）
npm run db:seed
```

初始化完成后：

- 管理员：`admin@prospshop.in` / `admin123456`
- **部署后务必修改管理员密码**

可选补丁脚本：

```bash
npm run db:patch      # 修复特定商品数据
npm run db:sync-json  # 同步 JSON 与 DB
```

---

## 方案 A：AWS Amplify（推荐快速上线）

Amplify 支持 Next.js SSR，与 GitHub 自动集成，适合快速上线。

### A.1 创建应用

1. **Amplify → Hosting → Get started → GitHub**
2. 选择仓库 `Allan-Pan9889/Prospshop`，分支 `main`
3. 构建设置（Amplify 通常自动检测 Next.js）：

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: .next
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
      - .next/cache/**/*
```

> 若 Amplify Gen 2 自动检测 Next.js，可保留默认配置，仅需确认 build 命令为 `npm run build`。

### A.2 环境变量

Amplify 控制台 → **App settings → Environment variables**：

```
DATABASE_URL=postgresql://...
AUTH_SECRET=...
AUTH_URL=https://<your-amplify-domain>.amplifyapp.com
NODE_ENV=production
```

### A.3 连接 RDS（VPC）

RDS 若设为 **Private**，Amplify 需配置 VPC：

1. Amplify → **App settings → VPC**
2. 选择与 RDS 相同的 VPC、子网
3. 应用安全组允许出站到 RDS 5432

### A.4 自定义域名

1. Amplify → **Domain management → Add domain**
2. 在 Route 53 或域名 DNS 添加 CNAME
3. 更新 `AUTH_URL` 为自定义域名，重新部署

### A.5 验证

- 首页、Shop、商品详情页可访问
- 注册 / 登录正常
- `/admin` 管理员可进入
- `/my-account` 可查看订单历史

---

## 方案 B：EC2 + Docker

与本地 `docker compose` 最接近，适合单实例部署。

### B.1 启动 EC2

| 配置 | 建议 |
|------|------|
| AMI | Amazon Linux 2023 或 Ubuntu 22.04 |
| 实例类型 | `t3.small`（2 vCPU / 2GB，构建需内存） |
| 存储 | 30GB gp3 |
| 安全组 | 入站 22（SSH）、80、443；出站全部 |

### B.2 安装依赖

```bash
# Amazon Linux 2023 示例
sudo dnf update -y
sudo dnf install -y docker git
sudo systemctl enable --now docker
sudo usermod -aG docker ec2-user

# 安装 Node.js 22
curl -fsSL https://rpm.nodesource.com/setup_22.x | sudo bash -
sudo dnf install -y nodejs
```

### B.3 部署应用

```bash
git clone https://github.com/Allan-Pan9889/Prospshop.git
cd Prospshop

cp .env.example .env.local
# 编辑 .env.local（DATABASE_URL 指向 RDS）

npm ci
npm run db:push
npm run db:seed
npm run build
```

### B.4 使用 PM2 守护进程

```bash
sudo npm install -g pm2
pm2 start npm --name prospshop -- start
pm2 save
pm2 startup
```

应用默认监听 **3000** 端口。

### B.5 Nginx 反向代理 + HTTPS

```bash
sudo dnf install -y nginx certbot python3-certbot-nginx
```

`/etc/nginx/conf.d/prospshop.conf`：

```nginx
server {
    listen 80;
    server_name www.prospshop.com;

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
sudo certbot --nginx -d www.prospshop.com
```

更新 `.env.local` 中 `AUTH_URL=https://www.prospshop.com`，重启应用：

```bash
pm2 restart prospshop
```

---

## 方案 C：ECS Fargate + RDS（生产推荐）

适合需要自动扩缩、高可用的生产环境。

### C.1 组件清单

| 组件 | AWS 服务 |
|------|----------|
| 容器镜像 | ECR |
| 运行 | ECS Fargate |
| 负载均衡 | Application Load Balancer |
| 数据库 | RDS PostgreSQL |
| 密钥 | Secrets Manager |
| 域名 / HTTPS | Route 53 + ACM |
| 日志 | CloudWatch Logs |

### C.2 Dockerfile

在项目根目录创建 `Dockerfile`：

```dockerfile
FROM node:22-alpine AS base

FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
```

> **注意：** Dockerfile 使用 Next.js `standalone` 输出。需在 `next.config.ts` 中加入：

```typescript
const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "prospshop.in" },
    ],
  },
};
```

`.dockerignore`：

```
node_modules
.next
.git
.env*.local
drizzle
```

### C.3 构建并推送镜像

```bash
aws ecr create-repository --repository-name prospshop --region ap-south-1

AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
ECR_URI=$AWS_ACCOUNT_ID.dkr.ecr.ap-south-1.amazonaws.com/prospshop

aws ecr get-login-password --region ap-south-1 | \
  docker login --username AWS --password-stdin $ECR_URI

docker build -t prospshop .
docker tag prospshop:latest $ECR_URI:latest
docker push $ECR_URI:latest
```

### C.4 Secrets Manager

存储敏感环境变量：

```bash
aws secretsmanager create-secret \
  --name prospshop/prod \
  --secret-string '{
    "DATABASE_URL":"postgresql://...",
    "AUTH_SECRET":"...",
    "AUTH_URL":"https://www.prospshop.com"
  }'
```

ECS Task Definition 中通过 `secrets` 字段注入。

### C.5 ECS 服务要点

- **Task CPU/Memory**：512 CPU / 1024 MB 起步；构建已在镜像内完成
- **Desired count**：生产至少 2（跨可用区）
- **Health check**：ALB 路径 `/`，期望 200
- **Security Group**：应用 SG 出站 → RDS SG 5432
- **环境变量**：`NODE_ENV=production`

### C.6 数据库迁移

镜像内不含 `drizzle-kit`。迁移应在 CI/CD 或一次性 Task 中执行：

```bash
# 本地或 CI，指向生产 RDS
DATABASE_URL=... npm run db:push
DATABASE_URL=... npm run db:seed
```

---

## 5. 域名与 HTTPS

| 方案 | HTTPS 配置 |
|------|------------|
| Amplify | 控制台自动签发 ACM 证书 |
| EC2 | Certbot + Nginx |
| ECS | ACM 证书挂载到 ALB（443 → Target Group 3000） |

DNS 示例（Route 53）：

```
www.prospshop.com  CNAME  <ALB 或 Amplify 域名>
```

---

## 6. 部署后检查清单

- [ ] 首页、Shop、商品详情正常加载
- [ ] 图片来自 `prospshop.in` CDN 可显示（已在 `next.config.ts` 配置）
- [ ] 用户注册 / 登录 / 登出正常
- [ ] 登录用户下单后 `/my-account` 可见订单
- [ ] `/admin` 仅 admin 角色可访问
- [ ] 已修改默认管理员密码
- [ ] RDS 未对 `0.0.0.0/0` 开放 5432
- [ ] `AUTH_URL` 与浏览器地址栏一致
- [ ] CloudWatch / Amplify 日志无持续报错

---

## 7. CI/CD 示例（GitHub Actions → ECR → ECS）

`.github/workflows/deploy-ecs.yml` 参考：

```yaml
name: Deploy to ECS

on:
  push:
    branches: [main]

env:
  AWS_REGION: ap-south-1
  ECR_REPOSITORY: prospshop
  ECS_SERVICE: prospshop-service
  ECS_CLUSTER: prospshop-cluster

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ env.AWS_REGION }}

      - name: Login to ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v2

      - name: Build and push
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          IMAGE_TAG: ${{ github.sha }}
        run: |
          docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG .
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG

      - name: Deploy to ECS
        run: |
          aws ecs update-service \
            --cluster $ECS_CLUSTER \
            --service $ECS_SERVICE \
            --force-new-deployment
```

GitHub Secrets 需配置：`AWS_ACCESS_KEY_ID`、`AWS_SECRET_ACCESS_KEY`。

---

## 8. 常见问题

### 构建超时 / 内存不足

`npm run build` 需预渲染 597 页，建议构建环境至少 **2GB RAM**。Amplify 默认构建实例通常足够；EC2 请用 `t3.small` 及以上。

### 登录后跳回首页 / Session 丢失

- 检查 `AUTH_URL` 是否与访问域名一致
- 确认 ALB / Nginx 转发了 `X-Forwarded-Proto` 和 `Host`
- `AUTH_SECRET` 在多实例间必须相同

### 商品页数据与 Admin 不一致

- 运行时优先读 PostgreSQL；构建阶段读 JSON
- 确保已执行 `npm run db:seed`
- 修改 JSON 后执行 `npm run db:sync-json` 和 `npm run db:patch`

### RDS 连接失败

- 安全组是否允许应用 → 5432
- 连接串是否含 `?sslmode=require`（RDS 默认要求 SSL）
- RDS 与应用是否在同一 VPC（私有 RDS）

### 图片无法显示

确认 `next.config.ts` 中 `remotePatterns` 包含 `prospshop.in`（已配置）。

---

## 9. 成本参考（ap-south-1，按需估算）

| 资源 | 测试环境 / 月 | 生产环境 / 月 |
|------|---------------|---------------|
| RDS db.t4g.micro | ~$15 | — |
| RDS db.t4g.small | — | ~$30 |
| EC2 t3.small | ~$15 | — |
| ECS Fargate 0.5 vCPU × 2 | — | ~$30 |
| ALB | — | ~$20 |
| Amplify Hosting | ~$5–15（按流量） | ~$15–50 |
| CloudFront（可选） | ~$1–5 | 按流量 |

> 实际费用以 AWS 账单为准；测试环境可用 Free Tier 降低首年成本。

---

## 10. 相关命令速查

```bash
# 本地开发
npm run dev -- -p 3005

# 生产构建
npm run build && npm start

# 数据库
npm run db:up          # 本地 Docker PostgreSQL
npm run db:push        # 同步表结构
npm run db:seed        # 导入商品 + 管理员
npm run db:patch       # 补丁特定商品
npm run db:sync-json   # JSON ↔ 数据同步
```

---

## 11. 安全建议

1. **立即修改** seed 创建的默认管理员密码
2. RDS 使用强密码，启用自动备份（7 天保留）
3. 生产环境 `AUTH_SECRET` 存入 Secrets Manager，不要写在代码或明文环境文件
4. 限制 `/admin` 访问（可选：IP 白名单、WAF 规则）
5. 启用 AWS CloudWatch 告警（5xx 错误、RDS CPU/存储）
6. 定期更新依赖：`npm audit`

---

**仓库：** https://github.com/Allan-Pan9889/Prospshop  
**文档版本：** 2026-07-08
