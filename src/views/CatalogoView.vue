<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  obtenerLibros,
  agregarLibro,
  actualizarLibro,
  eliminarLibro
} from '../services/librosService'
import { crearOperacion } from '../services/operacionesService'
import { useToast } from '../composables/useToast'
import AppButton from '../components/AppButton.vue'
import AppCard from '../components/AppCard.vue'
import AppModal from '../components/AppModal.vue'
import FormField from '../components/FormField.vue'
import LoadingSpinner from '../components/LoadingSpinner.vue'
import EmptyState from '../components/EmptyState.vue'

const router = useRouter()
const { mostrar } = useToast()
const usuario = JSON.parse(localStorage.getItem('usuario'))

const esUsuario = computed(() => usuario?.rol === 'usuario')

const libros = ref([])
const busqueda = ref('')
const cargando = ref(true)

const mostrandoFormulario = ref(false)
const editando = ref(false)
const tituloLibroEdicion = ref('')
const formulario = ref({
  titulo: '',
  autor: '',
  genero: '',
  stock: 0
})

const mostrandoFormularioDonacion = ref(false)
const formularioDonacion = ref({
  titulo: '',
  autor: '',
  genero: ''
})

// Modal de confirmación
const modalVisible = ref(false)
const modalTitulo = ref('')
const modalMensaje = ref('')
const modalVariant = ref('default')
const modalCallback = ref(null)

// Modal de cantidad (reemplaza prompt)
const modalCantidadVisible = ref(false)
const modalCantidadLibro = ref(null)
const cantidadEliminar = ref(1)

const abrirModalConfirm = (titulo, mensaje, variant, callback) => {
  modalTitulo.value = titulo
  modalMensaje.value = mensaje
  modalVariant.value = variant
  modalCallback.value = callback
  modalVisible.value = true
}

const confirmarModal = () => {
  modalVisible.value = false
  if (modalCallback.value) modalCallback.value()
}

const cerrarModal = () => {
  modalVisible.value = false
}

onMounted(async () => {
  if (!usuario) {
    router.push('/login')
    return
  }
  await cargarLibros()
})

const cargarLibros = async () => {
  cargando.value = true
  libros.value = await obtenerLibros()
  cargando.value = false
}

const paginaActual = ref(1)
const elementosPorPagina = 20

const librosFiltrados = computed(() => {
  return libros.value.filter(libro =>
    libro.titulo.toLowerCase().includes(busqueda.value.toLowerCase())
  )
})

const totalPaginas = computed(() =>
  Math.ceil(librosFiltrados.value.length / elementosPorPagina)
)

const librosPaginados = computed(() => {
  const inicio = (paginaActual.value - 1) * elementosPorPagina
  return librosFiltrados.value.slice(inicio, inicio + elementosPorPagina)
})

const abrirAlta = () => {
  editando.value = false
  mostrandoFormulario.value = true
  formulario.value = { titulo: '', autor: '', genero: '', stock: 0 }
}

const abrirModificacion = (libro) => {
  editando.value = true
  mostrandoFormulario.value = true
  tituloLibroEdicion.value = libro.titulo
  formulario.value = { ...libro }
}

const guardarLibro = async () => {
  if (!formulario.value.titulo || !formulario.value.autor) {
    mostrar('Se deben completar todos los campos', 'error')
    return
  }

  if (editando.value) {
    abrirModalConfirm(
      'Guardar cambios',
      `¿Guardar los cambios para "${formulario.value.titulo}"?`,
      'default',
      async () => {
        const indice = libros.value.findIndex(
          l => l.titulo === tituloLibroEdicion.value
        )
        if (indice !== -1) {
          libros.value[indice] = { ...formulario.value }
        }
        try {
          await actualizarLibro(tituloLibroEdicion.value, formulario.value)
          mostrar('Libro actualizado correctamente', 'success')
        } catch (error) {
          console.error('Error al guardar en MockAPI:', error)
        }
        mostrandoFormulario.value = false
        await cargarLibros()
      }
    )
  } else {
    try {
      const nuevo = await agregarLibro(formulario.value)
      libros.value.push(nuevo)
      mostrar('Libro registrado correctamente', 'success')
    } catch (error) {
      libros.value.push({ ...formulario.value })
    }
    mostrandoFormulario.value = false
    await cargarLibros()
  }
}

const ejecutarBaja = (libro) => {
  modalCantidadLibro.value = libro
  cantidadEliminar.value = 1
  modalCantidadVisible.value = true
}

