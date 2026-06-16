<template>
  <div>
    <v-row align="center" class="mb-4">
      <v-col cols="auto">
        <v-btn icon="mdi-arrow-left" variant="text" @click="$router.push('/ordenes')" />
      </v-col>
      <v-col>
        <h2 class="text-h5">
          {{ orden ? orden.referencia : 'Cargando…' }}
        </h2>
        <p v-if="orden" class="text-body-2 text-grey">
          Creada el {{ formatDate(orden.fechaSolicitud) }} por {{ orden.nombreSolicitante }}
        </p>
      </v-col>
      <v-col cols="auto" v-if="orden">
        <v-chip :color="colorEstatus(orden.estatus)" size="large" variant="tonal" class="font-weight-bold">
          {{ labelEstatus(orden.estatus) }}
        </v-chip>
      </v-col>
    </v-row>

    <v-progress-linear v-if="loading" indeterminate color="primary" />

    <div v-if="orden">
      <!-- Tarjeta principal -->
      <v-card class="pa-6 mb-4">
        <v-row>
          <v-col cols="12" md="6">
            <h3 class="text-subtitle-1 font-weight-bold mb-2">Proveedor</h3>
            <p class="mb-1">
              <v-icon size="small" class="mr-1">mdi-domain</v-icon>
              {{ orden.proveedorRazonSocial }}
            </p>
            <p class="text-body-2 text-grey">RIF/Cédula: {{ orden.proveedorCedulaRif }}</p>
          </v-col>

          <v-col cols="12" md="6">
            <h3 class="text-subtitle-1 font-weight-bold mb-2">Viaje</h3>
            <p class="mb-1">
              <v-icon size="small" class="mr-1">mdi-calendar</v-icon>
              Fecha de viaje: <b>{{ orden.fechaViaje }}</b>
            </p>
            <p class="mb-1">
              <v-icon size="small" class="mr-1">mdi-map-marker-path</v-icon>
              {{ orden.lugarSalida }} → {{ orden.lugarDestino }}
            </p>
            <p>
              <v-icon size="small" class="mr-1">mdi-truck</v-icon>
              {{ orden.cantidadGandolas }} gandola{{ orden.cantidadGandolas === 1 ? '' : 's' }} solicitada{{ orden.cantidadGandolas === 1 ? '' : 's' }}
            </p>
          </v-col>

          <v-col cols="12" v-if="orden.observaciones">
            <v-divider class="my-3" />
            <h3 class="text-subtitle-1 font-weight-bold mb-1">Observaciones</h3>
            <p>{{ orden.observaciones }}</p>
          </v-col>
        </v-row>
      </v-card>

      <!-- Link al proveedor -->
      <v-card class="pa-6 mb-4">
        <h3 class="text-subtitle-1 font-weight-bold mb-2">
          <v-icon size="small" class="mr-1">mdi-link</v-icon> Link para el proveedor
        </h3>
        <v-text-field
          :model-value="linkPublico"
          readonly
          variant="filled"
          density="compact"
          append-inner-icon="mdi-content-copy"
          @click:append-inner="copiarLink"
        />
        <p class="text-caption text-grey mt-1">
          Cópialo y envíalo por WhatsApp / Email al proveedor.
        </p>
      </v-card>

      <!-- Progreso del proveedor -->
      <v-card class="pa-6 mb-4">
        <div class="d-flex align-center mb-3">
          <h3 class="text-subtitle-1 font-weight-bold">
            Gandolas registradas por el proveedor
          </h3>
          <v-chip class="ml-2" size="small" :color="(orden.gandolas?.length ?? 0) >= orden.cantidadGandolas ? 'success' : 'orange'" variant="tonal">
            {{ orden.gandolas?.length ?? 0 }} / {{ orden.cantidadGandolas }}
          </v-chip>
        </div>

        <v-table v-if="orden.gandolas?.length" density="compact">
          <thead>
            <tr>
              <th>#</th>
              <th>Placa Gandola</th>
              <th>Placa Remolque</th>
              <th>Marca/Modelo</th>
              <th>Chofer</th>
              <th>Cédula</th>
              <th>Teléfono</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(g, i) in orden.gandolas" :key="g.id ?? i">
              <td>{{ i + 1 }}</td>
              <td>{{ g.placaVehiculo }}</td>
              <td>{{ g.placaRemolque || '—' }}</td>
              <td>{{ [g.marca, g.modelo].filter(Boolean).join(' ') || '—' }}</td>
              <td>{{ g.nombreChofer }}</td>
              <td>{{ g.cedulaChofer }}</td>
              <td>{{ g.telefonoChofer || '—' }}</td>
            </tr>
          </tbody>
        </v-table>

        <v-alert v-else type="info" variant="tonal" density="compact">
          El proveedor aún no ha registrado ninguna gandola.
        </v-alert>
      </v-card>

      <!-- Culminación -->
      <v-card v-if="orden.estatus === 'culminada'" class="pa-6 mb-4">
        <h3 class="text-subtitle-1 font-weight-bold mb-2">
          <v-icon size="small" color="success" class="mr-1">mdi-check-circle</v-icon>
          Orden culminada
        </h3>
        <p class="mb-1">Fecha de culminación: <b>{{ formatDate(orden.fechaCulminacion!) }}</b></p>
        <p v-if="orden.notasProveedor"><b>Notas del proveedor:</b> {{ orden.notasProveedor }}</p>
      </v-card>

      <!-- Acciones -->
      <v-card class="pa-4 mb-6">
        <v-row align="center">
          <v-col>
            <v-btn
              v-if="orden.estatus === 'culminada'"
              color="warning" variant="tonal"
              prepend-icon="mdi-lock-open-variant" :loading="reabriendo"
              @click="reabrir"
            >
              Reabrir para corrección
            </v-btn>
          </v-col>
          <v-col cols="auto">
            <v-btn
              v-if="['pendiente', 'en_progreso'].includes(orden.estatus)"
              color="error" variant="outlined"
              prepend-icon="mdi-close-circle" :loading="cancelando"
              @click="cancelar"
            >
              Cancelar orden
            </v-btn>
          </v-col>
        </v-row>
      </v-card>
    </div>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3000">
      {{ snackbar.message }}
    </v-snackbar>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ordenesService } from '@/services/ordenesService'
