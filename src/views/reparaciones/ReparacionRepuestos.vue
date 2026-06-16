<template>
  <div>
    <h2 class="text-h5 mb-4">{{ tituloPagina }}</h2>
    <v-card class="pa-6">
      <v-alert type="info" variant="tonal" class="mb-4">Agregue los {{ etiquetaPlural.toLowerCase() }} requeridos.</v-alert>

      <!-- Botón agregar -->
      <v-btn color="success" prepend-icon="mdi-plus" class="mb-4" @click="store.addRepuesto()">Agregar {{ etiquetaSingular }}</v-btn>

      <v-form ref="form">
      <!-- Tabla dinámica de repuestos -->
      <v-table v-if="store.repuestos.length" density="compact">
        <thead>
          <tr>
            <th>Descripción</th>
            <th width="90">Cant.</th>
            <th width="120">Precio {{ monedaActiva }}</th>
            <th width="120">Precio Bs</th>
            <th width="120">Total {{ monedaActiva }}</th>
            <th width="120">Total Bs</th>
            <th width="50"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(rep, idx) in store.repuestos" :key="idx">
            <td>
              <v-text-field
                v-model="rep.reqCarParts"
                density="compact"
                variant="plain"
                hide-details="auto"
                placeholder="Descripción del repuesto"
                :rules="[v => !!(v || '').trim() || 'Requerido']"
              />
            </td>
            <td>
              <v-text-field v-model="rep.quantityPartsCar" density="compact" variant="plain" hide-details type="number" @update:model-value="recalcular(idx)" />
            </td>
            <td>
              <v-text-field
                :model-value="rep.priceUsd"
                density="compact"
                variant="plain"
                hide-details
                type="number"
                step="0.01"
                @update:model-value="(v) => onUsdInput(idx, v)"
              />
            </td>
            <td>
              <v-text-field
                :model-value="rep.priceBs"
                density="compact"
                variant="plain"
                hide-details
                type="number"
                step="0.01"
                @update:model-value="(v) => onBsInput(idx, v)"
              />
            </td>
            <td class="font-weight-medium">{{ rep.totPriceUsd.toFixed(2) }}</td>
            <td class="font-weight-medium">{{ rep.totPriceBs.toFixed(2) }}</td>
            <td>
              <v-btn icon="mdi-delete" variant="text" color="error" size="x-small" @click="store.removeRepuesto(idx)" />
            </td>
          </tr>
        </tbody>
        <tfoot>
          <tr class="font-weight-bold">
            <td colspan="4" class="text-right">TOTALES:</td>
            <td>{{ store.totalRepuestosUsd.toFixed(2) }}</td>
            <td>{{ store.totalRepuestosBs.toFixed(2) }}</td>
            <td></td>
          </tr>
        </tfoot>
      </v-table>

      <v-alert v-if="store.repuestos.length === 0" type="warning" variant="tonal" class="mb-4">
        No hay {{ etiquetaPlural.toLowerCase() }} agregados. Presione "Agregar {{ etiquetaSingular }}" para comenzar.
      </v-alert>

      <!-- Moneda + Tasa de cambio -->
      <v-row class="mt-4" align="center">
        <v-col cols="12" md="4">
          <v-select
            v-model="store.monedaCompraExterna"
            :items="monedaItems"
            label="Moneda de pago"
            density="comfortable"
            hint="Moneda base de los precios (afecta tasa Bs y la solicitud al sistema central)"
            persistent-hint
            @update:model-value="onMonedaChange"
          >
            <template #prepend-inner>
              <v-icon :icon="store.monedaCompraExterna === 'EUR' ? 'mdi-currency-eur' : 'mdi-currency-usd'" />
            </template>
          </v-select>
        </v-col>
        <v-col cols="12" md="4">
          <v-text-field
            v-model.number="tipoCambio"
            :label="labelTasa"
            type="number"
            @update:model-value="onTasaManual"
            :hint="hintTasa"
            persistent-hint
          >
            <template #append-inner>
              <v-tooltip :text="`Refrescar tasa de ${monedaActiva} desde dolarapi.com`">
                <template #activator="{ props }">
                  <v-icon v-bind="props" icon="mdi-refresh" size="small" class="cursor-pointer" @click="refrescarTasa" />
                </template>
              </v-tooltip>
            </template>
          </v-text-field>
        </v-col>
      </v-row>

      <v-row class="mt-4">
        <v-col><v-btn variant="outlined" @click="$router.back()"><v-icon start icon="mdi-arrow-left" /> Anterior</v-btn></v-col>
        <v-col cols="auto"><v-btn color="primary" @click="siguiente" :disabled="store.repuestos.length === 0">Siguiente <v-icon end icon="mdi-arrow-right" /></v-btn></v-col>
      </v-row>
      </v-form>
    </v-card>
  </div>
</template>
<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useReparacionStore } from '@/stores/reparacionStore'
import { useCatalogosStore } from '@/stores/catalogosStore'
import type { MonedaCompra } from '@/interfaces'

