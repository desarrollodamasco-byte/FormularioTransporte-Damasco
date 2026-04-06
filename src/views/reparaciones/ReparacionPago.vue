<template>
  <div>
    <h2 class="text-h5 mb-4">Información de Pago — Reparación</h2>
    <v-card class="pa-6">
      <v-form>
        <v-row>
          <v-col cols="12" md="6"><v-text-field v-model="nombreBeneficiario" label="Nombre del Beneficiario" /></v-col>
          <v-col cols="12" md="6"><v-text-field v-model="cedulaBeneficiario" label="Cédula del Beneficiario" /></v-col>
          <v-col cols="12" md="6">
            <v-autocomplete v-model="banco" :items="bancos" item-title="nameBanco" item-value="nameBanco" label="Banco" />
          </v-col>
          <v-col cols="12" md="6"><v-text-field v-model="nroCuenta" label="Número de Cuenta" /></v-col>
          <v-col cols="12" md="6"><v-text-field v-model="telefono" label="Teléfono" /></v-col>
          <v-col cols="12"><v-textarea v-model="observaciones" label="Observaciones" rows="2" /></v-col>
        </v-row>
        <v-row class="mt-4">
          <v-col><v-btn variant="outlined" @click="$router.back()"><v-icon start icon="mdi-arrow-left" /> Anterior</v-btn></v-col>
          <v-col cols="auto"><v-btn color="primary" @click="$router.push('/formulario-reparaciones/resumen-reparacion')">Siguiente <v-icon end icon="mdi-arrow-right" /></v-btn></v-col>
        </v-row>
      </v-form>
    </v-card>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { consultasService } from '@/services/consultasService'
import type { Banco } from '@/interfaces'
const bancos = ref<Banco[]>([])
const nombreBeneficiario = ref(''); const cedulaBeneficiario = ref('')
const banco = ref(''); const nroCuenta = ref(''); const telefono = ref(''); const observaciones = ref('')
onMounted(async () => { bancos.value = await consultasService.getBancos() })
</script>
