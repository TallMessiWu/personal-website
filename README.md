# 个人网站 (Personal Website)

一个基于 Vue 3、TypeScript 和 Element Plus 构建的现代化响应式个人网站模板。该项目集成了国际化 (i18n) 和主题定制（深色/浅色模式）功能，既可以用作个人作品集展示，也可以作为博客平台。

## 功能特性

- **Vue 3 & TypeScript**: 采用最新的 Vue 3 组合式 API (Composition API) 和 TypeScript 开发，确保类型安全和开发体验。
- **Element Plus UI**: 使用 Element Plus 组件库，提供简洁、现代的用户界面。
- **响应式设计**: 针对不同屏幕尺寸（手机、平板、桌面）进行了优化。
- **国际化 (i18n)**:
  - 支持中英文动态切换。
  - 语言文件位于 `src/locales/` 目录。
- **主题定制**:
  - 支持深色 (Dark) 和浅色 (Light) 模式切换。
  - 使用 Less 进行样式定制。
- **路由管理**: 使用 Vue Router 进行客户端路由管理（包含主页、日常、作品集、关于页面）。
- **平滑过渡**: 页面切换时提供流畅的过渡动画效果。

## 技术栈

- **前端框架**: [Vue 3](https://cn.vuejs.org/)
- **构建工具**: [Vite](https://cn.vitejs.dev/)
- **开发语言**: [TypeScript](https://www.typescriptlang.org/zh/)
- **UI 组件库**: [Element Plus](https://element-plus.org/zh-CN/)
- **CSS 预处理器**: [Less](https://lesscss.org/)
- **路由**: [Vue Router](https://router.vuejs.org/zh/)
- **国际化**: [Vue I18n](https://vue-i18n.intlify.dev/)

## 环境要求

- **Node.js**: `^20.19.0` 或 `>=22.12.0`
- **npm**: (通常随 Node.js 一起安装)

## 项目设置与运行

1. **安装依赖**:

   在项目根目录下运行以下命令安装所需依赖：

   ```sh
   npm install
   ```

2. **启动开发服务器 (支持热重载)**:

   ```sh
   npm run dev
   ```
   启动后访问 `http://localhost:5173` (默认 Vite 端口)。

3. **构建生产版本 (类型检查、编译与压缩)**:

   ```sh
   npm run build
   ```

4. **预览生产构建**:

   ```sh
   npm run preview
   ```

5. **执行类型检查**:

   ```sh
   npm run type-check
   ```

## 项目结构

```
src/
├── assets/          # 静态资源 (图片、字体等)
├── components/      # 可复用的 Vue 组件
├── locales/         # 国际化语言文件 (en.json, zh.json)
├── router/          # 路由配置
├── views/           # 页面组件 (Home, Daily, Portfolio, About)
├── App.vue          # 根组件
├── main.ts          # 应用入口文件
└── main.less        # 全局样式和主题变量
```

## 部署 (Deployment)

本项目已配置为使用 GitHub Actions 自动部署到 GitHub Pages。

1.  将更改推送到 `main` 分支。
2.  进入仓库 **Settings** -> **Pages**。
3.  选择 **Source**: `Deploy from a branch`。
4.  选择 **Branch**: `gh-pages` 并保存。
5.  您的网站将在 `https://<YOUR_USERNAME>.github.io/personal-website/` 上线。

## 许可证

[MIT](LICENSE)
