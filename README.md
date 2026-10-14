# 企业智能知识库 · Frontend

企业内部知识沉淀与智能检索前端，覆盖全文检索、语义检索、知识问答与知识图谱等能力。

## 技术栈

- React 19 + TypeScript + Vite
- Ant Design 6 / Ant Design X
- React Router 7
- Axios
- AI SDK（流式问答）
- ECharts（知识图谱）
- Sass / oxlint / oxfmt
- ts-gear（OpenAPI → 请求代码生成）

## 功能模块

| 模块 | 路由 | 说明 |
| --- | --- | --- |
| 首页 | `/` | 入口与能力概览 |
| 检索 | `/search` | 关键词 + 语义检索 |
| 知识问答 | `/chat` | RAG 流式对话、过程卡片、引用与 TTS |
| 知识图谱 | `/graph` | 图谱总览与筛选 |
| 文档管理 | `/documents` | 上传、编辑、详情预览 |
| 审核 | `/reviews` | 文档审核（审核员 / 管理员） |
| 系统管理 | `/system/users`、`/system/rbac` | 用户与角色权限 |
| 认证 | `/login`、`/register`、`/forgot-password`、`/verify-email` | 登录注册、邮箱激活、重置密码 |

## 快速开始

推荐使用 pnpm（与开发规范、`pnpm tsg` 一致）：

```bash
# 安装依赖
pnpm install

# 启动开发服务（默认 http://localhost:5173）
pnpm dev

# 生产构建
pnpm build

# 预览构建产物
pnpm preview

# 代码检查 / 格式化
pnpm lint
pnpm format
```

开发时前端通过 Vite 将 `/api` 代理到后端 `http://localhost:3000`（见 `vite.config.ts`）。请先启动后端服务。

## 常用脚本

| 命令 | 说明 |
| --- | --- |
| `pnpm dev` | 本地开发 |
| `pnpm build` | TypeScript 检查 + 生产构建 |
| `pnpm preview` | 预览 `dist` |
| `pnpm lint` / `pnpm lint:fix` | oxlint |
| `pnpm format` / `pnpm format:check` | oxfmt |
| `pnpm tsg` | 根据后端 OpenAPI 重新生成 `src/service/api/` |

## 目录结构

```
src/
├── assets/          # 静态资源
├── components/      # 通用组件（详情抽屉、文件图标、图谱等）
├── constants/       # 常量与枚举
├── layouts/         # 布局与页脚
├── pages/           # 业务页面（按功能分目录）
├── service/api/     # ts-gear 生成的 API（禁止手改）
├── styles/          # 全局样式
├── types/           # 业务类型
├── utils/           # 工具（含 Axios 封装、鉴权）
├── tsg.config.cjs   # OpenAPI 生成配置
├── App.tsx
└── main.tsx
docs/
└── dev.md           # 开发规范（文件体量、拆分、生成代码约定）
```

路径别名：`@` → `src/`。

## 接口与代码生成

- 运行时请求走 `src/utils/request.ts`，默认 `baseURL` 为环境变量 `VITE_API_BASE_URL`。
- **禁止手改** `src/service/api/`。后端 OpenAPI 变更后，确保后端 `http://localhost:3000/docs-json` 可访问，再执行：

```bash
pnpm tsg
```

配置见 `src/tsg.config.cjs`。临时业务类型请写在 `pages/` 或 `types/`，不要补丁生成文件。

## 环境变量

| 变量 | 说明 |
| --- | --- |
| `VITE_API_BASE_URL` | 接口基础路径；开发环境通常可不设，由 Vite 代理 `/api` → 后端 |

开发代理目标可在 `vite.config.ts` 的 `server.proxy` 中修改。

## 开发规范

请遵循 [docs/dev.md](docs/dev.md)（单文件行数上限、拆分原则、禁止手改生成 API 等）。Agent 指引见 [AGENTS.md](AGENTS.md)。
