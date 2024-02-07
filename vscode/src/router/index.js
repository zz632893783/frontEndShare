import { createRouter, createWebHashHistory } from 'vue-router'

export const routes = [
    {
        path: '/',
        redirect: '/dinosaur'
    },
    {
        path: '/dinosaur',
        component: () => import('@/views/dinosaur/index.vue'),
        meta: {
            isMenu: true,
            menuName: '小恐龙'
        }
    },
    {
        path: '/textBall',
        component: () => import('@/views/textBall/index.vue'),
        meta: {
            isMenu: true,
            menuName: '文字球体'
        }
    },
    {
        path: '/gobang',
        component: () => import('@/views/gobang/index.vue'),
        meta: {
            isMenu: true,
            menuName: '五子棋'
        }
    }
]
export const router = createRouter({ history: createWebHashHistory(), routes })
