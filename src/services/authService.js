const API_USUARIOS = 'https://6a281fad4e1e783349a51c27.mockapi.io/Usuarios'

export async function login(email, password) {
  const response = await fetch(API_USUARIOS)
  const usuarios = await response.json()

  return usuarios.find(
    usuario =>
      usuario.email === email &&
      usuario.password === password &&
      usuario.estado === 'activo'
  )
}