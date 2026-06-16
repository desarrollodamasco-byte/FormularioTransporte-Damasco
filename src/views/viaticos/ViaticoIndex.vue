<template>
  <div>
    <v-row align="center" class="mb-4">
      <v-col>
        <h2 class="text-h5">Viáticos y Peajes</h2>
        <p class="text-body-2 text-grey">Listado de solicitudes de viáticos</p>
      </v-col>
      <v-col cols="auto">
        <v-btn color="primary" prepend-icon="mdi-plus" @click="$router.push('/formulario-viatico/inicio-viatico')">
          Nuevo Viático
        </v-btn>
      </v-col>
    </v-row>

    <v-card>
      <v-data-table
        :headers="headers"
        :items="viaticos"
        :loading="loading"
        hover
      >
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

        <template #item.viajaEscoltado="{ item }">
          <v-chip
            v-if="item.viajaEscoltado"
            color="primary"
            size="small"
            prepend-icon="mdi-shield-account"
          >
            {{ item.cantEscoltas ?? '—' }}
          </v-chip>
          <span v-else class="text-grey text-body-2">No</span>
        </template>

        <template #item.cantDiasExtra="{ item }">
          <v-chip
            v-if="item.cantDiasExtra"
            color="orange"
            size="small"
            prepend-icon="mdi-calendar-plus"
          >
            {{ item.cantDiasExtra }} ({{ item.tipoDiaExtra ?? '' }})
          </v-chip>
          <span v-else class="text-grey text-body-2">—</span>
        </template>

        <template #item.actions="{ item }">
          <div class="d-flex ga-1">
            <v-btn v-if="item.editable" icon="mdi-pencil" variant="text" color="warning" size="small" title="Editar (24h)" @click="editarViatico(item.nroSolicitud)" />
            <v-btn v-if="item.puedeAgregarDiaExtra" icon="mdi-calendar-plus" variant="text" color="orange" size="small" title="Agregar Extensión de Viáticos" @click="abrirDiaExtra(item)" />
            <v-btn icon="mdi-file-pdf-box" variant="text" color="error" size="small" @click="descargarPdf(item.nroSolicitud)" />
          </div>
        </template>
      </v-data-table>
    </v-card>

    <!-- Diálogo: Agregar Extensión de Viáticos -->
    <v-dialog v-model="dialogDiaExtra" max-width="600" persistent>
      <v-card>
        <v-card-title class="d-flex align-center">
          <v-icon class="mr-2" color="orange">mdi-calendar-plus</v-icon>
          Agregar Extensión de Viáticos — Viático #{{ diaExtraTarget?.nroSolicitud }}
        </v-card-title>
        <v-card-text>
          <v-alert type="info" variant="tonal" class="mb-4" density="compact">
            {{ diaExtraTarget?.nombreSolicitante }} · {{ diaExtraTarget?.lugarSalida }} → {{ diaExtraTarget?.lugarDestino }}
          </v-alert>
          <v-row>
            <v-col cols="12">
              <v-select
                v-model="dxForm.tipoDiaExtra"
                :items="catalogos.diasExtras"
                item-title="diaExtraTipo"
                item-value="diaExtraTipo"
                label="Tipo de Extensión"
                :loading="catalogos.loading"
                @update:model-value="onTipoDxChange"
              />
            </v-col>
            <v-col cols="6">
              <v-text-field :model-value="dxForm.viaticoDiario" label="Monto Viático (USD)" type="number" readonly />
            </v-col>
            <v-col cols="6">
              <v-text-field v-model.number="dxForm.cantDias" label="Cantidad de Días" type="number" min="1" @update:model-value="calcDx" />
            </v-col>
            <v-col cols="6">
              <v-text-field :model-value="dxForm.tipoCambio.toFixed(4)" label="Tasa de Cambio" readonly />
            </v-col>
            <v-col cols="6">
              <v-text-field :model-value="dxTotalBs.toFixed(2)" label="Total a Pagar (Bs)" readonly variant="filled" color="success" />
            </v-col>
            <v-col cols="12">
              <v-textarea
                v-model="dxForm.observaciones"
                label="Observaciones"
                rows="2"
                auto-grow
                hint="Motivo de la extensión, contexto, etc."
                persistent-hint
                counter="500"
                maxlength="500"
              />
            </v-col>
          </v-row>
          <v-alert v-if="dxError" type="error" variant="tonal" density="compact" class="mt-2">{{ dxError }}</v-alert>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="dialogDiaExtra = false">Cancelar</v-btn>
          <v-btn color="orange" variant="flat" :loading="dxSubmitting" :disabled="!dxForm.tipoDiaExtra || dxForm.cantDias < 1" @click="guardarDiaExtra">
            Guardar Extensión
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar éxito -->
    <v-snackbar v-model="showSuccess" color="success" timeout="3000">
      ✅ {{ successMsg }}
    </v-snackbar>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { viaticosService } from '@/services/viaticosService'
import { useViaticoStore } from '@/stores/viaticoStore'
import { useCatalogosStore } from '@/stores/catalogosStore'
import type { CabeceraViaticoInterface } from '@/interfaces'

const router = useRouter()
const viaticoStore = useViaticoStore()
const catalogos = useCatalogosStore()
const viaticos = ref<CabeceraViaticoInterface[]>([])
const loading = ref(false)

