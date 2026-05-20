import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', name: 'Home', component: () => import('../views/HomeView.vue') },
  { path: '/members', name: 'Members', component: () => import('../views/MembersView.vue') },
  { path: '/members/:id', name: 'MemberDetail', component: () => import('../views/MemberDetailView.vue') },
]

export default createRouter({ history: createWebHistory(), routes, scrollBehavior: () => ({ top: 0 }) })
