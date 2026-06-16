<template>
  <div>
    <v-row align="center" class="mb-4">
      <v-col>
        <h2 class="text-h5">Solicitudes de Compra</h2>
        <p class="text-body-2 text-grey">
          Bitácora de los envíos al sistema central de Compras de Damasco.
          Cada viático, escolta o reparación genera una solicitud aquí.
        </p>
      </v-col>
      <v-col cols="auto">
        <v-btn variant="text" prepend-icon="mdi-refresh" @click="cargar">
          Refrescar
        </v-btn>
      </v-col>
    </v-row>

    <!-- ── Filtros ── -->
    <v-card class="mb-3 pa-3">
      <v-row dense>
        <v-col cols="12" md="3">
          <v-select
            v-model="filtroTipo"
            :items="tipoOpciones"
            label="Tipo"
            density="compact"
            clearable
            hide-details
            @update:model-value="cargar"
          />
        </v-col>
        <v-col cols="12" md="3">
          <v-select
            v-model="filtroEstado"
            :items="estadoOpciones"
            label="Estado"
            density="compact"
            clearable
            hide-details
            @update:model-value="cargar"
          />
        </v-col>
        <v-col cols="12" md="4">
          <v-text-field
            v-model="busqueda"
            label="Buscar (origen, descripción, usuario)"
            density="compact"
            hide-details
            prepend-inner-icon="mdi-magnify"
            clearable
          />
        </v-col>
      </v-row>
    </v-card>

    <!-- ── Tabla ── -->
    <v-card>
      <v-data-table
        :headers="headers"
        :items="filtradas"
        :loading="loading"
        hover
        density="comfortable"
      >
        <template #item.tipo="{ item }">
          <v-chip :color="colorTipo(item.tipo)" size="small" variant="tonal">
            {{ labelTipo(item.tipo) }}
          </v-chip>
        </template>

        <template #item.origenRef="{ item }">
          <span class="font-weight-medium">{{ item.origenRef || `#${item.origenId}` }}</span>
        </template>

        <template #item.montoTotal="{ item }">
          {{ formatoMoneda(item.montoTotal, item.moneda) }}
        </template>

        <template #item.nroSolicitudCompra="{ item }">
          <span v-if="item.nroSolicitudCompra" class="text-success font-weight-bold">
            #{{ item.nroSolicitudCompra }}
          </span>
          <span v-else class="text-grey">—</span>
        </template>

        <template #item.estado="{ item }">
          <v-chip :color="colorEstado(item.estado)" size="small" variant="tonal">
            <v-icon start :icon="iconoEstado(item.estado)" size="small" />
            {{ labelEstado(item.estado) }}
          </v-chip>
        </template>

        <template #item.fechaEnvio="{ item }">
          {{ formatoFecha(item.fechaEnvio) }}
        </template>

        <template #item.actions="{ item }">
          <div class="d-flex ga-1">
            <v-btn icon="mdi-eye" variant="text" size="small" color="primary"
              @click="verDetalle(item)" title="Ver detalle" />
            <v-btn
              v-if="item.estado === 'error'"
              icon="mdi-refresh" variant="text" size="small" color="warning"
              :loading="reintentandoId === item.id"
              @click="reintentar(item)" title="Reintentar envío" />
          </div>
        </template>

        <template #no-data>
          <div class="text-center text-grey py-6">
            No se han enviado solicitudes todavía.
          </div>
        </template>
      </v-data-table>
    </v-card>

    <!-- ── Dialog de detalle ── -->
    <v-dialog v-model="detalleAbierto" max-width="900">
      <v-card v-if="seleccionada">
        <v-card-title class="d-flex align-center">
          <v-chip :color="colorTipo(seleccionada.tipo)" size="small" variant="tonal" class="mr-2">
            {{ labelTipo(seleccionada.tipo) }}
          </v-chip>
          {{ seleccionada.origenRef || `#${seleccionada.origenId}` }}
          <v-spacer />
          <v-chip :color="colorEstado(seleccionada.estado)" size="small" variant="tonal">
            {{ labelEstado(seleccionada.estado) }}
          </v-chip>
        </v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12" md="6">
              <p class="text-caption text-grey">Descripción</p>
              <p>{{ seleccionada.descripcion }}</p>
            </v-col>
            <v-col cols="12" md="3">
              <p class="text-caption text-grey">Monto</p>
              <p>{{ formatoMoneda(seleccionada.montoTotal, seleccionada.moneda) }}</p>
            </v-col>
            <v-col cols="12" md="3">
              <p class="text-caption text-grey">Nro Compra (central)</p>
              <p>
                <span v-if="seleccionada.nroSolicitudCompra" class="text-success font-weight-bold">
                  #{{ seleccionada.nroSolicitudCompra }}
                </span>
                <span v-else class="text-grey">—</span>
              </p>
            </v-col>
            <v-col cols="12" md="6" v-if="seleccionada.loteOrigen">
              <p class="text-caption text-grey">Lote origen</p>
              <p>{{ seleccionada.loteOrigen }}</p>
            </v-col>
            <v-col cols="12" md="6">
              <p class="text-caption text-grey">Usuario</p>
              <p>{{ seleccionada.usuarioNombre || '—' }}</p>
            </v-col>
            <v-col cols="12" md="6">
              <p class="text-caption text-grey">Fecha de envío</p>
              <p>{{ formatoFecha(seleccionada.fechaEnvio) }}</p>
            </v-col>
            <v-col cols="12" md="6">
              <p class="text-caption text-grey">Última actualización</p>
              <p>{{ formatoFecha(seleccionada.fechaActualizacion) }}</p>
            </v-col>
          </v-row>

          <v-alert v-if="seleccionada.error" type="error" variant="tonal" class="mt-3">
            <p class="font-weight-medium">Error del envío:</p>
            <pre class="text-caption mt-1">{{ seleccionada.error }}</pre>
          </v-alert>

          <v-expansion-panels class="mt-3">
            <v-expansion-panel title="Payload enviado">
              <template #text>
                <pre class="text-caption">{{ formatoJson(seleccionada.payloadEnviado) }}</pre>
              </template>
            </v-expansion-panel>
            <v-expansion-panel title="Respuesta del central">
              <template #text>
                <pre class="text-caption">{{ formatoJson(seleccionada.respuestaRaw) }}</pre>
              </template>
            </v-expansion-panel>
          </v-expansion-panels>
        </v-card-text>
        <v-card-actions>
          <v-btn
            v-if="seleccionada.estado === 'error'"
            color="warning" variant="flat" prepend-icon="mdi-refresh"
            :loading="reintentandoId === seleccionada.id"
            @click="reintentar(seleccionada)"
          >
            Reintentar envío
          </v-btn>
          <v-spacer />
          <v-btn variant="text" @click="detalleAbierto = false">Cerrar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3500">
      {{ snackbar.message }}
    </v-snackbar>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { comprasService } from '@/services/comprasService'
