import { createRouter, createWebHistory } from 'vue-router'

import LoginView from '../views/LoginView.vue'
import CatalogoView from '../views/CatalogoView.vue'
import OperacionesView from '../views/OperacionesView.vue'
import UsuariosView from '../views/UsuariosView.vue'
import InformesView from '../views/InformesView.vue'
import MisOperacionesView from '../views/MisOperacionesView.vue'

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
    component: CatalogoView,
    meta: { roles: ['admin', 'bibliotecario', 'usuario'] }
  },
  {
    path: '/operaciones',
    component: OperacionesView,
    meta: { roles: ['admin', 'bibliotecario'] }
  },
  {
    path: '/usuarios',
    component: UsuariosView,
    meta: { roles: ['admin'] }
  },
  {
    path: '/informes',
    component: InformesView,
    meta: { roles: ['admin', 'bibliotecario'] }
  },
  {
    path: '/mis-operaciones',
    component: MisOperacionesView,
    meta: { roles: ['usuario'] }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to) => {
  const usuario = JSON.parse(localStorage.getItem('usuario'))

  if (to.path === '/login') {
    return usuario ? '/catalogo' : true
  }

  if (!usuario) return '/login'

  const rolesPermitidos = to.meta.roles
  if (rolesPermitidos && !rolesPermitidos.includes(usuario.rol)) {
    return '/catalogo'
  }
})

export default router
