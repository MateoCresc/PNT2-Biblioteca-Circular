const API_LIBROS = 'https://6a281fad4e1e783349a51c27.mockapi.io/Libros'

export async function obtenerLibros() {
  const response = await fetch(API_LIBROS)
  return await response.json()
}

export async function actualizarLibro(libroActualizado) {
  console.log("PUT a MockAPI:", libroActualizado)

  const response = await fetch(`${API_LIBROS}/${libroActualizado.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(libroActualizado)
  })

  if (!response.ok) {
    console.error("Error en PUT:", response.status)
    return null
  }

  const data = await response.json()
  console.log("Respuesta API:", data)

  return data
}