import type { SolicitudCompraEnviada } from '@/interfaces'

const items = ref<SolicitudCompraEnviada[]>([])
const loading = ref(false)

const filtroTipo = ref<string | null>(null)
const filtroEstado = ref<string | null>(null)
const busqueda = ref('')

const detalleAbierto = ref(false)
const seleccionada = ref<SolicitudCompraEnviada | null>(null)
const reintentandoId = ref<number | null>(null)

const snackbar = ref({ show: false, color: 'success', message: '' })

const tipoOpciones = [
  { title: 'Viático', value: 'viatico' },
  { title: 'Día Extra', value: 'dia_extra' },
  { title: 'Escolta', value: 'escolta' },
  { title: 'Reparación', value: 'reparacion' },
]

const estadoOpciones = [
  { title: 'Enviado', value: 'enviado' },
  { title: 'Error', value: 'error' },
]

const headers = [
  { title: 'Tipo', key: 'tipo', sortable: true },
  { title: 'Origen', key: 'origenRef', sortable: true },
  { title: 'Descripción', key: 'descripcion' },
  { title: 'Moneda', key: 'moneda', sortable: true },
  { title: 'Monto', key: 'montoTotal', align: 'end' as const, sortable: true },
  { title: 'Nro Compra', key: 'nroSolicitudCompra', sortable: true },
  { title: 'Estado', key: 'estado', sortable: true },
  { title: 'Usuario', key: 'usuarioNombre' },
  { title: 'Fecha', key: 'fechaEnvio', sortable: true },
  { title: 'Acciones', key: 'actions', sortable: false, align: 'center' as const },
]

