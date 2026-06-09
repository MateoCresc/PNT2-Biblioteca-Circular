const API_LIBROS = 'https://6a281fad4e1e783349a51c27.mockapi.io/Libros'

export async function obtenerLibros() {
  const response = await fetch(API_LIBROS)
  return await response.json()
}