# 剧本圈 — 技术设计文档

## 1. 技术栈

| 层 | 选型 | 说明 |
|---|------|------|
| 前端框架 | Next.js 14 (App Router) | RSC + Route Handlers |
| 语言 | TypeScript 5.x | 全栈共用 |
| UI 样式 | TailwindCSS 3.x + shadcn/ui | 黑蓝主题定制 |
| 图标 | lucide-react | 线性风格 |
| 表单 | react-hook-form + zod | 前后端校验复用 |
| 数据获取 | TanStack Query | 客户端缓存 |
| 状态 | zustand | 全局轻量态 |
| 后端 | Next.js Route Handlers | 同仓库 |
| ORM | Prisma 5.x | 类型安全 |
| 数据库 | PostgreSQL 16 | 主存储 |
| 缓存 | Redis 7 | 会话辅助 + 限流 |
| 鉴权 | NextAuth.js v5 | Credentials Provider |
| 文件存储 | 本地磁盘 + Nginx 静态托管 | MVP 方案，后续可切 OSS |
| 图片处理 | sharp | 压缩 + 缩略图 |
| 部署 | Docker Compose | app / postgres / redis / nginx |
| Node | 20 LTS | |
| 包管理 | pnpm | |

---

## 2. 系统架构

```
                ┌────────────┐
   浏览器 ─────▶│   Nginx    │  (HTTPS, 静态文件, 反代)
                └─────┬──────┘
                      │
                ┌─────▼──────────────┐
                │  Next.js (Node 20) │  (App Router + API Routes)
                └─────┬──────────────┘
                      │
            ┌─────────┴────────────┐
            ▼                      ▼
       ┌─────────┐           ┌──────────┐
       │PostgreSQL│           │  Redis   │
       └─────────┘           └──────────┘

      ┌─────────────────────┐
      │  /uploads (本地磁盘) │ ◀─ Nginx 静态提供
      └─────────────────────┘
```

---

## 3. 目录结构

```
jvbentieba/
├── app/
│   ├── (public)/                  # 游客可见
│   │   ├── page.tsx              # 首页
│   │   ├── topics/[slug]/page.tsx
│   │   ├── posts/[id]/page.tsx
│   │   ├── users/[id]/page.tsx
│   │   └── search/page.tsx
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (app)/                     # 需登录
│   │   ├── me/page.tsx
│   │   ├── me/posts/page.tsx
│   │   ├── me/favorites/page.tsx
│   │   ├── me/following/page.tsx
│   │   ├── posts/new/page.tsx
│   │   └── admin/topics/page.tsx  # 管理员：话题管理
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts
│   │   ├── auth/register/route.ts
│   │   ├── posts/route.ts
│   │   ├── posts/[id]/route.ts
│   │   ├── posts/[id]/like/route.ts
│   │   ├── posts/[id]/favorite/route.ts
│   │   ├── posts/[id]/comments/route.ts
│   │   ├── comments/[id]/route.ts
│   │   ├── comments/[id]/like/route.ts
│   │   ├── comments/[id]/replies/route.ts
│   │   ├── topics/route.ts
│   │   ├── topics/[slug]/route.ts
│   │   ├── topics/[slug]/follow/route.ts
│   │   ├── users/[id]/route.ts
│   │   ├── users/[id]/follow/route.ts
│   │   ├── me/route.ts
│   │   ├── upload/route.ts
│   │   ├── search/route.ts
│   │   └── reports/route.ts
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── ui/                        # shadcn/ui
│   ├── header.tsx
│   ├── footer.tsx
│   ├── post-card.tsx
│   ├── comment-item.tsx
│   ├── comment-list.tsx
│   ├── image-uploader.tsx
│   ├── login-dialog.tsx
│   └── topic-card.tsx
├── lib/
│   ├── db.ts
│   ├── auth.ts
│   ├── redis.ts
│   ├── upload.ts
│   ├── sanitize.ts
│   └── utils.ts
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts
│   └── migrations/
├── public/
├── uploads/
├── docker/
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── nginx.conf
├── .env.example
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.mjs
└── README.md
```

