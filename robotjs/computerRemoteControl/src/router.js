import { createRouter, createWebHashHistory } from 'vue-router';

// 2. 定义一些路由
// 每个路由都需要映射到一个组件。
// 我们后面再讨论嵌套路由。
const routes = [
    { path: '/', redirect: '/remoteControl' },
    { path: '/remoteControl', component: () => import('./views/remoteControl.vue') },
    { path: '/remoteDesktop', component: () => import('./views/remoteDesktop.vue') }
]

// 3. 创建路由实例并传递 `routes` 配置
// 你可以在这里输入更多的配置，但我们在这里
// 暂时保持简单
const router = createRouter({
    history: createWebHashHistory(),
    routes
});

export { router }