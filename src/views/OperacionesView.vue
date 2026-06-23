<script setup>
import { ref, onMounted } from 'vue'
import { obtenerLibros, actualizarLibro, agregarLibro } from '../services/librosService'
import { obtenerOperaciones, actualizarOperacion } from '../services/operacionesService'
import { useToast } from '../composables/useToast'
import AppButton from '../components/AppButton.vue'
import AppCard from '../components/AppCard.vue'
import StatusBadge from '../components/StatusBadge.vue'
import LoadingSpinner from '../components/LoadingSpinner.vue'
import EmptyState from '../components/EmptyState.vue'

const { mostrar } = useToast()
const operaciones = ref([])
const libros = ref([])
const cargando = ref(true)

onMounted(async () => {
  libros.value = await obtenerLibros()
  operaciones.value = await obtenerOperaciones()
  cargando.value = false
})

const aprobarOperacion = async (operacion) => {
  if (operacion.tipo === 'retiro') {
    const libro = libros.value.find(l => l.id == operacion.libroId)

    if (!libro) {
      mostrar('No se encontró el libro', 'error')
      return
    }

    if (Number(libro.stock) <= 0) {
      mostrar('No hay stock disponible', 'warning')
      return
    }

    libro.stock = Number(libro.stock) - 1
    await actualizarLibro(libro.titulo, libro)
  } else if (operacion.tipo === 'donacion') {
    if (operacion.libroId) {
      const libro = libros.value.find(l => l.id == operacion.libroId)

      if (!libro) {
        mostrar('No se encontró el libro', 'error')
        return
      }

      libro.stock = Number(libro.stock) + 1
      await actualizarLibro(libro.titulo, libro)
    } else {
      await agregarLibro({
        titulo: operacion.titulo,
        autor: operacion.autor,
        genero: operacion.genero,
        stock: 1
      })
    }
  }

  await actualizarOperacion(operacion.id, { estado: 'aprobada' })
  operacion.estado = 'aprobada'
  libros.value = await obtenerLibros()
  mostrar('Operación aprobada', 'success')
}

const rechazarOperacion = async (operacion) => {
  await actualizarOperacion(operacion.id, { estado: 'rechazada' })
  operacion.estado = 'rechazada'
  mostrar('Operación rechazada', 'success')
}
</script>

<template>
  <div class="operaciones-page">

    <h2>Operaciones Pendientes</h2>

    <LoadingSpinner v-if="cargando" />

    <template v-else>
      <EmptyState
        v-if="operaciones.length === 0"
        icon="⚙️"
        title="No hay operaciones"
        description="Todavía no se registraron operaciones."
      />

      <AppCard v-else>
        <table class="tabla-operaciones">
          <thead>
            <tr>
              <th>Tipo</th>
              <th>Libro</th>
              <th>Autor</th>
              <th>Usuario</th>
              <th>Fecha</th>
              <th>Estado</th>
              <th>Acción</th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="operacion in operaciones"
              :key="operacion.id"
            >
              <td>{{ operacion.tipo === 'retiro' ? 'Retiro' : 'Donación' }}</td>
              <td>{{ operacion.titulo }}</td>
              <td>{{ operacion.autor }}</td>
              <td>{{ operacion.usuarioNombre }}</td>
              <td>{{ operacion.fecha }}</td>
              <td>
                <StatusBadge :estado="operacion.estado" />
              </td>
              <td>
                <template v-if="operacion.estado === 'pendiente'">
                  <div class="acciones">
                    <AppButton size="sm" variant="success" @click="aprobarOperacion(operacion)">
                      Aprobar
                    </AppButton>
                    <AppButton size="sm" variant="danger" @click="rechazarOperacion(operacion)">
                      Rechazar
                    </AppButton>
                  </div>
                </template>
                <template v-else>
                  -
                </template>
              </td>
            </tr>
          </tbody>
        </table>
      </AppCard>
    </template>

  </div>
</template>

<style scoped>
.operaciones-page {
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

.acciones {
  display: flex;
  gap: var(--space-sm);
}
</style>
