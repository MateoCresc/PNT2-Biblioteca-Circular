<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const volver = () => {
  router.back()
}


const usuario = JSON.parse(localStorage.getItem('usuario'))

const cerrarSesion = () => {
  localStorage.removeItem('usuario')
  router.push('/login')
}

const todosLosItems = [
  { label: 'Catálogo',    icon: '📚', to: '/catalogo',    roles: ['admin', 'bibliotecario', 'usuario'] },
  { label: 'Operaciones', icon: '⚙️',  to: '/operaciones', roles: ['admin', 'bibliotecario'] },
  { label: 'Usuarios',    icon: '👥', to: '/usuarios',    roles: ['admin'] },
  { label: 'Informes',    icon: '📊', to: '/informes',    roles: ['admin', 'bibliotecario'] },
]

const navItems = computed(() =>
  todosLosItems.filter(item => item.roles.includes(usuario?.rol))
)
</script>

<template>
  <aside class="sidebar">
    <div class="sidebar-header">
      <span class="sidebar-logo">📖</span>
      <span class="sidebar-title">Biblioteca</span>
    </div>

    <nav class="sidebar-nav">
      <RouterLink
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        class="nav-item"
        active-class="nav-item--active"
      >
        <span class="nav-icon">{{ item.icon }}</span>
        <span class="nav-label">{{ item.label }}</span>
      </RouterLink>
    </nav>

    <div class="sidebar-footer">
      <button class="logout-btn" @click="cerrarSesion">
        <span>🚪</span>
        <span>Cerrar sesión</span>
      </button>
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  width: 220px;
  min-height: 100vh;
  background-color: #1e293b;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

.sidebar-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 24px 20px;
  border-bottom: 1px solid #334155;
}

.sidebar-logo {
  font-size: 1.5rem;
}

.sidebar-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #f1f5f9;
  letter-spacing: 0.02em;
}

.sidebar-nav {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 16px 0;
  gap: 4px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 20px;
  color: #94a3b8;
  text-decoration: none;
  font-size: 0.95rem;
  border-radius: 6px;
  margin: 0 8px;
  transition: background-color 0.15s, color 0.15s;
}

.nav-item:hover {
  background-color: #334155;
  color: #f1f5f9;
}

.nav-item--active {
  background-color: #3b82f6;
  color: #ffffff;
}

.nav-icon {
  font-size: 1.1rem;
  width: 22px;
  text-align: center;
}

.nav-label {
  font-weight: 500;
}

.sidebar-footer {
  padding: 16px 8px;
  border-top: 1px solid #334155;
}

.logout-btn {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 20px;
  background: none;
  border: none;
  color: #94a3b8;
  font-size: 0.95rem;
  cursor: pointer;
  border-radius: 6px;
  transition: background-color 0.15s, color 0.15s;
}

.logout-btn:hover {
  background-color: #334155;
  color: #f87171;
}
</style>
