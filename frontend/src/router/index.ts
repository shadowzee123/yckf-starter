import { createRouter, createWebHashHistory } from 'vue-router'
import Home from '../pages/Home.vue'
import Company from '../pages/Company.vue'
import FreeTraining from '../pages/FreeTraining.vue'
import PremiumTraining from '../pages/PremiumTraining.vue'
import Blogs from '../pages/Blogs.vue'
import Contact from '../pages/Contact.vue'
import Complaints from '../pages/Complaints.vue'
import StudentDashboard from '../pages/StudentDashboard.vue'
import VerifyCertificate from '../pages/VerifyCertificate.vue'
import Login from '../pages/Login.vue'
import AdminUsers from '../pages/AdminUsers.vue'
import AdminCourses from '../pages/AdminCourses.vue'
import BotSupport from '../pages/BotSupport.vue'

const routes = [
  { path: '/', component: Home },
  { path: '/company', component: Company },
  { path: '/free-training', component: FreeTraining },
  { path: '/premium-training', component: PremiumTraining },
  { path: '/blogs', component: Blogs },
  { path: '/contact', component: Contact },
  { path: '/complaints', component: Complaints },
  { path: '/student-dashboard', component: StudentDashboard },
  { path: '/verify', component: VerifyCertificate },
  { path: '/login', component: Login },
  { path: '/admin', component: AdminUsers },
  { path: '/admin/courses', component: AdminCourses },
  { path: '/bot-support', component: BotSupport },
]

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
