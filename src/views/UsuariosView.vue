<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  obtenerUsuarios,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario
} from '../services/usuariosService'

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

const toastMsg = ref('')
const toastTipo = ref('exito')

const mostrarToast = (mensaje, tipo = 'exito') => {
  toastMsg.value = mensaje
  toastTipo.value = tipo
  setTimeout(() => { toastMsg.value = '' }, 3000)
}

onMounted(async () => {
  if (!usuarioLogueado || usuarioLogueado.rol !== 'admin') {
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
    mostrarToast('Se deben completar todos los campos', 'error')
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
      mostrarToast('Usuario actualizado correctamente')
    } catch (error) {
      console.error('Error al guardar en MockAPI:', error)
    }
  } else {
    const emailDuplicado = usuarios.value.find(
      u => u.email.toLowerCase() === formulario.value.email.toLowerCase()
    )
    if (emailDuplicado) {
      mostrarToast('Ya existe un usuario con ese email', 'error')
      return
    }

    try {
      const nuevo = await crearUsuario(formulario.value)
      usuarios.value.push(nuevo)
      mostrarToast('Usuario creado correctamente')
    } catch (error) {
      usuarios.value.push({ ...formulario.value })
    }
    mostrandoFormulario.value = false
  }

  await cargarUsuarios()
}

const ejecutarBaja = async (usuario) => {
  if (confirm(`¿Estás seguro de que deseas dar de baja a ${usuario.nombre}?`)) {
    await eliminarUsuario(usuario.email)
    await cargarUsuarios()
    mostrarToast('Usuario dado de baja')
  }
}

const cancelarFormulario = () => {
  mostrandoFormulario.value = false
}
</script>

<template>
  <div class="usuarios-page">

    <header class="topbar">
      <div>
        <h1>Biblioteca Digital</h1>
      </div>
      <div class="usuario-box">
        <span>{{ usuarioLogueado?.nombre }} (Admin)</span>
      </div>
    </header>

    <!-- Toast -->
    <div v-if="toastMsg" class="toast" :class="toastTipo">
      {{ toastMsg }}
    </div>

    <!-- Formulario -->
    <div v-if="mostrandoFormulario" class="card card-form">
      <h3>{{ editando ? 'Modificar Usuario' : 'Alta de Usuario' }}</h3>
      <form @submit.prevent="guardarUsuario" class="formulario">
        <div class="form-grupo">
          <label class="form-label">Nombre:</label>
          <input class="form-input" v-model="formulario.nombre" required />
        </div>

        <div class="form-grupo">
          <label class="form-label">Email:</label>
          <input class="form-input" type="email" v-model="formulario.email" required :disabled="editando" />
        </div>

        <div class="form-grupo">
          <label class="form-label">Rol:</label>
          <select class="form-input" v-model="formulario.rol">
            <option value="usuario">Usuario</option>
            <option value="bibliotecario">Bibliotecario</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <div class="form-grupo">
          <label class="form-label">Estado:</label>
          <select class="form-input" v-model="formulario.estado">
            <option value="activo">Activo</option>
            <option value="inactivo">Inactivo</option>
          </select>
        </div>

        <div class="form-actions">
          <button type="submit" class="btn-guardar">
            {{ editando ? 'Guardar Cambios' : 'Registrar' }}
          </button>
          <button type="button" class="btn-cancelar" @click="cancelarFormulario">
            Cancelar
          </button>
        </div>
      </form>
    </div>

    <!-- Listado -->
    <div class="card">

      <div class="card-header">
        <h2>Gestión de Usuarios</h2>
        <button class="btn-nuevo" @click="abrirAlta">Nuevo Usuario</button>
      </div>

      <div class="card-header">
        <input
          class="search-input"
          v-model="busqueda"
          placeholder="Buscar usuario por email..."
        />
      </div>

      <table class="tabla-usuarios">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Email</th>
            <th>Rol</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="usuario in usuariosFiltrados"
            :key="usuario.email"
          >
            <td>{{ usuario.nombre }}</td>
            <td>{{ usuario.email }}</td>
            <td class="capitalize">{{ usuario.rol }}</td>
            <td>
              <span class="badge" :class="usuario.estado === 'activo' ? 'badge-activo' : 'badge-inactivo'">
                {{ usuario.estado === 'activo' ? 'Activo' : 'Inactivo' }}
              </span>
            </td>
            <td class="acciones">
              <button class="btn-editar" @click="abrirModificacion(usuario)">Editar</button>
              <button
                v-if="usuario.estado === 'activo'"
                class="btn-eliminar"
                @click="ejecutarBaja(usuario)"
              >
                Dar de baja
              </button>
            </td>
          </tr>
        </tbody>
      </table>

    </div>

  </div>
