import { createRouter, createWebHashHistory } from 'vue-router'

import Login from '../pages/Login.vue'
import AdminUsers from '../pages/AdminUsers.vue'
import StudentDashboard from '../pages/StudentDashboard.vue'
import Home from '../pages/Home.vue'
import FreeTraining from '../pages/FreeTraining.vue'
import PremiumTraining from '../pages/PremiumTraining.vue'
import Blogs from '../pages/Blogs.vue'
import Company from '../pages/Company.vue'
import Complaints from '../pages/Complaints.vue'
import BotSupport from '../pages/BotSupport.vue'
import Contact from '../pages/Contact.vue'

const routes = [
  { path: '/', component: Home },

  { path: '/free-training', component: FreeTraining },

  { path: '/premium-training', component: PremiumTraining },

  { path: '/blogs', component: Blogs },

  { path: '/contact', component: Contact },

  { path: '/complaints', component: Complaints },

  { path: '/bot-support', component: BotSupport },

  { path: '/company', component: Company },
  

  { path: '/admin', component: AdminUsers },

  { path: '/student-dashboard', component: StudentDashboard },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

export default router