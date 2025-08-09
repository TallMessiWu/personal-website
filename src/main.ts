import { createApp } from 'vue'

import "./main.less"

import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(ElementPlus)
app.use(router)

// 用来处理路由跳转后页面滚动到顶部
router.afterEach((to, from, next) => {
    window.scrollTo(0, 0);
});

app.mount('#app')
