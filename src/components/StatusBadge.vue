<script setup>
defineProps({
  estado: {
    type: String,
    required: true,
    validator: v => ['pendiente', 'aprobada', 'rechazada', 'activo', 'inactivo'].includes(v)
  }
})

const iconos = {
  pendiente: '⏳',
  aprobada: '✅',
  rechazada: '❌',
  activo: '●',
  inactivo: '●'
}

const etiquetas = {
  pendiente: 'Pendiente',
  aprobada: 'Aprobada',
  rechazada: 'Rechazada',
  activo: 'Activo',
  inactivo: 'Inactivo'
}
</script>

<template>
  <span class="status-badge" :class="`status-badge--${estado}`">
    {{ iconos[estado] }} {{ etiquetas[estado] }}
  </span>
</template>

<style scoped>
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  font-size: var(--font-size-xs);
  font-weight: 500;
  padding: 4px 12px;
  border-radius: 6px;
  color: var(--color-text-inverse);
  white-space: nowrap;
}

.status-badge--pendiente {
  background-color: var(--color-warning);
}

.status-badge--aprobada,
.status-badge--activo {
  background-color: var(--color-success);
}

.status-badge--rechazada,
.status-badge--inactivo {
  background-color: var(--color-danger);
}
</style>
