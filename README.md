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
- **Shop** — 570 个商品、分类筛选、排序、搜索、Load More
- **商品详情** — 动态商品详情、图片画廊、相关商品
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

- 商品图片保存在 `public/catalog/`，覆盖全部 570 个商品；维护方法见 [商品图片维护](docs/catalog-images.md)
- 购物车数据保存在浏览器 localStorage
- 注册、登录和订单使用 PostgreSQL 后端；尚未接入在线支付

## 商品数据同步

- 配置 `DATABASE_URL` 后，首页、商城、搜索和商品详情均以数据库中的已发布商品为准。
- 后台新增、编辑、下架或删除后，前台在下一次页面请求时读取新数据，无需重新构建。已打开的页面需刷新。
- 首页保留精选商品顺序，但标题、价格、图片和上架状态实时来自数据库；已删除或下架的精选项由其他已发布商品补位。
- 仅未配置 `DATABASE_URL` 时使用 JSON 演示目录。数据库为空或连接失败时不会回退到初始目录，避免重新展示已删除商品。
