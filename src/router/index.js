import { createRouter, createWebHistory } from 'vue-router'
import YandexMap from '../components/YandexMap.vue'
import Profile from '../components/Profile.vue'
import MinistryAdminProfile from '@/components/MinistryAdminProfile.vue'

const routes = [
  { path: '/', component: YandexMap },
  { path: '/profile', component: Profile },
  { path: '/ministry-admin-profile', component: MinistryAdminProfile }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
