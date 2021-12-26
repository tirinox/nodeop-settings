import Vue from 'vue'
import VueRouter from 'vue-router'
import WelcomePage from "../views/WelcomePage";
import NodeSelectPage from "../views/NodeSelectPage";
import AlertsPage from "../views/AlertsPage";

Vue.use(VueRouter)

const routes = [
    {path: '/', component: WelcomePage},
    {path: '/select/nodes', component: NodeSelectPage},
    {path: '/alerts/', component: AlertsPage},
]

const router = new VueRouter({
    mode: 'history',
    base: process.env.BASE_URL,
    routes
})

export default router
