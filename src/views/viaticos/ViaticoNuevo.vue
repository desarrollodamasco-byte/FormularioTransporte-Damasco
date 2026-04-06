<template>
  <div>
    <h2 class="text-h5 mb-4">Nuevo Viático</h2>
    <v-card class="pa-6">
      <v-form ref="form">
        <v-row>
          <v-col cols="12" md="6">
            <v-text-field v-model="formData.nombreSolicitante" label="Nombre del Solicitante" />
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field v-model="formData.fechaSolicitud" label="Fecha de Solicitud" type="date" />
          </v-col>
          <v-col cols="12" md="6">
            <v-autocomplete v-model="formData.lugarSalida" :items="destinos" item-title="nameDestination" item-value="nameDestination" label="Lugar de Salida" />
          </v-col>
          <v-col cols="12" md="6">
            <v-autocomplete v-model="formData.lugarDestino" :items="destinos" item-title="nameDestination" item-value="nameDestination" label="Lugar de Destino" />
          </v-col>
          <v-col cols="12" md="4">
            <v-text-field v-model="formData.fechaSalida" label="Fecha de Salida" type="date" />
          </v-col>
          <v-col cols="12" md="4">
            <v-text-field v-model="formData.fechaRetorno" label="Fecha de Retorno" type="date" />
          </v-col>
          <v-col cols="12" md="4">
            <v-text-field v-model.number="formData.diasDeViaje" label="Días de Viaje" type="number" />
          </v-col>
          <v-col cols="12" md="6">
            <v-switch v-model="formData.viajaEscoltado" label="¿Viaja Escoltado?" color="primary" />
          </v-col>
          <v-col cols="12">
            <v-textarea v-model="formData.observaciones" label="Observaciones" rows="3" />
          </v-col>
        </v-row>
        <v-btn color="primary" class="mt-4" @click="$router.push('/formulario-viatico/info-vehiculo-viatico')">
          Siguiente
          <v-icon end icon="mdi-arrow-right" />
        </v-btn>
      </v-form>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { consultasService } from '@/services/consultasService'
import type { Destino } from '@/interfaces'

const destinos = ref<Destino[]>([])
const formData = ref({
  nombreSolicitante: '',
  fechaSolicitud: '',
  lugarSalida: '',
  lugarDestino: '',
  fechaSalida: '',
  fechaRetorno: '',
  diasDeViaje: 1,
  viajaEscoltado: false,
  observaciones: '',
})

onMounted(async () => {
  destinos.value = await consultasService.getDestinos()
})
</script>
