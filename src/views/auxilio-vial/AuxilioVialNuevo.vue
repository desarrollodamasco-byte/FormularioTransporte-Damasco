<template>
  <div>
    <h2 class="text-h5 mb-4">Nuevo Auxilio Vial</h2>
    <v-card class="pa-6">
      <v-form ref="form">
        <!-- Selector de modo: seleccionar viático existente o asignar manualmente. Ambos opcionales. -->
        <v-row dense class="mb-2">
          <v-col cols="12">
            <v-btn-toggle
              v-model="modoRuta"
              color="primary"
              density="compact"
              divided
              variant="outlined"
            >
              <v-btn value="seleccionar">
                <v-icon start icon="mdi-link-variant" />
                Seleccionar viático
              </v-btn>
              <v-btn value="asignar">
                <v-icon start icon="mdi-map-marker-path" />
                Asignar ruta
              </v-btn>
            </v-btn-toggle>
            <span class="text-caption text-medium-emphasis ml-3">
              Ambas opciones son opcionales.
            </span>
          </v-col>
        </v-row>

        <v-row>
          <!-- Modo "seleccionar": autocomplete del viático principal -->
          <v-col v-if="modoRuta === 'seleccionar'" cols="12" md="4">
            <v-autocomplete
              v-model="store.header.viaticoPrincipalId"
              :items="viaticosDisponibles"
              item-title="label"
              item-value="nroSolicitud"
              label="Viático Principal (opcional)"
              :loading="loadingViaticos || precargando"
              clearable
              @update:model-value="onViaticoPrincipalChange"
            />
          </v-col>

          <!-- Modo "asignar": Desde + Hasta -->
          <template v-else-if="modoRuta === 'asignar'">
            <v-col cols="12" md="2">
              <v-autocomplete
                v-model="store.header.lugarSalida"
                :items="catalogos.destinos"
                item-title="nameDestination"
                item-value="nameDestination"
                label="Desde (opcional)"
                :loading="catalogos.loading"
                clearable
              />
            </v-col>
            <v-col cols="12" md="2">
              <v-autocomplete
                v-model="store.header.lugarDestino"
                :items="catalogos.destinos"
                item-title="nameDestination"
                item-value="nameDestination"
                label="Hasta (opcional)"
                :loading="catalogos.loading"
                clearable
              />
            </v-col>
          </template>

          <v-col cols="12" md="4">
            <v-text-field v-model="store.header.nombreSolicitante" label="Solicitante" :rules="[v => !!v || 'Requerido']" />
          </v-col>
          <v-col cols="12" md="4">
            <v-text-field v-model="store.header.fechaSolicitud" label="Fecha Solicitud" type="date" :rules="[v => !!v || 'Requerido']" />
          </v-col>
        </v-row>

        <v-divider class="my-4" />
        <h3 class="text-h6 mb-2">Mecánico</h3>
        <v-row>
          <v-col cols="12" md="6">
            <v-autocomplete
              v-model="store.header.cedulaMecanico"
              :items="catalogos.mecanicos"
              :item-title="mecanicoLabel"
              item-value="cedulaChofer"
              label="Seleccionar Mecánico"
              :loading="catalogos.loading"
              @update:model-value="onMecanicoSelect"
              :rules="[v => !!v || 'Requerido']"
            />
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field
              :model-value="store.header.nombreMecanico"
              label="Nombre del Mecánico"
              readonly
              variant="filled"
            />
          </v-col>
        </v-row>

        <v-divider class="my-4" />
        <h3 class="text-h6 mb-2">Fechas</h3>
        <v-row>
          <v-col cols="12" md="4">
            <v-text-field v-model="store.header.fechaSalida" label="Fecha Salida" type="date" :rules="[v => !!v || 'Requerido']" />
          </v-col>
          <v-col cols="12" md="4">
            <v-text-field v-model="store.header.fechaRetorno" label="Fecha Retorno" type="date" :rules="[v => !!v || 'Requerido']" />
          </v-col>
          <v-col cols="12" md="4">
            <v-text-field v-model.number="store.header.diasDeViaje" label="Días de Viaje" type="number" min="1" />
          </v-col>
        </v-row>

        <v-divider class="my-4" />
        <h3 class="text-h6 mb-2">Vehículo</h3>
        <v-row>
          <v-col cols="12" md="3">
            <v-autocomplete v-model="store.vehiculo.placa" :items="catalogos.vehiculos" item-title="plateNumber" item-value="plateNumber" label="Placa" :loading="catalogos.loading" @update:model-value="onPlacaChange" />
          </v-col>
          <v-col cols="12" md="3"><v-text-field v-model="store.vehiculo.marca" label="Marca" readonly /></v-col>
          <v-col cols="12" md="3"><v-text-field v-model="store.vehiculo.modelo" label="Modelo" readonly /></v-col>
          <v-col cols="12" md="3"><v-text-field v-model="store.vehiculo.tipoVehiculo" label="Tipo" readonly /></v-col>
        </v-row>

        <v-divider class="my-4" />
        <h3 class="text-h6 mb-2">Viáticos y Peajes</h3>
        <v-row>
          <v-col cols="12" md="3">
            <v-text-field v-model.number="store.pago.viaticoDiario" label="Viático Diario (USD)" type="number" @update:model-value="store.calcularPago()" />
          </v-col>
          <v-col cols="12" md="3">
            <v-text-field v-model.number="store.pago.cantDiasViaje" label="Días de Viaje" type="number" @update:model-value="store.calcularPago()" />
          </v-col>
          <v-col cols="12" md="3">
            <v-text-field :model-value="store.pago.tipoCambio?.toFixed(4)" label="Tasa de Cambio" readonly />
          </v-col>
          <v-col cols="12" md="3">
            <v-text-field :model-value="store.pago.totViaticoUsd?.toFixed(2)" label="Total Viático (USD)" readonly variant="filled" />
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12" md="3">
            <v-text-field v-model.number="store.pago.asignacionPeaje" label="Peaje Unitario (Bs)" type="number" @update:model-value="store.calcularPago()" />
          </v-col>
          <v-col cols="12" md="3">
            <v-text-field v-model.number="store.pago.cantPeajes" label="Cant. Peajes" type="number" @update:model-value="store.calcularPago()" />
          </v-col>
          <v-col cols="12" md="3">
            <v-text-field :model-value="store.pago.totPeajes?.toFixed(2)" label="Total Peajes (Bs)" readonly variant="filled" />
          </v-col>
          <v-col cols="12" md="3">
            <v-text-field :model-value="store.pago.totalPagarBs?.toFixed(2)" label="TOTAL A PAGAR (Bs)" readonly variant="filled" color="success" />
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="12">
            <v-textarea v-model="store.header.descripcion" label="Descripción del problema mecánico" rows="2" />
          </v-col>
          <v-col cols="12">
            <v-textarea v-model="store.header.observaciones" label="Observaciones" rows="2" />
          </v-col>
        </v-row>

        <v-alert v-if="store.error" type="error" variant="tonal" class="mt-4">{{ store.error }}</v-alert>

        <v-row class="mt-4">
          <v-col><v-btn variant="outlined" @click="$router.push('/auxilio-vial')"><v-icon start icon="mdi-arrow-left" /> Volver</v-btn></v-col>
          <v-col cols="auto">
            <v-btn color="primary" :loading="store.submitting" @click="guardar">
              <v-icon start icon="mdi-content-save" /> Guardar Auxilio Vial
            </v-btn>
          </v-col>
        </v-row>
      </v-form>
    </v-card>

    <v-snackbar v-model="showSuccess" color="success" timeout="3000">
      ✅ {{ successMsg }}
    </v-snackbar>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuxilioVialStore } from '@/stores/auxilioVialStore'
