<template>
  <div>
    <h2 class="text-h5 mb-4">Información de Pago — Viático y Peajes por Tramo</h2>
    <v-card class="pa-6">
      <v-alert type="info" variant="tonal" class="mb-4">
        Paso 4 de 5 — Ruta: <strong>{{ store.rutaCompleta }}</strong>.
        Define para cada tramo los días, viático diario y peajes.
      </v-alert>

      <!-- Tabla maestra -->
      <v-table density="compact" class="mb-4">
        <thead>
          <tr>
            <th>Tramo</th>
            <th width="90" class="text-center">Días</th>
            <th width="140" class="text-end">Viático Diario (USD)</th>
            <th width="140" class="text-end">Total Viático (USD)</th>
            <th width="100" class="text-center">Cant. Peajes</th>
            <th width="140" class="text-end">Monto/Peaje (Bs)</th>
            <th width="140" class="text-end">Total Peajes (Bs)</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(tramo, idx) in store.tramos" :key="idx">
            <td>
              <v-chip size="small" color="primary" variant="tonal" class="mr-1">{{ tramo.orden }}</v-chip>
              {{ tramo.origen }} → {{ tramo.destino }}
            </td>
            <td>
              <v-text-field
                v-model.number="tramo.diasViajeTramo"
                type="number"
                min="0"
                density="compact"
                variant="outlined"
                hide-details
                @update:model-value="recalcular()"
              />
            </td>
            <td>
              <v-text-field
                v-model.number="tramo.viaticoDiarioTramo"
                type="number"
                min="0"
                step="0.01"
                density="compact"
                variant="outlined"
                hide-details
                prefix="$"
                @update:model-value="recalcular()"
              />
            </td>
            <td class="text-end font-weight-medium">
              ${{ ((tramo.diasViajeTramo || 0) * (tramo.viaticoDiarioTramo || 0)).toFixed(2) }}
            </td>
            <td>
              <v-text-field
                v-model.number="tramo.cantPeajes"
                type="number"
                min="0"
                density="compact"
                variant="outlined"
                hide-details
                @update:model-value="recalcular()"
              />
            </td>
            <td>
              <v-text-field
                v-model.number="tramo.montoPeaje"
                type="number"
                min="0"
                step="0.01"
                density="compact"
                variant="outlined"
                hide-details
                @update:model-value="recalcular()"
              />
            </td>
            <td class="text-end font-weight-medium">
              {{ (tramo.montoPeaje * tramo.cantPeajes).toFixed(2) }}
            </td>
          </tr>
        </tbody>
        <tfoot>
          <tr class="bg-primary-lighten-5">
            <td class="font-weight-bold">TOTAL</td>
            <td class="text-center font-weight-bold">{{ totalDias }}</td>
            <td></td>
            <td class="text-end font-weight-bold text-primary">${{ totalViaticoUsd.toFixed(2) }}</td>
            <td class="text-center font-weight-bold">{{ totalCantPeajes }}</td>
            <td></td>
            <td class="text-end font-weight-bold text-primary">{{ totalPeajesBs.toFixed(2) }}</td>
          </tr>
        </tfoot>
      </v-table>

      <v-alert v-if="hayTramoSinViatico" type="warning" variant="tonal" class="mb-4" density="compact">
        Hay tramos sin viático diario o días asignados. Revisa antes de continuar.
      </v-alert>

      <!-- Total general (viático en Bs + peajes en Bs) -->
      <v-card variant="tonal" color="primary" class="pa-4 mb-2">
        <v-row dense align="center">
          <v-col cols="12" md="3">
            <div class="text-caption text-medium-emphasis">Total Viático</div>
            <div class="text-subtitle-1 font-weight-medium">
              ${{ totalViaticoUsd.toFixed(2) }}
              <span class="text-caption text-medium-emphasis">USD</span>
            </div>
            <div class="text-body-2">
              Bs {{ totalViaticoBs.toFixed(2) }}
              <span class="text-caption text-medium-emphasis">(× {{ tasaCambio.toFixed(4) }})</span>
            </div>
          </v-col>
          <v-col cols="12" md="3">
            <div class="text-caption text-medium-emphasis">Total Peajes</div>
            <div class="text-subtitle-1 font-weight-medium">
              Bs {{ totalPeajesBs.toFixed(2) }}
            </div>
          </v-col>
          <v-col cols="12" md="6" class="text-md-end">
            <div class="text-caption text-medium-emphasis">TOTAL GENERAL</div>
            <div class="text-h5 font-weight-bold text-primary">
              Bs {{ totalGeneralBs.toFixed(2) }}
            </div>
          </v-col>
        </v-row>
      </v-card>

      <v-row class="mt-4">
        <v-col><v-btn variant="outlined" @click="$router.back()"><v-icon start icon="mdi-arrow-left" /> Anterior</v-btn></v-col>
        <v-col cols="auto"><v-btn color="primary" @click="$router.push('/formulario-viatico/resumen-viatico')">Siguiente <v-icon end icon="mdi-arrow-right" /></v-btn></v-col>
      </v-row>
    </v-card>
  </div>
