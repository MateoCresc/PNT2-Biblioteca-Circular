<script setup>
import { ref, computed, onMounted } from 'vue'
import { obtenerLibros } from '../services/librosService'
import { obtenerUsuarios } from '../services/usuariosService'
import { obtenerOperaciones } from '../services/operacionesService'

const solapaActiva = ref('resumen')

const libros = ref([])
const usuarios = ref([])
const operaciones = ref([])

onMounted(async () => {
  libros.value = await obtenerLibros()
  usuarios.value = await obtenerUsuarios()
  operaciones.value = await obtenerOperaciones()
})

const librosConStockBajo = computed(() =>
  libros.value.filter(l => Number(l.stock) < 3)
)

const usuariosActivos = computed(() =>
  usuarios.value.filter(u => u.estado === 'activo').length
)

const generosPorCantidad = computed(() => {
  const conteo = {}
  libros.value.forEach(l => {
    if (l.genero) conteo[l.genero] = (conteo[l.genero] || 0) + 1
  })
  return Object.entries(conteo)
    .map(([genero, cantidad]) => ({ genero, cantidad }))
    .sort((a, b) => b.cantidad - a.cantidad)
})

const maxGenero = computed(() =>
  Math.max(...generosPorCantidad.value.map(g => g.cantidad), 1)
)

const totalRetiros = computed(() =>
  operaciones.value.filter(op => op.tipo === 'retiro').length
)

const totalDonaciones = computed(() =>
  operaciones.value.filter(op => op.tipo === 'donacion').length
)

const retirosAprobados = computed(() =>
  operaciones.value.filter(op => op.tipo === 'retiro' && op.estado === 'aprobada').length
)

const operacionesPendientes = computed(() =>
  operaciones.value.filter(op => op.estado === 'pendiente').length
)

const operacionesAprobadas = computed(() =>
  operaciones.value.filter(op => op.estado === 'aprobada').length
)

const operacionesRechazadas = computed(() =>
  operaciones.value.filter(op => op.estado === 'rechazada').length
)

const ratioCircular = computed(() => {
  const don = operaciones.value.filter(op => op.tipo === 'donacion' && op.estado === 'aprobada').length
  const ret = retirosAprobados.value
  if (don === 0 && ret === 0) return '0:0'
  if (ret === 0) return `${don} solo donaciones`
  const ratio = don / ret
  return Number.isInteger(ratio) ? `${ratio}:1` : `${ratio.toFixed(1)}:1`
})

const operacionesRecientes = computed(() =>
  [...operaciones.value]
    .sort((a, b) => {
      const [dA, mA, yA] = a.fecha.split('/').map(Number)
      const [dB, mB, yB] = b.fecha.split('/').map(Number)
      return new Date(yB, mB - 1, dB) - new Date(yA, mA - 1, dA)
    })
    .slice(0, 5)
)

const maxOperacionTipo = computed(() =>
  Math.max(totalRetiros.value, totalDonaciones.value, 1)
)

const usuariosInactivos = computed(() =>
  usuarios.value.filter(u => u.estado === 'inactivo').length
)

const rolesPorCantidad = computed(() => {
  const conteo = {}
  usuarios.value.forEach(u => {
    if (u.rol) conteo[u.rol] = (conteo[u.rol] || 0) + 1
  })
  return Object.entries(conteo)
    .map(([rol, cantidad]) => ({ rol, cantidad }))
    .sort((a, b) => b.cantidad - a.cantidad)
})

const maxRol = computed(() =>
  Math.max(...rolesPorCantidad.value.map(r => r.cantidad), 1)
)
</script>

