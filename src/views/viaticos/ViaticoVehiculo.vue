<template>
  <div>
    <h2 class="text-h5 mb-4">Información del Vehículo</h2>
    <v-card class="pa-6">
      <v-form ref="form">
        <v-row>
          <v-col cols="12" md="6">
            <v-autocomplete v-model="choferCedula" :items="catalogos.choferes" :item-title="choferLabel" item-value="cedulaChofer" label="Cédula del Chofer" :loading="catalogos.loading" @update:model-value="onChoferSelect" :rules="[v => !!v || 'Requerido']" />
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field v-model="choferNombre" label="Nombre del Chofer" readonly />
          </v-col>
          <v-col cols="12" md="6">
            <v-autocomplete v-model="vehiculoPlaca" :items="catalogos.vehiculos" item-title="plateNumber" item-value="plateNumber" label="Placa del Vehículo" :loading="catalogos.loading" @update:model-value="onVehiculoSelect" :rules="[v => !!v || 'Requerido']" />
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field v-model="vehiculoInfo" label="Marca / Modelo" readonly />
          </v-col>

          <!-- Remolque (opcional): seleccionar o crear uno nuevo desde el mismo combobox -->
          <v-col cols="12" md="6">
            <v-autocomplete
              v-model="remolquePlaca"
              :items="itemsRemolquesConCrear"
              item-title="display"
              item-value="value"
              label="Placa del Remolque (opcional)"
              :loading="catalogos.loading"
              clearable
              prepend-inner-icon="mdi-truck-trailer"
              hint="Si la gandola lleva remolque, selecciónalo o registra uno nuevo"
              persistent-hint
              @update:model-value="onRemolqueSelect"
            >
              <template #item="{ item, props }">
                <v-list-item v-bind="props" :title="item.raw.display">
                  <template v-if="item.raw.value === '__NEW__'" #prepend>
                    <v-icon color="primary">mdi-plus-circle</v-icon>
                  </template>
                  <template v-else-if="item.raw.subtitle" #subtitle>
                    {{ item.raw.subtitle }}
                  </template>
                </v-list-item>
              </template>
            </v-autocomplete>
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field
              :model-value="remolqueInfo"
              label="Remolque — Marca / Modelo"
              readonly
              variant="filled"
              :placeholder="remolquePlaca ? '' : 'Selecciona un remolque'"
            />
          </v-col>

          <!-- Segunda puerta (por gandola) -->
          <v-col cols="12" md="6">
            <v-switch
              v-model="tieneSegundaPuerta"
              label="¿Esta gandola tiene segunda puerta?"
              color="primary"
              hide-details
              density="compact"
              @update:model-value="onSegundaPuertaToggle"
            />
            <div class="text-caption text-grey">
              Si activa, se registra un precinto adicional para la 2da puerta.
            </div>
          </v-col>
          <v-col cols="12" md="6" v-if="tieneSegundaPuerta">
            <v-text-field
              v-model="idPrecintoSegundaPuerta"
              label="ID de Precinto — 2da Puerta"
              prepend-inner-icon="mdi-lock-outline"
              hint="Precinto de la segunda puerta de esta gandola"
              persistent-hint
              :rules="[v => !!v || 'Requerido']"
            />
          </v-col>

          <!-- Precintos + Facturas por tramo (uno por cada tramo del viático) -->
          <v-col cols="12" v-if="store.tramos.length > 0">
            <v-divider class="mb-3" />
            <div class="d-flex align-center mb-2">
              <v-icon size="small" color="primary" class="mr-1">mdi-lock-outline</v-icon>
              <span class="text-subtitle-2 font-weight-bold">
                Precintos y facturas por tramo de esta gandola
              </span>
              <v-chip class="ml-2" size="x-small" color="primary" variant="tonal">
                {{ store.tramos.length }} tramo{{ store.tramos.length === 1 ? '' : 's' }}
              </v-chip>
            </div>
            <p class="text-caption text-grey mb-2">
              Cada gandola lleva su propio precinto y nro de factura para cada tramo.
            </p>
            <div
              v-for="(t, i) in store.tramos" :key="t.orden"
              class="mb-3"
            >
              <div class="text-caption font-weight-medium mb-1">
                Tramo {{ t.orden }}{{ t.destino ? ` — ${t.origen || '?'} → ${t.destino}` : '' }}
              </div>
              <v-row dense>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="precintosTramosForm[i]"
                    label="Precinto"
                    prepend-inner-icon="mdi-lock-outline"
                    density="compact"
                    :rules="[v => !!v || 'Requerido']"
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="facturasTramosForm[i]"
                    label="Nro de Factura"
                    prepend-inner-icon="mdi-receipt-text-outline"
                    density="compact"
                    :rules="[v => !!v || 'Requerido']"
                  />
                </v-col>
              </v-row>
            </div>
          </v-col>

          <v-col cols="12">
            <v-btn color="success" prepend-icon="mdi-plus" @click="agregarVehiculo" :disabled="!puedeAgregar">
              Agregar Vehículo
            </v-btn>
          </v-col>
        </v-row>
      </v-form>

      <!-- ═══ DIÁLOGO: Crear nuevo remolque ═══ -->
      <v-dialog v-model="dialogoNuevoRemolque" max-width="640" persistent>
        <v-card>
          <v-card-title class="d-flex align-center">
            <v-icon class="mr-2" color="primary">mdi-truck-trailer</v-icon>
            Registrar nuevo remolque
          </v-card-title>
          <v-card-text>
            <v-alert type="info" variant="tonal" density="compact" class="mb-4">
              Esta placa se guarda en el catálogo de Remolques y queda disponible para futuros viáticos.
            </v-alert>
            <v-row dense>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model.trim="remolqueForm.plateNumber"
                  label="Placa"
                  :rules="[v => !!v || 'Requerido']"
                  autofocus
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field v-model.trim="remolqueForm.typeCar" label="Tipo (Plataforma, Jaula, etc.)" />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field v-model.trim="remolqueForm.carBrand" label="Marca" />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field v-model.trim="remolqueForm.carModel" label="Modelo" />
              </v-col>
              <v-col cols="12">
                <v-text-field v-model.trim="remolqueForm.carSerial" label="Serial de carrocería (opcional)" />
              </v-col>
            </v-row>
            <v-alert v-if="errorRemolque" type="error" variant="tonal" density="compact" class="mt-3">
              {{ errorRemolque }}
            </v-alert>
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn variant="text" @click="dialogoNuevoRemolque = false">Cancelar</v-btn>
            <v-btn color="primary" :loading="guardandoRemolque" @click="guardarNuevoRemolque">
              Guardar y usar
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Tabla de vehículos agregados -->
      <v-divider class="my-4" v-if="store.vehiculos.length" />
      <h3 class="text-h6 mb-2" v-if="store.vehiculos.length">Vehículos Agregados ({{ store.vehiculos.length }})</h3>
      <v-table v-if="store.vehiculos.length" density="compact">
        <thead>
          <tr>
            <th>Chofer</th>
            <th>Placa</th>
            <th>Remolque</th>
            <th>Precintos por tramo</th>
            <th>Facturas por tramo</th>
            <th>2da Puerta</th>
            <th width="60"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(veh, idx) in store.vehiculos" :key="idx">
            <td>
              <div class="font-weight-medium">{{ veh.nameDriver }}</div>
              <div class="text-caption text-grey">{{ veh.idDriver }}</div>
            </td>
            <td>
              <div>{{ veh.plateNumber }}</div>
              <div class="text-caption text-grey">{{ veh.carBrand }} {{ veh.carModel }}</div>
            </td>
            <td>
              <v-chip v-if="veh.plateNumberRemolque" size="x-small" color="primary" variant="tonal" prepend-icon="mdi-truck-trailer">
                {{ veh.plateNumberRemolque }}
              </v-chip>
              <span v-else class="text-grey text-body-2">—</span>
            </td>
            <td>
              <div v-if="veh.precintosTramos && veh.precintosTramos.length" class="d-flex flex-wrap ga-1">
                <v-chip
                  v-for="p in veh.precintosTramos" :key="p.ordenTramo"
                  size="x-small" color="primary" variant="tonal"
                >
                  T{{ p.ordenTramo }}: {{ p.idPrecinto }}
                </v-chip>
              </div>
              <span v-else class="text-grey text-body-2">—</span>
            </td>
            <td>
              <div v-if="veh.precintosTramos && veh.precintosTramos.some(p => p.facturaNumero)" class="d-flex flex-wrap ga-1">
                <v-chip
                  v-for="p in veh.precintosTramos.filter(p => p.facturaNumero)" :key="`f-${p.ordenTramo}`"
                  size="x-small" color="teal" variant="tonal"
                  prepend-icon="mdi-receipt-text-outline"
                >
                  T{{ p.ordenTramo }}: {{ p.facturaNumero }}
                </v-chip>
              </div>
              <span v-else class="text-grey text-body-2">—</span>
            </td>
            <td>
              <v-chip v-if="veh.tieneSegundaPuerta && veh.idPrecintoSegundaPuerta"
                size="x-small" color="deep-purple" variant="tonal"
                prepend-icon="mdi-door-open">
                {{ veh.idPrecintoSegundaPuerta }}
              </v-chip>
              <span v-else class="text-grey text-body-2">—</span>
            </td>
            <td>
              <v-btn icon="mdi-delete" variant="text" color="error" size="x-small" @click="store.removeVehiculo(idx)" />
            </td>
          </tr>
        </tbody>
      </v-table>

      <v-row class="mt-4">
        <v-col>
          <v-btn variant="outlined" @click="$router.back()">
            <v-icon start icon="mdi-arrow-left" /> Anterior
          </v-btn>
        </v-col>
        <v-col cols="auto">
          <v-btn color="primary" @click="siguiente" :disabled="store.vehiculos.length === 0">
            Siguiente <v-icon end icon="mdi-arrow-right" />
          </v-btn>
        </v-col>
      </v-row>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useViaticoStore } from '@/stores/viaticoStore'