const confirmarBaja = async () => {
  const libro = modalCantidadLibro.value
  const num = Number(cantidadEliminar.value)

  if (isNaN(num) || num <= 0 || !Number.isInteger(num)) {
    mostrar('Ingresá un número entero mayor a 0', 'error')
    return
  }

  if (num > Number(libro.stock)) {
    mostrar(`No podés eliminar más de ${libro.stock} ejemplares`, 'error')
    return
  }

  modalCantidadVisible.value = false

  if (num === Number(libro.stock)) {
    abrirModalConfirm(
      'Eliminar libro',
      `Esto eliminará "${libro.titulo}" completamente del catálogo. ¿Continuar?`,
      'danger',
      async () => {
        await eliminarLibro(libro.titulo)
        mostrar('Libro eliminado del catálogo', 'success')
        await cargarLibros()
      }
    )
  } else {
    await actualizarLibro(libro.titulo, { ...libro, stock: Number(libro.stock) - num })
    mostrar(`Se eliminaron ${num} ejemplares de "${libro.titulo}"`, 'success')
    await cargarLibros()
  }
}

const cancelarFormulario = () => {
  mostrandoFormulario.value = false
}

const solicitarRetiro = async (libro) => {
  await crearOperacion({
    tipo: 'retiro',
    usuarioId: usuario.id,
    usuarioNombre: usuario.nombre,
    libroId: libro.id,
    titulo: libro.titulo,
    autor: libro.autor,
    genero: libro.genero
  })
  mostrar(`Pedido de retiro de "${libro.titulo}" creado`, 'success')
}

const solicitarDonacion = async (libro) => {
  await crearOperacion({
    tipo: 'donacion',
    usuarioId: usuario.id,
    usuarioNombre: usuario.nombre,
    libroId: libro.id,
    titulo: libro.titulo,
    autor: libro.autor,
    genero: libro.genero
  })
  mostrar(`Pedido de donación de "${libro.titulo}" creado`, 'success')
}

const abrirFormularioDonacion = () => {
  mostrandoFormularioDonacion.value = true
  formularioDonacion.value = { titulo: '', autor: '', genero: '' }
}

const cancelarFormularioDonacion = () => {
  mostrandoFormularioDonacion.value = false
}

const enviarDonacionNueva = async () => {
  if (!formularioDonacion.value.titulo || !formularioDonacion.value.autor) {
    mostrar('Se deben completar título y autor', 'error')
    return
  }

  await crearOperacion({
    tipo: 'donacion',
    usuarioId: usuario.id,
    usuarioNombre: usuario.nombre,
    libroId: null,
    titulo: formularioDonacion.value.titulo,
    autor: formularioDonacion.value.autor,
    genero: formularioDonacion.value.genero
  })
  mostrar(`Pedido de donación de "${formularioDonacion.value.titulo}" creado`, 'success')
  mostrandoFormularioDonacion.value = false
}
</script>

