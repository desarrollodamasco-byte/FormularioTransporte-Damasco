<template>
  <div>
    <h2 class="text-h5 mb-4">Resumen Viático Escolta — Por Tramo</h2>
    <v-card class="pa-6">
      <v-alert type="info" variant="tonal" class="mb-4">
        Ruta: <strong>{{ store.rutaCompleta }}</strong>. Define para cada tramo los días y el viático diario.
      </v-alert>

      <!-- Tabla maestra por tramo (los viáticos de escolta NO usan peajes) -->
      <v-table density="compact" class="mb-4">
        <thead>
          <tr>
            <th>Tramo</th>
            <th width="120" class="text-center">Días</th>
            <th width="170" class="text-end">Viático Diario (USD)</th>
            <th width="170" class="text-end">Total Viático (USD)</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(tramo, idx) in store.tramos" :key="idx">
            <td>
              <v-chip size="small" color="primary" variant="tonal" class="mr-1">{{ tramo.orden }}</v-chip>
              {{ tramo.origen }} → {{ tramo.destino }}
            </td>
            <td>
              <v-text-field v-model.number="tramo.diasViajeTramo" type="number" min="0" density="compact" variant="outlined" hide-details @update:model-value="recalcular" />
            </td>
            <td>
              <v-text-field v-model.number="tramo.viaticoDiarioTramo" type="number" min="0" step="0.01" density="compact" variant="outlined" hide-details prefix="$" @update:model-value="recalcular" />
            </td>
            <td class="text-end font-weight-medium">
              ${{ ((tramo.diasViajeTramo || 0) * (tramo.viaticoDiarioTramo || 0)).toFixed(2) }}
            </td>
          </tr>
        </tbody>
        <tfoot>
          <tr class="bg-primary-lighten-5">
            <td class="font-weight-bold">TOTAL</td>
            <td class="text-center font-weight-bold">{{ totalDias }}</td>
            <td></td>
            <td class="text-end font-weight-bold text-primary">${{ store.pago.totalViaticoEscoltaUsd.toFixed(2) }}</td>
          </tr>
        </tfoot>
      </v-table>

      <!-- Tasa de cambio -->
      <v-row>
        <v-col cols="12" md="6">
          <v-text-field
            v-model.number="store.pago.tasaDolar"
            label="Tasa Dólar (Bs/USD)"
            type="number"
            @update:model-value="onTasaManual"
            :hint="hintDolar"
            persistent-hint
          >
            <template #append-inner>
              <v-tooltip text="Refrescar tasa desde dolarapi.com">
                <template #activator="{ props }">
                  <v-icon v-bind="props" icon="mdi-refresh" size="small" class="cursor-pointer" @click="refrescarTasa" />
                </template>
              </v-tooltip>
            </template>
          </v-text-field>
        </v-col>
      </v-row>

      <!-- Desglose final (sin peajes — no aplican para escolta) -->
      <v-card variant="tonal" color="primary" class="pa-4 mb-2 mt-2">
        <v-row dense align="center">
          <v-col cols="12" md="6">
            <div class="text-caption text-medium-emphasis">Total Viático</div>
            <div class="text-subtitle-1 font-weight-medium">
              ${{ store.pago.totalViaticoEscoltaUsd.toFixed(2) }}
              <span class="text-caption text-medium-emphasis">USD</span>
            </div>
            <div class="text-body-2">
              <span class="text-caption text-medium-emphasis">Tasa × {{ store.pago.tasaDolar.toFixed(4) }}</span>
            </div>
          </v-col>
          <v-col cols="12" md="6" class="text-md-end">
            <div class="text-caption text-medium-emphasis">TOTAL A PAGAR</div>
            <div class="text-h5 font-weight-bold text-primary">
              Bs {{ totalViaticoBs.toFixed(2) }}
            </div>
          </v-col>
        </v-row>
      </v-card>

      <!-- ── Moneda para envío al sistema central de Compras ── -->
      <v-card class="mt-4 pa-4" variant="tonal" color="info">
        <h4 class="text-subtitle-2 mb-2">
          <v-icon start icon="mdi-cash-multiple" />
          Moneda de la solicitud de compra
        </h4>
        <p class="text-caption mb-3">
          La solicitud se enviará al sistema central de Compras en la moneda
          que selecciones.
        </p>
        <v-radio-group v-model="store.monedaCompraExterna" inline density="compact" hide-details>
          <v-radio label="USD (Dólares)" value="USD" />
          <v-radio label="VES (Bolívares)" value="VES" />
        </v-radio-group>
      </v-card>

      <!-- Error -->
      <v-alert v-if="store.error" type="error" variant="tonal" class="mt-4" closable @click:close="store.error = ''">{{ store.error }}</v-alert>

      <v-row class="mt-4">
        <v-col><v-btn variant="outlined" @click="$router.back()"><v-icon start icon="mdi-arrow-left" /> Anterior</v-btn></v-col>
        <v-col cols="auto"><v-btn color="primary" size="large" prepend-icon="mdi-send" :loading="store.submitting" @click="enviar">Enviar Solicitud</v-btn></v-col>
      </v-row>
    </v-card>

    <v-snackbar v-model="showSuccess" color="success" timeout="4000">
      Viático Escolta creado exitosamente
    </v-snackbar>
  </div>
