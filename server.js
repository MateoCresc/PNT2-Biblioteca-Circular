import express from 'express'
import cors from 'cors'

const app = express()
app.use(cors())
app.use(express.json())

function normalizar(texto) {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

app.post('/api/chat', async (req, res) => {
  const { pregunta, libros } = req.body

  const texto = normalizar(pregunta)

  let busqueda = texto

  if (texto.includes('ciencia ficcion')) busqueda = 'ciencia ficcion'
  else if (texto.includes('ficcion')) busqueda = 'ficcion'
  else if (texto.includes('novela')) busqueda = 'novela'
  else if (texto.includes('fantasia')) busqueda = 'fantasia'
  else if (texto.includes('distopia')) busqueda = 'distopia'
  else if (texto.includes('romance')) busqueda = 'romance'
  else if (texto.includes('drama')) busqueda = 'drama'

 const encontrados = libros.filter(libro => {
  const titulo = normalizar(libro.titulo)
  const autor = normalizar(libro.autor)
  const genero = normalizar(libro.genero)

  return (
    texto.includes(titulo) ||
    texto.includes(autor) ||
    texto.includes(genero) ||
    titulo.includes(texto) ||
    autor.includes(texto) ||
    genero.includes(texto)
  )
})

  if (encontrados.length > 0) {
    const respuesta = encontrados
      .map(libro => `• ${libro.titulo} de ${libro.autor} - Género: ${libro.genero} - Stock: ${libro.stock}`)
      .join('\n')

    return res.json({
      respuesta: `Encontré estos libros en el catálogo:\n${respuesta}`
    })
  }

  res.json({
    respuesta: 'No encontré coincidencias en el catálogo.'
  })
})

app.listen(3001, () => {
  console.log('Servidor del chatbot corriendo en http://localhost:3001')
})