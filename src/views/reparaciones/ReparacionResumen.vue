<template>
  <div>
    <v-row align="center" class="mb-4">
      <v-col>
        <h2 class="text-h5">Resumen de {{ tipoLabel }}</h2>
      </v-col>
      <v-col cols="auto">
        <v-chip :color="tipoColor" size="large" variant="tonal">
          <v-icon start :icon="tipoIcon" /> {{ store.header.tipoSolicitud }}
        </v-chip>
      </v-col>
    </v-row>
    <v-card class="pa-6">
      <v-alert type="success" variant="tonal" class="mb-4">Revise y envíe la solicitud de {{ tipoLabel.toLowerCase() }}.</v-alert>

      <!-- Header -->
      <h3 class="text-subtitle-1 font-weight-bold mb-2">Datos del Proveedor</h3>
      <v-table density="compact" class="mb-4">
        <tbody>
          <tr><td class="font-weight-medium" width="200">Tipo de Solicitud</td><td>
            <v-chip :color="tipoColor" size="small" variant="tonal">{{ store.header.tipoSolicitud }}</v-chip>
          </td></tr>
          <tr><td class="font-weight-medium">Solicitante</td><td>{{ store.header.nombreSolicitante }}</td></tr>
          <tr><td class="font-weight-medium">Fecha</td><td>{{ store.header.fechaSolicitud }}</td></tr>
          <tr><td class="font-weight-medium">Proveedor</td><td>{{ store.header.nombreoRazonSocial }}</td></tr>
          <tr><td class="font-weight-medium">Documento</td><td>{{ store.header.numeroDocumento }}</td></tr>
          <tr v-if="store.header.description"><td class="font-weight-medium">Descripción</td><td>{{ store.header.description }}</td></tr>
        </tbody>
      </v-table>

      <!-- Vehículo -->
      <h3 class="text-subtitle-1 font-weight-bold mb-2">Vehículo</h3>
      <v-table density="compact" class="mb-4">
        <tbody>
          <tr><td class="font-weight-medium" width="200">Placa</td><td>{{ store.vehiculo.plateNumber }}</td></tr>
          <tr><td class="font-weight-medium">Marca / Modelo</td><td>{{ store.vehiculo.carBrand }} {{ store.vehiculo.carModel }}</td></tr>
          <tr><td class="font-weight-medium">Tipo</td><td>{{ store.vehiculo.typeCar }}</td></tr>
        </tbody>
      </v-table>

      <!-- Repuestos -->
      <h3 class="text-subtitle-1 font-weight-bold mb-2">{{ itemsLabel }} ({{ store.repuestos.length }})</h3>
      <v-table density="compact" class="mb-4">
        <thead><tr><th>Descripción</th><th>Cant.</th><th>{{ monedaItem }}</th><th>Bs</th><th>Total {{ monedaItem }}</th><th>Total Bs</th></tr></thead>
        <tbody>
          <tr v-for="(r, i) in store.repuestos" :key="i">
            <td>
              <span v-if="r.reqCarParts">{{ r.reqCarParts }}</span>
              <span v-else class="text-error font-italic">— Sin descripción —</span>
            </td>
            <td>{{ r.quantityPartsCar }}</td>
            <td>{{ r.priceUsd.toFixed(2) }}</td><td>{{ r.priceBs.toFixed(2) }}</td>
            <td>{{ r.totPriceUsd.toFixed(2) }}</td><td>{{ r.totPriceBs.toFixed(2) }}</td>
          </tr>
        </tbody>
        <tfoot>
          <tr class="font-weight-bold">
            <td colspan="4" class="text-right">TOTALES:</td>
            <td>{{ store.totalRepuestosUsd.toFixed(2) }}</td>
            <td>{{ store.totalRepuestosBs.toFixed(2) }}</td>
          </tr>
        </tfoot>
      </v-table>

      <v-alert
        v-if="hayRepuestosSinDescripcion"
        type="warning"
        variant="tonal"
        density="compact"
        class="mb-4"
      >
        Uno o más {{ itemsLabel.toLowerCase() }} no tienen descripción.
        Vuelve al paso anterior y complétala antes de enviar.
      </v-alert>

      <!-- Pago -->
      <h3 class="text-subtitle-1 font-weight-bold mb-2">Datos de Pago</h3>
      <v-table density="compact" class="mb-4">
        <tbody>
          <tr><td class="font-weight-medium" width="200">Beneficiario</td><td>{{ store.payment.nombreBeneficiario }}</td></tr>
          <tr><td class="font-weight-medium">Banco</td><td>{{ store.payment.banco }}</td></tr>
          <tr><td class="font-weight-medium">Cuenta</td><td>{{ store.payment.nroCuenta }}</td></tr>
          <tr><td class="font-weight-medium">Teléfono</td><td>{{ store.payment.telefonoPago }}</td></tr>
        </tbody>
      </v-table>

      <!-- ── Archivo adjunto opcional ── -->
      <v-card class="mt-4 mb-4 pa-4 archivo-adjunto-card" variant="outlined">
        <h4 class="text-subtitle-1 font-weight-bold mb-2 d-flex align-center">
          <v-icon start icon="mdi-paperclip" color="primary" />
          Adjuntar archivo (opcional)
        </h4>
        <p class="text-body-2 text-medium-emphasis mb-3">
          Cotización, factura o foto del repuesto. Se compartirá con el
          sistema central de Compras (link público). Formatos: PDF, JPG, PNG. Máx 10MB.
        </p>
        <v-file-input
          v-model="archivoLocal"
          accept="application/pdf,image/jpeg,image/png"
          label="Selecciona un archivo"
          prepend-icon="mdi-file-document-outline"
          variant="outlined"
          density="comfortable"
          show-size
          clearable
          :error-messages="archivoError"
          hide-details="auto"
          @update:model-value="onArchivoSeleccionado"
        />
      </v-card>

      <!-- ── Moneda para envío al sistema central de Compras ── -->
      <v-card class="mt-4 mb-4 pa-4" variant="tonal" color="info">
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
          <v-radio label="EUR (Euros)" value="EUR" />
          <v-radio label="VES (Bolívares)" value="VES" />
        </v-radio-group>
      </v-card>

      <!-- Error -->
      <v-alert v-if="store.error" type="error" variant="tonal" class="mb-4" closable @click:close="store.error = ''">{{ store.error }}</v-alert>

      <v-row class="mt-4">
        <v-col><v-btn variant="outlined" @click="$router.back()"><v-icon start icon="mdi-arrow-left" /> Anterior</v-btn></v-col>
        <v-col cols="auto"><v-btn color="primary" size="large" prepend-icon="mdi-send" :loading="store.submitting" @click="enviar">Enviar Solicitud</v-btn></v-col>
      </v-row>
    </v-card>

    <v-snackbar v-model="showSuccess" color="success" timeout="4000">
      ✅ {{ tipoLabel }} creada exitosamente
    </v-snackbar>
  </div>