import type { OrdenProveedor, OrdenEstatus } from '@/interfaces'

const route = useRoute()
const router = useRouter()
const orden = ref<OrdenProveedor | null>(null)
const loading = ref(false)
const reabriendo = ref(false)
const cancelando = ref(false)
const snackbar = ref({ show: false, message: '', color: 'success' })

const linkPublico = computed(() =>
  orden.value ? ordenesService.publicUrl(orden.value.token) : ''
)

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

function formatDate(iso: string) {
  if (!iso) return '—'
  const d = new Date(iso)
  return isNaN(d.getTime()) ? iso : d.toLocaleString()
}

async function cargar() {
  loading.value = true
  try {
    const id = Number(route.params.id)
    orden.value = await ordenesService.get(id)
  } catch (e: any) {
    snackbar.value = { show: true, message: 'No se pudo cargar la orden', color: 'error' }
    setTimeout(() => router.push('/ordenes'), 1500)
  } finally {
    loading.value = false
  }
}

async function copiarLink() {
  try {
    await navigator.clipboard.writeText(linkPublico.value)
    snackbar.value = { show: true, message: 'Link copiado', color: 'success' }
  } catch {
    snackbar.value = { show: true, message: linkPublico.value, color: 'info' }
  }
}

async function cancelar() {
  if (!orden.value) return
  if (!confirm('¿Cancelar esta orden?')) return
  cancelando.value = true
  try {
    orden.value = await ordenesService.cancelar(orden.value.id)
    snackbar.value = { show: true, message: 'Orden cancelada', color: 'success' }
  } catch (e: any) {
    snackbar.value = { show: true, message: e?.response?.data?.error || 'Error', color: 'error' }
  } finally {
    cancelando.value = false
  }
}

async function reabrir() {
  if (!orden.value) return
  reabriendo.value = true
  try {
    orden.value = await ordenesService.reabrir(orden.value.id)
    snackbar.value = { show: true, message: 'Orden reabierta. El proveedor puede corregir.', color: 'success' }
  } catch (e: any) {
    snackbar.value = { show: true, message: e?.response?.data?.error || 'Error', color: 'error' }
  } finally {
    reabriendo.value = false
  }
}

onMounted(cargar)
</script>
