<template>
  <div>
    <h2 class="text-h5 mb-4">Repuestos y Piezas</h2>
    <v-card class="pa-6">
      <v-alert type="info" variant="tonal" class="mb-4">Agregue los repuestos y piezas requeridos para la reparación.</v-alert>
      <!-- TODO: Implementar tabla dinámica de repuestos con agregar/eliminar filas -->
      <v-alert type="warning" variant="tonal" class="mb-4">Implementar: Tabla dinámica con campos reqCarParts, quantity, priceUsd, priceBs, IVA, totals.</v-alert>
      <v-row class="mt-4">
        <v-col><v-btn variant="outlined" @click="$router.back()"><v-icon start icon="mdi-arrow-left" /> Anterior</v-btn></v-col>
        <v-col cols="auto"><v-btn color="primary" @click="$router.push('/formulario-reparaciones/info-pago-rep')">Siguiente <v-icon end icon="mdi-arrow-right" /></v-btn></v-col>
      </v-row>
    </v-card>
  </div>
</template>
<script setup lang="ts"></script>
