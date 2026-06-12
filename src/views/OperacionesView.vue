<script setup>
//import Sidebar from '../components/Sidebar.vue'
import { ref } from 'vue'

const operaciones = ref([
  {
    id: 1,
    tipo: 'Préstamo',
    libro: 'El Principito',
    autor: 'Antoine de Saint-Exupéry',
    usuario: 'Franco',
    estado: 'Pendiente'
  },
  {
    id: 2,
    tipo: 'Devolución',
    libro: '1984',
    autor: 'George Orwell',
    usuario: 'Ana',
    estado: 'Pendiente'
  },
  {
    id: 3,
    tipo: 'Venta',
    libro: 'Clean Code',
    autor: 'Robert Martin',
    usuario: 'Juan',
    estado: 'Pendiente'
  }
])

const aprobarOperacion = (operacion) => {
  operacion.estado = 'Aprobada'
}

const rechazarOperacion = (operacion) => {
  operacion.estado = 'Rechazada'
}
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