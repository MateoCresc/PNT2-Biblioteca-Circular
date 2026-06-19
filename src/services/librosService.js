const API_LIBROS = 'https://6a281fad4e1e783349a51c27.mockapi.io/Libros'

// Listar libros
export async function obtenerLibros() {
  const response = await fetch(API_LIBROS)
  return await response.json()
}

// Buscar libro por título
async function obtenerLibroPorTitulo(titulo) {
  const libros = await obtenerLibros()

  return libros.find(
    libro => libro.titulo.toLowerCase() === titulo.toLowerCase()
  )
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
export async function eliminarLibro(titulo) {
  const libro = await obtenerLibroPorTitulo(titulo)

  if (!libro) {
    throw new Error('Libro no encontrado')
  }

  const response = await fetch(
    `${API_LIBROS}/${encodeURIComponent(libro.titulo)}`,
    {
      method: 'DELETE'
    }
  )

  return await response.json()
}

// Modificación
export async function actualizarLibro(titulo, datosActualizados) {
  const libro = await obtenerLibroPorTitulo(titulo)

  if (!libro) {
    throw new Error('Libro no encontrado')
  }

  const response = await fetch(
    `${API_LIBROS}/${encodeURIComponent(libro.titulo)}`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datosActualizados)
    }
  )

  return await response.json()
}
