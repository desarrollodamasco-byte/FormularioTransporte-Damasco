<template>
  <div>
    <v-row align="center" class="mb-4">
      <v-col>
        <h2 class="text-h5">Auxilio Vial</h2>
        <p class="text-body-2 text-grey">Solicitudes de asistencia mecánica en ruta</p>
      </v-col>
      <v-col cols="auto">
        <v-btn color="primary" prepend-icon="mdi-plus" @click="$router.push('/auxilio-vial/nuevo')">
          Nuevo Auxilio Vial
        </v-btn>
      </v-col>
    </v-row>

    <v-card>
      <v-data-table :headers="headers" :items="auxilios" :loading="loading" hover>
        <template #item.viaticoPrincipalRef="{ item }">
          <v-chip v-if="item.viaticoPrincipalRef" color="primary" size="small" variant="tonal">
            {{ item.viaticoPrincipalRef }}
          </v-chip>
          <span v-else class="text-grey text-body-2">—</span>
        </template>
        <template #item.fechaSalida="{ item }">
          {{ item.fechaSalida }} → {{ item.fechaRetorno }}
        </template>
        <template #item.actions="{ item }">
          <v-btn v-if="item.editable" icon="mdi-pencil" variant="text" color="primary" size="small" @click="abrirEditar(item)" />
          <v-btn icon="mdi-file-pdf-box" variant="text" color="error" size="small" @click="descargarPdf(item.nroSolicitud)" />
        </template>
      </v-data-table>
    </v-card>

    <!-- Diálogo de Edición -->
    <v-dialog v-model="dialogEditar" max-width="800" persistent>
      <v-card>
        <v-card-title class="text-h6">Editar Auxilio Vial #{{ editItem.nroSolicitud }}</v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field v-model="editItem.nombreSolicitante" label="Solicitante" />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field v-model="editItem.nombreMecanico" label="Mecánico" />
            </v-col>
            <v-col cols="12" md="4">
              <v-text-field v-model="editItem.cedulaMecanico" label="Cédula Mecánico" />
            </v-col>
            <v-col cols="12" md="4">
              <v-text-field v-model="editItem.fechaSalida" label="Fecha Salida" type="date" />
            </v-col>
            <v-col cols="12" md="4">
              <v-text-field v-model="editItem.fechaRetorno" label="Fecha Retorno" type="date" />
            </v-col>
            <v-col cols="12" md="4">
              <v-text-field v-model="editItem.lugarSalida" label="Lugar Salida" />
            </v-col>
            <v-col cols="12" md="4">
              <v-text-field v-model="editItem.lugarDestino" label="Lugar Destino" />
            </v-col>
            <v-col cols="12" md="4">
              <v-text-field v-model.number="editItem.diasDeViaje" label="Días de Viaje" type="number" />
            </v-col>
            <v-col cols="12">
              <v-textarea v-model="editItem.descripcion" label="Descripción" rows="2" />
            </v-col>
            <v-col cols="12">
              <v-textarea v-model="editItem.observaciones" label="Observaciones" rows="2" />
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
import { auxilioVialService } from '@/services/auxilioVialService'

const auxilios = ref<any[]>([])
const loading = ref(false)

const headers = [
  { title: '#', key: 'nroSolicitud', width: '80px' },
  { title: 'Ref.', key: 'referencia', width: '110px' },
  { title: 'Viático Ppal.', key: 'viaticoPrincipalRef', width: '140px' },
  { title: 'Solicitante', key: 'nombreSolicitante' },
  { title: 'Mecánico', key: 'nombreMecanico' },
  { title: 'Fechas', key: 'fechaSalida' },
  { title: 'Destino', key: 'lugarDestino' },
  { title: 'Días', key: 'diasDeViaje', width: '80px' },
  { title: 'Acciones', key: 'actions', sortable: false, width: '130px' },
]

onMounted(async () => {
  loading.value = true
  try { auxilios.value = await auxilioVialService.getAuxilios() }
  finally { loading.value = false }
})

const descargarPdf = (id: number) => auxilioVialService.getPdf(id)

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
    await auxilioVialService.editAuxilio(editItem.value.nroSolicitud, {
      header: {
        nombreSolicitante: editItem.value.nombreSolicitante,
        nombreMecanico: editItem.value.nombreMecanico,
        cedulaMecanico: editItem.value.cedulaMecanico,
        fechaSalida: editItem.value.fechaSalida,
        fechaRetorno: editItem.value.fechaRetorno,
        lugarSalida: editItem.value.lugarSalida,
        lugarDestino: editItem.value.lugarDestino,
        diasDeViaje: editItem.value.diasDeViaje,
        descripcion: editItem.value.descripcion,
        observaciones: editItem.value.observaciones,
      },
    })
    dialogEditar.value = false
    successMsg.value = 'Auxilio Vial actualizado'
    showSuccess.value = true
    auxilios.value = await auxilioVialService.getAuxilios()
  } catch (e: any) {
    alert(e?.response?.data?.error || 'Error al guardar')
  } finally {
    saving.value = false
  }
}
</script>
