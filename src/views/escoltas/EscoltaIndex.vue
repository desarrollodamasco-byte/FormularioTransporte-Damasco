<template>
  <div>
    <h2 class="text-h5 mb-4">Viático Escolta</h2>
    <v-card class="pa-6">
      <v-form ref="form">
        <!-- Datos del solicitante / escolta -->
        <v-row>
          <v-col cols="12" md="6"><v-text-field v-model="store.nombreSolicitante" label="Nombre del Solicitante" :rules="[v => !!v || 'Requerido']" /></v-col>
          <v-col cols="12" md="6"><v-text-field v-model="store.fechaSolicitud" label="Fecha de Solicitud" type="date" :rules="[v => !!v || 'Requerido']" /></v-col>
          <v-col cols="12" md="6">
            <v-autocomplete
              v-model="store.cedulaEscolta"
              :items="catalogos.escoltas"
              :item-title="escoltaLabel"
              item-value="cedulaEscolta"
              label="Cédula del Escolta Beneficiario"
              :loading="catalogos.loading"
              :rules="[v => !!v || 'Requerido']"
            />
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="store.fechaSalida"
              label="Fecha de Salida"
              type="date"
              :rules="[v => !!v || 'Requerido']"
            />
          </v-col>
          <v-col cols="12"><v-textarea v-model="store.observaciones" label="Observaciones" rows="2" /></v-col>
        </v-row>

        <!-- ── Tramos del viaje ── -->
        <v-divider class="my-4" />
        <div class="d-flex align-center mb-3">
          <h3 class="text-h6">Tramos del Viaje</h3>
          <v-chip class="ml-2" size="small" color="primary" variant="tonal">
            {{ store.tramos.length }} tramo{{ store.tramos.length === 1 ? '' : 's' }}
          </v-chip>
        </div>

        <v-card v-for="(tramo, idx) in store.tramos" :key="idx" variant="outlined" class="pa-4 mb-3">
          <div class="d-flex align-center mb-2">
            <v-chip size="small" color="primary" variant="flat" class="mr-2">Tramo {{ tramo.orden }}</v-chip>
            <v-spacer />
            <v-btn
              v-if="store.tramos.length > 1"
              icon="mdi-close" size="x-small" variant="text" color="error"
              @click="store.removeTramo(idx)"
            />
          </div>
          <v-row dense>
            <v-col cols="12" md="5">
              <v-autocomplete
                v-if="idx === 0"
                v-model="tramo.origen"
                :items="itemsSalidas"
                item-title="nameDestination"
                item-value="nameDestination"
                label="Origen"
                :loading="catalogos.loading"
                :rules="[v => !!v || 'Requerido']"
              />
              <v-text-field
                v-else
                :model-value="tramo.origen"
                label="Origen"
                readonly
                variant="filled"
                hint="Auto desde tramo anterior"
                persistent-hint
              />
            </v-col>
            <v-col cols="12" md="2" class="d-flex align-center justify-center">
              <v-icon icon="mdi-arrow-right" size="large" color="primary" />
            </v-col>
            <v-col cols="12" md="5">
              <v-autocomplete
                v-model="tramo.destino"
                :items="itemsDestinosDesde(tramo.origen)"
                item-title="nameDestination"
                item-value="nameDestination"
                :label="`Destino${tramo.origen ? ` (rutas desde ${tramo.origen})` : ''}`"
                :loading="catalogos.loading"
                :disabled="!tramo.origen"
                :rules="[v => !!v || 'Requerido']"
                :no-data-text="tramo.origen ? `No hay rutas desde ${tramo.origen}` : 'Selecciona primero un origen'"
                @update:model-value="store.onTramoDestinoChange(idx)"
              />
            </v-col>
          </v-row>
        </v-card>

        <v-btn variant="tonal" color="primary" prepend-icon="mdi-plus" class="mb-4" @click="store.addTramo">
          Agregar Tramo
        </v-btn>

        <!-- ══════════════════════════════════════════════════════
             VEHÍCULOS — formulario de alta + lista
             ══════════════════════════════════════════════════════ -->
        <v-divider class="my-4" />
        <div class="d-flex align-center mb-2">
          <h3 class="text-h6">Vehículos</h3>
          <v-chip class="ml-2" size="small" color="primary" variant="tonal">
            {{ store.vehiculos.length }} gandola{{ store.vehiculos.length === 1 ? '' : 's' }}
          </v-chip>
        </div>
        <p class="text-caption text-grey mb-3">
          Selecciona el proveedor y la gandola. Si la placa no existe en el catálogo,
          puedes registrarla aquí mismo.
        </p>

        <!-- Formulario de alta -->
        <v-card variant="outlined" class="pa-4 mb-3">
          <v-row dense>
            <v-col cols="12" md="6">
              <v-autocomplete
                v-model="formVeh.proveedorId"
                :items="catalogos.proveedoresViatico"
                item-title="razonSocial"
                item-value="id"
                label="Proveedor de Servicio"
                :loading="catalogos.loading"
                @update:model-value="onProveedorChange"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-autocomplete
                v-model="formVeh.placa"
                :items="placasItems"
                item-title="display"
                item-value="value"
                label="Número de Placa (opcional)"
                :loading="catalogos.loading"
                :disabled="!formVeh.proveedorId"
                :hint="!formVeh.proveedorId ? 'Selecciona primero un proveedor' : 'Puedes dejarlo en blanco si la asignan después'"
                persistent-hint
                @update:model-value="onPlacaChange"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="formVeh.marca"
                label="Marca (opcional)"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="formVeh.modelo"
                label="Modelo (opcional)"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="formVeh.nroFactura"
                label="Nro de Factura (opcional)"
              />
            </v-col>
          </v-row>

          <!-- Segunda puerta -->
          <v-divider class="my-3" />
          <v-row dense>
            <v-col cols="12" md="6">
              <v-switch
                v-model="formVeh.tieneSegundaPuerta"
                label="¿Esta gandola tiene segunda puerta?"
                color="primary" hide-details density="comfortable"
                @update:model-value="onSegundaPuertaToggle"
              />
            </v-col>
            <v-col cols="12" md="6" v-if="formVeh.tieneSegundaPuerta">
              <v-text-field
                v-model="formVeh.idPrecintoSegundaPuerta"
                label="ID de Precinto — 2da Puerta"
              />
            </v-col>
          </v-row>

          <!-- Precintos por tramo -->
          <v-divider class="my-3" />
          <h4 class="text-subtitle-2 mb-2">
            <v-icon start icon="mdi-shield-check-outline" />
            Precintos por tramo de esta gandola
          </h4>
          <v-row dense>
            <v-col
              v-for="(t, i) in store.tramos"
              :key="i"
              cols="12" md="6"
            >
              <v-text-field
                v-model="precintosTramosForm[i]"
                :label="`Precinto Tramo ${t.orden}${t.destino ? ` — ${t.origen || '?'} → ${t.destino}` : ''}`"
              />
            </v-col>
          </v-row>

          <v-row class="mt-2">
            <v-col cols="auto">
              <v-btn
                color="primary"
                variant="flat"
                prepend-icon="mdi-plus"
                :disabled="!puedeAgregarVehiculo"
                :loading="registrando"
                @click="agregarVehiculo"
              >
                Agregar vehículo
              </v-btn>
            </v-col>
            <v-col v-if="!puedeAgregarVehiculo" class="d-flex align-center">
              <span class="text-caption text-grey">
                Selecciona un proveedor para agregar. La placa es opcional.
              </span>
            </v-col>
          </v-row>
        </v-card>

        <!-- Lista de vehículos agregados -->
        <v-card v-if="store.vehiculos.length" variant="tonal" color="surface-variant" class="pa-3 mb-4">
          <h4 class="text-subtitle-2 mb-2">Gandolas registradas en este viático</h4>
          <v-table density="compact">
            <thead>
              <tr>
                <th>Placa</th>
                <th>Marca / Modelo</th>
                <th>Proveedor</th>
                <th>Factura</th>
                <th>2da puerta</th>
                <th>Precintos</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(v, idx) in store.vehiculos" :key="idx">
                <td class="font-weight-medium">{{ v.nroPlaca || '—' }}</td>
                <td>{{ [v.marca, v.modelo].filter(Boolean).join(' ') || '—' }}</td>
                <td>{{ v.proveedorRazonSocial || '—' }}</td>
                <td>{{ v.nroFactura || '—' }}</td>
                <td>
                  <v-chip v-if="v.tieneSegundaPuerta" size="x-small" color="warning" variant="tonal">
                    {{ v.idPrecintoSegundaPuerta || '?' }}
                  </v-chip>
                  <span v-else class="text-grey">—</span>
                </td>
                <td>
                  <v-chip
                    v-for="p in v.precintosTramos" :key="p.ordenTramo"
                    size="x-small" color="primary" variant="tonal" class="mr-1"
                  >
                    T{{ p.ordenTramo }}: {{ p.idPrecinto }}
                  </v-chip>
                </td>
                <td>
                  <v-btn
                    icon="mdi-close" size="x-small" variant="text" color="error"
                    @click="store.removeVehiculo(idx)"
                  />
                </td>
              </tr>
            </tbody>
          </v-table>
        </v-card>

        <v-alert v-if="!store.vehiculos.length" type="warning" variant="tonal" density="compact" class="mb-4">
          Agrega al menos un vehículo antes de continuar.
        </v-alert>

        <v-row class="mt-4">
          <v-col cols="auto">
            <v-btn color="primary" :disabled="!store.vehiculos.length" @click="siguiente">
              Siguiente <v-icon end icon="mdi-arrow-right" />
            </v-btn>
          </v-col>
        </v-row>
      </v-form>
    </v-card>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3000">
      {{ snackbar.message }}
    </v-snackbar>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useEscoltaStore } from '@/stores/escoltaStore'
