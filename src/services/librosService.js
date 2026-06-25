const API_LIBROS = 'https://6a281fad4e1e783349a51c27.mockapi.io/Libros'

// Listar libros
export async function obtenerLibros() {
  const response = await fetch(API_LIBROS)
  return await response.json()
}

// Alta
export async function agregarLibro(nuevoLibro) {
  const response = await fetch(API_LIBROS, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(nuevoLibro)
  })

  return await response.json()
}

// Baja
export async function eliminarLibro(id) {
  const response = await fetch(`${API_LIBROS}/${id}`, {
    method: 'DELETE'
  })

  if (!response.ok) {
    throw new Error('Error al eliminar libro')
  }

  return await response.json()
}

// Modificación
export async function actualizarLibro(id, datosActualizados) {
  const response = await fetch(`${API_LIBROS}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datosActualizados)
  })

  if (!response.ok) {
    throw new Error('Error al actualizar libro')
  }

  return await response.json()
}