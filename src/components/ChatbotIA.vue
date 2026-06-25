<template>
  <div class="chatbot-ia">
    <button class="chatbot-button" @click="abierto = !abierto">🤖</button>

    <div v-if="abierto" class="chatbot-window">
      <div class="chatbot-header">
        <strong>Asistente IA</strong>
        <button @click="abierto = false">×</button>
      </div>

      <div class="chatbot-body">
        <div class="mensajes">
          <div
            v-for="(mensaje, index) in mensajes"
            :key="index"
            :class="['mensaje', mensaje.tipo]"
          >
            {{ mensaje.texto }}
          </div>
        </div>

        <form class="chatbot-form" @submit.prevent="enviarPregunta">
          <input
            v-model="pregunta"
            type="text"
            placeholder="Preguntá por autor, género o stock..."
          />
          <button type="submit" :disabled="cargando">
            {{ cargando ? '...' : 'Enviar' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { obtenerLibros } from '../services/librosService'

const abierto = ref(false)
const pregunta = ref('')
const cargando = ref(false)

const mensajes = ref([
  {
    tipo: 'ia',
    texto: 'Hola, soy el asistente de Biblioteca Circular. Puedo ayudarte a buscar libros por autor, género o disponibilidad.'
  }
])

async function enviarPregunta() {
  if (!pregunta.value.trim()) return

  const preguntaUsuario = pregunta.value

  mensajes.value.push({
    tipo: 'usuario',
    texto: preguntaUsuario
  })

  pregunta.value = ''
  cargando.value = true

  try {
    const libros = await obtenerLibros()

    const response = await fetch('http://localhost:3001/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pregunta: preguntaUsuario,
        libros
      })
    })

    const data = await response.json()

mensajes.value.push({
  tipo: 'ia',
  texto: data.respuesta || data.error || 'No pude obtener una respuesta.'
})
  } catch (error) {
    mensajes.value.push({
      tipo: 'ia',
      texto: 'Ocurrió un error al consultar la IA.'
    })
  } finally {
    cargando.value = false
  }
}
</script>

<style scoped>
.chatbot-ia {
  position: fixed;
  right: 24px;
  bottom: 24px;
  z-index: 1000;
}

.chatbot-button {
  width: 58px;
  height: 58px;
  border-radius: 50%;
  border: none;
  font-size: 26px;
  cursor: pointer;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.25);
}

.chatbot-window {
  position: absolute;
  right: 0;
  bottom: 72px;
  width: 360px;
  height: 500px;
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 12px 35px rgba(0, 0, 0, 0.25);
}

.chatbot-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #2f5d50;
  color: white;
}

.chatbot-header button {
  background: none;
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
}

.chatbot-body {
  height: calc(100% - 56px);
  display: flex;
  flex-direction: column;
  padding: 12px;
  color: #333;
}

.mensajes {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-bottom: 10px;
}

.mensaje {
  padding: 10px 12px;
  border-radius: 12px;
  font-size: 14px;
  line-height: 1.4;
}

.mensaje.ia {
  background: #f1f1f1;
  align-self: flex-start;
}

.mensaje.usuario {
  background: #2f5d50;
  color: white;
  align-self: flex-end;
}

.chatbot-form {
  display: flex;
  gap: 8px;
  border-top: 1px solid #ddd;
  padding-top: 10px;
}

.chatbot-form input {
  flex: 1;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 8px;
}

.chatbot-form button {
  padding: 10px 12px;
  border: none;
  border-radius: 8px;
  background: #2f5d50;
  color: white;
  cursor: pointer;
}

.chatbot-form button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>