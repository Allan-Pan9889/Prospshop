# ProspShop Clone

https://prospshop.in 的像素级前端复刻项目。

## 技术栈

- Next.js 15 (App Router)
- React 19
- TypeScript
- CSS（复刻 WoodMart 主题样式）

## 功能

### 页面
- **首页** — Banner、Our Recommendations、Best Collection
- **Shop** — 284+ 商品、分类筛选、排序、搜索、Load More
- **商品详情** — 284 个静态页面、图片画廊、相关商品
- **About us / Contact us** — 内容页 + 联系表单
- **Basket / Checkout** — 购物车与结账流程
- **My Account** — 登录/注册表单
- **政策页面** — Privacy、Terms、Refund、Return、Shipping

### 交互
- 购物车（localStorage 持久化）
- Quick View 弹窗
- 登录/注册弹窗
- 购物车侧边栏
- 全屏搜索（实时结果）
- 粘性 Header、Cookie 横幅、移动端工具栏

## 认证（NextAuth.js + PostgreSQL）

使用 **NextAuth.js v5** + **Drizzle ORM** + **PostgreSQL** 实现注册/登录。

### 环境配置

复制 `.env.example` 为 `.env.local` 并填写：

```bash
DATABASE_URL=postgresql://prospshop:prospshop@localhost:5432/prospshop
AUTH_SECRET=<openssl rand -base64 32>
AUTH_URL=http://localhost:3005
```

### 数据库

**方式一：Docker**
```bash
npm run db:up
npm run db:push
```

**方式二：本地 PostgreSQL（Homebrew）**
```bash
# 创建数据库后
npm run db:push
```

### 功能

- 用户注册（`/api/auth/register`）
- 邮箱密码登录（NextAuth Credentials）
- JWT 会话持久化
- Header 显示登录用户名 / 退出
- `/my-account` 登录后显示账户信息

### 启动

```bash
npm install
npm run db:push
npm run dev
```

访问 http://localhost:3000

## 项目结构

```
app/                  # 页面路由
components/           # UI 组件
contexts/             # Cart + Modal 状态管理
data/                 # 商品 JSON 数据
lib/                  # 工具函数
public/assets/        # Logo、Banner 本地资源
```

## 说明

- 商品图片使用 prospshop.in 原始 CDN
- 购物车数据保存在浏览器 localStorage
- 结账/登录为前端模拟，无真实后端