const router = useRouter()
const store = useReparacionStore()
const catalogos = useCatalogosStore()
const tipoCambio = ref(0)
const form = ref()

const siguiente = async () => {
  const { valid } = await form.value.validate()
  if (valid) router.push('/formulario-reparaciones/info-pago-rep')
}

const monedaItems: { title: string; value: MonedaCompra }[] = [
  { title: 'USD — Dólares', value: 'USD' },
  { title: 'EUR — Euros', value: 'EUR' },
]

const monedaActiva = computed<MonedaCompra>(() =>
  store.monedaCompraExterna === 'EUR' ? 'EUR' : 'USD'
)

const labelTasa = computed(() => `Tasa de Cambio (Bs/${monedaActiva.value})`)

const tasaDeMonedaActiva = () =>
  monedaActiva.value === 'EUR'
    ? (catalogos.euro.dolarValue || 0)
    : (catalogos.dolar.dolarValue || 0)

const fuenteActiva = computed(() =>
  monedaActiva.value === 'EUR' ? catalogos.euroFuente : catalogos.dolarFuente
)
const fechaActiva = computed(() =>
  monedaActiva.value === 'EUR' ? catalogos.euroFechaActualizacion : catalogos.dolarFechaActualizacion
)

// Etiqueta dinámica según el tipo de solicitud (Reparación, Repuesto, Insumo)
const etiquetaSingular = computed(() => {
  const t = store.header.tipoSolicitud
  if (t === 'Insumo') return 'Insumo'
  if (t === 'Reparación') return 'Reparación'
  return 'Repuesto'
})
const etiquetaPlural = computed(() => {
  const t = store.header.tipoSolicitud
  if (t === 'Insumo') return 'Insumos'
  if (t === 'Reparación') return 'Reparaciones'
  return 'Repuestos y Piezas'
})
const tituloPagina = computed(() => etiquetaPlural.value)

const hintTasa = computed(() => {
  if (fuenteActiva.value === 'dolarapi') {
    const fecha = fechaActiva.value
      ? ` (${new Date(fechaActiva.value).toLocaleDateString('es-VE')})`
      : ''
    return `Fuente: ${monedaActiva.value === 'EUR' ? 'BCE' : 'BCV'} / dolarapi.com${fecha}`
  }
  if (fuenteActiva.value === 'api_interno') return 'Fuente: API interno'
  if (fuenteActiva.value === 'manual') return 'Ingrese la tasa manualmente'
  return ''
})

const onTasaManual = () => {
  if (monedaActiva.value === 'EUR') catalogos.euroFuente = 'manual'
  else catalogos.dolarFuente = 'manual'
  recalcularTodos()
}

const refrescarTasa = async () => {
  if (monedaActiva.value === 'EUR') {
    await catalogos.recargarEuro()
  } else {
    await catalogos.recargarDolar()
  }
  const t = tasaDeMonedaActiva()
  if (t > 0) {
    tipoCambio.value = t
    recalcularTodos()
  }
}

/** Aplica la tasa de la moneda activa, refrescando del API si vino en 0. */
const aplicarTasaDeMonedaActiva = async () => {
  let t = tasaDeMonedaActiva()
  if (t === 0) {
    if (monedaActiva.value === 'EUR') await catalogos.recargarEuro()
    else await catalogos.recargarDolar()
    t = tasaDeMonedaActiva()
  }
  // Siempre asignamos — aunque sea 0 — para que el campo de tasa quede
  // consistente con la moneda elegida. Si quedó en 0, el usuario la
  // ingresará manualmente.
  tipoCambio.value = t
  recalcularTodos()
}

const onMonedaChange = () => { void aplicarTasaDeMonedaActiva() }

// Defensivo: si la moneda cambia desde otro lugar (ej. resumen), también
// resincronizamos la tasa y los Bs.
watch(() => store.monedaCompraExterna, () => { void aplicarTasaDeMonedaActiva() })

onMounted(() => {
  void aplicarTasaDeMonedaActiva()
  if (store.repuestos.length === 0) {
    store.addRepuesto()
  }
})

const recalcular = (idx: number) => {
  store.calcularRepuesto(idx, tipoCambio.value)
}

function parseNum(v: unknown): number {
  if (typeof v === 'number') return isFinite(v) ? v : 0
  if (typeof v === 'string') {
    const n = parseFloat(v.replace(',', '.'))
    return isFinite(n) ? n : 0
  }
  return 0
}

const onUsdInput = (idx: number, v: unknown) => {
  store.repuestos[idx].priceUsd = parseNum(v)
  store.calcularRepuesto(idx, tipoCambio.value)
}

const onBsInput = (idx: number, v: unknown) => {
  store.repuestos[idx].priceBs = parseNum(v)
  store.calcularRepuestoDesdeBs(idx, tipoCambio.value)
}

const recalcularTodos = () => {
  for (let i = 0; i < store.repuestos.length; i++) {
    store.calcularRepuesto(i, tipoCambio.value)
  }
}
</script>
