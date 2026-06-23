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
import '../styles/catalogo.css'

const router = useRouter()
const usuario = JSON.parse(
  localStorage.getItem('usuario')
)

const esUsuario = computed(() => usuario?.rol === 'usuario')

const libros = ref([])
const busqueda = ref('')

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

onMounted(async () => {
  if (!usuario) {
    router.push('/login')
    return
  }
  await cargarLibros()
})

const cargarLibros = async () => {
  libros.value = await obtenerLibros()
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
    alert('Se deben completar todos los campos')
    return
  }

  if (editando.value) {
    const seguro = confirm(`¿Guardar los cambios para ${formulario.value.titulo}?`)
    if (!seguro) return

    const indice = libros.value.findIndex(
      l => l.titulo === tituloLibroEdicion.value
    )

    if (indice !== -1) {
      libros.value[indice] = { ...formulario.value }
    }

    try {
      await actualizarLibro(tituloLibroEdicion.value, formulario.value)
    } catch (error) {
      console.error('Error al guardar en MockAPI:', error)
    }
  } else {
    try {
      const nuevo = await agregarLibro(formulario.value)
      libros.value.push(nuevo)
    } catch (error) {
      libros.value.push({ ...formulario.value })
    }
  }

  mostrandoFormulario.value = false
  await cargarLibros()
}