<template>
  <div class="catalogo-page">

    <!-- Modal de confirmación -->
    <AppModal
      :visible="modalVisible"
      :title="modalTitulo"
      :variant="modalVariant"
      @confirm="confirmarModal"
      @cancel="cerrarModal"
      @close="cerrarModal"
    >
      {{ modalMensaje }}
    </AppModal>

    <!-- Modal de cantidad para eliminar -->
    <AppModal
      :visible="modalCantidadVisible"
      title="Eliminar ejemplares"
      confirm-text="Eliminar"
      variant="danger"
      @confirm="confirmarBaja"
      @cancel="modalCantidadVisible = false"
      @close="modalCantidadVisible = false"
    >
      <p>¿Cuántos ejemplares de "{{ modalCantidadLibro?.titulo }}" deseas eliminar?</p>
      <p class="stock-info">Stock actual: {{ modalCantidadLibro?.stock }}</p>
      <input
        type="number"
        v-model.number="cantidadEliminar"
        min="1"
        :max="modalCantidadLibro?.stock"
        class="cantidad-input"
      />
    </AppModal>

    <!-- Formulario alta/modificación (solo admin/bibliotecario) -->
    <Transition name="slide-down">
      <AppCard v-if="mostrandoFormulario && !esUsuario" class="formulario-card">
        <h3>{{ editando ? 'Modificar Libro' : 'Alta de Libro' }}</h3>
        <form @submit.prevent="guardarLibro" class="formulario">
          <FormField label="Título" :required="true">
            <input v-model="formulario.titulo" required />
          </FormField>

          <FormField label="Autor" :required="true">
            <input v-model="formulario.autor" required />
          </FormField>

          <FormField label="Género">
            <input v-model="formulario.genero" />
          </FormField>

          <FormField label="Stock">
            <input type="number" v-model="formulario.stock" />
          </FormField>

          <div class="form-actions">
            <AppButton type="submit" variant="success">
              {{ editando ? 'Guardar Cambios' : 'Registrar' }}
            </AppButton>
            <AppButton type="button" variant="danger" @click="cancelarFormulario">
              Cancelar
            </AppButton>
          </div>
        </form>
      </AppCard>
    </Transition>

    <!-- Formulario donación de libro nuevo (solo usuario) -->
    <Transition name="slide-down">
      <AppCard v-if="mostrandoFormularioDonacion && esUsuario" class="formulario-card">
        <h3>Donar Libro Nuevo</h3>
        <form @submit.prevent="enviarDonacionNueva" class="formulario">
          <FormField label="Título" :required="true">
            <input v-model="formularioDonacion.titulo" required />
          </FormField>

          <FormField label="Autor" :required="true">
            <input v-model="formularioDonacion.autor" required />
          </FormField>

          <FormField label="Género">
            <input v-model="formularioDonacion.genero" />
          </FormField>

          <div class="form-actions">
            <AppButton type="submit" variant="success">
              Enviar Donación
            </AppButton>
            <AppButton type="button" variant="danger" @click="cancelarFormularioDonacion">
              Cancelar
            </AppButton>
          </div>
        </form>
      </AppCard>
    </Transition>

    <AppCard>
      <div class="catalogo-header">
        <h2>Catálogo de Libros</h2>
        <AppButton v-if="!esUsuario" variant="primary" @click="abrirAlta">
          Nuevo Libro
        </AppButton>
        <AppButton v-if="esUsuario" variant="success" @click="abrirFormularioDonacion">
          Donar libro nuevo
        </AppButton>
      </div>

      <div class="catalogo-search">
        <input
          class="search-input"
          v-model="busqueda"
          placeholder="Buscar libro..."
          @input="paginaActual = 1"
        />
      </div>

      <LoadingSpinner v-if="cargando" />

      <template v-else>
        <EmptyState
          v-if="librosFiltrados.length === 0"
          icon="📚"
          title="No se encontraron libros"
          :description="busqueda ? 'Probá con otro término de búsqueda.' : 'Todavía no hay libros en el catálogo.'"
        />

        <template v-else>
          <table>
            <thead>
              <tr>
                <th>Título</th>
                <th>Autor</th>
                <th>Género</th>
                <th>Stock</th>
                <th class="th-acciones">Acciones</th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="libro in librosPaginados"
                :key="libro.id"
              >
                <td>{{ libro.titulo }}</td>
                <td>{{ libro.autor }}</td>
                <td>{{ libro.genero }}</td>
                <td>{{ libro.stock }}</td>
                <td class="td-acciones">
                  <template v-if="!esUsuario">
                    <AppButton size="sm" variant="outline" @click="abrirModificacion(libro)">
                      Editar
                    </AppButton>
                    <AppButton size="sm" variant="danger" @click="ejecutarBaja(libro)">
                      Eliminar
                    </AppButton>
                  </template>
                  <template v-if="esUsuario">
                    <AppButton
                      v-if="Number(libro.stock) > 0"
                      size="sm"
                      variant="outline"
                      @click="solicitarRetiro(libro)"
                    >
                      Retirar
                    </AppButton>
                    <AppButton size="sm" variant="success" @click="solicitarDonacion(libro)">
                      Donar
                    </AppButton>
                  </template>
                </td>
              </tr>
            </tbody>
          </table>

          <div v-if="totalPaginas > 1" class="paginacion">
            <AppButton
              size="sm"
              variant="outline"
              @click="paginaActual--"
              :disabled="paginaActual === 1"
            >
              Anterior
            </AppButton>
            <span class="paginacion-info">
              Página {{ paginaActual }} de {{ totalPaginas }}
            </span>
            <AppButton
              size="sm"
              variant="outline"
              @click="paginaActual++"
              :disabled="paginaActual === totalPaginas"
            >
              Siguiente
            </AppButton>
          </div>
        </template>
      </template>
    </AppCard>

  </div>
</template>

<style scoped>
.catalogo-page {
  min-height: 100vh;
  padding: var(--space-lg);
}

.formulario-card {
  max-width: 1200px;
  margin: 0 auto var(--space-lg);
}

.formulario {
  display: flex;
  flex-direction: column;
  gap: 14px;
  max-width: 420px;
  margin-top: var(--space-md);
}

.formulario input {
  width: 100%;
}

.form-actions {
  display: flex;
  gap: var(--space-sm);
  margin-top: var(--space-sm);
}

.catalogo-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-lg);
}

.catalogo-search {
  margin-bottom: var(--space-lg);
}

.search-input {
  width: 300px;
}

table {
  width: 100%;
  border-collapse: collapse;
}

thead {
  background: var(--color-primary);
}

thead th {
  color: var(--color-text-inverse);
  font-weight: 600;
}

th,
td {
  padding: 14px;
  text-align: left;
}

.th-acciones {
  text-align: center;
}

tbody tr {
  border-bottom: 1px solid var(--color-border);
  transition: background-color var(--transition-fast);
}

tbody tr:hover {
  background: #f9fafb;
}

.td-acciones {
  text-align: center;
  display: flex;
  justify-content: center;
  gap: var(--space-sm);
}

.paginacion {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: var(--space-sm);
  margin-top: var(--space-lg);
}

.paginacion-info {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
}

.stock-info {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  margin: var(--space-sm) 0;
}

.cantidad-input {
  width: 100%;
  margin-top: var(--space-sm);
}

h3 {
  margin-bottom: var(--space-sm);
}
</style>