---

## 4. 数据库设计

### 4.1 ER 关系

```
User ──< Post ──> Topic
 │        └──< Image
 │        └──< Comment ──< Reply (同表自关联)
 │        └──< Like (post)
 │        └──< Favorite
 │
 └──< Follow (user / topic)
 └──< Report
 └──< Like (comment)
```

### 4.2 Prisma Schema

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            String     @id @default(cuid())
  email         String     @unique
  passwordHash  String
  nickname      String     @unique
  avatarUrl     String?
  bio           String?
  role          Role       @default(USER)
  status        UserStatus @default(ACTIVE)
  createdAt     DateTime   @default(now())
  updatedAt     DateTime   @updatedAt

  posts         Post[]
  comments      Comment[]
  likes         Like[]
  favorites     Favorite[]
  reports       Report[]
  followers     Follow[]   @relation("Followee")
  following     Follow[]   @relation("Follower")
}

enum Role { USER ADMIN }
enum UserStatus { ACTIVE BANNED }

model Topic {
  id          String   @id @default(cuid())
  slug        String   @unique
  name        String
  description String   @default("")
  coverUrl    String?
  isPreset    Boolean  @default(false)
  postCount   Int      @default(0)
  followCount Int      @default(0)
  createdAt   DateTime @default(now())

  posts       Post[]
  follows     Follow[]
}

model Post {
  id           String     @id @default(cuid())
  authorId     String
  topicId      String
  title        String
  content      String     @db.Text
  status       PostStatus @default(PUBLISHED)
  likeCount    Int        @default(0)
  commentCount Int        @default(0)
  favoriteCount Int       @default(0)
  viewCount    Int        @default(0)
  createdAt    DateTime   @default(now())
  updatedAt    DateTime   @updatedAt

  author       User       @relation(fields: [authorId], references: [id])
  topic        Topic      @relation(fields: [topicId], references: [id])
  images       Image[]
  comments     Comment[]
  likes        Like[]
  favorites    Favorite[]

  @@index([topicId, createdAt])
  @@index([authorId, createdAt])
}

enum PostStatus { PUBLISHED HIDDEN DELETED }

model Image {
  id      String @id @default(cuid())
  postId  String
  url     String
  thumbUrl String?
  width   Int?
  height  Int?
  order   Int    @default(0)

  post    Post   @relation(fields: [postId], references: [id], onDelete: Cascade)
}

model Comment {
  id        String        @id @default(cuid())
  postId    String
  authorId  String
  parentId  String?                         // null = 一级评论, 有值 = 楼中楼回复
  content   String        @db.VarChar(500)
  likeCount Int           @default(0)
  status    CommentStatus @default(PUBLISHED)
  createdAt DateTime      @default(now())

  post      Post          @relation(fields: [postId], references: [id], onDelete: Cascade)
  author    User          @relation(fields: [authorId], references: [id])
  parent    Comment?      @relation("Replies", fields: [parentId], references: [id])
  replies   Comment[]     @relation("Replies")
  likes     Like[]

  @@index([postId, createdAt])
  @@index([parentId])
}

enum CommentStatus { PUBLISHED DELETED }

model Like {
  id        String     @id @default(cuid())
  userId    String
  targetId  String
  type      LikeTarget
  createdAt DateTime   @default(now())

  user      User       @relation(fields: [userId], references: [id])
  comment   Comment?   @relation(fields: [targetId], references: [id], map: "like_comment_fk")
  post      Post?      @relation(fields: [targetId], references: [id], map: "like_post_fk")

  @@unique([userId, targetId, type])
}

enum LikeTarget { POST COMMENT }

model Favorite {
  userId    String
  postId    String
  createdAt DateTime @default(now())

  user      User     @relation(fields: [userId], references: [id])
  post      Post     @relation(fields: [postId], references: [id])

  @@id([userId, postId])
}

