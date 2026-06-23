<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { obtenerOperacionesPorUsuario } from '../services/operacionesService'
import AppCard from '../components/AppCard.vue'
import AppButton from '../components/AppButton.vue'
import StatusBadge from '../components/StatusBadge.vue'
import LoadingSpinner from '../components/LoadingSpinner.vue'
import EmptyState from '../components/EmptyState.vue'

const router = useRouter()
const usuario = JSON.parse(localStorage.getItem('usuario'))

const operaciones = ref([])
const cargando = ref(true)

onMounted(async () => {
  if (!usuario) {
    router.push('/login')
    return
  }
  operaciones.value = await obtenerOperacionesPorUsuario(usuario.id)
  cargando.value = false
})
</script>

<template>
  <div class="mis-operaciones-page">
    <h2>Mis Operaciones</h2>

    <LoadingSpinner v-if="cargando" />

    <template v-else>
      <EmptyState
        v-if="operaciones.length === 0"
        icon="📋"
        title="No tenés operaciones todavía"
        description="Explorá el catálogo para retirar o donar tu primer libro."
      >
        <template #action>
          <AppButton variant="primary" @click="router.push('/catalogo')">
            Ir al catálogo
          </AppButton>
        </template>
      </EmptyState>

      <AppCard v-else>
        <table class="tabla-operaciones">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Tipo</th>
              <th>Libro</th>
              <th>Autor</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="op in operaciones" :key="op.id">
              <td>{{ op.fecha }}</td>
              <td>{{ op.tipo === 'retiro' ? 'Retiro' : 'Donación' }}</td>
              <td>{{ op.titulo }}</td>
              <td>{{ op.autor }}</td>
              <td>
                <StatusBadge :estado="op.estado" />
              </td>
            </tr>
          </tbody>
        </table>
      </AppCard>
    </template>
  </div>
</template>

<style scoped>
.mis-operaciones-page {
  padding: var(--space-lg);
}

h2 {
  margin-bottom: var(--space-lg);
}

.tabla-operaciones {
  width: 100%;
  border-collapse: collapse;
}

.tabla-operaciones th,
.tabla-operaciones td {
  border: 1px solid var(--color-border);
  padding: 12px;
  text-align: left;
  font-size: var(--font-size-sm);
}

.tabla-operaciones th {
  background: var(--color-primary);
  color: var(--color-text-inverse);
  font-weight: 600;
}

.tabla-operaciones tbody tr {
  transition: background-color var(--transition-fast);
}

.tabla-operaciones tbody tr:hover {
  background: #f9fafb;
}
</style>
