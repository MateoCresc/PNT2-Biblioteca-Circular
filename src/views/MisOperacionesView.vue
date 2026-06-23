<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { obtenerOperacionesPorUsuario } from '../services/operacionesService'

const router = useRouter()
const usuario = JSON.parse(localStorage.getItem('usuario'))

const operaciones = ref([])

onMounted(async () => {
  if (!usuario) {
    router.push('/login')
    return
  }
  operaciones.value = await obtenerOperacionesPorUsuario(usuario.id)
})
</script>

<template>
  <div class="contenido">
    <h2>Mis Operaciones</h2>

    <table v-if="operaciones.length > 0" class="tabla-operaciones">
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
            <span
              class="badge"
              :class="{
                pendiente: op.estado === 'pendiente',
                aprobada: op.estado === 'aprobada',
                rechazada: op.estado === 'rechazada'
              }"
            >
              {{ op.estado === 'pendiente' ? '⏳' : op.estado === 'aprobada' ? '✅' : '❌' }}
              {{ op.estado.charAt(0).toUpperCase() + op.estado.slice(1) }}
            </span>
          </td>
        </tr>
      </tbody>
    </table>

    <p v-else style="margin-top: 15px; color: #64748b;">No hay operaciones registradas.</p>
  </div>
</template>

<style scoped>
.contenido {
  flex: 1;
  padding: 20px;
}

h2 {
  margin-bottom: 20px;
}

.tabla-operaciones {
  width: 100%;
  border-collapse: collapse;
  background: var(--card);
}

.tabla-operaciones th,
.tabla-operaciones td {
  border: 1px solid var(--border);
  padding: 12px;
  text-align: left;
}

.tabla-operaciones th {
  background: var(--primary);
  color: white;
}

.badge {
  font-size: 0.9rem;
  padding: 0.5rem 0.8rem;
  border-radius: 6px;
  color: white;
}

.pendiente {
  background-color: #f59e0b;
}

.aprobada {
  background-color: #10b981;
}

.rechazada {
  background-color: #ef4444;
}
</style>
