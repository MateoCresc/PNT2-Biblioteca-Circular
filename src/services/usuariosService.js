const API_USUARIOS = 'https://6a281fad4e1e783349a51c27.mockapi.io/Usuarios'

// Listar usuarios
export async function obtenerUsuarios() {
  const response = await fetch(API_USUARIOS)
  return await response.json()
}

// Buscar usuario por mail
async function obtenerUsuarioPorEmail(email) {
  const usuarios = await obtenerUsuarios()

  return usuarios.find(
    usuario => usuario.email.toLowerCase() === email.toLowerCase()
  )
}

// Alta
export async function crearUsuario(nuevoUsuario) {
  const response = await fetch(API_USUARIOS, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(nuevoUsuario)
  })
  return await response.json()
}

// Baja lógica
export async function eliminarUsuario(email) {
  const usuario = await obtenerUsuarioPorEmail(email)

  if (!usuario) {
    throw new Error('Usuario no encontrado')
  }

  const response = await fetch(
    `${API_USUARIOS}/${usuario.id}`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...usuario, estado: 'inactivo' })
    }
  )

  return await response.json()
}

// Modificación
export async function actualizarUsuario(email, datosActualizados) {
  const usuario = await obtenerUsuarioPorEmail(email)

  if (!usuario) {
    throw new Error('Usuario no encontrado')
  }

  const response = await fetch(
    `${API_USUARIOS}/${usuario.id}`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datosActualizados)
    }
  )

  return await response.json()
}
