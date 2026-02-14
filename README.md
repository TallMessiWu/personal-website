# 🏠 我的小站 | MySpace

> 一个基于 **Vue 3 + TypeScript + Element Plus** 构建的现代化个人网站，融合 VS Code 风格的设计语言，支持中英文切换和深色/浅色主题。

## ✨ 功能特性

- 🎨 **VS Code 风格设计** — 代码窗口、语法高亮等程序员美学元素贯穿全站
- 🌗 **深色 / 浅色主题** — 一键切换，偏好自动持久化至 `localStorage`，首次访问跟随系统主题
- 🌍 **国际化 (i18n)** — 中英文动态切换，所有页面内容同步更新
- 📱 **响应式布局** — 适配手机、平板和桌面端
- 🚀 **GitHub Actions 自动部署** — 推送 `main` 分支即自动构建并部署至 GitHub Pages
- 🔍 **SEO 优化** — 动态 `<title>`、`meta` 描述、`robots.txt` 和 `sitemap.xml`
- ✨ **丰富的交互动效** — 页面过渡动画、卡片悬浮效果、模态框展开/收起动画

## 📄 页面介绍

| 页面 | 路由 | 说明 |
| --- | --- | --- |
| **首页** | `/home` | Hero 区域展示个人信息代码卡片 + 名言引用区 |
| **日常** | `/daily` | 瀑布流卡片布局，点击展开详情弹窗，支持图片和视频内容 |
| **作品集** | `/portfolio` | 网格展示作品，支持按类型 (视频/照片/代码) 筛选，带悬浮遮罩动效 |
| **关于** | `/about` | 个人简介、教育/工作/项目/技能亮点卡片、几何时间轴、兴趣爱好展示 |

## 🛠️ 技术栈

| 类别 | 技术 |
| --- | --- |
| 前端框架 | [Vue 3](https://cn.vuejs.org/) (Composition API) |
| 开发语言 | [TypeScript](https://www.typescriptlang.org/zh/) |
| 构建工具 | [Vite 7](https://cn.vitejs.dev/) |
| UI 组件库 | [Element Plus](https://element-plus.org/zh-CN/) |
| CSS 预处理器 | [Less](https://lesscss.org/) |
| 路由管理 | [Vue Router 4](https://router.vuejs.org/zh/) |
| 国际化 | [Vue I18n](https://vue-i18n.intlify.dev/) |
| SEO | [@vueuse/head](https://github.com/vueuse/head) |
| 部署 | [GitHub Actions](https://docs.github.com/zh/actions) + GitHub Pages |

## 📁 项目结构

```
personal-website/
├── .github/workflows/     # GitHub Actions 部署工作流
├── public/                # 静态资源 (favicon, robots.txt, sitemap.xml)
├── src/
│   ├── assets/            # 静态资源 (logo 等)
│   ├── components/        # 通用组件
│   │   ├── TheHeader.vue  #   顶部导航栏 (主题切换、语言切换)
│   │   ├── TheFooter.vue  #   底部社交链接栏
│   │   └── DailyCard.vue  #   日常页面卡片组件
│   ├── locales/           # 国际化语言文件
│   │   ├── zh.json        #   中文
│   │   ├── en.json        #   英文
│   │   └── i18n.ts        #   i18n 配置
│   ├── router/            # 路由配置
│   ├── views/             # 页面视图
│   │   ├── Home.vue       #   首页
│   │   ├── Daily.vue      #   日常
│   │   ├── Portfolio.vue  #   作品集
│   │   ├── About.vue      #   关于
│   │   └── Index.vue      #   根布局
│   ├── App.vue            # 根组件
│   ├── main.ts            # 应用入口
│   └── main.less          # 全局样式 & 主题变量
├── index.html             # HTML 入口
├── vite.config.ts         # Vite 配置
├── tsconfig.json          # TypeScript 配置
└── package.json           # 项目依赖 & 脚本
```

## 🚀 快速开始

### 环境要求

- **Node.js** `^20.19.0` 或 `>=22.12.0`
- **npm** (随 Node.js 安装)

### 安装与运行

```bash
# 1. 克隆仓库
git clone https://github.com/TallMessiWu/personal-website.git
cd personal-website

# 2. 安装依赖
npm install

# 3. 启动开发服务器 (支持热重载)
npm run dev
```

启动后访问 `http://localhost:5173`

### 其他命令

```bash
# 构建生产版本 (含类型检查)
npm run build

# 预览生产构建
npm run preview

# 仅执行类型检查
npm run type-check
```

## 🌐 部署

项目已配置 GitHub Actions 自动部署至 GitHub Pages：

1. 将代码推送到 `main` 分支
2. GitHub Actions 自动执行构建与部署
3. 进入仓库 **Settings** → **Pages** → **Source** 选择 `GitHub Actions`
4. 网站上线地址：`https://<你的用户名>.github.io/personal-website/`

## 📝 许可证

[MIT](LICENSE)
