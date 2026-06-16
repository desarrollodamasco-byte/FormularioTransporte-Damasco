<template>
  <div class="publica-wrapper">
    <!-- Top bar mínimo -->
    <div class="publica-topbar">
      <div class="d-flex align-center justify-space-between">
        <div class="d-flex align-center">
          <v-icon size="32" color="white" class="mr-2">mdi-truck-fast</v-icon>
          <h1 class="text-h6 text-white font-weight-medium">Damasco — Registro de Orden</h1>
        </div>
      </div>
    </div>

    <v-container class="py-6" max-width="1100">
      <!-- Loading -->
      <v-card v-if="loading" class="pa-8 text-center">
        <v-progress-circular indeterminate color="primary" size="50" />
        <p class="mt-4 text-grey">Cargando orden…</p>
      </v-card>

      <!-- Error -->
      <v-card v-else-if="error" class="pa-6">
        <v-alert type="error" variant="tonal">
          <v-alert-title>Link inválido</v-alert-title>
          {{ error }}
        </v-alert>
      </v-card>

      <!-- Contenido -->
      <template v-else-if="orden">
        <!-- Resumen de la orden -->
        <v-card class="pa-6 mb-4">
          <div class="d-flex align-center mb-3 flex-wrap">
            <h2 class="text-h5 mr-3">{{ orden.referencia }}</h2>
            <v-chip :color="colorEstatus(orden.estatus)" size="small" variant="tonal" class="font-weight-bold">
              {{ labelEstatus(orden.estatus) }}
            </v-chip>
          </div>

          <v-row dense class="mt-2">
            <v-col cols="12" md="6">
              <p class="mb-1"><b>Solicitante:</b> {{ orden.nombreSolicitante }}</p>
              <p class="mb-1"><b>Proveedor:</b> {{ orden.proveedorRazonSocial }}</p>
            </v-col>
            <v-col cols="12" md="6">
              <p class="mb-1"><b>Fecha del viaje:</b> {{ orden.fechaViaje }}</p>
              <p class="mb-1"><b>Ruta:</b> {{ orden.lugarSalida }} → {{ orden.lugarDestino }}</p>
              <p class="mb-1"><b>Gandolas solicitadas:</b> {{ orden.cantidadGandolas }}</p>
            </v-col>
            <v-col cols="12" v-if="orden.observaciones">
              <v-divider class="my-2" />
              <p><b>Observaciones:</b> {{ orden.observaciones }}</p>
            </v-col>
          </v-row>
        </v-card>

        <!-- Estado culminada / cancelada -->
        <v-alert
          v-if="orden.estatus === 'culminada'"
          type="success" variant="tonal" class="mb-4" prominent
        >
          <v-alert-title>Orden culminada</v-alert-title>
          Esta orden ya fue cerrada el {{ formatDate(orden.fechaCulminacion!) }}.
          Si necesitas corregir algo, contacta al solicitante para que la reabra.
        </v-alert>

        <v-alert
          v-else-if="orden.estatus === 'cancelada'"
          type="error" variant="tonal" class="mb-4" prominent
        >
          <v-alert-title>Orden cancelada</v-alert-title>
          Esta orden ya no está activa.
        </v-alert>

        <!-- Formulario de gandolas (editable solo si pendiente/en_progreso) -->
        <v-card v-if="editable" class="pa-6 mb-4">
          <div class="d-flex align-center mb-3">
            <h3 class="text-h6">Gandolas a registrar</h3>
            <v-chip class="ml-2" size="small" :color="gandolasFormulario.length === orden.cantidadGandolas ? 'success' : 'orange'" variant="tonal">
              {{ gandolasFormulario.length }} / {{ orden.cantidadGandolas }}
            </v-chip>
          </div>

          <v-alert v-if="gandolasFormulario.length === 0" type="info" variant="tonal" density="compact" class="mb-3">
            Agrega cada gandola que asignarás a este viaje.
          </v-alert>

          <div
            v-for="(g, idx) in gandolasFormulario" :key="idx"
            class="gandola-card mb-3"
          >
            <div class="d-flex align-center mb-2">
              <v-chip size="small" color="primary" variant="flat">Gandola {{ idx + 1 }}</v-chip>
              <v-spacer />
              <v-btn
                icon="mdi-close" size="x-small" variant="text" color="error"
                @click="quitarGandola(idx)"
              />
            </div>
            <v-row dense>
              <v-col cols="12" md="4">
                <v-text-field
                  v-model="g.placaVehiculo" label="Placa de la gandola"
                  density="compact"
                  :rules="[v => !!v || 'Requerido']"
                />
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field
                  v-model="g.placaRemolque" label="Placa del remolque (opcional)"
                  density="compact"
                />
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field v-model="g.tipoVehiculo" label="Tipo" density="compact" />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field v-model="g.marca" label="Marca" density="compact" />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field v-model="g.modelo" label="Modelo" density="compact" />
              </v-col>
              <v-col cols="12" md="5">
                <v-text-field
                  v-model="g.nombreChofer" label="Nombre del chofer"
                  density="compact"
                  :rules="[v => !!v || 'Requerido']"
                />
              </v-col>
              <v-col cols="12" md="3">
                <v-text-field
                  v-model="g.cedulaChofer" label="Cédula"
                  density="compact"
                  :rules="[v => !!v || 'Requerido']"
                />
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field v-model="g.telefonoChofer" label="Teléfono" density="compact" />
              </v-col>
              <v-col cols="12">
                <v-text-field v-model="g.observaciones" label="Observaciones" density="compact" />
              </v-col>
            </v-row>
          </div>

          <v-btn
            variant="tonal" color="primary" prepend-icon="mdi-plus"
            :disabled="gandolasFormulario.length >= orden.cantidadGandolas"
            @click="agregarGandola"
          >
            Agregar gandola
          </v-btn>

          <v-alert v-if="mensajeGuardado" type="success" variant="tonal" density="compact" class="mt-3">
            {{ mensajeGuardado }}
          </v-alert>
          <v-alert v-if="errorGuardar" type="error" variant="tonal" density="compact" class="mt-3">
            {{ errorGuardar }}
          </v-alert>

          <v-row class="mt-4">
            <v-col cols="auto">
              <v-btn
                color="primary" variant="outlined"
                prepend-icon="mdi-content-save" :loading="guardando"
                :disabled="gandolasFormulario.length === 0"
                @click="guardarBorrador"
              >
                Guardar avance
              </v-btn>
            </v-col>
            <v-spacer />
            <v-col cols="auto">
              <v-btn
                color="success" variant="flat"
                prepend-icon="mdi-check-circle"
                :loading="culminando"
                :disabled="gandolasFormulario.length === 0"
                @click="dialogCulminar = true"
              >
                Culminar y enviar
              </v-btn>
            </v-col>
          </v-row>
        </v-card>

        <!-- Vista de solo lectura cuando culminada/cancelada -->
        <v-card v-else-if="orden.gandolas?.length" class="pa-6 mb-4">
          <h3 class="text-h6 mb-2">Gandolas registradas</h3>
          <v-table density="compact">
            <thead>
              <tr>
                <th>#</th>
                <th>Placa</th>
                <th>Remolque</th>
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
                <td>{{ g.nombreChofer }}</td>
                <td>{{ g.cedulaChofer }}</td>
                <td>{{ g.telefonoChofer || '—' }}</td>
              </tr>
            </tbody>
          </v-table>
        </v-card>
      </template>
    </v-container>

    <!-- Diálogo: culminar -->
    <v-dialog v-model="dialogCulminar" max-width="520">
      <v-card>
        <v-card-title>Culminar orden</v-card-title>
        <v-card-text>
          <p class="mb-3">
            Vas a culminar la orden con <b>{{ gandolasFormulario.length }}</b> gandola(s) registradas.
            Después de culminar no podrás editar (solo el solicitante podrá reabrir).
          </p>
          <v-textarea
            v-model="notasFinal"
            label="Notas para el solicitante (opcional)"
            rows="2"
            placeholder="Ej: Salimos a primera hora, todo en orden."
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="dialogCulminar = false">Cancelar</v-btn>
          <v-btn color="success" variant="flat" :loading="culminando" @click="culminar">
            Culminar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { ordenesService } from '@/services/ordenesService'
