[![中文](https://img.shields.io/badge/语言-中文-red)](./README.md) ![English](https://img.shields.io/badge/Lang-English-blue) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

# 🏠 MySpace | Personal Website

> A modern personal website built with **Vue 3 + TypeScript + Element Plus**, featuring VS Code–inspired design, bilingual support (Chinese/English), and dark/light theme switching.

## 🔗 Project Links

### Frontend
- [![Gitee](https://img.shields.io/badge/Gitee-tallmessiwu%2Fpersonal--website-C71D23?logo=gitee)](https://gitee.com/tallmessiwu/personal-website)
- [![GitHub](https://img.shields.io/badge/GitHub-TallMessiWu%2Fpersonal--website-181717?logo=github)](https://github.com/TallMessiWu/personal-website)

### Admin Project
- [![Gitee](https://img.shields.io/badge/Gitee-tallmessiwu%2Fpersonal--website--admin-C71D23?logo=gitee)](https://gitee.com/tallmessiwu/personal-website-admin)
- [![GitHub](https://img.shields.io/badge/GitHub-TallMessiWu%2Fpersonal--website--admin-181717?logo=github)](https://github.com/TallMessiWu/personal-website-admin)

## ✨ Features

- 🎨 **VS Code–Inspired Design** — Code window aesthetics, syntax highlighting, and developer-oriented UI throughout
- 🌗 **Dark / Light Theme** — One-click toggle, preference persisted in `localStorage`, defaults to system theme on first visit
- 🌍 **Internationalization (i18n)** — Seamless Chinese/English switching with real-time content updates
- 📱 **Responsive Layout** — Optimized for mobile, tablet, and desktop
- 🚀 **GitHub Actions CI/CD** — Auto-build and deploy to GitHub Pages on push to `main`
- 🔍 **SEO Optimized** — Dynamic `<title>`, `meta` descriptions, `robots.txt`, and `sitemap.xml`
- ✨ **Rich Interactions** — Page transitions, card hover effects, and modal open/close animations

## 📄 Pages

| Page | Route | Description |
| --- | --- | --- |
| **Home** | `/home` | Hero section with a personal info code card + inspirational quotes |
| **Daily** | `/daily` | Masonry card layout, click to expand details with image/video support |
| **Portfolio** | `/portfolio` | Grid showcase with category filters (video/photo/code) and hover overlays |
| **About** | `/about` | Bio, education/work/projects/skills highlight cards, geometric timeline, hobbies |

## 🛠️ Tech Stack

| Category | Technology |
| --- | --- |
| Frontend Framework | [Vue 3](https://vuejs.org/) (Composition API) |
| Language | [TypeScript](https://www.typescriptlang.org/) |
| Build Tool | [Vite 7](https://vitejs.dev/) |
| UI Library | [Element Plus](https://element-plus.org/) |
| CSS Preprocessor | [Less](https://lesscss.org/) |
| Routing | [Vue Router 4](https://router.vuejs.org/) |
| i18n | [Vue I18n](https://vue-i18n.intlify.dev/) |
| SEO | [@vueuse/head](https://github.com/vueuse/head) |
| Deployment | [GitHub Actions](https://docs.github.com/en/actions) + GitHub Pages |

## 📁 Project Structure

```
personal-website/
├── .agent/                # AI assistant configurations (Skills & Workflows)
├── .github/workflows/     # GitHub Actions deployment workflow
├── public/                # Static assets (favicon, robots.txt, sitemap.xml)
├── src/
│   ├── assets/            # Static resources (logo, etc.)
│   ├── components/        # Shared components
│   │   ├── TheHeader.vue  #   Top navigation bar (theme & language toggle)
│   │   ├── TheFooter.vue  #   Footer social links bar
│   │   └── DailyCard.vue  #   Daily page card component
│   ├── data/              # Static data (data files for Daily, Portfolio, etc.)
│   ├── locales/           # i18n language files
│   │   ├── zh.json        #   Chinese
│   │   ├── en.json        #   English
│   │   └── i18n.ts        #   i18n configuration
│   ├── router/            # Route configuration
│   ├── views/             # Page views
│   │   ├── Home.vue       #   Home
│   │   ├── Daily.vue      #   Daily
│   │   ├── Portfolio.vue  #   Portfolio
│   │   ├── About.vue      #   About
│   │   └── Index.vue      #   Root layout
│   ├── App.vue            # Root component
│   ├── main.ts            # App entry point
│   └── main.less          # Global styles & theme variables
├── index.html             # HTML entry
├── vite.config.ts         # Vite configuration
├── tsconfig.json          # TypeScript configuration
└── package.json           # Dependencies & scripts
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** `^20.19.0` or `>=22.12.0`
- **npm** (bundled with Node.js)

### Installation & Development

```bash
# 1. Clone the repository
git clone https://github.com/TallMessiWu/personal-website.git
cd personal-website

# 2. Install dependencies
npm install

# 3. Start the dev server (with hot reload)
npm run dev
```

Open `http://localhost:5173` after startup.

### Other Commands

```bash
# Production build (with type checking)
npm run build

# Preview production build
npm run preview

# Type check only
npm run type-check
```

## 🌐 Deployment

The project is configured with GitHub Actions for automatic deployment to GitHub Pages:

1. Push code to the `main` branch
2. GitHub Actions automatically builds and deploys
3. Go to **Settings** → **Pages** → **Source** and select `GitHub Actions`
4. Live at: `https://<your-username>.github.io/personal-website/`

## 📝 License

[MIT](LICENSE)
