<template>
  <div>
    <h2 class="text-h5 mb-4">Resumen Viático Escolta</h2>
    <v-card class="pa-6">
      <v-form>
        <v-row>
          <v-col cols="12" md="4"><v-text-field v-model.number="viaticoDiario" label="Viático Diario (USD)" type="number" /></v-col>
          <v-col cols="12" md="4"><v-text-field v-model.number="cantidadDias" label="Cantidad de Días" type="number" /></v-col>
          <v-col cols="12" md="4"><v-text-field :model-value="(viaticoDiario * cantidadDias).toFixed(2)" label="Total USD" readonly /></v-col>
          <v-col cols="12" md="6"><v-text-field v-model.number="tasaDolar" label="Tasa Dólar (Bs)" type="number" /></v-col>
          <v-col cols="12" md="6"><v-text-field :model-value="(viaticoDiario * cantidadDias * tasaDolar).toFixed(2)" label="Total Bolívares" readonly variant="filled" /></v-col>
        </v-row>
        <v-row class="mt-4">
          <v-col><v-btn variant="outlined" @click="$router.back()"><v-icon start icon="mdi-arrow-left" /> Anterior</v-btn></v-col>
          <v-col cols="auto"><v-btn color="primary" size="large" prepend-icon="mdi-send" :loading="sending" @click="enviar">Enviar Solicitud</v-btn></v-col>
        </v-row>
      </v-form>
    </v-card>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { consultasService } from '@/services/consultasService'
const router = useRouter(); const sending = ref(false)
const viaticoDiario = ref(0); const cantidadDias = ref(1); const tasaDolar = ref(0)
onMounted(async () => { const dolar = await consultasService.getDolar(); tasaDolar.value = dolar.dolarValue })
const enviar = async () => { sending.value = true; setTimeout(() => { sending.value = false; router.push('/formulario-escoltas') }, 1000) }
</script>