import type { OrdenProveedorPublic, OrdenGandola, OrdenEstatus } from '@/interfaces'

const route = useRoute()
const orden = ref<OrdenProveedorPublic | null>(null)
const loading = ref(false)
const error = ref('')

const gandolasFormulario = ref<OrdenGandola[]>([])
const guardando = ref(false)
const culminando = ref(false)
const mensajeGuardado = ref('')
const errorGuardar = ref('')

const dialogCulminar = ref(false)
const notasFinal = ref('')

const editable = computed(() =>
  orden.value
  && (orden.value.estatus === 'pendiente' || orden.value.estatus === 'en_progreso')
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

function nuevaGandolaVacia(): OrdenGandola {
  return {
    placaVehiculo: '',
    marca: '',
    modelo: '',
    tipoVehiculo: '',
    placaRemolque: '',
    nombreChofer: '',
    cedulaChofer: '',
    telefonoChofer: '',
    observaciones: '',
  }
}

function agregarGandola() {
  gandolasFormulario.value.push(nuevaGandolaVacia())
}

function quitarGandola(idx: number) {
  gandolasFormulario.value.splice(idx, 1)
}

async function cargar() {
  loading.value = true
  error.value = ''
  try {
    const token = route.params.token as string
    orden.value = await ordenesService.publica.get(token)
    // Pre-llenar formulario con lo ya guardado (o N filas vacías hasta cumplir el mínimo)
    if (orden.value.gandolas?.length) {
      gandolasFormulario.value = orden.value.gandolas.map(g => ({ ...g }))
    } else {
      gandolasFormulario.value = []
    }
  } catch (e: any) {
    error.value = e?.response?.data?.error || 'No se pudo cargar la orden.'
  } finally {
    loading.value = false
  }
}

async function guardarBorrador() {
  errorGuardar.value = ''
  mensajeGuardado.value = ''
  guardando.value = true
  try {
    const token = route.params.token as string
    orden.value = await ordenesService.publica.setGandolas(token, gandolasFormulario.value)
    mensajeGuardado.value = 'Avance guardado correctamente'
    setTimeout(() => (mensajeGuardado.value = ''), 3000)
  } catch (e: any) {
    errorGuardar.value = e?.response?.data?.error
      || (e?.response?.data ? JSON.stringify(e.response.data) : null)
      || 'Error al guardar'
  } finally {
    guardando.value = false
  }
}

async function culminar() {
  errorGuardar.value = ''
  culminando.value = true
  try {
    const token = route.params.token as string
    // Primero asegurar que se guarden las gandolas
    await ordenesService.publica.setGandolas(token, gandolasFormulario.value)
    // Luego culminar
    orden.value = await ordenesService.publica.culminar(token, notasFinal.value)
    dialogCulminar.value = false
  } catch (e: any) {
    errorGuardar.value = e?.response?.data?.error
      || (e?.response?.data ? JSON.stringify(e.response.data) : null)
      || 'Error al culminar la orden'
    dialogCulminar.value = false
  } finally {
    culminando.value = false
  }
}

onMounted(cargar)
</script>

<style scoped>
.publica-wrapper {
  min-height: 100vh;
  background: #F8F9FA;
}

.publica-topbar {
  background: #e1052d;
  padding: 14px 24px;
  border-bottom: 3px solid #bc1830;
}

.gandola-card {
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 8px;
  padding: 16px;
  background: #fafafa;
}
</style>
