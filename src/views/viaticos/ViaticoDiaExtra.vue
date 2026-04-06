<template>
  <div>
    <h2 class="text-h5 mb-4">Día Extra (Opcional)</h2>
    <v-card class="pa-6">
      <v-alert type="info" variant="tonal" class="mb-4">Paso 6 de 7 — Si aplica, complete la información del día extra.</v-alert>
      <v-row>
        <v-col cols="12" md="6">
          <v-select v-model="tipoDiaExtra" :items="diasExtras" item-title="diaExtraTipo" item-value="diaExtraTipo" label="Tipo de Día Extra" @update:model-value="onTipoChange" />
        </v-col>
        <v-col cols="12" md="6"><v-text-field v-model.number="montoDiaExtra" label="Monto Viático Extra (USD)" type="number" readonly /></v-col>
        <v-col cols="12" md="4"><v-text-field v-model.number="cantDiasExtra" label="Cantidad de Días Extra" type="number" /></v-col>
      </v-row>
      <v-row class="mt-4">
        <v-col><v-btn variant="outlined" @click="$router.back()"><v-icon start icon="mdi-arrow-left" /> Anterior</v-btn></v-col>
        <v-col cols="auto"><v-btn color="primary" @click="$router.push('/formulario-viatico/resumen-viatico')">Siguiente <v-icon end icon="mdi-arrow-right" /></v-btn></v-col>
      </v-row>
    </v-card>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { consultasService } from '@/services/consultasService'
import type { DiaExtra } from '@/interfaces'
const diasExtras = ref<DiaExtra[]>([])
const tipoDiaExtra = ref('')
const montoDiaExtra = ref(0)
const cantDiasExtra = ref(0)
onMounted(async () => { diasExtras.value = await consultasService.getDiasExtras() })
const onTipoChange = (tipo: string) => {
  const found = diasExtras.value.find(d => d.diaExtraTipo === tipo)
  montoDiaExtra.value = found?.viaticoMonto ?? 0
}
</script>
