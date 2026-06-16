<template>
  <div>
    <h2 class="text-h5 mb-4">Resumen del Viático</h2>
    <v-card class="pa-6">
      <v-alert :type="store.editMode ? 'warning' : 'success'" variant="tonal" class="mb-4">
        {{ store.editMode ? `Editando Viático #${store.editingId} — Revise y actualice.` : 'Paso 5 de 5 — Revise totales, ajuste tasa y envíe la solicitud.' }}
      </v-alert>

      <!-- Cabecera -->
      <h3 class="text-subtitle-1 font-weight-bold mb-2">Datos del Viaje</h3>
      <v-table density="compact" class="mb-4">
        <tbody>
          <tr><td class="font-weight-medium" width="200">Solicitante</td><td>{{ store.header.nombreSolicitante }}</td></tr>
          <tr><td class="font-weight-medium">Fecha Solicitud</td><td>{{ store.header.fechaSolicitud }}</td></tr>
          <tr>
            <td class="font-weight-medium">Ruta</td>
            <td>{{ store.rutaCompleta }}</td>
          </tr>
          <tr><td class="font-weight-medium">Salida / Retorno</td><td>{{ store.header.fechaSalida }} — {{ store.header.fechaRetorno }}</td></tr>
          <tr><td class="font-weight-medium">Días de Viaje</td><td>{{ store.header.diasDeViaje }}</td></tr>
          <tr><td class="font-weight-medium">Escoltado</td><td>{{ store.header.viajaEscoltado ? 'Sí' : 'No' }}</td></tr>
          <tr v-if="store.header.observaciones"><td class="font-weight-medium">Observaciones</td><td>{{ store.header.observaciones }}</td></tr>
        </tbody>
      </v-table>

      <!-- Tramos: viático y peajes -->
      <h3 class="text-subtitle-1 font-weight-bold mb-2">Tramos ({{ store.tramos.length }})</h3>
      <v-table density="compact" class="mb-4">
        <thead>
          <tr>
            <th>#</th>
            <th>Salida</th>
            <th>Destino</th>
            <th>Días</th>
            <th>Cant. Peajes</th>
            <th class="text-end">Viático Diario</th>
            <th class="text-end">Total Viático</th>
            <th class="text-end">Total Peajes (Bs)</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="t in store.tramos" :key="t.orden">
            <td><v-chip size="x-small" color="primary" variant="tonal">{{ t.orden }}</v-chip></td>
            <td>{{ t.origen }}</td>
            <td>{{ t.destino }}</td>
            <td>{{ t.diasViajeTramo }}</td>
            <td>{{ t.cantPeajes }}</td>
            <td class="text-end">${{ t.viaticoDiarioTramo.toFixed(2) }}</td>
            <td class="text-end">${{ ((t.diasViajeTramo || 0) * (t.viaticoDiarioTramo || 0)).toFixed(2) }}</td>
            <td class="text-end">{{ (t.montoPeaje * t.cantPeajes).toFixed(2) }}</td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td colspan="3" class="font-weight-bold">Total</td>
            <td class="font-weight-bold">{{ store.header.diasDeViaje }}</td>
            <td class="font-weight-bold">{{ store.tramos.reduce((s, t) => s + t.cantPeajes, 0) }}</td>
            <td></td>
            <td class="text-end font-weight-bold text-primary">${{ store.pago.totalViaticoUsd.toFixed(2) }}</td>
            <td class="text-end font-weight-bold text-primary">{{ store.pago.totalAsigPeajeBs.toFixed(2) }}</td>
          </tr>
        </tfoot>
      </v-table>

      <!-- Vehículos -->
      <h3 class="text-subtitle-1 font-weight-bold mb-2">Vehículos ({{ store.vehiculos.length }})</h3>
      <v-table density="compact" class="mb-4">
        <thead><tr><th>Chofer</th><th>Placa</th><th>Remolque</th><th>Precintos por tramo</th><th>2da Puerta</th><th>Factura</th></tr></thead>
        <tbody>
          <tr v-for="(v, i) in store.vehiculos" :key="i">
            <td>
              <div class="font-weight-medium">{{ v.nameDriver }}</div>
              <div class="text-caption text-grey">{{ v.idDriver }}</div>
            </td>
            <td>
              <div>{{ v.plateNumber }}</div>
              <div class="text-caption text-grey">{{ v.carBrand }} {{ v.carModel }}</div>
            </td>
            <td>
              <v-chip v-if="v.plateNumberRemolque" size="x-small" color="primary" variant="tonal" prepend-icon="mdi-truck-trailer">
                {{ v.plateNumberRemolque }}
              </v-chip>
              <span v-else class="text-grey text-body-2">—</span>
            </td>
            <td>
              <div v-if="v.precintosTramos && v.precintosTramos.length" class="d-flex flex-wrap ga-1">
                <v-chip
                  v-for="p in v.precintosTramos" :key="p.ordenTramo"
                  size="x-small" color="primary" variant="tonal"
                >
                  T{{ p.ordenTramo }}: {{ p.idPrecinto }}
                </v-chip>
              </div>
              <span v-else class="text-grey text-body-2">—</span>
            </td>
            <td>
              <v-chip v-if="v.tieneSegundaPuerta && v.idPrecintoSegundaPuerta"
                size="x-small" color="deep-purple" variant="tonal"
                prepend-icon="mdi-door-open">
                {{ v.idPrecintoSegundaPuerta }}
              </v-chip>
              <span v-else class="text-grey text-body-2">—</span>
            </td>
            <td>{{ v.invoiceTravel || '—' }}</td>
          </tr>
        </tbody>
      </v-table>

      <!-- Pago: ajustes editables + totales -->
      <h3 class="text-subtitle-1 font-weight-bold mb-2">Detalle de Pago</h3>
      <v-row>
        <v-col cols="12" md="6">
          <v-text-field
            v-model.number="store.pago.tipoCambio"
            label="Tasa de Cambio (Bs/USD)"
            type="number"
            density="compact"
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
        <v-col cols="12" md="3">
          <v-text-field
            v-model.number="store.pago.cantChoferes"
            label="Cantidad de Choferes"
            type="number"
            density="compact"
            @update:model-value="store.calcularPago()"
          />
        </v-col>
        <v-col cols="12" md="3">
          <v-text-field
            v-model.number="store.pago.cantEscoltas"
            label="Cantidad de Escoltas"
            type="number"
            density="compact"
            @update:model-value="store.calcularPago()"
          />
        </v-col>
      </v-row>
      <v-table density="compact" class="mb-4 mt-2">
        <tbody>
          <tr><td class="font-weight-medium" width="250">Viático Diario (USD)</td><td>{{ store.pago.amountViatico }}</td></tr>
          <tr><td class="font-weight-medium">Total Viático (USD)</td><td>{{ store.pago.totalViaticoUsd.toFixed(2) }}</td></tr>
          <tr><td class="font-weight-medium">Total Viático (Bs)</td><td>{{ store.pago.totalViaticoBs.toFixed(2) }}</td></tr>
          <tr><td class="font-weight-medium">Total Peajes (Bs)</td><td>{{ store.pago.totalAsigPeajeBs.toFixed(2) }}</td></tr>
          <tr><td class="font-weight-bold text-primary">Total a Pagar (Bs)</td><td class="font-weight-bold text-primary">{{ store.pago.totalApagar.toFixed(2) }}</td></tr>
        </tbody>
      </v-table>

      <!-- Extensión de Viáticos -->
      <template v-if="store.diaExtraActivo">
        <h3 class="text-subtitle-1 font-weight-bold mb-2">Extensión de Viáticos</h3>
        <v-table density="compact" class="mb-4">
          <tbody>
            <tr><td class="font-weight-medium" width="250">Tipo</td><td>{{ store.diaExtra.tipoViatico }}</td></tr>
            <tr><td class="font-weight-medium">Días de Extensión</td><td>{{ store.diaExtra.cantidadDiasExtra }}</td></tr>
            <tr><td class="font-weight-bold text-primary">Total Extra (Bs)</td><td class="font-weight-bold text-primary">{{ store.diaExtra.totalApagar.toFixed(2) }}</td></tr>
          </tbody>
        </v-table>
      </template>

      <!-- Beneficiario del Pago -->
      <v-divider class="my-4" />
      <h3 class="text-subtitle-1 font-weight-bold mb-3">Beneficiario del Pago</h3>
      <v-form ref="formBeneficiario">
        <v-row>
          <v-col cols="12">
            <v-autocomplete
              v-model="store.header.cedulaPago"
              :items="catalogos.choferes"
              :item-title="choferLabelNombre"
              item-value="cedulaChofer"
              label="Nombre del Beneficiario"
              :loading="catalogos.loading"
              @update:model-value="onBeneficiarioSelect"
              :rules="[v => !!v || 'Requerido']"
            />
          </v-col>
          <v-col cols="12" md="6">
            <v-select
              v-model="beneficiario.tipoDoc"
              :items="tipoDocOpciones"
              label="Tipo documento"
              :rules="[v => !!v || 'Requerido']"
            />
          </v-col>
          <v-col cols="12" md="6">
            <v-autocomplete
              v-model="store.header.cedulaPago"
              :items="catalogos.choferes"
              :item-title="choferLabel"
              item-value="cedulaChofer"
              label="Cédula / RIF"
              :loading="catalogos.loading"
              @update:model-value="onBeneficiarioSelect"
              :rules="[v => !!v || 'Requerido']"
            />
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field
              :model-value="beneficiario.telefono"
              label="Nro. Teléfono"
              readonly
              variant="filled"
            />
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field
              :model-value="beneficiario.cuenta"
              label="Nro. Cuenta (20 dígitos)"
              readonly
              variant="filled"
              :rules="[v => !!v || 'Requerido']"
            />
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field
              :model-value="beneficiario.banco"
              label="Banco"
              readonly
              variant="filled"
              :rules="[v => !!v || 'Requerido']"
            />
          </v-col>
        </v-row>
      </v-form>

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
      <v-alert v-if="store.error" type="error" variant="tonal" class="mt-4 mb-4" closable @click:close="store.error = ''">{{ store.error }}</v-alert>

      <v-row class="mt-4">
        <v-col><v-btn variant="outlined" @click="$router.back()"><v-icon start icon="mdi-arrow-left" /> Anterior</v-btn></v-col>
        <v-col cols="auto"><v-btn :color="store.editMode ? 'warning' : 'primary'" size="large" :prepend-icon="store.editMode ? 'mdi-content-save' : 'mdi-send'" :loading="store.submitting" @click="enviar">{{ store.editMode ? 'Actualizar Viático' : 'Enviar Solicitud' }}</v-btn></v-col>
      </v-row>
    </v-card>

    <!-- Snackbar éxito -->
    <v-snackbar v-model="showSuccess" color="success" timeout="4000">
      ✅ Viático {{ store.editMode ? 'actualizado' : 'creado' }} exitosamente (Solicitud #{{ nroCreado }})
    </v-snackbar>
  </div>
</template>
<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useViaticoStore } from '@/stores/viaticoStore'
import { useCatalogosStore } from '@/stores/catalogosStore'