</template>

<style scoped>
.usuarios-page {
  min-height: 100vh;
  background: var(--background);
}

.topbar {
  background: #1e40af;
  color: white;
  padding: 18px 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.usuario-box {
  display: flex;
  align-items: center;
  gap: 15px;
}

/* Cards */
.card {
  max-width: 1200px;
  margin: 30px auto;
  background: var(--card);
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
}

.card-form {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

/* Search */
.search-input {
  width: 300px;
  padding: 10px 15px;
  border: 1px solid var(--border);
  border-radius: 8px;
  font-family: inherit;
}

/* Tabla */
.tabla-usuarios {
  width: 100%;
  border-collapse: collapse;
}

.tabla-usuarios th,
.tabla-usuarios td {
  border: 1px solid var(--border);
  padding: 12px 14px;
  text-align: left;
  font-size: 0.9rem;
}

.tabla-usuarios th {
  background: var(--primary);
  color: white;
  font-weight: 600;
}

.tabla-usuarios tr:nth-child(even) td {
  background: #f8fafc;
}

.tabla-usuarios tbody tr:hover td {
  background: #f1f5f9;
}

.capitalize {
  text-transform: capitalize;
}

.acciones {
  display: flex;
  gap: 8px;
}

/* Badges */
.badge {
  font-size: 0.8rem;
  padding: 4px 12px;
  border-radius: 6px;
  color: white;
  font-weight: 500;
}

.badge-activo {
  background: #10b981;
}

.badge-inactivo {
  background: #ef4444;
}

/* Botones de acción */
.btn-editar {
  background: none;
  border: 1px solid var(--primary);
  color: var(--primary);
  padding: 6px 14px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 500;
  transition: background 0.15s, color 0.15s;
}

.btn-editar:hover {
  background: var(--primary);
  color: white;
}

.btn-eliminar {
  background: none;
  border: 1px solid #ef4444;
  color: #ef4444;
  padding: 6px 14px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 500;
  transition: background 0.15s, color 0.15s;
}

.btn-eliminar:hover {
  background: #ef4444;
  color: white;
}

.btn-nuevo {
  background: var(--primary);
  color: white;
  padding: 10px 18px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.9rem;
  transition: background 0.15s;
}

.btn-nuevo:hover {
  background: var(--primary-hover);
}

/* Formulario */
.formulario {
  display: flex;
  flex-direction: column;
  gap: 14px;
  max-width: 420px;
  margin-top: 16px;
}

.form-grupo {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.form-label {
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--text);
}

.form-input {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid var(--border);
  border-radius: 8px;
  font-family: inherit;
  font-size: 0.9rem;
}

.form-input:disabled {
  background: #f1f5f9;
  color: #94a3b8;
}

.form-actions {
  display: flex;
  gap: 10px;
  margin-top: 8px;
}

.btn-guardar {
  background: #10b981;
  color: white;
  padding: 10px 18px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.9rem;
  transition: background 0.15s;
}

.btn-guardar:hover {
  background: #059669;
}

.btn-cancelar {
  background: #ef4444;
  color: white;
  padding: 10px 18px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.9rem;
  transition: background 0.15s;
}

.btn-cancelar:hover {
  background: #dc2626;
}

/* Toast */
.toast {
  position: fixed;
  top: 24px;
  left: 50%;
  transform: translateX(-50%);
  padding: 14px 28px;
  border-radius: 8px;
  color: white;
  font-weight: 600;
  font-size: 0.95rem;
  z-index: 1000;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.toast.exito {
  background: #10b981;
}

.toast.error {
  background: #ef4444;
}
</style>
