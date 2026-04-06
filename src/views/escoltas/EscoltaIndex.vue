<template>
  <div>
    <h2 class="text-h5 mb-4">Viático Escolta</h2>
    <v-card class="pa-6">
      <v-form>
        <v-row>
          <v-col cols="12" md="6"><v-text-field v-model="nombreSolicitante" label="Nombre del Solicitante" /></v-col>
          <v-col cols="12" md="6"><v-text-field v-model="fechaSolicitud" label="Fecha de Solicitud" type="date" /></v-col>
          <v-col cols="12" md="6">
            <v-autocomplete v-model="cedulaEscolta" :items="escoltas" item-title="nameChofer" item-value="cedulaChofer" label="Escolta Beneficiario" />
          </v-col>
          <v-col cols="12"><v-textarea v-model="observaciones" label="Observaciones" rows="2" /></v-col>
        </v-row>
        <v-divider class="my-4" />
        <h3 class="text-h6 mb-2">Información del Viaje</h3>
        <v-row>
          <v-col cols="12" md="4"><v-text-field v-model="origen" label="Origen" /></v-col>
          <v-col cols="12" md="4"><v-text-field v-model="destino" label="Destino" /></v-col>
          <v-col cols="12" md="4"><v-text-field v-model="fechaSalida" label="Fecha de Salida" type="date" /></v-col>
          <v-col cols="12" md="4"><v-text-field v-model="nroPlaca" label="Número de Placa" /></v-col>
          <v-col cols="12" md="4"><v-text-field v-model="marcaVeh" label="Marca" /></v-col>
          <v-col cols="12" md="4"><v-text-field v-model="modeloVeh" label="Modelo" /></v-col>
          <v-col cols="12" md="6"><v-text-field v-model="nroFactura" label="Nro de Factura" /></v-col>
          <v-col cols="12" md="6"><v-text-field v-model="proveedorServicio" label="Proveedor de Servicio" /></v-col>
        </v-row>
        <v-row class="mt-4">
          <v-col cols="auto">
            <v-btn color="primary" @click="$router.push('/formulario-escoltas/info-pago-escolta')">
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
import type { Chofer } from '@/interfaces'
const escoltas = ref<Chofer[]>([])
const nombreSolicitante = ref(''); const fechaSolicitud = ref(''); const cedulaEscolta = ref(''); const observaciones = ref('')
const origen = ref(''); const destino = ref(''); const fechaSalida = ref('')
const nroPlaca = ref(''); const marcaVeh = ref(''); const modeloVeh = ref('')
const nroFactura = ref(''); const proveedorServicio = ref('')
onMounted(async () => { escoltas.value = await consultasService.getEscoltas() })
</script>
