<template>
  <div>
    <h2 class="text-h5 mb-4">Resumen de Reparación</h2>
    <v-card class="pa-6">
      <v-alert type="success" variant="tonal" class="mb-4">Revise y envíe la solicitud de reparación.</v-alert>
      <!-- TODO: Mostrar resumen completo de la reparación -->
      <v-alert type="warning" variant="tonal" class="mb-4">Implementar: Resumen completo con datos del proveedor, vehículo, repuestos, y pago.</v-alert>
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
const router = useRouter(); const sending = ref(false)
const enviar = async () => { sending.value = true; setTimeout(() => { sending.value = false; router.push('/formulario-reparaciones') }, 1000) }
</script>
