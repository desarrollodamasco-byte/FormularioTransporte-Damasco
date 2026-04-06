<template>
  <div>
    <v-row align="center" class="mb-4">
      <v-col><h2 class="text-h5">Reparaciones</h2><p class="text-body-2 text-grey">Listado de solicitudes de reparación</p></v-col>
      <v-col cols="auto"><v-btn color="primary" prepend-icon="mdi-plus" @click="$router.push('/formulario-reparaciones/info-vehiculo')">Nueva Reparación</v-btn></v-col>
    </v-row>
    <v-card>
      <v-data-table :headers="headers" :items="reparaciones" :loading="loading" hover>
        <template #item.actions="{ item }">
          <v-btn icon="mdi-file-pdf-box" variant="text" color="error" size="small" @click="descargarPdf(item.reparationRequestNumber)" />
        </template>
      </v-data-table>
    </v-card>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { reparacionesService } from '@/services/reparacionesService'
import type { CarRepairsHeader } from '@/interfaces'
const reparaciones = ref<CarRepairsHeader[]>([])
const loading = ref(false)
const headers = [
  { title: '#', key: 'reparationRequestNumber', width: '80px' },
  { title: 'Solicitante', key: 'nombreSolicitante' },
  { title: 'Proveedor', key: 'nombreoRazonSocial' },
  { title: 'Documento', key: 'numeroDocumento' },
  { title: 'Fecha', key: 'fechaSolicitud' },
  { title: 'Acciones', key: 'actions', sortable: false, width: '100px' },
]
onMounted(async () => { loading.value = true; try { reparaciones.value = await reparacionesService.getReparaciones() } finally { loading.value = false } })
const descargarPdf = (id: number) => reparacionesService.getPdf(id)
</script>