import { useCatalogosStore } from '@/stores/catalogosStore'
import { consultasService } from '@/services/consultasService'
import type { VehiculoEscoltaInfo } from '@/interfaces'

const router = useRouter()
const store = useEscoltaStore()
const catalogos = useCatalogosStore()
const form = ref()

const snackbar = ref({ show: false, color: 'success', message: '' })

// ─── Autocompletes de origen/destino contra Peajes ───
const itemsSalidas = computed(() => {
  const set = new Set<string>()
  for (const p of catalogos.peajes) {
    const s = (p.lugarSalida || '').trim()
    if (s) set.add(s)
  }
  return [...set].sort().map(s => ({ nameDestination: s }))
})

function itemsDestinosDesde(origen: string) {
  const o = (origen || '').trim().toLowerCase()
  if (!o) return []
  const set = new Set<string>()
  for (const p of catalogos.peajes) {
    if ((p.lugarSalida || '').trim().toLowerCase() === o) {
      const d = (p.destino || '').trim()
      if (d) set.add(d)
    }
  }
  return [...set].sort().map(d => ({ nameDestination: d }))
}

const escoltaLabel = (e: { cedulaEscolta: string; nombreEscolta: string }) => {
  const ced = (e.cedulaEscolta || '').trim()
  const nom = (e.nombreEscolta || '').trim()
  return nom ? `${ced} — ${nom}` : ced
}

