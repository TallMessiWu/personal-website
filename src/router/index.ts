import {createRouter, createWebHistory} from "vue-router";
import Index from "../views/Index.vue"
import Home from "../views/Home.vue";

const routes = [
  {
    path: '/',
    component: Index,
    name: "Index",
    redirect: "/home",
    children: [
      {
        path: "home",
        component: Home,
        name: "Home"
      },
      {
        path: "daily",
        component: () => import("../views/Daily.vue"),
        name: "Daily"
      },
      {
        path: "portfolio",
        component: () => import("../views/Portfolio.vue"),
        name: "Portfolio"
      },
      {
        path: "about",
        component: () => import("../views/About.vue"),
        name: "About"
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router