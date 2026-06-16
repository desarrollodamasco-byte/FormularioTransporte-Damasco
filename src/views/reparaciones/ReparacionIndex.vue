<template>
  <div>
    <v-row align="center" class="mb-4">
      <v-col><h2 class="text-h5">Solicitudes de Reparación e Insumos</h2><p class="text-body-2 text-grey">Reparaciones, repuestos e insumos de vehículos</p></v-col>
      <v-col cols="auto"><v-btn color="primary" prepend-icon="mdi-plus" @click="$router.push('/formulario-reparaciones/info-vehiculo')">Nueva Solicitud</v-btn></v-col>
    </v-row>
    <v-card>
      <v-data-table :headers="headers" :items="reparaciones" :loading="loading" hover>
        <template #item.tipoSolicitud="{ item }">
          <v-chip
            :color="item.tipoSolicitud === 'Reparación' ? 'error' : item.tipoSolicitud === 'Repuesto' ? 'warning' : 'info'"
            size="small" variant="tonal"
          >
            {{ item.tipoSolicitud || 'Reparación' }}
          </v-chip>
        </template>
        <template #item.actions="{ item }">
          <v-btn v-if="item.editable" icon="mdi-pencil" variant="text" color="primary" size="small" @click="abrirEditar(item)" />
          <v-btn icon="mdi-file-pdf-box" variant="text" color="error" size="small" @click="descargarPdf(item.reparationRequestNumber)" />
        </template>
      </v-data-table>
    </v-card>

    <!-- Diálogo de Edición -->
    <v-dialog v-model="dialogEditar" max-width="700" persistent>
      <v-card>
        <v-card-title class="text-h6">Editar Solicitud #{{ editItem.reparationRequestNumber }}</v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12" md="4">
              <v-select v-model="editItem.tipoSolicitud" :items="['Reparación', 'Repuesto', 'Insumo']" label="Tipo de Solicitud" />
            </v-col>
            <v-col cols="12" md="4">
              <v-text-field v-model="editItem.nombreSolicitante" label="Solicitante" />
            </v-col>
            <v-col cols="12" md="4">
              <v-text-field v-model="editItem.nombreoRazonSocial" label="Proveedor" />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field v-model="editItem.numeroDocumento" label="RIF / Documento" />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field v-model="editItem.description" label="Descripción breve" />
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="dialogEditar = false">Cancelar</v-btn>
          <v-btn color="primary" :loading="saving" @click="guardarEdicion">Guardar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="showSuccess" color="success" timeout="2500">✅ {{ successMsg }}</v-snackbar>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { reparacionesService } from '@/services/reparacionesService'

const reparaciones = ref<any[]>([])
const loading = ref(false)
const headers = [
  { title: '#', key: 'reparationRequestNumber', width: '80px' },
  { title: 'Tipo', key: 'tipoSolicitud', width: '130px' },
  { title: 'Solicitante', key: 'nombreSolicitante' },
  { title: 'Proveedor', key: 'nombreoRazonSocial' },
  { title: 'Documento', key: 'numeroDocumento' },
  { title: 'Fecha', key: 'fechaSolicitud' },
  { title: 'Acciones', key: 'actions', sortable: false, width: '130px' },
]

onMounted(async () => {
  loading.value = true
  try { reparaciones.value = await reparacionesService.getReparaciones() }
  finally { loading.value = false }
})

const descargarPdf = (id: number) => reparacionesService.getPdf(id)

// ── Edición 24h ──
const dialogEditar = ref(false)
const saving = ref(false)
const showSuccess = ref(false)
const successMsg = ref('')
const editItem = ref<any>({})

const abrirEditar = (item: any) => {
  editItem.value = { ...item }
  dialogEditar.value = true
}

const guardarEdicion = async () => {
  saving.value = true
  try {
    await reparacionesService.editReparacion(editItem.value.reparationRequestNumber, {
      headerReparation: {
        nombreSolicitante: editItem.value.nombreSolicitante,
        nombreoRazonSocial: editItem.value.nombreoRazonSocial,
        numeroDocumento: editItem.value.numeroDocumento,
        description: editItem.value.description,
        tipoSolicitud: editItem.value.tipoSolicitud,
      },
      infoPayment: {},
    })
    dialogEditar.value = false
    successMsg.value = 'Solicitud actualizada'
    showSuccess.value = true
    // Refrescar lista
    reparaciones.value = await reparacionesService.getReparaciones()
  } catch (e: any) {
    alert(e?.response?.data?.error || 'Error al guardar')
  } finally {
    saving.value = false
  }
}
</script>
