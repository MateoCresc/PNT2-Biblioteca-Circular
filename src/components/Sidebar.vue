<script setup>
import { computed } from 'vue'

defineProps({
  abierto: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['cerrar'])

const cerrarSiMobile = () => {
  if (window.innerWidth <= 768) {
    emit('cerrar')
  }
}

const usuario = JSON.parse(localStorage.getItem('usuario'))

const todosLosItems = [
  { label: 'Catálogo',    icon: '📚', to: '/catalogo',    roles: ['admin', 'bibliotecario', 'usuario'] },
  { label: 'Operaciones', icon: '⚙️',  to: '/operaciones', roles: ['admin', 'bibliotecario'] },
  { label: 'Usuarios',    icon: '👥', to: '/usuarios',    roles: ['admin'] },
  { label: 'Informes',    icon: '📊', to: '/informes',    roles: ['admin', 'bibliotecario'] },
  { label: 'Mis Operaciones', icon: '📋', to: '/mis-operaciones', roles: ['usuario'] },
]

const navItems = computed(() =>
  todosLosItems.filter(item => item.roles.includes(usuario?.rol))
)
</script>

<template>
  <!-- Overlay mobile -->
  <Transition name="overlay">
    <div v-if="abierto" class="sidebar-overlay" @click="emit('cerrar')"></div>
  </Transition>

  <Transition name="sidebar">
    <aside v-if="abierto" class="sidebar">
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
          @click="cerrarSiMobile"
        >
          <span class="nav-icon">{{ item.icon }}</span>
          <span class="nav-label">{{ item.label }}</span>
        </RouterLink>
      </nav>
    </aside>
  </Transition>
</template>

<style scoped>
.sidebar {
  width: 220px;
  min-height: 100vh;
  background-color: var(--color-sidebar);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  z-index: 100;
}

.sidebar-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: var(--space-lg) 20px;
  border-bottom: 1px solid var(--color-border-dark);
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
  padding: var(--space-md) 0;
  gap: var(--space-xs);
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 20px;
  color: var(--color-text-light);
  text-decoration: none;
  font-size: var(--font-size-sm);
  border-radius: 6px;
  margin: 0 var(--space-sm);
  transition: background-color var(--transition-fast), color var(--transition-fast);
  border-left: 3px solid transparent;
}

.nav-item:hover {
  background-color: rgba(255, 255, 255, 0.08);
  color: #f1f5f9;
}

.nav-item--active {
  background-color: rgba(59, 130, 246, 0.2);
  color: #ffffff;
  border-left-color: var(--color-primary);
}

.nav-icon {
  font-size: 1.1rem;
  width: 22px;
  text-align: center;
}

.nav-label {
  font-weight: 500;
}

.sidebar-overlay {
  display: none;
}

/* Mobile */
@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    box-shadow: 4px 0 20px rgba(0, 0, 0, 0.3);
  }

  .sidebar-overlay {
    display: block;
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.4);
    z-index: 99;
  }
}

/* Transiciones sidebar mobile */
.sidebar-enter-active,
.sidebar-leave-active {
  transition: transform 0.25s ease;
}

.sidebar-enter-from,
.sidebar-leave-to {
  transform: translateX(-100%);
}

.overlay-enter-active,
.overlay-leave-active {
  transition: opacity 0.25s ease;
}

.overlay-enter-from,
.overlay-leave-to {
  opacity: 0;
}
</style>
