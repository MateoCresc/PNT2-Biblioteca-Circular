<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { login } from '../services/authService'
import AppButton from '../components/AppButton.vue'

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

      <h1 class="login-title">Biblioteca Digital</h1>

      <form @submit.prevent="iniciarSesion" class="login-form">

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

        <AppButton variant="primary" type="submit" class="login-btn">
          Ingresar
        </AppButton>

        <p class="error" v-if="error">
          {{ error }}
        </p>

      </form>

    </div>
  </div>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, var(--color-primary), var(--color-topbar));
}

.login-card {
  background: var(--color-card);
  padding: 40px;
  border-radius: var(--radius-lg);
  width: 400px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
}

.login-title {
  text-align: center;
  margin-bottom: 30px;
  font-size: var(--font-size-xl);
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.form-group label {
  font-weight: 600;
  font-size: var(--font-size-sm);
}

.form-group input {
  width: 100%;
  padding: 12px;
}

.login-btn {
  width: 100%;
  padding: 12px;
  margin-top: var(--space-sm);
}

.error {
  color: var(--color-danger);
  font-size: var(--font-size-sm);
  text-align: center;
}
</style>
