import {createRouter, createWebHistory} from 'vue-router'
import WelcomePage from '@/views/WelcomePage.vue'
import NodeSelectPage from '@/views/NodeSelectPage.vue'
import AlertsPage from '@/views/AlertsPage.vue'

const routes = [
    {path: '/', component: WelcomePage},
    {path: '/select/nodes', component: NodeSelectPage},
    {path: '/alerts', component: AlertsPage},
    {path: '/:pathMatch(.*)*', redirect: '/'},
]

export default createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
})
