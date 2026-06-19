<script setup>
//import Sidebar from '../components/Sidebar.vue'

import { ref, onMounted } from 'vue'
import { obtenerLibros, actualizarLibro } from '../services/librosService'

const operaciones = ref([])
const libros = ref([])

const aprobarOperacion = async (operacion) => {
  const libro = libros.value.find(l => l.id == operacion.libroId)

  if (!libro) {
    alert("No se encontró el libro")
    return
  }

  if (Number(libro.stock) > 0) {
    libro.stock = Number(libro.stock) - 1

    await actualizarLibro(libro)

    libros.value = await obtenerLibros()

    operacion.estado = 'Aprobada'
  } else {
    alert("No hay stock disponible")
    operacion.estado = 'Pendiente'
  }
}

const rechazarOperacion = (operacion) => {
  operacion.estado = 'Rechazada'
}

onMounted(async () => {
  libros.value = await obtenerLibros()

  operaciones.value = libros.value.map((libro) => ({
    id: crypto.randomUUID(),
    libroId: libro.id,
    tipo: 'Préstamo',
    libro: libro.titulo,
    autor: libro.autor,
    usuario: 'Pendiente de asignar',
    estado: 'Pendiente'
  }))
})

</script>

<template>
  <div class="contenido">

      <h2>Operaciones Pendientes</h2>

      <table class="tabla-operaciones">

        <thead>
          <tr>
            <th>ID</th>
            <th>Tipo</th>
            <th>Libro</th>
            <th>Autor</th>
            <th>Usuario</th>
            <th>Estado</th>
            <th>Acción</th>
          </tr>
        </thead>

        <tbody>

          <tr
            v-for="operacion in operaciones"
            :key="operacion.id"
          >
            <td>{{ operacion.id }}</td>
            <td>{{ operacion.tipo }}</td>
            <td>{{ operacion.libro }}</td>
            <td>{{ operacion.autor }}</td>
            <td>{{ operacion.usuario }}</td>

            <td>
              <span
                class="badge"
                :class="{
                  pendiente: operacion.estado === 'Pendiente',
                  aprobada: operacion.estado === 'Aprobada',
                  rechazada: operacion.estado === 'Rechazada'
                }"
              >
                {{ operacion.estado === 'Pendiente' ? '⏳' :
                   operacion.estado === 'Aprobada' ? '✅' : '❌' }}
                {{ operacion.estado }}
              </span>
            </td>

            <td>

              <template v-if="operacion.estado === 'Pendiente'">

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