</template>
<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useReparacionStore } from '@/stores/reparacionStore'

const router = useRouter()
const store = useReparacionStore()
const showSuccess = ref(false)

// ── Archivo adjunto opcional ──
const archivoLocal = ref<File | null>(null)
const archivoError = ref('')
const MAX_BYTES = 10 * 1024 * 1024
const TIPOS_OK = ['application/pdf', 'image/jpeg', 'image/png']

const onArchivoSeleccionado = (file: File | File[] | null) => {
  archivoError.value = ''
  // Vuetify devuelve File | File[] | null según versión; normalizamos.
  const f = Array.isArray(file) ? file[0] : file
  if (!f) {
    store.archivoAdjunto = null
    return
  }
  if (!TIPOS_OK.includes(f.type)) {
    archivoError.value = `Tipo no permitido (${f.type || 'desconocido'}). Solo PDF, JPG, PNG.`
    archivoLocal.value = null
    store.archivoAdjunto = null
    return
  }
  if (f.size > MAX_BYTES) {
    archivoError.value = `Archivo excede 10MB (${Math.round(f.size / 1024)} KB).`
    archivoLocal.value = null
    store.archivoAdjunto = null
    return
  }
  store.archivoAdjunto = f
}

const tipo = computed(() => store.header.tipoSolicitud || 'Reparación')

const tipoLabel = computed(() => {
  if (tipo.value === 'Repuesto') return 'Solicitud de Repuesto'
  if (tipo.value === 'Insumo') return 'Solicitud de Insumo'
  return 'Solicitud de Reparación'
})

const tipoColor = computed(() => {
  if (tipo.value === 'Repuesto') return 'warning'
  if (tipo.value === 'Insumo') return 'info'
  return 'error'
})

const tipoIcon = computed(() => {
  if (tipo.value === 'Repuesto') return 'mdi-cog-outline'
  if (tipo.value === 'Insumo') return 'mdi-package-variant-closed'
  return 'mdi-wrench-outline'
})

const itemsLabel = computed(() => {
  if (tipo.value === 'Repuesto') return 'Repuestos'
  if (tipo.value === 'Insumo') return 'Insumos'
  return 'Repuestos / Partes'
})

const monedaItem = computed(() => store.monedaCompraExterna === 'EUR' ? 'EUR' : 'USD')

const hayRepuestosSinDescripcion = computed(() =>
  store.repuestos.some(r => !(r.reqCarParts || '').trim())
)

const enviar = async () => {
  try {
    await store.submit()
    showSuccess.value = true
    setTimeout(() => {
      store.reset()
      router.push('/formulario-reparaciones')
    }, 2000)
  } catch { /* error shown via store.error */ }
}
</script>