const router = useRouter()
const store = useViaticoStore()
const catalogos = useCatalogosStore()
const showSuccess = ref(false)
const nroCreado = ref(0)
const formBeneficiario = ref()

// ── Tasa de cambio (heredado del paso "Estimado" ahora fusionado aquí) ──
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

const onTasaManual = () => {
  catalogos.dolarFuente = 'manual'
  store.calcularPago()
}

const refrescarTasa = async () => {
  await catalogos.recargarDolar()
  if (catalogos.dolar.dolarValue > 0) {
    store.pago.tipoCambio = catalogos.dolar.dolarValue
    store.calcularPago()
  }
}

// ─── Beneficiario del pago (autocompletado desde el catálogo de choferes) ───
const tipoDocOpciones = ['V', 'E', 'J', 'P', 'G']

const beneficiario = reactive({
  nombre: '',
  tipoDoc: 'V',
  telefono: '',
  cuenta: '',
  banco: '',
})

function autollenarBeneficiario(cedula: string) {
  const c = catalogos.getChoferByCedula(cedula)
  if (!c) {
    beneficiario.nombre = ''
    beneficiario.telefono = ''
    beneficiario.cuenta = ''
    beneficiario.banco = ''
    return
  }
  beneficiario.nombre = (c.nameChofer || '').trim()
  beneficiario.telefono = (c.telefonoChofer || '').trim()
  beneficiario.cuenta = (c.cuentaBanco || '').trim()
  beneficiario.banco = (c.banco || '').trim()
}

