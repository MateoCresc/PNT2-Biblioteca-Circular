<script setup>
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import Sidebar from './components/Sidebar.vue'
import Topbar from './components/Topbar.vue'
import ToastContainer from './components/ToastContainer.vue'
import { crearToastProvider } from './composables/useToast'

const route = useRoute()
const mostrarNav = computed(() => route.path !== '/login')
const sidebarAbierto = ref(true)

const toggleSidebar = () => {
  sidebarAbierto.value = !sidebarAbierto.value
}

crearToastProvider()
</script>

<template>
  <div class="app-layout">
    <Sidebar v-if="mostrarNav" :abierto="sidebarAbierto" @cerrar="sidebarAbierto = false" />
    <div class="main-wrapper">
      <Topbar v-if="mostrarNav" @toggle-sidebar="toggleSidebar" />
      <main :class="['main-content', { 'main-content--full': !mostrarNav }]">
        <router-view v-slot="{ Component }">
          <Transition name="fade" mode="out-in">
            <component :is="Component" />
          </Transition>
        </router-view>
      </main>
    </div>
    <ToastContainer />
  </div>
</template>

<style>
.app-layout {
  display: flex;
  min-height: 100vh;
}

.main-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.main-content {
  flex: 1;
  overflow-y: auto;
}
</style>
