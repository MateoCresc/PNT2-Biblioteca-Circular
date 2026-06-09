import { createRouter, createWebHistory } from 'vue-router'

import LoginView from '../views/LoginView.vue'
import CatalogoView from '../views/CatalogoView.vue'
import OperacionesView from '../views/OperacionesView.vue'
import UsuariosView from '../views/UsuariosView.vue'
import InformesView from '../views/InformesView.vue'

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    component: LoginView
  },
  {
    path: '/catalogo',
    component: CatalogoView
  },
  {
    path: '/operaciones',
    component: OperacionesView
  },
  {
    path: '/usuarios',
    component: UsuariosView
  },
  {
    path: '/informes',
    component: InformesView
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router