const onBeneficiarioSelect = (cedula: string) => {
  autollenarBeneficiario(cedula)
}

const choferLabelNombre = (c: { cedulaChofer: string; nameChofer: string }) => {
  const ced = (c.cedulaChofer || '').trim()
  const nom = (c.nameChofer || '').trim()
  return nom ? `${nom} — ${ced}` : ced
}

const choferLabel = (c: { cedulaChofer: string; nameChofer: string }) => {
  const ced = (c.cedulaChofer || '').trim()
  const nom = (c.nameChofer || '').trim()
  return nom ? `${ced} — ${nom}` : ced
}

// Modo edición o si los catálogos cargan tarde: re-autollenar cuando haya datos
watch(
  () => [store.header.cedulaPago, catalogos.choferes.length] as const,
  ([ced]) => {
    if (ced && !beneficiario.nombre) autollenarBeneficiario(ced as string)
  },
  { immediate: true },
)

onMounted(() => {
  if (store.header.cedulaPago) autollenarBeneficiario(store.header.cedulaPago)

  // Inicializaciones que antes vivían en el paso "Estimado":
  // tasa del dólar desde caché, choferes según vehículos, escoltas según selección.
  if (store.pago.tipoCambio === 0 && catalogos.dolar.dolarValue) {
    store.pago.tipoCambio = catalogos.dolar.dolarValue
  }
  if (store.pago.cantChoferes <= 1) {
    store.pago.cantChoferes = store.vehiculos.length || 1
  }
  const cedEsc = store.header.cedulasEscoltas
  if (store.header.viajaEscoltado && Array.isArray(cedEsc) && cedEsc.length > 0) {
    store.pago.cantEscoltas = cedEsc.length
  } else if (!store.header.viajaEscoltado) {
    store.pago.cantEscoltas = 0
  }
  store.calcularPago()
})

const enviar = async () => {
  // Validar el formulario del beneficiario antes de enviar
  if (formBeneficiario.value) {
    const { valid } = await formBeneficiario.value.validate()
    if (!valid) {
      store.error = 'Completa los datos del Beneficiario del Pago antes de enviar.'
      return
    }
  }
  try {
    const result = await store.submit()
    nroCreado.value = result?.nroSolicitud || result?.nro_solicitud || 0
    showSuccess.value = true
    setTimeout(() => {
      store.reset()
      router.push('/aprobaciones')
    }, 2000)
  } catch {
    // error ya se muestra en store.error
  }
}
</script>
