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
            <template #item.ruta="{ item }">
              <div class="d-flex align-center ga-2 flex-wrap">
                <span>{{ rutaCompleta(item) }}</span>
                <v-chip
                  v-if="(item.tramos?.length ?? 0) > 1"
                  size="x-small"
                  color="primary"
                  variant="tonal"
                  prepend-icon="mdi-map-marker-path"
                >
                  {{ item.tramos!.length }} tramos
                </v-chip>
              </div>
            </template>
            <template #item.actions="{ item }">
              <div class="d-flex ga-1">
                <v-btn v-if="item.editable" icon="mdi-pencil" variant="text" color="warning" size="small" title="Editar (24h)" @click="editarViatico(item.nroSolicitud)" />
                <v-btn icon="mdi-file-pdf-box" variant="text" color="error" size="small" @click="descargarPdfViatico(item.nroSolicitud)" />
              </div>
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
            <template #item.ruta="{ item }">
              <div class="d-flex align-center ga-2 flex-wrap">
                <span>{{ rutaCompletaEscolta(item) }}</span>
                <v-chip
                  v-if="(item.tramos?.length ?? 0) > 1"
                  size="x-small"
                  color="primary"
                  variant="tonal"
                  prepend-icon="mdi-map-marker-path"
                >
                  {{ item.tramos!.length }} tramos
                </v-chip>
              </div>
            </template>
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
import { useRouter } from 'vue-router'
import { viaticosService } from '@/services/viaticosService'
import { reparacionesService } from '@/services/reparacionesService'
import { escoltasService } from '@/services/escoltasService'
import { useViaticoStore } from '@/stores/viaticoStore'
import type { CabeceraViaticoInterface, CarRepairsHeader, EscoltaHeader } from '@/interfaces'

const router = useRouter()
const viaticoStore = useViaticoStore()

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
  { title: 'Ruta', key: 'ruta', sortable: false, minWidth: '240px' },
  { title: 'Días', key: 'diasDeViaje', width: '80px' },
  { title: 'Fecha', key: 'fechaSolicitud' },
  { title: '', key: 'actions', sortable: false, width: '120px' },
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
  { title: 'Cédula Escolta', key: 'cedulaEscolta' },
  { title: 'Ruta', key: 'ruta', sortable: false, minWidth: '220px' },
  { title: 'Fecha', key: 'fechaSolicitud' },
  { title: '', key: 'actions', sortable: false, width: '80px' },
]

/** Arma la ruta completa encadenando tramos. Fallback: lugarSalida → lugarDestino. */
function rutaCompleta(v: CabeceraViaticoInterface): string {
  const tramos = v.tramos ?? []
  if (tramos.length > 0) {
    const sorted = [...tramos].sort((a, b) => a.orden - b.orden)
    const puntos = [sorted[0].origen]
    for (const t of sorted) {
      if (t.destino && t.destino !== puntos[puntos.length - 1]) puntos.push(t.destino)
    }
    return puntos.filter(Boolean).join(' → ')
  }
  const s = v.lugarSalida || ''
  const d = v.lugarDestino || ''
  return s && d ? `${s} → ${d}` : (s || d || '—')
}

function rutaCompletaEscolta(item: any): string {
  const tramos = item.tramos ?? []
  if (tramos.length > 0) {
    const sorted = [...tramos].sort((a: any, b: any) => a.orden - b.orden)
    const puntos = [sorted[0].origen]
    for (const t of sorted) {
      if (t.destino && t.destino !== puntos[puntos.length - 1]) puntos.push(t.destino)
    }
    return puntos.filter(Boolean).join(' → ')
  }
  return '—'
}

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

const editarViatico = async (id: number) => {
  viaticoStore.reset()
  await viaticoStore.loadForEdit(id)
  router.push('/formulario-viatico/inicio-viatico')
}

const descargarPdfViatico = (id: number) => viaticosService.getPdf(id)
const descargarPdfRep = (id: number) => reparacionesService.getPdf(id)
const descargarPdfEscolta = (id: number) => escoltasService.getPdf(id)
</script>
