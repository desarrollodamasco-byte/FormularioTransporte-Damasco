<template>
  <div>
    <v-row align="center" class="mb-4">
      <v-col>
        <h2 class="text-h5">Órdenes a Proveedores</h2>
        <p class="text-body-2 text-grey">Solicitudes de gandolas enviadas a proveedores externos</p>
      </v-col>
      <v-col cols="auto">
        <v-btn color="primary" prepend-icon="mdi-plus" @click="$router.push('/ordenes/nueva')">
          Nueva Orden
        </v-btn>
      </v-col>
    </v-row>

    <v-card class="mb-3 pa-3">
      <v-row dense>
        <v-col cols="12" md="3">
          <v-select
            v-model="filtroEstatus"
            :items="estatusOpciones"
            label="Estatus"
            density="compact"
            clearable
            hide-details
            @update:model-value="cargar"
          />
        </v-col>
        <v-col cols="12" md="4">
          <v-text-field
            v-model="busqueda"
            label="Buscar (referencia, proveedor, lugar)"
            density="compact"
            hide-details
            prepend-inner-icon="mdi-magnify"
            clearable
          />
        </v-col>
      </v-row>
    </v-card>

    <v-card>
      <v-data-table
        :headers="headers"
        :items="ordenesFiltradas"
        :loading="loading"
        hover
      >
        <template #item.estatus="{ item }">
          <v-chip :color="colorEstatus(item.estatus)" size="small" variant="tonal">
            {{ labelEstatus(item.estatus) }}
          </v-chip>
        </template>

        <template #item.gandolas="{ item }">
          <span :class="(item.gandolasRegistradas ?? 0) >= item.cantidadGandolas ? 'text-success font-weight-bold' : ''">
            {{ item.gandolasRegistradas ?? 0 }} / {{ item.cantidadGandolas }}
          </span>
        </template>

        <template #item.ruta="{ item }">
          {{ item.lugarSalida }} → {{ item.lugarDestino }}
        </template>

        <template #item.actions="{ item }">
          <div class="d-flex ga-1">
            <v-btn icon="mdi-eye" variant="text" size="small" color="primary"
              @click="$router.push(`/ordenes/${item.id}`)" title="Ver detalle" />
            <v-btn icon="mdi-content-copy" variant="text" size="small"
              @click="copiarLink(item)" title="Copiar link público" />
            <v-btn
              v-if="item.estatus === 'pendiente' || item.estatus === 'en_progreso'"
              icon="mdi-close-circle" variant="text" size="small" color="error"
              @click="confirmarCancelar(item)" title="Cancelar orden" />
          </div>
        </template>
      </v-data-table>
    </v-card>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3000">
      {{ snackbar.message }}
    </v-snackbar>

    <v-dialog v-model="dialogCancelar" max-width="420">
      <v-card>
        <v-card-title>Cancelar orden</v-card-title>
        <v-card-text>
          ¿Seguro que quieres cancelar la orden <b>{{ ordenACancelar?.referencia }}</b>?
          Esta acción no se puede deshacer.
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="dialogCancelar = false">Volver</v-btn>
          <v-btn color="error" variant="flat" :loading="cancelando" @click="cancelarOrden">
            Sí, cancelar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { ordenesService } from '@/services/ordenesService'
import type { OrdenProveedor, OrdenEstatus } from '@/interfaces'

const ordenes = ref<OrdenProveedor[]>([])
const loading = ref(false)
const filtroEstatus = ref<string | null>(null)
const busqueda = ref('')
const cancelando = ref(false)
const dialogCancelar = ref(false)
const ordenACancelar = ref<OrdenProveedor | null>(null)

const snackbar = ref({ show: false, message: '', color: 'success' })

const estatusOpciones = [
  { title: 'Pendiente', value: 'pendiente' },
  { title: 'En progreso', value: 'en_progreso' },
  { title: 'Culminada', value: 'culminada' },
  { title: 'Cancelada', value: 'cancelada' },
]

const headers = [
  { title: 'Ref', key: 'referencia', width: '110px' },
  { title: 'Fecha viaje', key: 'fechaViaje', width: '120px' },
  { title: 'Proveedor', key: 'proveedorRazonSocial' },
  { title: 'Ruta', key: 'ruta', sortable: false, minWidth: '220px' },
  { title: 'Gandolas', key: 'gandolas', sortable: false, width: '100px' },
  { title: 'Estatus', key: 'estatus', width: '130px' },
  { title: 'Solicitante', key: 'nombreSolicitante' },
  { title: '', key: 'actions', sortable: false, width: '140px' },
]

const ordenesFiltradas = computed(() => {
  const q = busqueda.value.trim().toLowerCase()
  if (!q) return ordenes.value
  return ordenes.value.filter(o =>
    (o.referencia || '').toLowerCase().includes(q)
    || (o.proveedorRazonSocial || '').toLowerCase().includes(q)
    || (o.lugarSalida || '').toLowerCase().includes(q)
    || (o.lugarDestino || '').toLowerCase().includes(q)
    || (o.nombreSolicitante || '').toLowerCase().includes(q),
  )
})

const cargar = async () => {
  loading.value = true
  try {
    const params: any = {}
    if (filtroEstatus.value) params.estatus = filtroEstatus.value
    ordenes.value = await ordenesService.list(params)
  } finally {
    loading.value = false
  }
}

const labelEstatus = (e: OrdenEstatus) => ({
  pendiente: 'Pendiente',
  en_progreso: 'En progreso',
  culminada: 'Culminada',
  cancelada: 'Cancelada',
}[e] || e)

const colorEstatus = (e: OrdenEstatus) => ({
  pendiente: 'grey',
  en_progreso: 'orange',
  culminada: 'success',
  cancelada: 'error',
}[e] || 'default')

async function copiarLink(item: OrdenProveedor) {
  const url = ordenesService.publicUrl(item.token)
  try {
    await navigator.clipboard.writeText(url)
    snackbar.value = { show: true, message: `Link copiado: ${url}`, color: 'success' }
  } catch {
    snackbar.value = { show: true, message: url, color: 'info' }
  }
}

function confirmarCancelar(item: OrdenProveedor) {
  ordenACancelar.value = item
  dialogCancelar.value = true
}

async function cancelarOrden() {
  if (!ordenACancelar.value) return
  cancelando.value = true
  try {
    await ordenesService.cancelar(ordenACancelar.value.id)
    snackbar.value = { show: true, message: 'Orden cancelada', color: 'success' }
    dialogCancelar.value = false
    await cargar()
  } catch (e: any) {
    snackbar.value = {
      show: true,
      message: e?.response?.data?.error || 'Error al cancelar',
      color: 'error',
    }
  } finally {
    cancelando.value = false
  }
}

onMounted(cargar)
</script>
