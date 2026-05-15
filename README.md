# 剧本圈 (Juben Circle)

剧本杀爱好者交流社区 — 类贴吧论坛，支持发帖、评论（楼中楼）、点赞、收藏、关注等。

## 技术栈

- **前端**：Next.js 14 (App Router) + TypeScript + TailwindCSS
- **后端**：Next.js API Routes
- **数据库**：PostgreSQL 16 + Prisma ORM
- **缓存**：Redis 7
- **认证**：NextAuth.js (Credentials Provider)
- **部署**：Docker Compose (app + postgres + redis + nginx)

## 功能特性

- ✅ 游客浏览 + 账号注册/登录（微信占位）
- ✅ 4 个预置话题：玩家红榜/黑榜、DM红榜/黑榜
- ✅ 管理员可创建/编辑/删除自定义话题
- ✅ 发帖：文字 + 图片（最多9张）
- ✅ 评论：支持楼中楼（两层嵌套）
- ✅ 互动：点赞、收藏、关注用户/话题、举报
- ✅ 个人中心：编辑资料、我的帖子/收藏/关注
- ✅ 搜索帖子
- ✅ 管理员：删帖、删评论、封号
- ✅ 黑蓝主题 UI，PC + 移动端自适应
- ✅ Docker 一键部署

## 本地开发

### 前置要求

- Node.js 20+
- pnpm 8+
- PostgreSQL 16
- Redis 7

### 安装

```bash
# 克隆仓库
git clone <repo-url>
cd jvbentieba

# 安装依赖
pnpm install

# 配置环境变量
cp .env.example .env.local
# 编辑 .env.local 填入数据库连接等信息

# 数据库迁移
pnpm db:migrate

# 初始化数据（4个话题 + 管理员账号）
pnpm db:seed

# 启动开发服务器
pnpm dev
```

访问 http://localhost:3000

### 默认管理员账号

- 邮箱：admin@juben.com
- 密码：admin123456

## 生产部署（Docker）

### 1. 准备服务器

确保安装了 Docker 和 Docker Compose。

### 2. 配置

```bash
# 复制环境变量文件
cp .env.example .env.production

# 编辑 .env.production
# 重要：修改以下值
# - DATABASE_URL=postgresql://juben:<你的密码>@postgres:5432/juben
# - REDIS_URL=redis://redis:6379
# - NEXTAUTH_SECRET=<生成随机密钥: openssl rand -base64 32>
# - NEXTAUTH_URL=https://你的域名
# - ADMIN_PASSWORD=<设置管理员密码>
```

### 3. 构建和启动

```bash
cd docker
DB_PASSWORD=你的数据库密码 docker compose up -d --build
```

### 4. 初始化数据库

```bash
# 运行数据库迁移
docker compose exec app npx prisma migrate deploy

# 初始化数据
docker compose exec app node prisma/seed.js
```

### 5. HTTPS（可选）

1. 将 SSL 证书放到 `certs/` 目录（fullchain.pem + privkey.pem）
2. 取消 `docker/nginx.conf` 中 HTTPS 部分的注释
3. 重启 nginx：`docker compose restart nginx`

## 目录结构

```
├── app/              # Next.js App Router 页面和 API
│   ├── (public)/     # 公开页面（游客可见）
│   ├── (auth)/       # 登录/注册页
│   ├── (app)/        # 需登录页面
│   └── api/          # API Routes
├── components/       # React 组件
├── lib/              # 工具函数（db/auth/upload/utils）
├── prisma/           # 数据库 schema 和 seed
├── docker/           # 部署配置
├── uploads/          # 图片上传目录
└── public/           # 静态资源
```

## 环境变量

| 变量 | 说明 | 示例 |
|------|------|------|
| DATABASE_URL | PostgreSQL 连接 | postgresql://juben:pass@localhost:5432/juben |
| REDIS_URL | Redis 连接 | redis://localhost:6379 |
| NEXTAUTH_SECRET | JWT 密钥 | openssl rand -base64 32 |
| NEXTAUTH_URL | 站点地址 | https://your-domain.com |
| UPLOAD_DIR | 上传存储路径 | ./uploads |
| NEXT_PUBLIC_UPLOAD_BASE | 上传 URL 前缀 | /uploads |
| ADMIN_EMAIL | 管理员邮箱 | admin@juben.com |
| ADMIN_PASSWORD | 管理员初始密码 | admin123456 |

## License

MIT
