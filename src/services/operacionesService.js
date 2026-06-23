const KEY = 'operaciones'

function leerOperaciones() {
  return JSON.parse(localStorage.getItem(KEY)) || []
}

function guardarOperaciones(operaciones) {
  localStorage.setItem(KEY, JSON.stringify(operaciones))
}

export async function obtenerOperaciones() {
  return leerOperaciones()
}

export async function obtenerOperacionesPorUsuario(usuarioId) {
  const operaciones = leerOperaciones()
  return operaciones.filter(op => op.usuarioId === usuarioId)
}

export async function crearOperacion(operacion) {
  const operaciones = leerOperaciones()
  const nueva = {
    ...operacion,
    id: crypto.randomUUID(),
    estado: 'pendiente',
    fecha: new Date().toLocaleDateString('es-AR')
  }
  operaciones.push(nueva)
  guardarOperaciones(operaciones)
  return nueva
}

export async function actualizarOperacion(id, datos) {
  const operaciones = leerOperaciones()
  const indice = operaciones.findIndex(op => op.id === id)
  if (indice === -1) {
    throw new Error('Operación no encontrada')
  }
  operaciones[indice] = { ...operaciones[indice], ...datos }
  guardarOperaciones(operaciones)
  return operaciones[indice]
}
