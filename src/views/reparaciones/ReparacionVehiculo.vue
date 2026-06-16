<template>
  <div>
    <h2 class="text-h5 mb-4">Nueva Solicitud — {{ store.header.tipoSolicitud || 'Reparación' }}</h2>
    <v-card class="pa-6">
      <v-form ref="form">
        <v-row>
          <v-col cols="12" md="4">
            <v-select
              v-model="store.header.tipoSolicitud"
              :items="['Reparación', 'Repuesto', 'Insumo']"
              label="Tipo de Solicitud"
              :rules="[v => !!v || 'Requerido']"
              prepend-inner-icon="mdi-tag-outline"
            />
          </v-col>
          <v-col cols="12" md="4"><v-text-field v-model="store.header.nombreSolicitante" label="Nombre del Solicitante" :rules="[v => !!v || 'Requerido']" /></v-col>
          <v-col cols="12" md="4"><v-text-field v-model="store.header.fechaSolicitud" label="Fecha de Solicitud" type="date" :rules="[v => !!v || 'Requerido']" /></v-col>
          <v-col cols="12" md="6">
            <v-autocomplete
              v-model="store.header.nombreoRazonSocial"
              :items="catalogos.proveedoresRepuesto"
              :item-title="proveedorLabel"
              item-value="razonSocial"
              label="Nombre o Razón Social del Proveedor"
              :loading="catalogos.loading"
              @update:model-value="onProveedorSelect"
              :rules="[v => !!v || 'Requerido']"
            />
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="store.header.numeroDocumento"
              label="RIF / Número de Documento"
              :readonly="rifBloqueado"
              :variant="rifBloqueado ? 'filled' : 'outlined'"
              :rules="[v => !!v || 'Requerido']"
            />
          </v-col>
          <v-col cols="12"><v-textarea v-model="store.header.description" label="Descripción breve" rows="2" /></v-col>
        </v-row>
        <v-divider class="my-4" />
        <h3 class="text-h6 mb-2">Vehículo</h3>
        <v-row>
          <v-col cols="12" md="4">
            <v-autocomplete v-model="store.vehiculo.plateNumber" :items="catalogos.vehiculos" item-title="plateNumber" item-value="plateNumber" label="Número de Placa" :loading="catalogos.loading" @update:model-value="onVehiculoSelect" :rules="[v => !!v || 'Requerido']" />
          </v-col>
          <v-col cols="12" md="4"><v-text-field v-model="store.vehiculo.carBrand" label="Marca" readonly /></v-col>
          <v-col cols="12" md="4"><v-text-field v-model="store.vehiculo.carModel" label="Modelo" readonly /></v-col>
          <v-col cols="12" md="6"><v-text-field v-model="store.vehiculo.carSerial" label="Serial de Carrocería" readonly /></v-col>
          <v-col cols="12" md="6"><v-text-field v-model="store.vehiculo.typeCar" label="Tipo de Vehículo" readonly /></v-col>
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
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useReparacionStore } from '@/stores/reparacionStore'
import { useCatalogosStore } from '@/stores/catalogosStore'
import type { ProveedorTaller } from '@/interfaces'

const router = useRouter()
const store = useReparacionStore()
const catalogos = useCatalogosStore()
const form = ref()

const onVehiculoSelect = (placa: string) => {
  const v = catalogos.getVehiculoByPlaca(placa)
  if (v) {
    store.vehiculo.carBrand = v.carBrand
    store.vehiculo.carModel = v.carModel
    store.vehiculo.carSerial = v.carSerial
    store.vehiculo.typeCar = v.typeCar
  }
}

// ── Proveedor: muestra "RIF — Razón Social" y autollena RIF + datos de pago ──
const proveedorLabel = (p: ProveedorTaller) => {
  const r = (p.razonSocial || '').trim()
  const c = (p.cedulaRif || '').trim()
  return c ? `${c} — ${r}` : r
}

const rifBloqueado = computed(() =>
  catalogos.proveedoresRepuesto.some(p => p.razonSocial === store.header.nombreoRazonSocial)
)

const onProveedorSelect = (razonSocial: string) => {
  const p = catalogos.proveedoresRepuesto.find(x => x.razonSocial === razonSocial)
  if (!p) return
  store.header.numeroDocumento = p.cedulaRif || ''
  // Pre-llena el paso de Pago para que el usuario no reescriba todo
  store.payment.nombreBeneficiario = p.nombreBeneficiario || p.razonSocial || ''
  store.payment.numeroDocumento = p.cedulaRifBeneficiario || p.cedulaRif || ''
  store.payment.nroCuenta = p.nroCuenta || ''
  store.payment.banco = p.banco || ''
}

const siguiente = async () => {
  const { valid } = await form.value.validate()
  if (valid) router.push('/formulario-reparaciones/info-vehiculo-rep')
}
</script>
