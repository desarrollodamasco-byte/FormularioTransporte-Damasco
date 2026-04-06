<template>
  <v-layout>
    <!-- Sidebar -->
    <v-navigation-drawer
      v-model="drawer"
      :rail="rail"
      permanent
      color="white"
      elevation="3"
    >
      <v-list-item
        class="pa-4"
        prepend-icon="mdi-truck-delivery"
        title="Transporte Damasco"
        subtitle="Formularios"
        @click="rail = !rail"
      />

      <v-divider />

      <v-list nav density="comfortable">
        <v-list-item
          v-for="item in menuItems"
          :key="item.title"
          :to="item.route"
          :prepend-icon="item.icon"
          :title="item.title"
          color="primary"
          rounded="lg"
        />
      </v-list>
    </v-navigation-drawer>

    <!-- Toolbar -->
    <v-app-bar color="primary" density="comfortable" elevation="2">
      <v-app-bar-nav-icon @click="drawer = !drawer" />
      <v-toolbar-title>Formularios de Transporte</v-toolbar-title>
    </v-app-bar>

    <!-- Content -->
    <v-main>
      <v-container fluid class="pa-6">
        <router-view />
      </v-container>
    </v-main>
  </v-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const drawer = ref(true)
const rail = ref(false)

const menuItems = [
  { title: 'Inicio', icon: 'mdi-home', route: '/home/inicio' },
  { title: 'Viáticos y peajes', icon: 'mdi-card-account-details', route: '/formulario-viatico' },
  { title: 'Reparaciones', icon: 'mdi-wrench', route: '/formulario-reparaciones' },
  { title: 'Viáticos (Escoltas)', icon: 'mdi-shield-account', route: '/formulario-escoltas' },
  { title: 'Aprobaciones', icon: 'mdi-check-circle', route: '/aprobaciones' },
  { title: 'Auditoría', icon: 'mdi-chart-box', route: '/auditoria' },
]
</script>