import { useCatalogosStore } from '@/stores/catalogosStore'
import { viaticosService } from '@/services/viaticosService'
import { consultasService } from '@/services/consultasService'

const router = useRouter()
const store = useAuxilioVialStore()
const catalogos = useCatalogosStore()
const form = ref()
const showSuccess = ref(false)
const successMsg = ref('')

// Modo de definición de ruta (ambas opciones son opcionales: puede no elegir
// nada y dejar la ruta vacía).
//   - 'seleccionar': elige un viático principal existente y lo enlaza.
//   - 'asignar':     escribe Desde / Hasta a mano.
type ModoRuta = 'seleccionar' | 'asignar' | null
const modoRuta = ref<ModoRuta>('asignar')

// Al cambiar de modo, limpiamos los campos del modo que se abandona para
// no enviar datos cruzados al backend.
watch(modoRuta, (nuevo, viejo) => {
  if (viejo === 'seleccionar' && nuevo !== 'seleccionar') {
    store.header.viaticoPrincipalId = null
  }
  if (viejo === 'asignar' && nuevo !== 'asignar') {
    store.header.lugarSalida = ''
    store.header.lugarDestino = ''
  }
})

// Cargar viáticos para el autocomplete de viático principal
const loadingViaticos = ref(false)
const viaticosDisponibles = ref<any[]>([])
const precargando = ref(false)