const filtradas = computed(() => {
  const q = busqueda.value.trim().toLowerCase()
  if (!q) return items.value
  return items.value.filter(s =>
    (s.origenRef || '').toLowerCase().includes(q) ||
    (s.descripcion || '').toLowerCase().includes(q) ||
    (s.usuarioNombre || '').toLowerCase().includes(q) ||
    String(s.nroSolicitudCompra || '').includes(q),
  )
})

async function cargar() {
  loading.value = true
  try {
    items.value = await comprasService.list({
      tipo: filtroTipo.value || undefined,
      estado: filtroEstado.value || undefined,
    })
  } catch (e: any) {
    snackbar.value = {
      show: true, color: 'error',
      message: e?.response?.data?.detail || e.message || 'Error al cargar',
    }
  } finally {
    loading.value = false
  }
}

function verDetalle(item: SolicitudCompraEnviada) {
  seleccionada.value = item
  detalleAbierto.value = true
}

async function reintentar(item: SolicitudCompraEnviada) {
  reintentandoId.value = item.id
  try {
    const actualizada = await comprasService.retry(item.id)
    const idx = items.value.findIndex(x => x.id === item.id)
    if (idx >= 0) items.value[idx] = actualizada
    if (seleccionada.value?.id === item.id) seleccionada.value = actualizada
    snackbar.value = {
      show: true,
      color: actualizada.estado === 'enviado' ? 'success' : 'error',
      message: actualizada.estado === 'enviado'
        ? `Reenviado exitosamente (Compra #${actualizada.nroSolicitudCompra})`
        : `Falló el reintento: ${actualizada.error}`,
    }
  } catch (e: any) {
    snackbar.value = {
      show: true, color: 'error',
      message: e?.message || 'Error al reintentar',
    }
  } finally {
    reintentandoId.value = null
  }
}

// ── Helpers visuales ──
const labelTipo = (t: string) => ({
  viatico: 'Viático', dia_extra: 'Día Extra', escolta: 'Escolta', reparacion: 'Reparación',
} as Record<string, string>)[t] || t

const colorTipo = (t: string) => ({
  viatico: 'primary', dia_extra: 'teal', escolta: 'purple', reparacion: 'orange',
} as Record<string, string>)[t] || 'grey'

const labelEstado = (e: string) => ({
  enviado: 'Enviado', error: 'Error',
} as Record<string, string>)[e] || e

const colorEstado = (e: string) => ({
  enviado: 'success', error: 'error',
} as Record<string, string>)[e] || 'grey'

const iconoEstado = (e: string) => ({
  enviado: 'mdi-check-circle', error: 'mdi-alert-circle',
} as Record<string, string>)[e] || 'mdi-help-circle'

function formatoMoneda(monto: number | string, moneda: string) {
  const n = typeof monto === 'string' ? parseFloat(monto) : monto
  const valor = n.toLocaleString('es-VE', {
    minimumFractionDigits: 2, maximumFractionDigits: 2,
  })
  return `${valor} ${moneda}`
}

function formatoFecha(s?: string) {
  if (!s) return '—'
  const d = new Date(s)
  if (isNaN(d.getTime())) return s
  return d.toLocaleString('es-VE', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit',
  })
}

function formatoJson(raw?: string) {
  if (!raw) return ''
  try {
    return JSON.stringify(JSON.parse(raw), null, 2)
  } catch {
    return raw
  }
}

onMounted(cargar)
</script>
