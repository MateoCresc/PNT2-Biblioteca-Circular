<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

defineEmits(['toggle-sidebar'])

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
    <div class="topbar-left">
      <button class="hamburger" @click="$emit('toggle-sidebar')">
        ☰
      </button>
      <h1 class="topbar-titulo">Biblioteca Digital</h1>
    </div>

    <div class="usuario-dropdown" ref="dropdownRef" @click="toggleDropdown">
      <span class="usuario-nombre">{{ usuario?.nombre }}</span>
      <span class="usuario-rol">({{ usuario?.rol }})</span>
      <span class="dropdown-arrow">▼</span>

      <Transition name="dropdown">
        <div v-if="dropdownAbierto" class="dropdown-menu">
          <button class="dropdown-item" @click="cerrarSesion">
            Cerrar sesión
          </button>
        </div>
      </Transition>
    </div>
  </header>
</template>

<style scoped>
.topbar {
  background: var(--color-topbar);
  color: var(--color-text-inverse);
  padding: 14px 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
}

.topbar-left {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.hamburger {
  display: none;
  background: none;
  border: none;
  color: var(--color-text-inverse);
  font-size: 1.4rem;
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--radius-md);
  transition: background-color var(--transition-fast);
}

.hamburger:hover {
  background-color: rgba(255, 255, 255, 0.15);
}

@media (max-width: 768px) {
  .hamburger {
    display: block;
  }
}

.topbar-titulo {
  font-size: var(--font-size-lg);
  font-weight: 700;
  color: var(--color-text-inverse);
}

.usuario-dropdown {
  position: relative;
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  cursor: pointer;
  padding: var(--space-sm) 14px;
  border-radius: var(--radius-md);
  transition: background-color var(--transition-fast);
}

.usuario-dropdown:hover {
  background-color: rgba(255, 255, 255, 0.15);
}

.usuario-nombre {
  font-weight: 600;
  font-size: var(--font-size-sm);
}

.usuario-rol {
  font-size: var(--font-size-xs);
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
  background: var(--color-card);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-md);
  min-width: 180px;
  z-index: 100;
  overflow: hidden;
}

.dropdown-item {
  width: 100%;
  padding: 12px var(--space-md);
  border: none;
  background: none;
  color: var(--color-text);
  font-size: var(--font-size-sm);
  cursor: pointer;
  text-align: left;
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  transition: background-color var(--transition-fast), color var(--transition-fast);
}

.dropdown-item:hover {
  background-color: #fee2e2;
  color: var(--color-danger);
}

/* Dropdown transition */
.dropdown-enter-active {
  transition: all 0.15s ease-out;
}

.dropdown-leave-active {
  transition: all 0.1s ease-in;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}
</style>
