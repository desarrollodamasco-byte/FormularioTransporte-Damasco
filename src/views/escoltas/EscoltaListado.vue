<template>
  <div>
    <v-row align="center" class="mb-4">
      <v-col>
        <h2 class="text-h5">Viáticos (Escoltas)</h2>
        <p class="text-body-2 text-grey">Solicitudes de viáticos para escoltas</p>
      </v-col>
      <v-col cols="auto">
        <v-btn color="primary" prepend-icon="mdi-plus" @click="$router.push('/formulario-escoltas/inicio-viatico-escolta')">
          Nuevo Viático Escolta
        </v-btn>
      </v-col>
    </v-row>

    <v-card>
      <v-data-table :headers="headers" :items="escoltas" :loading="loading" hover>
        <template #item.ruta="{ item }">
          <div class="d-flex align-center ga-2 flex-wrap">
            <span>{{ rutaCompleta(item) }}</span>
            <v-chip
              v-if="(item.tramos?.length ?? 0) > 1"
              size="x-small"
              color="primary"
              variant="tonal"
              prepend-icon="mdi-map-marker-path"
            >
              {{ item.tramos!.length }} tramos
            </v-chip>
          </div>
        </template>
        <template #item.actions="{ item }">
          <v-btn v-if="item.editable" icon="mdi-pencil" variant="text" color="primary" size="small" @click="abrirEditar(item)" />
          <v-btn icon="mdi-file-pdf-box" variant="text" color="error" size="small" @click="descargarPdf(item.nroSolicitud)" />
        </template>
      </v-data-table>
    </v-card>

    <!-- Diálogo de Edición -->
    <v-dialog v-model="dialogEditar" max-width="600" persistent>
      <v-card>
        <v-card-title class="text-h6">Editar Escolta #{{ editItem.nroSolicitud }}</v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field v-model="editItem.nombreSolicitante" label="Solicitante" />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field v-model="editItem.cedulaEscolta" label="Cédula Escolta" />
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
import { escoltasService } from '@/services/escoltasService'

const escoltas = ref<any[]>([])
const loading = ref(false)

const headers = [
  { title: '#', key: 'nroSolicitud', width: '80px' },
  { title: 'Ref.', key: 'referencia', width: '120px' },
  { title: 'Solicitante', key: 'nombreSolicitante' },
  { title: 'Cédula Escolta', key: 'cedulaEscolta' },
  { title: 'Ruta', key: 'ruta', sortable: false, minWidth: '240px' },
  { title: 'Fecha', key: 'fechaSolicitud' },
  { title: 'Acciones', key: 'actions', sortable: false, width: '130px' },
]

function rutaCompleta(item: any): string {
  const tramos = item.tramos ?? []
  if (tramos.length > 0) {
    const sorted = [...tramos].sort((a: any, b: any) => a.orden - b.orden)
    const puntos = [sorted[0].origen]
    for (const t of sorted) {
      if (t.destino && t.destino !== puntos[puntos.length - 1]) puntos.push(t.destino)
    }
    return puntos.filter(Boolean).join(' → ')
  }
  return '—'
}

onMounted(async () => {
  loading.value = true
  try { escoltas.value = await escoltasService.getViaticosEscoltas() }
  finally { loading.value = false }
})

const descargarPdf = (id: number) => escoltasService.getPdf(id)

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
    await escoltasService.editEscolta(editItem.value.nroSolicitud, {
      nombreSolicitante: editItem.value.nombreSolicitante,
      cedulaEscolta: editItem.value.cedulaEscolta,
      observaciones: editItem.value.observaciones,
    })
    dialogEditar.value = false
    successMsg.value = 'Escolta actualizada'
    showSuccess.value = true
    escoltas.value = await escoltasService.getViaticosEscoltas()
  } catch (e: any) {
    alert(e?.response?.data?.error || 'Error al guardar')
  } finally {
    saving.value = false
  }
}
</script>
