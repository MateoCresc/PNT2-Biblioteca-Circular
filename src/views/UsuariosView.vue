<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { 
  obtenerUsuarios, 
  crearUsuario, 
  actualizarUsuario, 
  eliminarUsuario 
} from '../services/usuariosService'
import '../styles/catalogo.css' 

const router = useRouter()
const usuarioLogueado = JSON.parse(localStorage.getItem('usuario'))

const usuarios = ref([])
const busqueda = ref('')

const mostrandoFormulario = ref(false)
const editando = ref(false)
const emailUsuarioEdicion = ref('')
const formulario = ref({
  nombre: '',
  email: '',
  password: '1234', 
  rol: 'usuario',
  estado: 'activo'
})

onMounted(async () => {
  if (!usuarioLogueado || usuarioLogueado.rol !== 'admin') {
    alert('Acceso denegado. Se requieren permisos de administrador.')
    router.push('/catalogo')
    return
  }
  await cargarUsuarios()
})

const cargarUsuarios = async () => {
  usuarios.value = await obtenerUsuarios()
}

const usuariosFiltrados = computed(() => {
  return usuarios.value.filter(usuario =>
    usuario.email
      .toLowerCase()
      .includes(busqueda.value.toLowerCase())
  )
})

const abrirAlta = () => {
  editando.value = false
  mostrandoFormulario.value = true
  formulario.value = { nombre: '', email: '', password: '1234', rol: 'usuario', estado: 'activo' }
}

const abrirModificacion = (usuario) => {
  editando.value = true
  mostrandoFormulario.value = true
  emailUsuarioEdicion.value = usuario.email
  formulario.value = { ...usuario }
}

const guardarUsuario = async () => {
  if (!formulario.value.nombre || !formulario.value.email) {
    alert('Se deben completar todos los campos')
    return
  }

    if (editando.value) {
    const seguro = confirm(`¿Guardar los cambios para ${formulario.value.nombre}?`)
    if (!seguro) return

  const indice = usuarios.value.findIndex(
  u => u.email === emailUsuarioEdicion.value
)

if (indice !== -1) {
  usuarios.value[indice] = { ...formulario.value }
}

    mostrandoFormulario.value = false

    try {
     await actualizarUsuario(emailUsuarioEdicion.value, formulario.value)
    } catch (error) {
      console.error('Error al guardar en MockAPI:', error)
    }
  } else {
    try {
      const nuevo = await crearUsuario(formulario.value)
      usuarios.value.push(nuevo)
    } catch (error) {
      usuarios.value.push({ ...formulario.value })
    }
    mostrandoFormulario.value = false
  }

  await cargarUsuarios()
}

const ejecutarBaja = async (usuario) => {
  if (confirm(`¿Estás seguro de que deseas eliminar a ${usuario.nombre} del sistema?`)) {
    await eliminarUsuario(usuario.email)
    await cargarUsuarios()
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
        <h1>Biblioteca Digital</h1>
      </div>
      <div class="usuario-box">
        <span>{{ usuarioLogueado?.nombre }} (Admin)</span>
      </div>
    </header>

    <div v-if="mostrandoFormulario" class="catalogo-card" style="margin-bottom: 20px;">
      <h3>{{ editando ? 'Modificar Usuario' : 'Alta de Usuario' }}</h3>
      <form @submit.prevent="guardarUsuario" style="display: flex; flex-direction: column; gap: 10px; max-width: 400px; margin-top: 15px;">
        <div>
          <label style="display:block; font-weight: bold; margin-bottom: 5px;">Nombre:</label>
          <input class="search-input" style="width: 100%;" v-model="formulario.nombre" required />
        </div>
        
        <div>
          <label style="display:block; font-weight: bold; margin-bottom: 5px;">Email:</label>
          <input class="search-input" style="width: 100%;" type="email" v-model="formulario.email" required :disabled="editando" />
        </div>

        <div>
          <label style="display:block; font-weight: bold; margin-bottom: 5px;">Rol:</label>
          <select class="search-input" style="width: 100%;" v-model="formulario.rol">
            <option value="usuario">Usuario</option>
            <option value="bibliotecario">Bibliotecario</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <div>
          <label style="display:block; font-weight: bold; margin-bottom: 5px;">Estado:</label>
          <select class="search-input" style="width: 100%;" v-model="formulario.estado">
            <option value="activo">Activo</option>
            <option value="inactivo">Inactivo</option>
          </select>
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
        <h2>Gestión de Usuarios</h2>
        <button @click="abrirAlta" style="background-color: #008CBA; color: white; padding: 10px 15px; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;">
          Nuevo Usuario
        </button>
      </div>

      <div class="catalogo-header" style="margin-top: 15px;">
        <input
          class="search-input"
          v-model="busqueda"
          placeholder="Buscar usuario por email..."
        />
      </div>

      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Email</th>
            <th>Rol</th>
            <th>Estado</th>
            <th style="text-align: center;">Acciones</th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="usuario in usuariosFiltrados"
            :key="usuario.email"
          >
            <td>{{ usuario.nombre }}</td>
            <td>{{ usuario.email }}</td>
            <td style="text-transform: capitalize;">{{ usuario.rol }}</td> 
            <td style="text-transform: capitalize;">{{ usuario.estado }}</td>
            <td style="text-align: center;">
              <button @click="abrirModificacion(usuario)" style="background: none; border: none; cursor: pointer; font-size: 14px; margin-right: 10px; color: #008CBA;" type="button" title="Editar">Editar</button>
              <button @click="ejecutarBaja(usuario)" style="background: none; border: none; cursor: pointer; font-size: 14px; color: #f44336;" type="button" title="Eliminar">Eliminar</button>
            </td>
          </tr>
        </tbody>
      </table>

    </div>

  </div>
</template>

