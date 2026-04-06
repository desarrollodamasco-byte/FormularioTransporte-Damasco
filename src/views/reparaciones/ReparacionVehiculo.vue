<template>
  <div>
    <h2 class="text-h5 mb-4">Detalle del Vehículo — Reparación</h2>
    <v-card class="pa-6">
      <v-form>
        <v-row>
          <v-col cols="12" md="6"><v-text-field v-model="nombreSolicitante" label="Nombre del Solicitante" /></v-col>
          <v-col cols="12" md="6"><v-text-field v-model="fechaSolicitud" label="Fecha de Solicitud" type="date" /></v-col>
          <v-col cols="12" md="6"><v-text-field v-model="nombreProveedor" label="Nombre o Razón Social del Proveedor" /></v-col>
          <v-col cols="12" md="6"><v-text-field v-model="rif" label="RIF / Número de Documento" /></v-col>
          <v-col cols="12"><v-textarea v-model="descripcion" label="Descripción breve" rows="2" /></v-col>
        </v-row>
        <v-divider class="my-4" />
        <h3 class="text-h6 mb-2">Vehículo</h3>
        <v-row>
          <v-col cols="12" md="4"><v-text-field v-model="placa" label="Número de Placa" /></v-col>
          <v-col cols="12" md="4"><v-text-field v-model="marca" label="Marca" /></v-col>
          <v-col cols="12" md="4"><v-text-field v-model="modelo" label="Modelo" /></v-col>
          <v-col cols="12" md="6"><v-text-field v-model="serial" label="Serial de Carrocería" /></v-col>
          <v-col cols="12" md="6"><v-select v-model="tipoVehiculo" :items="['Sedan', 'Camioneta', 'Camión', 'Moto']" label="Tipo de Vehículo" /></v-col>
        </v-row>
        <v-row class="mt-4">
          <v-col><v-btn variant="outlined" @click="$router.back()"><v-icon start icon="mdi-arrow-left" /> Anterior</v-btn></v-col>
          <v-col cols="auto"><v-btn color="primary" @click="$router.push('/formulario-reparaciones/info-vehiculo-rep')">Siguiente <v-icon end icon="mdi-arrow-right" /></v-btn></v-col>
        </v-row>
      </v-form>
    </v-card>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
const nombreSolicitante = ref(''); const fechaSolicitud = ref('')
const nombreProveedor = ref(''); const rif = ref(''); const descripcion = ref('')
const placa = ref(''); const marca = ref(''); const modelo = ref('')
const serial = ref(''); const tipoVehiculo = ref('')
</script>