// ═══ FORMULARIO DE VEHÍCULO (alta) ════════════════════════════════
interface FormVeh {
  proveedorId: number | null
  placa: string
  marca: string
  modelo: string
  nroFactura: string
  tieneSegundaPuerta: boolean
  idPrecintoSegundaPuerta: string
}

const formVeh = reactive<FormVeh>({
  proveedorId: null,
  placa: '',
  marca: '',
  modelo: '',
  nroFactura: '',
  tieneSegundaPuerta: false,
  idPrecintoSegundaPuerta: '',
})

const precintosTramosForm = ref<string[]>([])

// Re-dimensiona el array cuando cambia la cantidad de tramos.
watch(() => store.tramos.length, (n) => {
  while (precintosTramosForm.value.length < n) precintosTramosForm.value.push('')
  while (precintosTramosForm.value.length > n) precintosTramosForm.value.pop()
}, { immediate: true })

// Marca especial dentro del autocomplete: "+ Registrar nueva placa…"
const REGISTRAR_NUEVO = '__REGISTRAR_NUEVO__'

const placasItems = computed(() => {
  if (!formVeh.proveedorId) return []
  const lista = catalogos.vehiculosProveedor
    .filter(v => v.proveedorId === formVeh.proveedorId)
    .map(v => ({ value: v.placa, display: v.placa }))
  return [
    ...lista,
    { value: REGISTRAR_NUEVO, display: '+ Registrar nueva placa…' },
  ]
})

