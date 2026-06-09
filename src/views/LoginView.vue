<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { login } from '../services/authService'
import '../styles/login.css'

const router = useRouter()

const email = ref('')
const password = ref('')
const error = ref('')

const iniciarSesion = async () => {
  error.value = ''

  const usuario = await login(
    email.value,
    password.value
  )

  if (!usuario) {
    error.value = 'Email o contraseña incorrectos'
    return
  }

  localStorage.setItem(
    'usuario',
    JSON.stringify(usuario)
  )

  router.push('/catalogo')
}
</script>

<template>
  <div class="login-page">
    <div class="login-card">

      <h1>📚 Biblioteca Digital</h1>

      <form @submit.prevent="iniciarSesion">

        <div class="form-group">
          <label>Email</label>
          <input
            v-model="email"
            type="email"
            placeholder="Ingrese email"
          />
        </div>

        <div class="form-group">
          <label>Contraseña</label>
          <input
            v-model="password"
            type="password"
            placeholder="Ingrese contraseña"
          />
        </div>

        <button class="login-btn" type="submit">
          Ingresar
        </button>

        <p class="error" v-if="error">
          {{ error }}
        </p>

      </form>

    </div>
  </div>
</template>

<style scoped>
.login-container {
  max-width: 400px;
  margin: 50px auto;
}

input {
  width: 100%;
  padding: 8px;
  margin-bottom: 10px;
}

button {
  padding: 10px;
}
</style>