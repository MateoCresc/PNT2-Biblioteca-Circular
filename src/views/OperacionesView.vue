<script setup>
import { ref, onMounted } from 'vue'
import { obtenerLibros, actualizarLibro, agregarLibro } from '../services/librosService'
import { obtenerOperaciones, actualizarOperacion } from '../services/operacionesService'

const operaciones = ref([])
const libros = ref([])

onMounted(async () => {
  libros.value = await obtenerLibros()
  operaciones.value = await obtenerOperaciones()
})

const aprobarOperacion = async (operacion) => {
  if (operacion.tipo === 'retiro') {
    const libro = libros.value.find(l => l.id == operacion.libroId)

    if (!libro) {
      alert('No se encontró el libro')
      return
    }

    if (Number(libro.stock) <= 0) {
      alert('No hay stock disponible')
      return
    }

    libro.stock = Number(libro.stock) - 1
    await actualizarLibro(libro.titulo, libro)
  } else if (operacion.tipo === 'donacion') {
    if (operacion.libroId) {
      const libro = libros.value.find(l => l.id == operacion.libroId)

      if (!libro) {
        alert('No se encontró el libro')
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
}

const rechazarOperacion = async (operacion) => {
  await actualizarOperacion(operacion.id, { estado: 'rechazada' })
  operacion.estado = 'rechazada'
}
</script>

<template>
  <div class="contenido">

      <h2>Operaciones Pendientes</h2>

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
              <span
                class="badge"
                :class="{
                  pendiente: operacion.estado === 'pendiente',
                  aprobada: operacion.estado === 'aprobada',
                  rechazada: operacion.estado === 'rechazada'
                }"
              >
                {{ operacion.estado === 'pendiente' ? '⏳' :
                   operacion.estado === 'aprobada' ? '✅' : '❌' }}
                {{ operacion.estado.charAt(0).toUpperCase() + operacion.estado.slice(1) }}
              </span>
            </td>

            <td>

              <template v-if="operacion.estado === 'pendiente'">

                <button
                  class="btn-aprobar"
                  @click="aprobarOperacion(operacion)"
                >
                  Aprobar
                </button>

                <button
                  class="btn-rechazar"
                  @click="rechazarOperacion(operacion)"
                >
                  Rechazar
                </button>

              </template>

              <template v-else>
                -
              </template>

            </td>

          </tr>

        </tbody>

      </table>

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

.btn-aprobar {
  background-color: #10b981;
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  margin-right: 8px;
}

.btn-rechazar {
  background-color: #ef4444;
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
}
</style>