const registrando = ref(false)

function onProveedorChange() {
  // Al cambiar de proveedor, reseteamos la placa para evitar inconsistencias
  formVeh.placa = ''
}

async function onPlacaChange(val: string) {
  if (val === REGISTRAR_NUEVO) {
    formVeh.placa = ''
    const nueva = window.prompt('Ingresa la placa de la nueva gandola:')
    if (!nueva || !formVeh.proveedorId) return
    const placa = nueva.trim().toUpperCase()
    if (!placa) return
    try {
      registrando.value = true
      const created = await consultasService.createVehiculoProveedor({
        placa, proveedorId: formVeh.proveedorId,
      })
      catalogos.upsertVehiculoProveedor(created)
      formVeh.placa = created.placa
      snackbar.value = { show: true, color: 'success', message: `Placa ${created.placa} registrada.` }
    } catch (e: any) {
      snackbar.value = {
        show: true, color: 'error',
        message: e?.response?.data?.error || 'No se pudo registrar la placa.',
      }
    } finally {
      registrando.value = false
    }
  }
}

function onSegundaPuertaToggle(val: boolean | null) {
  if (!val) formVeh.idPrecintoSegundaPuerta = ''
}

// La placa es opcional. Solo requerimos el proveedor. Si el usuario abrió
// el "Registrar nueva placa..." pero no completó la creación, eso sí lo
// bloqueamos (estado intermedio del autocomplete).
const puedeAgregarVehiculo = computed(() =>
  !!formVeh.proveedorId
  && formVeh.placa !== REGISTRAR_NUEVO,
)

function agregarVehiculo() {
  if (!puedeAgregarVehiculo.value || !formVeh.proveedorId) return
  const proveedor = catalogos.proveedores.find(p => p.id === formVeh.proveedorId)

  const precintosTramos = store.tramos
    .map((t, i) => ({
      ordenTramo: t.orden,
      idPrecinto: (precintosTramosForm.value[i] || '').trim(),
    }))
    .filter(p => p.idPrecinto)

  const nuevo: VehiculoEscoltaInfo = {
    fechaSalida: store.fechaSalida,
    origen: store.origenGlobal,
    destino: store.destinoGlobal,
    nroFactura: formVeh.nroFactura.trim(),
    proveedorServicio: proveedor?.razonSocial || '',
    proveedorId: formVeh.proveedorId,
    proveedorRazonSocial: proveedor?.razonSocial || '',
    nroPlaca: (formVeh.placa || '').trim().toUpperCase(),
    marca: formVeh.marca.trim(),
    modelo: formVeh.modelo.trim(),
    tieneSegundaPuerta: formVeh.tieneSegundaPuerta,
    idPrecintoSegundaPuerta: formVeh.tieneSegundaPuerta
      ? formVeh.idPrecintoSegundaPuerta.trim()
      : '',
    precintosTramos,
  }
  store.addVehiculo(nuevo)

  // Reset del formulario para agregar otra gandola
  formVeh.proveedorId = null
  formVeh.placa = ''
  formVeh.marca = ''
  formVeh.modelo = ''
  formVeh.nroFactura = ''
  formVeh.tieneSegundaPuerta = false
  formVeh.idPrecintoSegundaPuerta = ''
  precintosTramosForm.value = store.tramos.map(() => '')
}

const siguiente = async () => {
  const { valid } = await form.value.validate()
  if (!valid) return
  if (!store.vehiculos.length) {
    snackbar.value = { show: true, color: 'warning', message: 'Agrega al menos un vehículo.' }
    return
  }
  router.push('/formulario-escoltas/info-pago-escolta')
}
</script>