import { useCatalogosStore } from '@/stores/catalogosStore'
import { consultasService } from '@/services/consultasService'
import type { Chofer, Vehiculo, Remolque } from '@/interfaces'

const router = useRouter()
const store = useViaticoStore()
const catalogos = useCatalogosStore()

const choferCedula = ref('')
const choferNombre = ref('')
const vehiculoPlaca = ref('')
const vehiculoInfo = ref('')
const form = ref()

// Datos del vehículo seleccionado para agregar al store
let selectedVehiculo: Vehiculo | null = null

// ── Remolque (opcional) ──
const remolquePlaca = ref<string | null>(null)
const remolqueInfo = ref('')
let selectedRemolque: Remolque | null = null

// ── Segunda puerta (por gandola) ──
const tieneSegundaPuerta = ref(false)
const idPrecintoSegundaPuerta = ref('')

function onSegundaPuertaToggle(val: boolean | null) {
  if (!val) idPrecintoSegundaPuerta.value = ''
}

// ── Precintos + facturas por tramo (uno por cada tramo del viático) ──
// Cada gandola lleva su propio precinto y su propio nro de factura para
// cada tramo del viático. Ambos arrays se mantienen indexados por posición.
const precintosTramosForm = ref<string[]>([])
const facturasTramosForm = ref<string[]>([])

