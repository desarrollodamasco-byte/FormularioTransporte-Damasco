<template>
  <div class="login-wrapper">
    <v-card class="login-card pa-8" elevation="8">
      <!-- Logo Damasco -->
      <div class="d-flex justify-center mb-6">
        <svg viewBox="0 0 1652 199" class="login-logo" xmlns="http://www.w3.org/2000/svg">
          <path d="M102.399 4.016H30.137L0 53.415h102.399c25.6 0 45.205 19.478 45.205 46.185 0 27.109-18.957 45.383-45.205 45.383H47.635V75.504H0v118.074h102.399c52.982 0 92.03-41.567 92.03-96.588C194.591 42.37 155.867 4.016 102.399 4.016Z" fill="#e1052d"/>
          <path d="M621.201 128.717L635.784 195.586H683.581L644.371 26.507C640.158 8.635 629.465 0 617.475 0c-12.476 0-20.901 8.032-26.41 20.482l-24.79 54.62c-13.61 29.519-19.767 43.776-24.79 57.23-5.346-13.454-11.341-27.912-25.113-57.431L491.582 20.683C486.073 8.032 477.648.201 465.334.201c-11.99 0-23.008 8.635-27.058 26.507L398.094 195.787h47.149l14.582-66.869c4.699-21.486 8.101-37.551 10.37-52.812 4.86 12.852 10.369 26.507 21.873 52.812l20.901 48.596c8.101 18.876 16.04 21.486 27.544 21.486 11.666 0 19.443-2.61 27.544-21.486l20.901-48.194c10.694-25.101 16.527-39.559 21.55-53.214 2.592 15.261 5.833 30.723 10.693 52.611Z" fill="#e1052d"/>
          <path d="M1066.61 82.331h-84.419c-11.179 0-16.526-3.815-16.526-13.454 0-9.84 5.347-13.253 16.526-13.253h107.589l30.78-49.999H985.918c-47.149 0-66.592 23.494-66.592 59.84 0 33.133 18.309 55.222 58.167 55.222h84.415c11.34 0 16.52 4.016 16.52 13.856 0 10.04-5.02 14.056-16.52 14.056H944.602l-30.785 49.397h144.523c47.31 0 66.59-23.495 66.59-62.853-.16-35.141-20.57-52.812-58.32-52.812Z" fill="#e1052d"/>
          <path d="M1226.69 56.226h75.18l29.81-48.194h-104.83c-51.85 0-90.09 36.547-90.09 90.966 0 53.816 38.24 94.58 90.09 94.58h75.18l29.81-47.591h-104.83c-25.28 0-43.91-18.073-43.91-44.379-.16-26.707 18.63-45.382 43.59-45.382Z" fill="#e1052d"/>
          <path d="M1446.55 8.032c-71.77 0-107.74 28.916-107.74 94.179 0 65.262 35.8 94.379 107.74 94.379 71.62 0 107.75-29.117 107.75-94.379-.16-65.263-36.29-94.179-107.75-94.179Zm0 141.168c-45.85 0-62.38-7.631-62.38-46.989 0-39.358 16.53-46.587 62.38-46.587 45.86 0 62.38 7.43 62.38 46.587-.16 39.358-16.69 46.989-62.38 46.989Z" fill="#e1052d"/>
          <path d="m389.02 196.189-81.66-188.558h-40.02L185.68 196.189h42.45l16.527-37.752h85.225l16.364 37.752h42.774ZM264.91 111.85l22.521-52.009 22.522 52.009H264.91Z" fill="#e1052d"/>
          <path d="M780.633 7.631 698.973 196.189h42.45l16.527-37.752h85.225l16.364 37.752h42.775L820.653 7.631h-40.02Zm-2.43 104.219 22.521-52.009 22.522 52.009h-45.043Z" fill="#e1052d"/>
        </svg>
      </div>

      <h2 class="text-h6 text-center mb-1">Control de Transporte</h2>
      <p class="text-body-2 text-grey text-center mb-6">Inicia sesión con tu cuenta Damasco</p>

      <v-form ref="form" @submit.prevent="onSubmit">
        <v-text-field
          v-model="usuario"
          label="Usuario"
          prepend-inner-icon="mdi-account-outline"
          autocomplete="username"
          :rules="[v => !!v || 'Usuario requerido']"
          autofocus
          variant="outlined"
          density="comfortable"
        />
        <v-text-field
          v-model="contrasena"
          :type="mostrarPass ? 'text' : 'password'"
          label="Contraseña"
          prepend-inner-icon="mdi-lock-outline"
          :append-inner-icon="mostrarPass ? 'mdi-eye-off' : 'mdi-eye'"
          autocomplete="current-password"
          :rules="[v => !!v || 'Contraseña requerida']"
          variant="outlined"
          density="comfortable"
          class="mt-2"
          @click:append-inner="mostrarPass = !mostrarPass"
        />

        <v-alert
          v-if="auth.error"
          type="error" variant="tonal" density="compact" class="mt-2"
          closable
          @click:close="auth.error = ''"
        >
          {{ auth.error }}
        </v-alert>

        <v-btn
          type="submit"
          color="primary" block size="large"
          :loading="auth.loading"
          class="mt-4"
        >
          Iniciar sesión
          <v-icon end icon="mdi-login" />
        </v-btn>
      </v-form>

      <p class="text-caption text-grey text-center mt-6">
        Damasco® · Autenticación centralizada
      </p>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const form = ref()
const usuario = ref('')
const contrasena = ref('')
const mostrarPass = ref(false)

async function onSubmit() {
  if (!form.value) return
  const { valid } = await form.value.validate()
  if (!valid) return

  try {
    await auth.login({ usuario: usuario.value.trim(), contrasena: contrasena.value })
    // Redirigir al destino original (si vino de un guard) o al home
    const next = (route.query.next as string) || '/home/inicio'
    router.push(next)
  } catch {
    // el error ya se muestra desde auth.error
  }
}
</script>

<style scoped>
.login-wrapper {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1a1a1a 0%, #2c2c2c 100%);
  padding: 24px;
}

.login-card {
  width: 100%;
  max-width: 420px;
  border-radius: 12px;
}

.login-logo {
  width: 220px;
  height: auto;
}
</style>
