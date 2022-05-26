import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue')
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/RegisterView.vue')
    },
    {
      path: '/figure/show',
      name: 'figureShow',
      component: () => import('../views/FigureShowView.vue')
    },
    {
      path: '/figure',
      name: 'figure',
      component: () => import('../views/FigureListView.vue')
    },
    {
      path: '/figure/add',
      name: 'figureAdd',
      component: () => import('../views/FigureView.vue'),
      props: { isEdit: false, id: null }
    },
    {
      path: '/figure/edit/:id',
      name: 'figureEdit',
      component: () => import('../views/FigureView.vue'),
      props: route => ({ isEdit: true, id: route.params.id })
    },
    {
      path: '/file',
      name: 'file',
      component: () => import('../views/FileListView.vue')
    },
    {
      path: '/file/add',
      name: 'fileAdd',
      component: () => import('../views/FileView.vue'),
      props: { isEdit: false, id: null }
    },
    {
      path: '/file/edit/:id',
      name: 'fileEdit',
      component: () => import('../views/FileView.vue'),
      props: route => ({ isEdit: true, id: route.params.id })
    },
    {
      path: '/user',
      name: 'user',
      component: () => import('../views/UserListView.vue')
    },
    {
      path: '/user/add',
      name: 'userAdd',
      component: () => import('../views/UserView.vue'),
      props: { isEdit: false, id: null }
    },
    {
      path: '/user/edit/:id',
      name: 'userEdit',
      component: () => import('../views/UserView.vue'),
      props: route => ({ isEdit: true, id: route.params.id })
    },
    {
      path: '/role',
      name: 'role',
      component: () => import('../views/RoleListView.vue')
    },
    {
      path: '/role/add',
      name: 'roleAdd',
      component: () => import('../views/RoleView.vue'),
      props: { isEdit: false, id: null }
    },
    {
      path: '/role/edit/:id',
      name: 'roleEdit',
      component: () => import('../views/RoleView.vue'),
      props: route => ({ isEdit: true, id: route.params.id })
    },
    {
      path: '/permission',
      name: 'permission',
      component: () => import('../views/PermissionListView.vue')
    },
    {
      path: '/permission/add',
      name: 'permissionAdd',
      component: () => import('../views/PermissionView.vue'),
      props: { isEdit: false, id: null }
    },
    {
      path: '/permission/edit/:id',
      name: 'permissionEdit',
      component: () => import('../views/PermissionView.vue'),
      props: route => ({ isEdit: true, id: route.params.id })
    },
    {
      path: '/me',
      name: 'me',
      component: () => import('../views/MeView.vue')
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue')
    }
  ]
})

export default router
