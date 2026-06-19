<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { 
  obtenerLibros,
  agregarLibro,
  actualizarLibro,
  eliminarLibro
} from '../services/librosService'
import '../styles/catalogo.css'

const router = useRouter()
const usuario = JSON.parse(
  localStorage.getItem('usuario')
)

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

const librosFiltrados = computed(() => {
  return libros.value.filter(libro =>
    libro.titulo.toLowerCase().includes(busqueda.value.toLowerCase())
  )
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
  if (confirm(`¿Estás seguro de que deseas eliminar a ${libro.titulo} del catálogo?`)) {
    await eliminarLibro(libro.titulo)
    await cargarLibros()
  }
}

const cancelarFormulario = () => {
  mostrandoFormulario.value = false
}
</script>

<template>
  <div class="catalogo-page">

    <header class="topbar">

      <div>
        <h1>📚 Biblioteca Digital</h1>
      </div>

      <div class="usuario-box">
        <span>{{ usuario.nombre }}</span>
      </div>

    </header>

    <div v-if="mostrandoFormulario" class="catalogo-card" style="margin-bottom: 20px;">
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

    <div class="catalogo-card">

      <div class="catalogo-header" style="display: flex; justify-content: space-between; align-items: center;">
        <h2>Catálogo de Libros</h2>
        <button @click="abrirAlta" style="background-color: #008CBA; color: white; padding: 10px 15px; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;">
          Nuevo Libro
        </button>
      </div>

      <div class="catalogo-header" style="margin-top: 15px;">
        <input
          class="search-input"
          v-model="busqueda"
          placeholder="Buscar libro..."
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
            v-for="libro in librosFiltrados"
            :key="libro.id"
          >
            <td>{{ libro.titulo }}</td>
            <td>{{ libro.autor }}</td>
            <td>{{ libro.genero }}</td>
            <td>{{ libro.stock }}</td>
            <td style="text-align: center;">
              <button @click="abrirModificacion(libro)" style="background: none; border: none; cursor: pointer; font-size: 14px; margin-right: 10px; color: #008CBA;" type="button" title="Editar">Editar</button>
              <button @click="ejecutarBaja(libro)" style="background: none; border: none; cursor: pointer; font-size: 14px; color: #f44336;" type="button" title="Eliminar">Eliminar</button>
            </td>
          </tr>
        </tbody>

      </table>

    </div>

  </div>
</template>

