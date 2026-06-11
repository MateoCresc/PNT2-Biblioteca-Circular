<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const volver = () => {
  router.back()
}

const cerrarSesion = () => {
  router.push('/login')
}
</script>

<template>
  <aside class="sidebar">

    <h2>Biblioteca</h2>

    <nav>

      <RouterLink to="/catalogo" class="menu-item">
        Catálogo
      </RouterLink>

      <RouterLink to="/operaciones" class="menu-item">
        Operaciones
      </RouterLink>

      <RouterLink to="/usuarios" class="menu-item">
        Usuarios
      </RouterLink>

      <RouterLink to="/informes" class="menu-item">
        Informes
      </RouterLink>

      <button class="menu-item" @click="volver">
        Atrás
      </button>

      <button class="menu-item logout" @click="cerrarSesion">
        Cerrar sesión
      </button>

    </nav>

  </aside>
</template>

<style scoped>
.sidebar {
  width: 240px;
  min-height: 100vh;
  background: var(--card);
  border-right: 1px solid var(--border);
  padding: 20px;
}

.sidebar h2 {
  margin-bottom: 20px;
}

nav {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.menu-item {
  background: var(--primary);
  color: white;
  padding: 12px;
  border-radius: 8px;
  text-align: center;
}

.menu-item:hover {
  background: var(--primary-hover);
}

.logout {
  margin-top: 20px;
}
</style>