</template>
<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useEscoltaStore } from '@/stores/escoltaStore'
import { useCatalogosStore } from '@/stores/catalogosStore'
import { consultasService } from '@/services/consultasService'

const router = useRouter()
const store = useEscoltaStore()
const catalogos = useCatalogosStore()
const showSuccess = ref(false)

const totalDias = computed(() =>
  store.tramos.reduce((s, t) => s + (t.diasViajeTramo || 0), 0)
)
// Total viático USD convertido a Bs con la tasa actual.
// Los viáticos de escolta NO incluyen peajes — solo viático × días × tasa.
const totalViaticoBs = computed(() =>
  (store.pago.totalViaticoEscoltaUsd || 0) * (store.pago.tasaDolar || 0)
)

const hintDolar = computed(() => {
  if (catalogos.dolarFuente === 'dolarapi') {
    const fecha = catalogos.dolarFechaActualizacion
      ? ` (${new Date(catalogos.dolarFechaActualizacion).toLocaleDateString('es-VE')})`
      : ''
    return `Fuente: BCV / dolarapi.com${fecha}`
  }
  if (catalogos.dolarFuente === 'api_interno') return 'Fuente: API interno'
  if (catalogos.dolarFuente === 'manual') return 'Ingrese la tasa manualmente'
  return ''
})

function recalcular() {
  store.calcularPago()
}

const onTasaManual = () => {
  catalogos.dolarFuente = 'manual'
  recalcular()
}

const refrescarTasa = async () => {
  await catalogos.recargarDolar()
  if (catalogos.dolar.dolarValue > 0) {
    store.pago.tasaDolar = catalogos.dolar.dolarValue
    recalcular()
  }
}

onMounted(async () => {
  // Asegurar catálogos cargados (destinos, peajes, dolar).
  if (!catalogos.loaded && !catalogos.loading) {
    await catalogos.cargar()
  }
  // Tasa por defecto
  if (store.pago.tasaDolar === 0 && catalogos.dolar.dolarValue > 0) {
    store.pago.tasaDolar = catalogos.dolar.dolarValue
  }
  // Si la tasa sigue en 0, intentar cargar desde dolarapi
  if (store.pago.tasaDolar === 0) {
    await catalogos.recargarDolar()
    if (catalogos.dolar.dolarValue > 0) {
      store.pago.tasaDolar = catalogos.dolar.dolarValue
    }
  }

  // Auto-cargar SOLO el viático diario por tramo desde el catálogo.
  // Los viáticos de escolta no usan peajes — por eso no leemos cant_peajes
  // ni monto_peaje. Forzamos peajes en 0 para que la suma quede limpia.
  const primeraPlaca = store.vehiculos[0]?.nroPlaca || ''
  const veh = primeraPlaca ? catalogos.getVehiculoByPlaca(primeraPlaca) : undefined
  const tipoVeh = veh?.typeCar || 'Gandola'

  for (const tramo of store.tramos) {
    // Saneo defensivo: aunque alguien haya colado peajes desde otro paso,
    // aquí no aplican.
    tramo.cantPeajes = 0
    tramo.montoPeaje = 0
    tramo.totalPeajes = 0

    if (!tramo.destino || !tramo.origen) continue
    if (tramo.viaticoDiarioTramo > 0) continue

    let cargado = false
    try {
      const peaje = await consultasService.getPeajesDetallado(
        tramo.destino, tipoVeh, tramo.origen,
      )
      if (peaje && peaje.viaticoDiario) {
        tramo.viaticoDiarioTramo = peaje.viaticoDiario
        cargado = true
      }
    } catch { /* sin viático registrado, cae al fallback */ }

    // Fallback: catálogo de destinos.
    if (!cargado) {
      const dest = catalogos.destinos.find(d => d.nameDestination === tramo.destino)
      if (dest?.viaticoDiario) tramo.viaticoDiarioTramo = dest.viaticoDiario
    }
  }
  recalcular()
})

// Si el catálogo carga la tasa después del mount, actualizar
watch(
  () => catalogos.dolar.dolarValue,
  (val) => {
    if (val > 0 && store.pago.tasaDolar === 0) {
      store.pago.tasaDolar = val
      recalcular()
    }
  },
)

const enviar = async () => {
  try {
    await store.submit()
    showSuccess.value = true
    setTimeout(() => {
      store.reset()
      router.push('/formulario-escoltas')
    }, 2000)
  } catch { /* error en store.error */ }
}
</script>
