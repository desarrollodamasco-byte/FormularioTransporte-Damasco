<template>
  <div>
    <h2 class="text-h5 mb-4">Estimado Total del Viático</h2>
    <v-card class="pa-6">
      <v-alert type="info" variant="tonal" class="mb-4">Paso 5 de 7 — Revise el estimado total del viático.</v-alert>
      <v-row>
        <v-col cols="12" md="6"><v-text-field v-model.number="viaticoDiario" label="Viático Diario (USD)" type="number" /></v-col>
        <v-col cols="12" md="6"><v-text-field v-model.number="tipoCambio" label="Tasa de Cambio (Bs/USD)" type="number" /></v-col>
        <v-col cols="12" md="4"><v-text-field v-model.number="cantChoferes" label="Cantidad de Choferes" type="number" /></v-col>
        <v-col cols="12" md="4"><v-text-field v-model.number="cantEscoltas" label="Cantidad de Escoltas" type="number" /></v-col>
        <v-col cols="12" md="4"><v-text-field v-model.number="diasViaje" label="Días de Viaje" type="number" /></v-col>
      </v-row>
      <v-divider class="my-4" />
      <v-row>
        <v-col cols="12" md="6"><v-text-field :model-value="(viaticoDiario * diasViaje * tipoCambio).toFixed(2)" label="Total a Pagar (Bs)" readonly variant="filled" /></v-col>
      </v-row>
      <v-row class="mt-4">
        <v-col><v-btn variant="outlined" @click="$router.back()"><v-icon start icon="mdi-arrow-left" /> Anterior</v-btn></v-col>
        <v-col cols="auto"><v-btn color="primary" @click="$router.push('/formulario-viatico/info-diaextra-viatico')">Siguiente <v-icon end icon="mdi-arrow-right" /></v-btn></v-col>
      </v-row>
    </v-card>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { consultasService } from '@/services/consultasService'
const viaticoDiario = ref(0)
const tipoCambio = ref(0)
const cantChoferes = ref(1)
const cantEscoltas = ref(0)
const diasViaje = ref(1)
onMounted(async () => {
  const dolar = await consultasService.getDolar()
  tipoCambio.value = dolar.dolarValue
})
</script>
