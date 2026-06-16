<template>
  <div>
    <h2 class="text-h5 mb-4">Información de Pago — {{ store.header.tipoSolicitud || 'Reparación' }}</h2>
    <v-card class="pa-6">
      <v-alert
        v-if="store.header.nombreoRazonSocial && !beneficiarioCargado"
        type="warning"
        variant="tonal"
        density="compact"
        class="mb-4"
      >
        El proveedor <strong>{{ store.header.nombreoRazonSocial }}</strong> no se autocompletó.
        Selecciónalo del catálogo abajo para cargar sus datos de pago, o llena los campos manualmente.
      </v-alert>

      <v-form ref="form">
        <!-- Búsqueda en catálogo de proveedores: autocompleta todos los campos -->
        <v-row>
          <v-col cols="12">
            <v-autocomplete
              v-model="proveedorSeleccionado"
              :items="catalogos.proveedoresRepuesto"
              :item-title="proveedorLabel"
              item-value="cedulaRif"
              :label="`Buscar beneficiario en catálogo (${catalogos.proveedoresRepuesto.length} proveedores)`"
              prepend-inner-icon="mdi-account-search"
              :loading="catalogos.loading"
              clearable
              :hint="hintProveedor"
              persistent-hint
              @update:model-value="onProveedorSelect"
            >
              <template #append-inner>
                <v-tooltip text="Recargar catálogo de proveedores">
                  <template #activator="{ props }">
                    <v-icon
                      v-bind="props"
                      icon="mdi-refresh"
                      size="small"
                      class="cursor-pointer"
                      @click.stop="recargarCatalogos"
                    />
                  </template>
                </v-tooltip>
              </template>
            </v-autocomplete>
          </v-col>
        </v-row>

        <v-divider class="my-4" />

        <v-row>
          <v-col cols="12" md="6"><v-text-field v-model="store.payment.nombreBeneficiario" label="Nombre del Beneficiario" :rules="[v => !!v || 'Requerido']" /></v-col>
          <v-col cols="12" md="6"><v-text-field v-model="store.payment.numeroDocumento" label="Cédula / RIF del Beneficiario" /></v-col>
          <v-col cols="12" md="6">
            <v-autocomplete v-model="store.payment.banco" :items="catalogos.bancos" item-title="nameBanco" item-value="nameBanco" label="Banco" :loading="catalogos.loading" />
          </v-col>
          <v-col cols="12" md="6"><v-text-field v-model="store.payment.nroCuenta" label="Número de Cuenta" /></v-col>
          <v-col cols="12" md="6"><v-text-field v-model="store.payment.telefonoPago" label="Teléfono" /></v-col>
          <v-col cols="12"><v-textarea v-model="store.payment.observaciones" label="Observaciones" rows="2" /></v-col>
        </v-row>
        <v-row class="mt-4">
          <v-col><v-btn variant="outlined" @click="$router.back()"><v-icon start icon="mdi-arrow-left" /> Anterior</v-btn></v-col>
          <v-col cols="auto"><v-btn color="primary" @click="siguiente">Siguiente <v-icon end icon="mdi-arrow-right" /></v-btn></v-col>
        </v-row>
      </v-form>
    </v-card>
  </div>
</template>
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useReparacionStore } from '@/stores/reparacionStore'
import { useCatalogosStore } from '@/stores/catalogosStore'
import type { ProveedorTaller } from '@/interfaces'

const router = useRouter()
const store = useReparacionStore()
const catalogos = useCatalogosStore()
const form = ref()
const proveedorSeleccionado = ref<string | null>(null)

const proveedorLabel = (p: ProveedorTaller) => {
  const r = (p.razonSocial || '').trim()
  const c = (p.cedulaRif || '').trim()
  return c ? `${c} — ${r}` : r
}

/** Aplica los datos del proveedor a los campos de pago. */
const aplicarProveedor = (p: ProveedorTaller) => {
  store.payment.nombreBeneficiario = p.nombreBeneficiario || p.razonSocial || ''
  store.payment.numeroDocumento = p.cedulaRifBeneficiario || p.cedulaRif || ''
  store.payment.nroCuenta = p.nroCuenta || ''
  store.payment.banco = p.banco || ''
}

const onProveedorSelect = (cedulaRif: string | null) => {
  if (!cedulaRif) return
  const p = catalogos.proveedoresRepuesto.find(x => x.cedulaRif === cedulaRif)
  if (p) aplicarProveedor(p)
}

/** True si los campos críticos del pago ya están llenos. */
const beneficiarioCargado = computed(() =>
  !!(store.payment.nombreBeneficiario && store.payment.banco && store.payment.nroCuenta)
)

const hintProveedor = computed(() => {
  if (catalogos.loading) return 'Cargando catálogo...'
  if (catalogos.proveedoresRepuesto.length === 0) {
    return 'Catálogo vacío — usa el botón refresh ↻ para recargar'
  }
  return 'Selecciona el proveedor para autocompletar nombre, RIF, banco y cuenta'
})

/** Intenta hacer match del proveedor del header contra el catálogo. */
const matchearProveedorDesdeHeader = () => {
  if (beneficiarioCargado.value) return
  const cedula = (store.header.numeroDocumento || '').trim().toUpperCase()
  const razon = (store.header.nombreoRazonSocial || '').trim().toUpperCase()
  if (!cedula && !razon) return
  const p = catalogos.proveedoresRepuesto.find(x => {
    const rc = (x.cedulaRif || '').trim().toUpperCase()
    const rr = (x.razonSocial || '').trim().toUpperCase()
    return (cedula && rc === cedula) || (razon && rr === razon)
  })
  if (p) {
    proveedorSeleccionado.value = p.cedulaRif
    aplicarProveedor(p)
  }
}

/** Fuerza recarga del catálogo (en caso de carga fallida al iniciar). */
const recargarCatalogos = async () => {
  await catalogos.cargar(true)
  matchearProveedorDesdeHeader()
}

/** Al entrar al paso: asegura que el catálogo esté cargado y trata de
 *  autocompletar si el usuario tecleó manualmente el proveedor en el paso 1. */
onMounted(async () => {
  // cargar() es idempotente — si ya cargó, retorna sin hacer nada.
  // Si por alguna razón no se cargó (entrada directa por URL antes de que
  // MainLayout monte, error de auth en primer intento, etc.), esto lo arregla.
  if (!catalogos.loaded && !catalogos.loading) {
    await catalogos.cargar()
  }
  matchearProveedorDesdeHeader()
})

const siguiente = async () => {
  const { valid } = await form.value.validate()
  if (valid) router.push('/formulario-reparaciones/resumen-reparacion')
}
</script>