const ejecutarBaja = async (libro) => {
  const cantidad = prompt(`¿Cuántos ejemplares de "${libro.titulo}" deseas eliminar? (Stock actual: ${libro.stock})`)
  if (cantidad === null) return

  const num = Number(cantidad)
  if (isNaN(num) || num <= 0 || !Number.isInteger(num)) {
    alert('Ingresá un número entero mayor a 0')
    return
  }

  if (num > Number(libro.stock)) {
    alert(`No podés eliminar más de ${libro.stock} ejemplares`)
    return
  }

  if (num === Number(libro.stock)) {
    if (confirm(`Esto eliminará "${libro.titulo}" completamente del catálogo. ¿Continuar?`)) {
      await eliminarLibro(libro.titulo)
      await cargarLibros()
    }
  } else {
    await actualizarLibro(libro.titulo, { ...libro, stock: Number(libro.stock) - num })
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
  alert(`Pedido de retiro de "${libro.titulo}" creado correctamente`)
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
  alert(`Pedido de donación de "${libro.titulo}" creado correctamente`)
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
    alert('Se deben completar título y autor')
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
  alert(`Pedido de donación de "${formularioDonacion.value.titulo}" creado correctamente`)
  mostrandoFormularioDonacion.value = false
}
</script>

<template>
  <div class="catalogo-page">

    <!-- Formulario alta/modificación (solo admin/bibliotecario) -->
    <div v-if="mostrandoFormulario && !esUsuario" class="catalogo-card" style="margin-bottom: 20px;">
      <h3>{{ editando ? 'Modificar Libro' : 'Alta de Libro' }}</h3>
      <form @submit.prevent="guardarLibro" style="display: flex; flex-direction: column; gap: 10px; max-width: 400px; margin-top: 15px;">
        <div>
          <label style="display:block; font-weight: bold; margin-bottom: 5px;">Título:</label>
          <input class="search-input" style="width: 100%;" v-model="formulario.titulo" required />
        </div>

        <div>
          <label style="display:block; font-weight: bold; margin-bottom: 5px;">Autor:</label>
          <input class="search-input" style="width: 100%;" v-model="formulario.autor" required />
        </div>

        <div>
          <label style="display:block; font-weight: bold; margin-bottom: 5px;">Género:</label>
          <input class="search-input" style="width: 100%;" v-model="formulario.genero" />
        </div>

        <div>
          <label style="display:block; font-weight: bold; margin-bottom: 5px;">Stock:</label>
          <input class="search-input" style="width: 100%;" type="number" v-model="formulario.stock" />
        </div>

        <div style="display: flex; gap: 10px; margin-top: 10px;">
          <button type="submit" style="background-color: #4CAF50; color: white; padding: 8px 15px; border: none; border-radius: 4px; cursor: pointer;">
            {{ editando ? 'Guardar Cambios' : 'Registrar' }}
          </button>
          <button type="button" @click="cancelarFormulario" style="background-color: #f44336; color: white; padding: 8px 15px; border: none; border-radius: 4px; cursor: pointer;">
            Cancelar
          </button>
        </div>
      </form>
    </div>

    <!-- Formulario donación de libro nuevo (solo usuario) -->
    <div v-if="mostrandoFormularioDonacion && esUsuario" class="catalogo-card" style="margin-bottom: 20px;">
      <h3>Donar Libro Nuevo</h3>
      <form @submit.prevent="enviarDonacionNueva" style="display: flex; flex-direction: column; gap: 10px; max-width: 400px; margin-top: 15px;">
        <div>
          <label style="display:block; font-weight: bold; margin-bottom: 5px;">Título:</label>
          <input class="search-input" style="width: 100%;" v-model="formularioDonacion.titulo" required />
        </div>

        <div>
          <label style="display:block; font-weight: bold; margin-bottom: 5px;">Autor:</label>
          <input class="search-input" style="width: 100%;" v-model="formularioDonacion.autor" required />
        </div>

        <div>
          <label style="display:block; font-weight: bold; margin-bottom: 5px;">Género:</label>
          <input class="search-input" style="width: 100%;" v-model="formularioDonacion.genero" />
        </div>

        <div style="display: flex; gap: 10px; margin-top: 10px;">
          <button type="submit" style="background-color: #4CAF50; color: white; padding: 8px 15px; border: none; border-radius: 4px; cursor: pointer;">
            Enviar Donación
          </button>
          <button type="button" @click="cancelarFormularioDonacion" style="background-color: #f44336; color: white; padding: 8px 15px; border: none; border-radius: 4px; cursor: pointer;">
            Cancelar
          </button>
        </div>
      </form>
    </div>

    <div class="catalogo-card">

      <div class="catalogo-header" style="display: flex; justify-content: space-between; align-items: center;">
        <h2>Catálogo de Libros</h2>
        <button v-if="!esUsuario" @click="abrirAlta" style="background-color: #008CBA; color: white; padding: 10px 15px; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;">
          Nuevo Libro
        </button>
        <button v-if="esUsuario" @click="abrirFormularioDonacion" style="background-color: #4CAF50; color: white; padding: 10px 15px; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;">
          Donar libro nuevo
        </button>
      </div>

      <div class="catalogo-header" style="margin-top: 15px;">
        <input
          class="search-input"
          v-model="busqueda"
          placeholder="Buscar libro..."
          @input="paginaActual = 1"
        />
      </div>

      <table>

        <thead>
          <tr>
            <th>Título</th>
            <th>Autor</th>
            <th>Género</th>
            <th>Stock</th>
            <th style="text-align: center;">Acciones</th>
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
            <td style="text-align: center;">
              <!-- Acciones admin/bibliotecario -->
              <template v-if="!esUsuario">
                <button @click="abrirModificacion(libro)" style="background: none; border: none; cursor: pointer; font-size: 14px; margin-right: 10px; color: #008CBA;" type="button" title="Editar">Editar</button>
                <button @click="ejecutarBaja(libro)" style="background: none; border: none; cursor: pointer; font-size: 14px; color: #f44336;" type="button" title="Eliminar">Eliminar</button>
              </template>
              <!-- Acciones usuario -->
              <template v-if="esUsuario">
                <button v-if="Number(libro.stock) > 0" @click="solicitarRetiro(libro)" style="background: none; border: none; cursor: pointer; font-size: 14px; margin-right: 10px; color: #f59e0b; font-weight: bold;" type="button">Retirar</button>
                <button @click="solicitarDonacion(libro)" style="background: none; border: none; cursor: pointer; font-size: 14px; color: #10b981; font-weight: bold;" type="button">Donar</button>
              </template>
            </td>
          </tr>
        </tbody>

      </table>

      <div v-if="totalPaginas > 1" style="display: flex; justify-content: center; align-items: center; gap: 10px; margin-top: 20px;">
        <button
          @click="paginaActual--"
          :disabled="paginaActual === 1"
          style="padding: 6px 12px; border: 1px solid #cbd5e1; border-radius: 4px; background: white; cursor: pointer;"
          :style="{ opacity: paginaActual === 1 ? 0.5 : 1 }"
        >
          Anterior
        </button>
        <span style="font-size: 0.9rem; color: #475569;">
          Página {{ paginaActual }} de {{ totalPaginas }}
        </span>
        <button
          @click="paginaActual++"
          :disabled="paginaActual === totalPaginas"
          style="padding: 6px 12px; border: 1px solid #cbd5e1; border-radius: 4px; background: white; cursor: pointer;"
          :style="{ opacity: paginaActual === totalPaginas ? 0.5 : 1 }"
        >
          Siguiente
        </button>
      </div>

    </div>

  </div>
</template>
