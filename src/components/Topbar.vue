<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const usuario = JSON.parse(localStorage.getItem('usuario'))
const dropdownAbierto = ref(false)
const dropdownRef = ref(null)

const toggleDropdown = () => {
  dropdownAbierto.value = !dropdownAbierto.value
}

const cerrarDropdown = (e) => {
  if (dropdownRef.value && !dropdownRef.value.contains(e.target)) {
    dropdownAbierto.value = false
  }
}

onMounted(() => document.addEventListener('click', cerrarDropdown))
onUnmounted(() => document.removeEventListener('click', cerrarDropdown))

const cerrarSesion = () => {
  localStorage.removeItem('usuario')
  router.push('/login')
}
</script>

<template>
  <header class="topbar">
    <div>
      <h1 class="topbar-titulo">📚 Biblioteca Digital</h1>
    </div>

    <div class="usuario-dropdown" ref="dropdownRef" @click="toggleDropdown">
      <span class="usuario-nombre">{{ usuario?.nombre }}</span>
      <span class="usuario-rol">({{ usuario?.rol }})</span>
      <span class="dropdown-arrow">▼</span>

      <div v-if="dropdownAbierto" class="dropdown-menu">
        <button class="dropdown-item" @click="cerrarSesion">
          🚪 Cerrar sesión
        </button>
      </div>
    </div>
  </header>
</template>

<style scoped>
.topbar {
  background: #1e40af;
  color: white;
  padding: 14px 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
}

.topbar-titulo {
  font-size: 1.2rem;
  font-weight: 700;
}

.usuario-dropdown {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 8px 14px;
  border-radius: 8px;
  transition: background-color 0.15s;
}

.usuario-dropdown:hover {
  background-color: rgba(255, 255, 255, 0.15);
}

.usuario-nombre {
  font-weight: 600;
  font-size: 0.95rem;
}

.usuario-rol {
  font-size: 0.85rem;
  opacity: 0.8;
}

.dropdown-arrow {
  font-size: 0.65rem;
  opacity: 0.7;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 6px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  min-width: 180px;
  z-index: 100;
  overflow: hidden;
}

.dropdown-item {
  width: 100%;
  padding: 12px 16px;
  border: none;
  background: none;
  color: #334155;
  font-size: 0.9rem;
  cursor: pointer;
  text-align: left;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background-color 0.15s;
}

.dropdown-item:hover {
  background-color: #fee2e2;
  color: #dc2626;
}
</style>
