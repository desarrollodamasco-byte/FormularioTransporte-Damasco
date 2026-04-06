<template>
  <div>
    <h1 class="text-h4 mb-4">Bienvenido</h1>
    <p class="text-body-1 text-grey-darken-1">
      Sistema de gestión de formularios de transporte — Damasco
    </p>

    <v-row class="mt-6">
      <v-col cols="12" md="4" v-for="card in cards" :key="card.title">
        <v-card :to="card.route" hover class="pa-4">
          <v-card-item>
            <template #prepend>
              <v-icon :icon="card.icon" size="40" color="primary" />
            </template>
            <v-card-title>{{ card.title }}</v-card-title>
            <v-card-subtitle>{{ card.description }}</v-card-subtitle>
          </v-card-item>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
const cards = [
  {
    title: 'Viáticos y Peajes',
    description: 'Solicitar viáticos para viajes',
    icon: 'mdi-card-account-details',
    route: '/formulario-viatico',
  },
  {
    title: 'Reparaciones',
    description: 'Solicitar reparaciones de vehículos',
    icon: 'mdi-wrench',
    route: '/formulario-reparaciones',
  },
  {
    title: 'Viáticos Escoltas',
    description: 'Viáticos para personal de seguridad',
    icon: 'mdi-shield-account',
    route: '/formulario-escoltas',
  },
  {
    title: 'Auditoría',
    description: 'Reportes y análisis de gastos',
    icon: 'mdi-chart-box',
    route: '/auditoria',
  },
]
</script>
