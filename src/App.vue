<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import Sidebar from './components/Sidebar.vue'

const route = useRoute()
const mostrarSidebar = computed(() => route.path !== '/login')
</script>

<template>
  <div class="app-layout">
    <Sidebar v-if="mostrarSidebar" />
    <main :class="['main-content', { 'main-content--full': !mostrarSidebar }]">
      <router-view />
    </main>
  </div>
</template>

<style>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: system-ui, -apple-system, sans-serif;
  background-color: #f8fafc;
}

.app-layout {
  display: flex;
  min-height: 100vh;
}

.main-content {
  flex: 1;
  overflow-y: auto;
}
</style>
