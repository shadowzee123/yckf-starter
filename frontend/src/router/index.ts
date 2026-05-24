import { createRouter, createWebHashHistory } from 'vue-router'

import Login from '../pages/Login.vue'
import AdminUsers from '../pages/AdminUsers.vue'

const routes = [
  { path: '/', component: Login },
  { path: '/admin', component: AdminUsers },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

export default router