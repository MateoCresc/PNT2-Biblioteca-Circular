<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  obtenerUsuarios,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario
} from '../services/usuariosService'
import { useToast } from '../composables/useToast'
import AppButton from '../components/AppButton.vue'
import AppCard from '../components/AppCard.vue'
import AppModal from '../components/AppModal.vue'
import FormField from '../components/FormField.vue'
import StatusBadge from '../components/StatusBadge.vue'
import LoadingSpinner from '../components/LoadingSpinner.vue'

const router = useRouter()
const { mostrar } = useToast()
const usuarioLogueado = JSON.parse(localStorage.getItem('usuario'))

const usuarios = ref([])
const busqueda = ref('')
const cargando = ref(true)

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

// Modal de confirmación
const modalVisible = ref(false)
const modalUsuario = ref(null)

onMounted(async () => {
  if (!usuarioLogueado || usuarioLogueado.rol !== 'admin') {
    router.push('/catalogo')
    return
  }
  await cargarUsuarios()
})

const cargarUsuarios = async () => {
  cargando.value = true
  usuarios.value = await obtenerUsuarios()
  cargando.value = false
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
    mostrar('Se deben completar todos los campos', 'error')
    return
  }

  if (editando.value) {
    modalUsuario.value = { ...formulario.value }
    modalVisible.value = true
  } else {
    const emailDuplicado = usuarios.value.find(
      u => u.email.toLowerCase() === formulario.value.email.toLowerCase()
    )
    if (emailDuplicado) {
      mostrar('Ya existe un usuario con ese email', 'error')
      return
    }

    try {
      const nuevo = await crearUsuario(formulario.value)
      usuarios.value.push(nuevo)
      mostrar('Usuario creado correctamente', 'success')
    } catch (error) {
      usuarios.value.push({ ...formulario.value })
    }
    mostrandoFormulario.value = false
    await cargarUsuarios()
  }
}

const confirmarGuardar = async () => {
  modalVisible.value = false

  const indice = usuarios.value.findIndex(
    u => u.email === emailUsuarioEdicion.value
  )

  if (indice !== -1) {
    usuarios.value[indice] = { ...formulario.value }
  }

  mostrandoFormulario.value = false

  try {
    await actualizarUsuario(emailUsuarioEdicion.value, formulario.value)
    mostrar('Usuario actualizado correctamente', 'success')
  } catch (error) {
    console.error('Error al guardar en MockAPI:', error)
  }

  await cargarUsuarios()
}

const ejecutarBaja = (usuario) => {
  modalUsuario.value = usuario
  modalVisible.value = true
  modalVisible.value = false
  // Usar modal directamente
  modalBajaUsuario.value = usuario
  modalBajaVisible.value = true
}

// Modal de baja
const modalBajaVisible = ref(false)
const modalBajaUsuario = ref(null)

const confirmarBaja = async () => {
  modalBajaVisible.value = false
  await eliminarUsuario(modalBajaUsuario.value.email)
  await cargarUsuarios()
  mostrar('Usuario dado de baja', 'success')
}

const cancelarFormulario = () => {
  mostrandoFormulario.value = false
}
</script>

<template>
  <div class="usuarios-page">

    <!-- Modal guardar cambios -->
    <AppModal
      :visible="modalVisible"
      title="Guardar cambios"
      confirm-text="Guardar"
      @confirm="confirmarGuardar"
      @cancel="modalVisible = false"
      @close="modalVisible = false"
    >
      ¿Guardar los cambios para "{{ modalUsuario?.nombre }}"?
    </AppModal>

    <!-- Modal dar de baja -->
    <AppModal
      :visible="modalBajaVisible"
      title="Dar de baja usuario"
      confirm-text="Dar de baja"
      variant="danger"
      @confirm="confirmarBaja"
      @cancel="modalBajaVisible = false"
      @close="modalBajaVisible = false"
    >
      ¿Estás seguro de que deseas dar de baja a "{{ modalBajaUsuario?.nombre }}"?
    </AppModal>

    <!-- Formulario -->
    <Transition name="slide-down">
      <AppCard v-if="mostrandoFormulario" class="formulario-card">
        <h3>{{ editando ? 'Modificar Usuario' : 'Alta de Usuario' }}</h3>
        <form @submit.prevent="guardarUsuario" class="formulario">
          <FormField label="Nombre" :required="true">
            <input v-model="formulario.nombre" required />
          </FormField>

          <FormField label="Email" :required="true">
            <input type="email" v-model="formulario.email" required :disabled="editando" />
          </FormField>

          <FormField label="Rol">
            <select v-model="formulario.rol">
              <option value="usuario">Usuario</option>
              <option value="bibliotecario">Bibliotecario</option>
              <option value="admin">Admin</option>
            </select>
          </FormField>

          <FormField label="Estado">
            <select v-model="formulario.estado">
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
            </select>
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

    <!-- Listado -->
    <AppCard>
      <div class="card-header">
        <h2>Gestión de Usuarios</h2>
        <AppButton variant="primary" @click="abrirAlta">Nuevo Usuario</AppButton>
      </div>

      <div class="card-header">
        <input
          class="search-input"
          v-model="busqueda"
          placeholder="Buscar usuario por email..."
        />
      </div>

      <LoadingSpinner v-if="cargando" />

      <table v-else class="tabla-usuarios">
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
              <StatusBadge :estado="usuario.estado === 'activo' ? 'activo' : 'inactivo'" />
            </td>
            <td>
              <div class="acciones">
                <AppButton size="sm" variant="outline" @click="abrirModificacion(usuario)">
                  Editar
                </AppButton>
                <AppButton
                  v-if="usuario.estado === 'activo'"
                  size="sm"
                  variant="danger"
                  @click="ejecutarBaja(usuario)"
                >
                  Dar de baja
                </AppButton>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </AppCard>

  </div>
</template>

<style scoped>
.usuarios-page {
  padding: var(--space-lg);
}

.formulario-card {
  max-width: 1200px;
  margin-bottom: var(--space-lg);
}

.formulario {
  display: flex;
  flex-direction: column;
  gap: 14px;
  max-width: 420px;
  margin-top: var(--space-md);
}

.formulario input,
.formulario select {
  width: 100%;
}

.form-actions {
  display: flex;
  gap: var(--space-sm);
  margin-top: var(--space-sm);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-lg);
}

.search-input {
  width: 300px;
}

.tabla-usuarios {
  width: 100%;
  border-collapse: collapse;
}

.tabla-usuarios th,
.tabla-usuarios td {
  border: 1px solid var(--color-border);
  padding: 12px 14px;
  text-align: left;
  font-size: var(--font-size-sm);
}

.tabla-usuarios th {
  background: var(--color-primary);
  color: var(--color-text-inverse);
  font-weight: 600;
}

.tabla-usuarios tr:nth-child(even) td {
  background: #f8fafc;
}

.tabla-usuarios tbody tr {
  transition: background-color var(--transition-fast);
}

.tabla-usuarios tbody tr:hover td {
  background: #f1f5f9;
}

.capitalize {
  text-transform: capitalize;
}

.acciones {
  display: flex;
  gap: var(--space-sm);
}

h3 {
  margin-bottom: var(--space-sm);
}
</style>
