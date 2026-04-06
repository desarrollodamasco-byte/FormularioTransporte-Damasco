<template>
  <div>
    <h2 class="text-h5 mb-4">Resumen del Viático</h2>
    <v-card class="pa-6">
      <v-alert type="success" variant="tonal" class="mb-4">Paso 7 de 7 — Revise y envíe la solicitud.</v-alert>
      <p class="text-body-1 text-grey mb-4">Revise todos los datos antes de enviar la solicitud. Una vez enviada se generará el comprobante PDF.</p>
      <v-divider class="my-4" />
      <!-- TODO: Mostrar resumen de todos los pasos aquí -->
      <v-alert type="warning" variant="tonal" class="mb-4">Implementar: Mostrar resumen completo del viático con datos de todos los pasos anteriores.</v-alert>
      <v-row class="mt-4">
        <v-col><v-btn variant="outlined" @click="$router.back()"><v-icon start icon="mdi-arrow-left" /> Anterior</v-btn></v-col>
        <v-col cols="auto"><v-btn color="primary" size="large" prepend-icon="mdi-send" :loading="sending" @click="enviar">Enviar Solicitud</v-btn></v-col>
      </v-row>
    </v-card>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter()
const sending = ref(false)
const enviar = async () => {
  sending.value = true
  // TODO: Recopilar datos de todos los pasos y enviar con viaticosService.addViatico()
  setTimeout(() => {
    sending.value = false
    router.push('/formulario-viatico/info-general-viatico')
  }, 1000)
}
</script>