</template>
<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useViaticoStore } from '@/stores/viaticoStore'
import { useCatalogosStore } from '@/stores/catalogosStore'
import { consultasService } from '@/services/consultasService'

const store = useViaticoStore()
const catalogos = useCatalogosStore()

const totalDias = computed(() =>
  store.tramos.reduce((s, t) => s + (t.diasViajeTramo || 0), 0)
)
const totalViaticoUsd = computed(() =>
  store.tramos.reduce((s, t) => s + (t.diasViajeTramo || 0) * (t.viaticoDiarioTramo || 0), 0)
)
const totalCantPeajes = computed(() =>
  store.tramos.reduce((s, t) => s + (t.cantPeajes || 0), 0)
)
const totalPeajesBs = computed(() =>
  store.tramos.reduce((s, t) => s + (t.cantPeajes || 0) * (t.montoPeaje || 0), 0)
)
// Tasa: usa la del store si ya fue definida, sino la del catálogo (dolarapi).
const tasaCambio = computed(() =>
  store.pago.tipoCambio || catalogos.dolar.dolarValue || 0
)
const totalViaticoBs = computed(() =>
  totalViaticoUsd.value * tasaCambio.value
)
const totalGeneralBs = computed(() =>
  totalViaticoBs.value + totalPeajesBs.value
)
const hayTramoSinViatico = computed(() =>
  store.tramos.some(t => !t.viaticoDiarioTramo || !t.diasViajeTramo)
)

function recalcular() {
  store.calcularPago()
}

onMounted(async () => {
  // Autocargar viatico_diario, peajes y monto/peaje desde el catálogo por cada tramo
  const tipoVehiculo = store.vehiculos.length > 0 ? store.vehiculos[0].typeCar : ''

  for (const tramo of store.tramos) {
    if (!tramo.destino || !tramo.origen || !tipoVehiculo) continue
    // Solo autocargar lo que esté vacío
    if (tramo.viaticoDiarioTramo > 0 && tramo.montoPeaje > 0) continue

    let cargado = false
    try {
      const peaje = await consultasService.getPeajesDetallado(
        tramo.destino, tipoVehiculo, tramo.origen,
      )
      if (peaje) {
        if (!tramo.viaticoDiarioTramo) tramo.viaticoDiarioTramo = peaje.viaticoDiario || 0
        if (!tramo.montoPeaje) tramo.montoPeaje = peaje.montoPeaje || 0
        if (!tramo.cantPeajes) tramo.cantPeajes = peaje.cantPeaje || 0
        cargado = true
      }
    } catch {
      // sigue al fallback
    }

    // Fallback: catálogo de destinos (totales redondos por tienda foránea)
    if (!cargado) {
      const dest = catalogos.destinos.find(d => d.nameDestination === tramo.destino)
      if (dest) {
        if (!tramo.viaticoDiarioTramo && dest.viaticoDiario) {
          tramo.viaticoDiarioTramo = dest.viaticoDiario
        }
        // Solo usar cant_peajes del destino si es viático de un solo tramo
        // (los totales son redondos; no aplican por segmento intermedio).
        if (store.tramos.length === 1 && !tramo.cantPeajes && dest.cantPeajes) {
          tramo.cantPeajes = dest.cantPeajes
        }
      }
    }
  }
  store.calcularPago()
})
</script>
