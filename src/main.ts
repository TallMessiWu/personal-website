import {createApp} from 'vue'
import { createHead } from '@vueuse/head'

import "./main.less"

import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

import App from './App.vue'
import router from './router'
import i18n from './locales/i18n'

const app = createApp(App)
const head = createHead()
app.use(head)

// 使用Element Plus UI 库
app.use(ElementPlus)
// 注册所有
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}

app.use(router)
app.use(i18n)

// 用来处理路由跳转后页面滚动到顶部
router.afterEach((to, from, next) => {
    window.scrollTo(0, 0);
});

app.mount('#app')