model Follow {
  id             String     @id @default(cuid())
  followerId     String
  type           FollowType
  targetUserId   String?
  targetTopicId  String?
  createdAt      DateTime   @default(now())

  follower       User       @relation("Follower", fields: [followerId], references: [id])
  targetUser     User?      @relation("Followee", fields: [targetUserId], references: [id])
  topic          Topic?     @relation(fields: [targetTopicId], references: [id])

  @@unique([followerId, type, targetUserId])
  @@unique([followerId, type, targetTopicId])
}

enum FollowType { USER TOPIC }

model Report {
  id         String       @id @default(cuid())
  reporterId String
  targetType ReportTarget
  targetId   String
  reason     String
  detail     String?
  status     ReportStatus @default(OPEN)
  createdAt  DateTime     @default(now())

  reporter   User         @relation(fields: [reporterId], references: [id])
}

enum ReportTarget { POST COMMENT USER }
enum ReportStatus { OPEN RESOLVED REJECTED }
```

---

## 5. API 设计

### 5.1 认证
| Method | Path | 说明 |
|--------|------|------|
| POST | `/api/auth/register` | 注册 |
| (NextAuth) | `/api/auth/[...nextauth]` | 登录/登出/session |

### 5.2 话题
| Method | Path | 权限 | 说明 |
|--------|------|------|------|
| GET | `/api/topics` | 公开 | 全部话题 |
| POST | `/api/topics` | 管理员 | 创建话题 |
| GET | `/api/topics/:slug` | 公开 | 话题详情 |
| PATCH | `/api/topics/:slug` | 管理员 | 编辑话题 |
| DELETE | `/api/topics/:slug` | 管理员 | 删除话题（非预置） |
| POST | `/api/topics/:slug/follow` | 登录 | 关注/取消 |

### 5.3 帖子
| Method | Path | 权限 | 说明 |
|--------|------|------|------|
| GET | `/api/posts?topicSlug=&sort=&cursor=` | 公开 | 帖子列表 |
| POST | `/api/posts` | 登录 | 发帖 |
| GET | `/api/posts/:id` | 公开 | 详情 |
| PATCH | `/api/posts/:id` | 作者 | 编辑 |
| DELETE | `/api/posts/:id` | 作者/管理员 | 删除 |
| POST | `/api/posts/:id/like` | 登录 | 点赞 toggle |
| POST | `/api/posts/:id/favorite` | 登录 | 收藏 toggle |

### 5.4 评论
| Method | Path | 权限 | 说明 |
|--------|------|------|------|
| GET | `/api/posts/:id/comments?cursor=` | 公开 | 一级评论列表 |
| POST | `/api/posts/:id/comments` | 登录 | 发一级评论 |
| GET | `/api/comments/:id/replies?cursor=` | 公开 | 楼中楼回复列表 |
| POST | `/api/comments/:id/replies` | 登录 | 发楼中楼回复 |
| DELETE | `/api/comments/:id` | 作者/管理员 | 删除评论 |
| POST | `/api/comments/:id/like` | 登录 | 评论点赞 toggle |

### 5.5 用户
| Method | Path | 权限 | 说明 |
|--------|------|------|------|
| GET | `/api/users/:id` | 公开 | 用户主页 |
| PATCH | `/api/me` | 登录 | 编辑个人资料 |
| POST | `/api/users/:id/follow` | 登录 | 关注 toggle |
| GET | `/api/me/posts` | 登录 | 我的帖子 |
| GET | `/api/me/favorites` | 登录 | 我的收藏 |
| GET | `/api/me/following` | 登录 | 我的关注 |

### 5.6 其他
| Method | Path | 权限 | 说明 |
|--------|------|------|------|
| POST | `/api/upload` | 登录 | 图片上传 |
| GET | `/api/search?q=` | 公开 | 搜索帖子 |
| POST | `/api/reports` | 登录 | 举报 |

---

## 6. 楼中楼评论设计

采用**两层结构**：
- **一级评论**：`parentId = null`，直接属于帖子
- **二级回复**：`parentId = 一级评论 id`，属于某条一级评论

不做无限嵌套（最多 2 层）。回复 B 时显示"回复 @B.author.nickname"。

前端展示：
```
├─ 一级评论 A（楼主）
│   ├─ 回复1：回复 @A ...
│   ├─ 回复2：回复 @回复1的作者 ...
│   └─ [展开更多 (共12条)]
├─ 一级评论 B
│   └─ ...
```

---

## 7. UI 设计规范（黑蓝主题）

### 7.1 颜色 Token

```ts
// tailwind.config.ts extend.colors
colors: {
  bg: {
    DEFAULT: "#0B1020",    // 页面背景
    card: "#111827",       // 卡片背景
    elevated: "#1F2937",   // 悬浮/弹窗
  },
  brand: {
    DEFAULT: "#3B82F6",    // 主蓝
    light: "#60A5FA",      // 高亮蓝
    dark: "#1D4ED8",       // 深蓝
  },
  ink: {
    DEFAULT: "#F1F5F9",    // 主文字
    muted: "#94A3B8",      // 次要文字
    faint: "#64748B",      // 弱文字
  },
  border: {
    DEFAULT: "rgba(59,130,246,0.2)", // 蓝光边框
  },
}
```

### 7.2 设计原则
- 深色背景 + 蓝色高亮，营造"夜间社区"氛围
- 卡片使用 `bg-card` + 1px border + 圆角 12px
- 按钮：主按钮 `bg-brand`，幽灵按钮蓝色描边
- 字体：Inter + Noto Sans SC（系统回退）
- 响应式：sm 640 / md 768 / lg 1024 / xl 1280

### 7.3 关键页面布局

**首页**
```
┌─────────────────────────────────────────┐
│ Header: Logo | 话题导航 | 🔍 | [+发帖] [👤] │
├─────────────────────────────────────────┤
│ 话题横向卡片滚动区                        │
│ [推荐 | 最新] Tab                         │
│ PostCard...                              │
│ PostCard...                              │
└─────────────────────────────────────────┘
```

**帖子详情**
```
┌─────────────────────────────────────────┐
│ 作者头像 | 昵称 | 时间 | 话题badge        │
│ 标题                                     │
│ 正文内容...                              │
│ [图片画廊]                               │
│ [👍 点赞] [⭐ 收藏] [⚠ 举报]             │
├─────────────────────────────────────────┤
│ 评论区                                   │
│ [输入框: 写评论...]                       │
│ 一级评论 A                               │
│   ├─ 回复 1                              │
│   ├─ 回复 2                              │
│   └─ 展开更多                            │
│ 一级评论 B                               │
└─────────────────────────────────────────┘
```

---

## 8. 部署方案

### 8.1 docker-compose.yml
```yaml
services:
  app:
    build: .
    env_file: .env.production
    depends_on: [postgres, redis]
    volumes:
      - uploads:/app/uploads
    restart: unless-stopped

  postgres:
    image: postgres:16-alpine
    volumes: [pgdata:/var/lib/postgresql/data]
    environment:
      POSTGRES_DB: juben
      POSTGRES_USER: juben
      POSTGRES_PASSWORD: ${DB_PASSWORD}

  redis:
    image: redis:7-alpine

  nginx:
    image: nginx:alpine
    ports: ["80:80", "443:443"]
    volumes:
      - ./docker/nginx.conf:/etc/nginx/conf.d/default.conf
      - uploads:/var/www/uploads:ro
      - ./certs:/etc/nginx/certs:ro
    depends_on: [app]

volumes:
  pgdata:
  uploads:
```

### 8.2 环境变量
```
DATABASE_URL=postgresql://juben:xxx@postgres:5432/juben
REDIS_URL=redis://redis:6379
NEXTAUTH_SECRET=<随机32字节>
NEXTAUTH_URL=https://your-domain
UPLOAD_DIR=/app/uploads
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=<初始密码>
```

---

## 9. 后续演进

- V1.1：站内通知、完整运营后台、微信扫码登录
- V1.2：@提及、表情回应、拼车招募版
- V2.0：App 端、评分体系
