<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import Sidebar from './components/Sidebar.vue'
import Topbar from './components/Topbar.vue'

const route = useRoute()
const mostrarNav = computed(() => route.path !== '/login')
</script>

<template>
  <div class="app-layout">
    <Sidebar v-if="mostrarNav" />
    <div class="main-wrapper">
      <Topbar v-if="mostrarNav" />
      <main :class="['main-content', { 'main-content--full': !mostrarNav }]">
        <router-view />
      </main>
    </div>
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
