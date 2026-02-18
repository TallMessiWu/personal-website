# 技术栈与架构 (Tech Stack & Architecture)

## 核心框架 (Core Frameworks)
-   **Vue 3**: `^3.5.18` (Composition API)
-   **Vite**: `^7.0.6` (Build Tool)
-   **TypeScript**: `~5.8.0`

## UI 与样式 (UI & Styling)
-   **Element Plus**: `^2.10.6` (Component Library)
-   **Less**: `^4.4.0` (CSS Preprocessor)
-   **Icons**: `@element-plus/icons-vue`

## 目录结构 (Directory Structure)
-   `.agent/`: Agent 配置与上下文 (skills, docs, AGENTS.md, rules.md)
-   `public/`: 纯静态资源 (favicon, robots.txt, etc.)
-   `src/`: 源代码根目录
    -   `assets/`: 静态资源 (images, css)
    -   `components/`: Vue 通用组件
    -   `data/`: 静态数据文件
    -   `locales/`: i18n 国际化语言包
    -   `router/`: Vue Router 路由配置
    -   `utils/`: 工具函数
    -   `views/`: 页面视图组件
    -   `App.vue`: 根组件
    -   `main.ts`: 入口文件
    -   `main.less`: 全局样式入口

## 开发环境 (Dev Environment)
-   Node.js: `^20.19.0 || >=22.12.0`
-   Scripts:
    -   `npm run dev`: 启动开发服务器
    -   `npm run build`: 构建生产版本
    -   `npm run type-check`: 类型检查
