<script setup>
import { ref, computed, onMounted } from 'vue'
import { obtenerLibros } from '../services/librosService'
import { obtenerUsuarios } from '../services/usuariosService'
import { obtenerOperaciones } from '../services/operacionesService'
import StatusBadge from '../components/StatusBadge.vue'
import LoadingSpinner from '../components/LoadingSpinner.vue'

const solapaActiva = ref('resumen')
const cargando = ref(true)

const libros = ref([])
const usuarios = ref([])
const operaciones = ref([])

onMounted(async () => {
  libros.value = await obtenerLibros()
  usuarios.value = await obtenerUsuarios()
  operaciones.value = await obtenerOperaciones()
  cargando.value = false
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

const ratioClase = computed(() => {
  const don = operaciones.value.filter(op => op.tipo === 'donacion' && op.estado === 'aprobada').length
  const ret = retirosAprobados.value
  if (don === 0 && ret === 0) return ''
  if (ret === 0) return 'kpi-verde'
  return don / ret >= 1 ? 'kpi-verde' : 'kpi-naranja'
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
      <h2>Informes</h2>
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

    <LoadingSpinner v-if="cargando" />

    <template v-else>

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
                    <StatusBadge :estado="op.estado" />
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
          <div class="kpi-card" :class="ratioClase">
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
                  <StatusBadge :estado="op.estado" />
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

    </template>

  </div>
</template>

<style scoped>
.informes-page {
  flex: 1;
  padding: var(--space-lg);
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.informes-header h2 {
  font-size: var(--font-size-xl);
  color: var(--color-text);
}

/* Solapas */
.solapas {
  display: flex;
  gap: 0;
  border-bottom: 2px solid var(--color-border);
}

.solapa-btn {
  padding: 10px 28px;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--color-text-muted);
  cursor: pointer;
  transition: color var(--transition-fast), border-color var(--transition-fast);
}

.solapa-btn:hover {
  color: var(--color-primary);
}

.solapa-btn.activa {
  color: var(--color-primary);
  border-bottom-color: var(--color-primary);
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
  gap: var(--space-md);
}

.kpi-grid-3 {
  grid-template-columns: repeat(3, 1fr);
}

.kpi-card {
  background: var(--color-card);
  border: 1px solid var(--color-border);
  border-radius: 10px;
  padding: 20px var(--space-md);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  transition: box-shadow var(--transition-fast);
}

.kpi-card:hover {
  box-shadow: var(--shadow-md);
}

.kpi-valor  { font-size: 2rem; font-weight: 700; color: var(--color-text); }
.kpi-label  { font-size: var(--font-size-xs); color: var(--color-text-muted); text-align: center; }

.kpi-alerta   .kpi-valor { color: var(--color-warning); }
.kpi-verde    .kpi-valor { color: var(--color-success); }
.kpi-rojo     .kpi-valor { color: var(--color-danger); }
.kpi-amarillo .kpi-valor { color: var(--color-warning); }
.kpi-naranja  .kpi-valor { color: #f97316; }

/* Secciones */
.seccion {
  background: var(--color-card);
  border: 1px solid var(--color-border);
  border-radius: 10px;
  padding: 20px;
}

.seccion h3 {
  font-size: var(--font-size-base);
  font-weight: 600;
  margin-bottom: var(--space-md);
  color: var(--color-text);
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
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  text-align: right;
  flex-shrink: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.barra-track {
  flex: 1;
  background: #f1f5f9;
  border-radius: var(--radius-sm);
  height: 22px;
  overflow: hidden;
}

.barra-fill {
  height: 100%;
  border-radius: var(--radius-sm);
  transition: width 0.4s ease;
  min-width: 4px;
}

.barra-fill.azul    { background: var(--color-primary); }
.barra-fill.verde   { background: var(--color-success); }

.barra-valor {
  width: 28px;
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--color-text);
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
  border: 1px solid var(--color-border);
  padding: 10px 12px;
  text-align: left;
  font-size: var(--font-size-sm);
}

.tabla th {
  background: var(--color-primary);
  color: var(--color-text-inverse);
  font-weight: 600;
}

.tabla tr:nth-child(even) td {
  background: #f8fafc;
}

.tabla tbody tr {
  transition: background-color var(--transition-fast);
}

.tabla tbody tr:hover td {
  background: #f1f5f9;
}

/* Badges */
.badge {
  font-size: var(--font-size-xs);
  padding: 4px 10px;
  border-radius: 6px;
  color: var(--color-text-inverse);
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
}

.badge-alerta { background: var(--color-warning); }

.vacio {
  color: var(--color-text-light);
  font-size: var(--font-size-sm);
  padding: var(--space-sm) 0;
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