// Re-dimensiona los arrays cuando cambia la cantidad de tramos.
watch(
  () => store.tramos.length,
  (n) => {
    while (precintosTramosForm.value.length < n) precintosTramosForm.value.push('')
    while (precintosTramosForm.value.length > n) precintosTramosForm.value.pop()
    while (facturasTramosForm.value.length < n) facturasTramosForm.value.push('')
    while (facturasTramosForm.value.length > n) facturasTramosForm.value.pop()
  },
  { immediate: true },
)

const puedeAgregar = computed(() => {
  if (!choferCedula.value || !vehiculoPlaca.value) return false
  if (tieneSegundaPuerta.value && !idPrecintoSegundaPuerta.value) return false
  // Todos los precintos y facturas por tramo deben estar llenos
  for (let i = 0; i < store.tramos.length; i++) {
    if (!(precintosTramosForm.value[i] || '').trim()) return false
    if (!(facturasTramosForm.value[i] || '').trim()) return false
  }
  return true
})

/** Items para el v-autocomplete: catálogo + entrada especial "+ Registrar nuevo". */
const itemsRemolquesConCrear = computed(() => {
  const items = catalogos.remolques.map(r => ({
    value: r.plateNumber,
    display: r.plateNumber,
    subtitle: [r.carBrand, r.carModel].filter(Boolean).join(' ').trim() || undefined,
  }))
  items.push({ value: '__NEW__', display: '+ Registrar nuevo remolque', subtitle: undefined })
  return items
})

function onRemolqueSelect(val: string | null) {
  if (val === '__NEW__') {
    abrirDialogoNuevoRemolque()
    // Lo dejamos en null hasta que el usuario guarde el nuevo
    remolquePlaca.value = null
    remolqueInfo.value = ''
    selectedRemolque = null
    return
  }
  if (!val) {
    remolqueInfo.value = ''
    selectedRemolque = null
    return
  }
  selectedRemolque = catalogos.remolques.find(r => r.plateNumber === val) || null
  remolqueInfo.value = selectedRemolque
    ? [selectedRemolque.carBrand, selectedRemolque.carModel].filter(Boolean).join(' ')
    : ''
}

