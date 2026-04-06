<template>
  <div>
    <h2 class="text-h5 mb-4">Información del Vehículo</h2>
    <v-card class="pa-6">
      <v-form>
        <v-row>
          <v-col cols="12" md="6">
            <v-autocomplete v-model="choferCedula" :items="choferes" item-title="cedulaChofer" item-value="cedulaChofer" label="Cédula del Chofer" @update:model-value="onChoferSelect" />
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field v-model="choferNombre" label="Nombre del Chofer" readonly />
          </v-col>
          <v-col cols="12" md="6">
            <v-autocomplete v-model="vehiculoPlaca" :items="vehiculos" item-title="plateNumber" item-value="plateNumber" label="Placa del Vehículo" @update:model-value="onVehiculoSelect" />
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field v-model="vehiculoInfo" label="Marca / Modelo" readonly />
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field v-model="facturaNumero" label="Número de Factura" />
          </v-col>
        </v-row>

        <v-row class="mt-4">
          <v-col>
            <v-btn variant="outlined" @click="$router.back()">
              <v-icon start icon="mdi-arrow-left" /> Anterior
            </v-btn>
          </v-col>
          <v-col cols="auto">
            <v-btn color="primary" @click="$router.push('/formulario-viatico/info-pago-viatico')">
              Siguiente <v-icon end icon="mdi-arrow-right" />
            </v-btn>
          </v-col>
        </v-row>
      </v-form>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { consultasService } from '@/services/consultasService'
import type { Chofer, Vehiculo } from '@/interfaces'

const choferes = ref<Chofer[]>([])
const vehiculos = ref<Vehiculo[]>([])
const choferCedula = ref('')
const choferNombre = ref('')
const vehiculoPlaca = ref('')
const vehiculoInfo = ref('')
const facturaNumero = ref('')

onMounted(async () => {
  choferes.value = await consultasService.getChoferes()
  vehiculos.value = await consultasService.getVehiculos()
})

const onChoferSelect = (cedula: string) => {
  const chofer = choferes.value.find(c => c.cedulaChofer === cedula)
  choferNombre.value = chofer?.nameChofer ?? ''
}

const onVehiculoSelect = (placa: string) => {
  const vehiculo = vehiculos.value.find(v => v.plateNumber === placa)
  vehiculoInfo.value = vehiculo ? `${vehiculo.carBrand} ${vehiculo.carModel}` : ''
}
</script>
