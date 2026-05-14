# 剧本圈 — V1.0 MVP 任务拆解

> 按顺序执行，每个 Phase 完成后可本地启动验证。

## Phase 0：项目脚手架
- [ ] 0.1 初始化 Next.js 14 项目（TS / App Router / Tailwind / pnpm）
- [ ] 0.2 配置 tsconfig 严格模式 + 路径别名 `@/*`
- [ ] 0.3 安装依赖：next-auth, prisma, @prisma/client, zod, react-hook-form, @tanstack/react-query, zustand, lucide-react, sharp, bcryptjs, ioredis, sonner
- [ ] 0.4 初始化 shadcn/ui + 加入基础组件（button, input, dialog, tabs, avatar, badge, card, textarea, select, dropdown-menu, toast）
- [ ] 0.5 配置 Tailwind 黑蓝主题 token（见 design.md 7.1）
- [ ] 0.6 全局样式：body 背景、字体引入
- [ ] 0.7 `.env.example` + `.gitignore`
- [ ] 0.8 根 `layout.tsx`、`globals.css`

## Phase 1：数据库与认证
- [ ] 1.1 编写 `prisma/schema.prisma`（9 个模型）
- [ ] 1.2 `lib/db.ts` Prisma 单例
- [ ] 1.3 `prisma/seed.ts`：创建 4 个预置话题 + 1 个管理员账号
- [ ] 1.4 `lib/auth.ts` NextAuth 配置（Credentials + JWT）
- [ ] 1.5 `app/api/auth/[...nextauth]/route.ts`
- [ ] 1.6 `app/api/auth/register/route.ts`（zod 校验 + bcrypt）
- [ ] 1.7 `middleware.ts` 保护需登录路由

## Phase 2：公共布局与组件
- [ ] 2.1 `components/header.tsx`（logo、话题导航、搜索框、发帖按钮、登录/头像）
- [ ] 2.2 `components/footer.tsx`
- [ ] 2.3 `components/login-dialog.tsx`（未登录操作时弹出）
- [ ] 2.4 `components/post-card.tsx`
- [ ] 2.5 `components/topic-card.tsx`
- [ ] 2.6 `components/image-uploader.tsx`
- [ ] 2.7 移动端响应式适配（汉堡菜单等）

## Phase 3：登录 / 注册页面
- [ ] 3.1 `/login` 页（邮箱+密码 + 微信占位按钮）
- [ ] 3.2 `/register` 页（邮箱+昵称+密码+确认密码）
- [ ] 3.3 注册成功自动登录跳转
- [ ] 3.4 Header 登出菜单项

## Phase 4：话题模块
- [ ] 4.1 `GET /api/topics` 列表
- [ ] 4.2 `POST /api/topics`（管理员创建）
- [ ] 4.3 `PATCH /api/topics/:slug`（管理员编辑）
- [ ] 4.4 `DELETE /api/topics/:slug`（管理员删除，非预置）
- [ ] 4.5 `POST /api/topics/:slug/follow` toggle
- [ ] 4.6 首页话题横向卡片区
- [ ] 4.7 话题详情页 `/topics/:slug`（帖子列表 + 关注 + 发帖入口）
- [ ] 4.8 管理员话题管理页 `/admin/topics`

## Phase 5：图片上传
- [ ] 5.1 `POST /api/upload`（multipart, sharp 压缩, 存 /uploads/）
- [ ] 5.2 `lib/upload.ts` 工具函数
- [ ] 5.3 `components/image-uploader.tsx` 完善（预览、删除、拖拽）

## Phase 6：帖子模块
- [ ] 6.1 `POST /api/posts` 发帖（zod 校验、图片关联）
- [ ] 6.2 `GET /api/posts` 列表（分页、排序、话题筛选）
- [ ] 6.3 `GET /api/posts/:id` 详情
- [ ] 6.4 `PATCH /api/posts/:id` 编辑（作者）
- [ ] 6.5 `DELETE /api/posts/:id` 删除（作者/管理员）
- [ ] 6.6 发帖页 `/posts/new`（选话题 + 标题 + 正文 + 上传图片）
- [ ] 6.7 帖子详情页 `/posts/:id`（正文 + 图片画廊 + 操作栏）
- [ ] 6.8 首页信息流（推荐/最新 Tab + 帖子卡片列表 + 触底加载）

## Phase 7：评论（楼中楼）
- [ ] 7.1 `POST /api/posts/:id/comments` 发一级评论
- [ ] 7.2 `GET /api/posts/:id/comments` 一级评论列表（分页）
- [ ] 7.3 `POST /api/comments/:id/replies` 发楼中楼回复
- [ ] 7.4 `GET /api/comments/:id/replies` 回复列表
- [ ] 7.5 `DELETE /api/comments/:id` 删除（作者/管理员）
- [ ] 7.6 `POST /api/comments/:id/like` 评论点赞 toggle
- [ ] 7.7 评论区 UI：一级评论 + 楼中楼展开/折叠

## Phase 8：互动（点赞/收藏/关注/举报）
- [ ] 8.1 `POST /api/posts/:id/like` 帖子点赞 toggle
- [ ] 8.2 `POST /api/posts/:id/favorite` 收藏 toggle
- [ ] 8.3 `POST /api/users/:id/follow` 关注用户 toggle
- [ ] 8.4 `POST /api/reports` 举报（帖子/评论/用户）
- [ ] 8.5 点赞/收藏/关注按钮前端状态联动

## Phase 9：个人中心
- [ ] 9.1 `/me` 资料编辑（头像/昵称/签名/密码）
- [ ] 9.2 `/me/posts` 我的帖子
- [ ] 9.3 `/me/favorites` 我的收藏
- [ ] 9.4 `/me/following` 我的关注（话题 + 用户）
- [ ] 9.5 `/users/:id` 用户主页

## Phase 10：搜索
- [ ] 10.1 `GET /api/search?q=` 帖子搜索（PostgreSQL ILIKE）
- [ ] 10.2 搜索结果页 `/search`

## Phase 11：管理员能力
- [ ] 11.1 管理员可在帖子详情删帖
- [ ] 11.2 管理员可删任意评论
- [ ] 11.3 管理员可封禁用户（status → BANNED）

## Phase 12：部署
- [ ] 12.1 多阶段 `Dockerfile`
- [ ] 12.2 `docker-compose.yml`（app + postgres + redis + nginx）
- [ ] 12.3 `nginx.conf`（反代 + /uploads 静态 + HTTPS 占位）
- [ ] 12.4 数据库迁移 + seed 脚本
- [ ] 12.5 README（本地启动 + 生产部署步骤）

## Phase 13：自测交付
- [ ] 13.1 完整链路走查：注册→登录→浏览→发帖→评论→回复→点赞→收藏→关注→搜索→管理员操作
- [ ] 13.2 移动端 H5 走查
- [ ] 13.3 修复关键 bug
- [ ] 13.4 提交代码 + PR

---

## 预估工期
- 总计约 **6 ~ 8 个工作日**

## 里程碑确认点
- ✅ Phase 1 完成 → 数据库结构确认
- ✅ Phase 4 完成 → 首页 + 话题可见，确认 UI 风格
- ✅ Phase 7 完成 → 发帖 + 楼中楼评论闭环
- ✅ Phase 12 完成 → 部署联调