// ── Diálogo: nuevo remolque ──
const dialogoNuevoRemolque = ref(false)
const guardandoRemolque = ref(false)
const errorRemolque = ref('')
const remolqueForm = reactive({
  plateNumber: '',
  carBrand: '',
  carModel: '',
  carSerial: '',
  typeCar: '',
})

function abrirDialogoNuevoRemolque() {
  errorRemolque.value = ''
  remolqueForm.plateNumber = ''
  remolqueForm.carBrand = ''
  remolqueForm.carModel = ''
  remolqueForm.carSerial = ''
  remolqueForm.typeCar = ''
  dialogoNuevoRemolque.value = true
}

async function guardarNuevoRemolque() {
  errorRemolque.value = ''
  const placa = (remolqueForm.plateNumber || '').trim().toUpperCase()
  if (!placa) {
    errorRemolque.value = 'La placa es requerida.'
    return
  }
  guardandoRemolque.value = true
  try {
    const nuevo = await consultasService.createRemolque({
      plateNumber: placa,
      carBrand: remolqueForm.carBrand,
      carModel: remolqueForm.carModel,
      carSerial: remolqueForm.carSerial,
      typeCar: remolqueForm.typeCar,
    })
    catalogos.upsertRemolque(nuevo)
    // Auto-asignar al formulario
    remolquePlaca.value = nuevo.plateNumber
    selectedRemolque = nuevo
    remolqueInfo.value = [nuevo.carBrand, nuevo.carModel].filter(Boolean).join(' ')
    dialogoNuevoRemolque.value = false
  } catch (e: any) {
    errorRemolque.value = e?.response?.data?.error || e.message || 'Error al guardar el remolque'
  } finally {
    guardandoRemolque.value = false
  }
}

const choferLabel = (c: Chofer) => {
  const ced = (c.cedulaChofer || '').trim()
  const nom = (c.nameChofer || '').trim()
  return nom ? `${ced} — ${nom}` : ced
}

const onChoferSelect = (cedula: string) => {
  const chofer = catalogos.getChoferByCedula(cedula)
  choferNombre.value = chofer?.nameChofer ?? ''
}

const onVehiculoSelect = (placa: string) => {
  selectedVehiculo = catalogos.getVehiculoByPlaca(placa) || null
  vehiculoInfo.value = selectedVehiculo ? `${selectedVehiculo.carBrand} ${selectedVehiculo.carModel}` : ''
}

const agregarVehiculo = () => {
  if (!choferCedula.value || !selectedVehiculo) return
  // Precintos + facturas por tramo: armar la lista (matriz vehículo × tramo)
  // a partir de los arrays indexados y los tramos del store.
  const precintosTramos = store.tramos.map((t, i) => ({
    ordenTramo: t.orden,
    idPrecinto: (precintosTramosForm.value[i] || '').trim(),
    facturaNumero: (facturasTramosForm.value[i] || '').trim(),
  })).filter(p => p.idPrecinto || p.facturaNumero)

  store.addVehiculo({
    nameDriver: choferNombre.value,
    idDriver: choferCedula.value,
    invoiceTravel: '',  // la factura ahora vive por tramo, no por gandola
    plateNumber: selectedVehiculo.plateNumber,
    carBrand: selectedVehiculo.carBrand,
    carModel: selectedVehiculo.carModel,
    carSerial: selectedVehiculo.carSerial,
    typeCar: selectedVehiculo.typeCar,
    plateNumberRemolque: remolquePlaca.value || '',
    tieneSegundaPuerta: tieneSegundaPuerta.value,
    idPrecintoSegundaPuerta: tieneSegundaPuerta.value ? idPrecintoSegundaPuerta.value : '',
    precintosTramos,
  })
  // Limpiar campos para agregar otro
  choferCedula.value = ''
  choferNombre.value = ''
  vehiculoPlaca.value = ''
  vehiculoInfo.value = ''
  selectedVehiculo = null
  remolquePlaca.value = null
  remolqueInfo.value = ''
  selectedRemolque = null
  tieneSegundaPuerta.value = false
  idPrecintoSegundaPuerta.value = ''
  precintosTramosForm.value = store.tramos.map(() => '')
  facturasTramosForm.value = store.tramos.map(() => '')
}

const siguiente = () => {
  if (store.vehiculos.length > 0) {
    router.push('/formulario-viatico/info-pago-viatico')
  }
}
</script>
