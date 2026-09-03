# Knowledge Hub Frontend

知识库前端项目，基于 React + TypeScript + Ant Design + Axios。

## 技术栈

- [React 19](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vite.dev/)
- [Ant Design](https://ant.design/)
- [Axios](https://axios-http.com/)

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务（默认 http://localhost:5173）
npm run dev

# 生产构建
npm run build

# 预览构建产物
npm run preview
```

## 目录结构

```
src/
├── api/           # 接口模块
├── assets/        # 静态资源
├── components/    # 通用组件
├── pages/         # 页面
├── styles/        # 全局样式
├── utils/         # 工具（含 Axios 封装）
├── App.tsx
└── main.tsx
```

## 环境变量

复制 `.env.example` 为对应环境文件：

| 变量 | 说明 |
|------|------|
| `VITE_API_BASE_URL` | 接口基础路径，开发默认 `/api`，由 Vite 代理到后端 |

开发代理目标可在 `vite.config.ts` 中修改。