<template>
  <div class="informes-page">

    <div class="informes-header">
      <h2>📊 Informes</h2>
    </div>

    <!-- Solapas -->
    <div class="solapas">
      <button
        v-for="solapa in ['resumen', 'libros', 'operaciones', 'usuarios']"
        :key="solapa"
        class="solapa-btn"
        :class="{ activa: solapaActiva === solapa }"
        @click="solapaActiva = solapa"
      >
        {{ solapa.charAt(0).toUpperCase() + solapa.slice(1) }}
      </button>
    </div>

    <!-- RESUMEN -->
    <div v-if="solapaActiva === 'resumen'" class="contenido">

      <div class="kpi-grid">
        <div class="kpi-card">
          <span class="kpi-valor">{{ libros.length }}</span>
          <span class="kpi-label">Total libros</span>
        </div>
        <div class="kpi-card">
          <span class="kpi-valor">{{ usuariosActivos }}</span>
          <span class="kpi-label">Usuarios activos</span>
        </div>
        <div class="kpi-card">
          <span class="kpi-valor">{{ retirosAprobados }}</span>
          <span class="kpi-label">Retiros aprobados</span>
        </div>
        <div class="kpi-card kpi-alerta">
          <span class="kpi-valor">{{ operacionesPendientes }}</span>
          <span class="kpi-label">Pendientes</span>
        </div>
      </div>

      <div class="resumen-cols">
        <div class="seccion">
          <h3>Operaciones por tipo</h3>
          <div class="barras">
            <div class="barra-fila">
              <span class="barra-label">Retiros</span>
              <div class="barra-track">
                <div class="barra-fill azul" :style="{ width: (totalRetiros / maxOperacionTipo * 100) + '%' }"></div>
              </div>
              <span class="barra-valor">{{ totalRetiros }}</span>
            </div>
            <div class="barra-fila">
              <span class="barra-label">Donaciones</span>
              <div class="barra-track">
                <div class="barra-fill verde" :style="{ width: (totalDonaciones / maxOperacionTipo * 100) + '%' }"></div>
              </div>
              <span class="barra-valor">{{ totalDonaciones }}</span>
            </div>
          </div>
        </div>

        <div class="seccion">
          <h3>Últimas operaciones</h3>
          <p v-if="operacionesRecientes.length === 0" class="vacio">No hay operaciones registradas.</p>
          <table v-else class="tabla">
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Libro</th>
                <th>Usuario</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(op, i) in operacionesRecientes" :key="i">
                <td>{{ op.tipo === 'retiro' ? 'Retiro' : 'Donación' }}</td>
                <td>{{ op.titulo }}</td>
                <td>{{ op.usuarioNombre }}</td>
                <td>
                  <span class="badge" :class="{
                    pendiente: op.estado === 'pendiente',
                    aprobada:  op.estado === 'aprobada',
                    rechazada: op.estado === 'rechazada'
                  }">
                    {{ op.estado === 'pendiente' ? '⏳' : op.estado === 'aprobada' ? '✅' : '❌' }}
                    {{ op.estado.charAt(0).toUpperCase() + op.estado.slice(1) }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>

    <!-- LIBROS -->
    <div v-if="solapaActiva === 'libros'" class="contenido">

      <div class="seccion">
        <h3>Libros con stock bajo</h3>
        <p v-if="librosConStockBajo.length === 0" class="vacio">No hay libros con stock bajo.</p>
        <table v-else class="tabla">
          <thead>
            <tr>
              <th>Título</th>
              <th>Autor</th>
              <th>Género</th>
              <th>Stock</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="libro in librosConStockBajo" :key="libro.id">
              <td>{{ libro.titulo }}</td>
              <td>{{ libro.autor }}</td>
              <td>{{ libro.genero }}</td>
              <td><span class="badge badge-alerta">{{ libro.stock }}</span></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="seccion">
        <h3>Géneros más populares</h3>
        <div class="barras">
          <div class="barra-fila" v-for="item in generosPorCantidad" :key="item.genero">
            <span class="barra-label">{{ item.genero }}</span>
            <div class="barra-track">
              <div class="barra-fill azul" :style="{ width: (item.cantidad / maxGenero * 100) + '%' }"></div>
            </div>
            <span class="barra-valor">{{ item.cantidad }}</span>
          </div>
        </div>
      </div>

    </div>

    <!-- OPERACIONES -->
    <div v-if="solapaActiva === 'operaciones'" class="contenido">

      <div class="kpi-grid">
        <div class="kpi-card kpi-verde">
          <span class="kpi-valor">{{ operacionesAprobadas }}</span>
          <span class="kpi-label">Aprobadas</span>
        </div>
        <div class="kpi-card kpi-rojo">
          <span class="kpi-valor">{{ operacionesRechazadas }}</span>
          <span class="kpi-label">Rechazadas</span>
        </div>
        <div class="kpi-card kpi-amarillo">
          <span class="kpi-valor">{{ operacionesPendientes }}</span>
          <span class="kpi-label">Pendientes</span>
        </div>
        <div class="kpi-card">
          <span class="kpi-valor kpi-ratio">{{ ratioCircular }}</span>
          <span class="kpi-label">Ratio Don/Ret</span>
        </div>
      </div>

      <div class="seccion">
        <h3>Operaciones recientes</h3>
        <p v-if="operacionesRecientes.length === 0" class="vacio">No hay operaciones registradas.</p>
        <table v-else class="tabla">
          <thead>
            <tr>
              <th>Tipo</th>
              <th>Libro</th>
              <th>Usuario</th>
              <th>Fecha</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(op, i) in operacionesRecientes" :key="i">
              <td>{{ op.tipo === 'retiro' ? 'Retiro' : 'Donación' }}</td>
              <td>{{ op.titulo }}</td>
              <td>{{ op.usuarioNombre }}</td>
              <td>{{ op.fecha }}</td>
              <td>
                <span class="badge" :class="{
                  pendiente: op.estado === 'pendiente',
                  aprobada:  op.estado === 'aprobada',
                  rechazada: op.estado === 'rechazada'
                }">
                  {{ op.estado === 'pendiente' ? '⏳' : op.estado === 'aprobada' ? '✅' : '❌' }}
                  {{ op.estado.charAt(0).toUpperCase() + op.estado.slice(1) }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

    </div>

    <!-- USUARIOS -->
    <div v-if="solapaActiva === 'usuarios'" class="contenido">

      <div class="kpi-grid kpi-grid-3">
        <div class="kpi-card">
          <span class="kpi-valor">{{ usuarios.length }}</span>
          <span class="kpi-label">Total usuarios</span>
        </div>
        <div class="kpi-card kpi-verde">
          <span class="kpi-valor">{{ usuariosActivos }}</span>
          <span class="kpi-label">Activos</span>
        </div>
        <div class="kpi-card kpi-rojo">
          <span class="kpi-valor">{{ usuariosInactivos }}</span>
          <span class="kpi-label">Inactivos</span>
        </div>
      </div>

      <div class="seccion">
        <h3>Distribución por rol</h3>
        <div class="barras">
          <div class="barra-fila" v-for="item in rolesPorCantidad" :key="item.rol">
            <span class="barra-label capitalize">{{ item.rol }}</span>
            <div class="barra-track">
              <div class="barra-fill azul" :style="{ width: (item.cantidad / maxRol * 100) + '%' }"></div>
            </div>
            <span class="barra-valor">{{ item.cantidad }}</span>
          </div>
        </div>
      </div>

    </div>

  </div>
</template>

<style scoped>
.informes-page {
  flex: 1;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.informes-header h2 {
  font-size: 1.5rem;
  color: var(--text);
}

/* Solapas */
.solapas {
  display: flex;
  gap: 0;
  border-bottom: 2px solid var(--border);
}

.solapa-btn {
  padding: 10px 28px;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
  font-size: 0.95rem;
  font-weight: 500;
  color: #64748b;
  cursor: pointer;
  transition: color 0.15s, border-color 0.15s;
}

.solapa-btn:hover {
  color: var(--primary);
}

.solapa-btn.activa {
  color: var(--primary);
  border-bottom-color: var(--primary);
}

/* Contenido */
.contenido {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* KPI Grid */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.kpi-grid-3 {
  grid-template-columns: repeat(3, 1fr);
}

.kpi-card {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 20px 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.kpi-icono  { font-size: 1.6rem; }
.kpi-valor  { font-size: 2rem; font-weight: 700; color: var(--text); }
.kpi-label  { font-size: 0.82rem; color: #64748b; text-align: center; }

.kpi-alerta  .kpi-valor { color: #f59e0b; }
.kpi-verde   .kpi-valor { color: #10b981; }
.kpi-rojo    .kpi-valor { color: #ef4444; }
.kpi-amarillo .kpi-valor { color: #f59e0b; }

/* Secciones */
.seccion {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 20px;
}

.seccion h3 {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 16px;
  color: var(--text);
}

/* Barras CSS */
.barras {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.barra-fila {
  display: flex;
  align-items: center;
  gap: 12px;
}

.barra-label {
  width: 120px;
  font-size: 0.88rem;
  color: #64748b;
  text-align: right;
  flex-shrink: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.barra-track {
  flex: 1;
  background: #f1f5f9;
  border-radius: 4px;
  height: 22px;
  overflow: hidden;
}

.barra-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.4s ease;
  min-width: 4px;
}

.barra-fill.azul    { background: var(--primary); }
.barra-fill.verde   { background: #10b981; }
.barra-fill.naranja { background: #f59e0b; }

.barra-valor {
  width: 28px;
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--text);
  text-align: right;
  flex-shrink: 0;
}

/* Tabla */
.tabla {
  width: 100%;
  border-collapse: collapse;
}

.tabla th,
.tabla td {
  border: 1px solid var(--border);
  padding: 10px 12px;
  text-align: left;
  font-size: 0.9rem;
}

.tabla th {
  background: var(--primary);
  color: white;
  font-weight: 600;
}

.tabla tr:nth-child(even) td {
  background: #f8fafc;
}

/* Badges */
.badge {
  font-size: 0.8rem;
  padding: 4px 10px;
  border-radius: 6px;
  color: white;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.badge-alerta { background: #f59e0b; }
.pendiente    { background: #f59e0b; }
.aprobada     { background: #10b981; }
.rechazada    { background: #ef4444; }

.vacio {
  color: #94a3b8;
  font-size: 0.9rem;
  padding: 8px 0;
}

/* Layout columnas resumen */
.resumen-cols {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

/* Ratio */
.kpi-ratio {
  font-size: 1.4rem;
}

/* Capitalize */
.capitalize {
  text-transform: capitalize;
}
</style>
