<template>
  <div>
    <h2 class="text-h5 mb-4">Información de Pago — Viático</h2>
    <v-card class="pa-6">
      <v-alert type="info" variant="tonal" class="mb-4">Paso 4 de 7 — Complete la información de peajes y pagos.</v-alert>
      <v-form>
        <v-row>
          <v-col cols="12" md="4"><v-text-field v-model.number="montoPeaje" label="Monto por Peaje (Bs)" type="number" /></v-col>
          <v-col cols="12" md="4"><v-text-field v-model.number="cantPeaje" label="Cantidad de Peajes" type="number" /></v-col>
          <v-col cols="12" md="4"><v-text-field :model-value="montoPeaje * cantPeaje" label="Total Peajes (Bs)" readonly /></v-col>
        </v-row>
        <v-row class="mt-4">
          <v-col><v-btn variant="outlined" @click="$router.back()"><v-icon start icon="mdi-arrow-left" /> Anterior</v-btn></v-col>
          <v-col cols="auto"><v-btn color="primary" @click="$router.push('/formulario-viatico/info-total-viatico')">Siguiente <v-icon end icon="mdi-arrow-right" /></v-btn></v-col>
        </v-row>
      </v-form>
    </v-card>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
const montoPeaje = ref(0)
const cantPeaje = ref(0)
</script>