onMounted(async () => {
  store.reset()
  store.calcularPago()

  // Fallback: si el catálogo global no tiene mecánicos cargados (porque el
  // endpoint era nuevo o el backend no estaba listo), los pedimos aquí.
  if (!catalogos.mecanicos || catalogos.mecanicos.length === 0) {
    try {
      const mc = await consultasService.getMecanicos()
      catalogos.mecanicos = mc
    } catch (e) {
      console.warn('No se pudieron cargar mecánicos', e)
    }
  }

  loadingViaticos.value = true
  try {
    const list = await viaticosService.getViaticos()
    viaticosDisponibles.value = list.map((v: any) => ({
      nroSolicitud: v.nroSolicitud,
      label: `#${v.nroSolicitud} — ${v.nombreSolicitante} (${v.lugarSalida} → ${v.lugarDestino})`,
    }))
  } finally {
    loadingViaticos.value = false
  }
})

const onPlacaChange = (placa: string) => {
  const v = catalogos.getVehiculoByPlaca(placa)
  if (v) {
    store.vehiculo.marca = v.carBrand
    store.vehiculo.modelo = v.carModel
    store.vehiculo.tipoVehiculo = v.typeCar
  }
}

const mecanicoLabel = (m: { cedulaChofer: string; nameChofer: string }) => {
  const c = (m.cedulaChofer || '').trim()
  const n = (m.nameChofer || '').trim()
  return n ? `${c} — ${n}` : c
}

const onMecanicoSelect = (cedula: string) => {
  const m = catalogos.mecanicos.find(x => x.cedulaChofer === cedula)
  store.header.nombreMecanico = m ? (m.nameChofer || '').trim() : ''
}

/**
 * Al elegir un viático principal, precarga ruta, fechas y el primer vehículo del viático.
 * No pisa campos que el usuario ya haya tipeado.
 */
const onViaticoPrincipalChange = async (nroSolicitud: number | null) => {
  if (!nroSolicitud) return
  precargando.value = true
  try {
    const data: any = await viaticosService.getViatico(nroSolicitud)
    const h = data?.viaticoHeaderResponse || {}
    const vehs = data?.vehiculoViaticos || []

    // Cabecera: ruta y fechas (no pisamos lo que el usuario ya escribió)
    if (!store.header.lugarSalida && h.lugarSalida) store.header.lugarSalida = h.lugarSalida
    if (!store.header.lugarDestino && h.lugarDestino) store.header.lugarDestino = h.lugarDestino
    if (!store.header.fechaSalida && h.fechaSalida) store.header.fechaSalida = h.fechaSalida
    if (!store.header.fechaRetorno && h.fechaRetorno) store.header.fechaRetorno = h.fechaRetorno
    if ((!store.header.diasDeViaje || store.header.diasDeViaje === 1) && h.diasDeViaje)
      store.header.diasDeViaje = h.diasDeViaje
    if (!store.header.nombreSolicitante && h.nombreSolicitante)
      store.header.nombreSolicitante = h.nombreSolicitante

    // Vehículo: tomar el primero del viático original
    const v0 = vehs[0]
    if (v0 && !store.vehiculo.placa) {
      store.vehiculo.placa = v0.plateNumber || ''
      store.vehiculo.marca = v0.carBrand || ''
      store.vehiculo.modelo = v0.carModel || ''
      store.vehiculo.tipoVehiculo = v0.typeCar || ''
    }
  } catch (e) {
    console.error('No se pudo precargar el viático principal', e)
  } finally {
    precargando.value = false
  }
}

const guardar = async () => {
  const { valid } = await form.value.validate()
  if (!valid) return
  try {
    const result = await store.submit()
    successMsg.value = `Auxilio Vial ${result.response?.referencia || ''} registrado`
    showSuccess.value = true
    setTimeout(() => router.push('/auxilio-vial'), 1500)
  } catch { /* error se muestra en el alert */ }
}
</script>