const headers = [
  { title: '#', key: 'nroSolicitud', width: '80px' },
  { title: 'Solicitante', key: 'nombreSolicitante' },
  { title: 'Ruta', key: 'ruta', sortable: false, minWidth: '260px' },
  { title: 'Días', key: 'diasDeViaje', width: '80px' },
  { title: 'Escoltado', key: 'viajaEscoltado', width: '110px' },
  { title: 'Extensión', key: 'cantDiasExtra', width: '160px' },
  { title: 'Fecha', key: 'fechaSolicitud' },
  { title: 'Acciones', key: 'actions', sortable: false, width: '150px' },
]

/** Arma la ruta completa del viático: encadena todos los tramos.
 *  Si no hay tramos (viático legacy), usa lugarSalida → lugarDestino. */
function rutaCompleta(v: CabeceraViaticoInterface): string {
  const tramos = v.tramos ?? []
  if (tramos.length > 0) {
    const sorted = [...tramos].sort((a, b) => a.orden - b.orden)
    const puntos = [sorted[0].origen]
    for (const t of sorted) {
      if (t.destino && t.destino !== puntos[puntos.length - 1]) {
        puntos.push(t.destino)
      }
    }
    return puntos.filter(Boolean).join(' → ')
  }
  const salida = v.lugarSalida || ''
  const destino = v.lugarDestino || ''
  return salida && destino ? `${salida} → ${destino}` : (salida || destino || '—')
}

const showSuccess = ref(false)
const successMsg = ref('')

const cargarViaticos = async () => {
  loading.value = true
  try {
    viaticos.value = await viaticosService.getViaticos()
  } finally {
    loading.value = false
  }
}

onMounted(cargarViaticos)

// ── Editar Viático ──
const editarViatico = async (id: number) => {
  viaticoStore.reset()
  await viaticoStore.loadForEdit(id)
  router.push('/formulario-viatico/inicio-viatico')
}

// ── Día Extra ──
const dialogDiaExtra = ref(false)
const diaExtraTarget = ref<any>(null)
const dxSubmitting = ref(false)
const dxError = ref('')

const dxForm = ref({
  tipoDiaExtra: '',
  viaticoDiario: 0,
  cantDias: 1,
  cantChoferes: 0,
  cantEscoltas: 0,
  tipoCambio: 0,
  observaciones: '',
})

const dxTotalBs = computed(() => {
  const f = dxForm.value
  const totalUsd = f.viaticoDiario * f.cantDias
  const totalChoferes = totalUsd * f.tipoCambio * f.cantChoferes
  const totalEscoltas = totalUsd * f.tipoCambio * f.cantEscoltas
  return totalChoferes + totalEscoltas
})

const abrirDiaExtra = async (item: any) => {
  diaExtraTarget.value = item
  dxError.value = ''

  // Cargar datos del viático para obtener cant_choferes, cant_escolta, tipo_cambio
  try {
    const data = await viaticosService.getViatico(item.nroSolicitud)
    const pago = data.pagoViaticoGeneral
    dxForm.value = {
      tipoDiaExtra: '',
      viaticoDiario: 0,
      cantDias: 1,
      cantChoferes: pago?.cant_choferes || pago?.cantChoferes || 1,
      cantEscoltas: pago?.cant_escolta || pago?.cantEscoltas || 0,
      tipoCambio: pago?.tipo_cambio || pago?.tipoCambio || catalogos.dolar.dolarValue || 0,
      observaciones: '',
    }
  } catch {
    dxForm.value = {
      tipoDiaExtra: '',
      viaticoDiario: 0,
      cantDias: 1,
      cantChoferes: 1,
      cantEscoltas: 0,
      tipoCambio: catalogos.dolar.dolarValue || 0,
      observaciones: '',
    }
  }
  dialogDiaExtra.value = true
}

const onTipoDxChange = (tipo: string) => {
  const found = catalogos.diasExtras.find(d => d.diaExtraTipo === tipo)
  dxForm.value.viaticoDiario = found?.viaticoMonto ?? 0
}

const calcDx = () => { /* reactivo via computed */ }

const guardarDiaExtra = async () => {
  dxSubmitting.value = true
  dxError.value = ''
  const f = dxForm.value
  const totalUsd = f.viaticoDiario * f.cantDias

  try {
    await viaticosService.agregarDiaExtra(diaExtraTarget.value.nroSolicitud, {
      tipo_dia_extra: f.tipoDiaExtra,
      viatico_diario_extra: f.viaticoDiario,
      cant_dias_extra: f.cantDias,
      tot_viatico: totalUsd,
      cant_choferes: f.cantChoferes,
      cant_escolta: f.cantEscoltas,
      tipo_cambio: f.tipoCambio,
      tot_viatico_bolivares: totalUsd * f.tipoCambio,
      tot_viatico_choferes_boli: totalUsd * f.tipoCambio * f.cantChoferes,
      tot_escolta_choferes_boli: totalUsd * f.tipoCambio * f.cantEscoltas,
      tot_pago_bolivares: dxTotalBs.value,
      observaciones: f.observaciones.trim(),
    })
    dialogDiaExtra.value = false
    successMsg.value = `Extensión de viáticos agregada al viático #${diaExtraTarget.value.nroSolicitud}`
    showSuccess.value = true
    await cargarViaticos() // refrescar tabla
  } catch (e: any) {
    dxError.value = e.response?.data?.error || e.message || 'Error al agregar extensión de viáticos'
  } finally {
    dxSubmitting.value = false
  }
}

const descargarPdf = (id: number) => viaticosService.getPdf(id)
</script>
