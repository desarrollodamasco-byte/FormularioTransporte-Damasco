<template>
  <div>
    <h2 class="text-h5 mb-4">Aprobaciones</h2>
    <p class="text-body-2 text-grey mb-4">Solicitudes pendientes de aprobación</p>

    <v-tabs v-model="tab" color="primary">
      <v-tab value="viaticos">Viáticos</v-tab>
      <v-tab value="reparaciones">Reparaciones</v-tab>
      <v-tab value="escoltas">Escoltas</v-tab>
    </v-tabs>

    <v-tabs-window v-model="tab" class="mt-4">

      <!-- Tab Viáticos -->
      <v-tabs-window-item value="viaticos">
        <v-card>
          <v-data-table :headers="headersViaticos" :items="viaticos" :loading="loadingViaticos" hover>
            <template #item.actions="{ item }">
              <v-btn icon="mdi-file-pdf-box" variant="text" color="error" size="small" @click="descargarPdfViatico(item.nroSolicitud)" />
            </template>
          </v-data-table>
        </v-card>
      </v-tabs-window-item>

      <!-- Tab Reparaciones -->
      <v-tabs-window-item value="reparaciones">
        <v-card>
          <v-data-table :headers="headersReparaciones" :items="reparaciones" :loading="loadingReparaciones" hover>
            <template #item.actions="{ item }">
              <v-btn icon="mdi-file-pdf-box" variant="text" color="error" size="small" @click="descargarPdfRep(item.reparationRequestNumber)" />
            </template>
          </v-data-table>
        </v-card>
      </v-tabs-window-item>

      <!-- Tab Escoltas -->
      <v-tabs-window-item value="escoltas">
        <v-card>
          <v-data-table :headers="headersEscoltas" :items="escoltas" :loading="loadingEscoltas" hover>
            <template #item.actions="{ item }">
              <v-btn icon="mdi-file-pdf-box" variant="text" color="error" size="small" @click="descargarPdfEscolta(item.nroSolicitud)" />
            </template>
          </v-data-table>
        </v-card>
      </v-tabs-window-item>

    </v-tabs-window>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { viaticosService } from '@/services/viaticosService'
import { reparacionesService } from '@/services/reparacionesService'
import { escoltasService } from '@/services/escoltasService'
import type { CabeceraViaticoInterface, CarRepairsHeader, EscoltaHeader } from '@/interfaces'

const tab = ref('viaticos')
const viaticos = ref<CabeceraViaticoInterface[]>([])
const reparaciones = ref<CarRepairsHeader[]>([])
const escoltas = ref<EscoltaHeader[]>([])
const loadingViaticos = ref(false)
const loadingReparaciones = ref(false)
const loadingEscoltas = ref(false)

const headersViaticos = [
  { title: '#', key: 'nroSolicitud', width: '80px' },
  { title: 'Solicitante', key: 'nombreSolicitante' },
  { title: 'Destino', key: 'lugarDestino' },
  { title: 'Días', key: 'diasDeViaje', width: '80px' },
  { title: 'Fecha', key: 'fechaSolicitud' },
  { title: '', key: 'actions', sortable: false, width: '80px' },
]

const headersReparaciones = [
  { title: '#', key: 'reparationRequestNumber', width: '80px' },
  { title: 'Solicitante', key: 'nombreSolicitante' },
  { title: 'Proveedor', key: 'nombreoRazonSocial' },
  { title: 'Fecha', key: 'fechaSolicitud' },
  { title: '', key: 'actions', sortable: false, width: '80px' },
]

const headersEscoltas = [
  { title: '#', key: 'nroSolicitud', width: '80px' },
  { title: 'Solicitante', key: 'nombreSolicitante' },
  { title: 'Fecha', key: 'fechaSolicitud' },
  { title: '', key: 'actions', sortable: false, width: '80px' },
]

onMounted(async () => {
  loadingViaticos.value = true
  loadingReparaciones.value = true
  loadingEscoltas.value = true
  try {
    const [v, r, e] = await Promise.all([
      viaticosService.getViaticos(),
      reparacionesService.getReparaciones(),
      escoltasService.getViaticosEscoltas(),
    ])
    viaticos.value = v
    reparaciones.value = r
    escoltas.value = e
  } finally {
    loadingViaticos.value = false
    loadingReparaciones.value = false
    loadingEscoltas.value = false
  }
})

const descargarPdfViatico = (id: number) => viaticosService.getPdf(id)
const descargarPdfRep = (id: number) => reparacionesService.getPdf(id)
const descargarPdfEscolta = (id: number) => escoltasService.getPdf(id)
</script>
