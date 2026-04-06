<template>
  <div>
    <v-row align="center" class="mb-4">
      <v-col>
        <h2 class="text-h5">Viáticos y Peajes</h2>
        <p class="text-body-2 text-grey">Listado de solicitudes de viáticos</p>
      </v-col>
      <v-col cols="auto">
        <v-btn color="primary" prepend-icon="mdi-plus" @click="$router.push('/formulario-viatico/inicio-viatico')">
          Nuevo Viático
        </v-btn>
      </v-col>
    </v-row>

    <v-card>
      <v-data-table
        :headers="headers"
        :items="viaticos"
        :loading="loading"
        hover
      >
        <template #item.actions="{ item }">
          <v-btn icon="mdi-file-pdf-box" variant="text" color="error" size="small" @click="descargarPdf(item.nroSolicitud)" />
        </template>
      </v-data-table>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { viaticosService } from '@/services/viaticosService'
import type { CabeceraViaticoInterface } from '@/interfaces'

const viaticos = ref<CabeceraViaticoInterface[]>([])
const loading = ref(false)

const headers = [
  { title: '#', key: 'nroSolicitud', width: '80px' },
  { title: 'Solicitante', key: 'nombreSolicitante' },
  { title: 'Salida', key: 'lugarSalida' },
  { title: 'Destino', key: 'lugarDestino' },
  { title: 'Días', key: 'diasDeViaje', width: '80px' },
  { title: 'Fecha', key: 'fechaSolicitud' },
  { title: 'Acciones', key: 'actions', sortable: false, width: '100px' },
]

onMounted(async () => {
  loading.value = true
  try {
    viaticos.value = await viaticosService.getViaticos()
  } finally {
    loading.value = false
  }
})

const descargarPdf = (id: number) => viaticosService.getPdf(id)
</script>
