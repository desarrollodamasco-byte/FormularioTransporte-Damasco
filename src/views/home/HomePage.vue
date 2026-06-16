<template>
  <div class="home-page">
    <!-- Hero Section -->
    <div class="hero-section mb-8">
      <h1 class="hero-title">Bienvenido</h1>
      <p class="hero-subtitle">
        Sistema de gestión de formularios de transporte — Damasco
      </p>
    </div>

    <!-- Quick Action Cards -->
    <v-row class="cards-grid">
      <v-col cols="12" sm="6" lg="3" v-for="(card, i) in cards" :key="card.title">
        <v-card
          :to="card.route"
          class="action-card"
          :style="{ '--delay': `${i * 0.08}s` }"
        >
          <div class="card-accent" :style="{ background: card.gradient }" />
          <v-card-item class="pa-5">
            <div class="d-flex align-center mb-4">
              <v-avatar
                size="52"
                :style="{ background: card.gradient }"
                class="card-icon-wrap"
              >
                <v-icon :icon="card.icon" size="26" color="white" />
              </v-avatar>
            </div>
            <v-card-title class="card-title">{{ card.title }}</v-card-title>
            <v-card-subtitle class="card-description mt-1">
              {{ card.description }}
            </v-card-subtitle>
          </v-card-item>
          <v-card-actions class="px-5 pb-4 pt-0">
            <v-btn
              variant="text"
              :color="card.color"
              size="small"
              append-icon="mdi-arrow-right"
              class="card-action-btn"
            >
              Acceder
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <!-- Quick Stats -->
    <v-row class="mt-4">
      <v-col cols="12">
        <v-card class="stats-card pa-5" variant="flat">
          <div class="d-flex align-center ga-3 mb-3">
            <v-icon color="primary" size="22">mdi-information-outline</v-icon>
            <span class="text-body-2 font-weight-medium" style="color: var(--damasco-muted);">
              Acceso rápido a los módulos del sistema. Selecciona una opción para comenzar.
            </span>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
const cards = [
  {
    title: 'Viáticos y Peajes',
    description: 'Solicitar viáticos para viajes de transporte',
    icon: 'mdi-card-account-details',
    route: '/formulario-viatico',
    color: '#e1052d',
    gradient: 'linear-gradient(135deg, #e1052d 0%, #ff4757 100%)',
  },
  {
    title: 'Reparaciones',
    description: 'Solicitar reparaciones de vehículos',
    icon: 'mdi-wrench',
    route: '/formulario-reparaciones',
    color: '#bc1830',
    gradient: 'linear-gradient(135deg, #bc1830 0%, #e1052d 100%)',
  },
  {
    title: 'Viáticos Escoltas',
    description: 'Viáticos para personal de seguridad',
    icon: 'mdi-shield-account',
    route: '/formulario-escoltas',
    color: '#000000',
    gradient: 'linear-gradient(135deg, #1a1a1a 0%, #444444 100%)',
  },
  {
    title: 'Auditoría',
    description: 'Reportes y análisis de gastos',
    icon: 'mdi-chart-box',
    route: '/auditoria',
    color: '#e1052d',
    gradient: 'linear-gradient(135deg, #e1052d 0%, #bc1830 100%)',
  },
]
</script>

<style scoped>
.home-page {
  animation: fadeIn 0.4s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

/* ── Hero ── */
.hero-title {
  font-size: 32px;
  font-weight: 700;
  color: #000000;
  margin-bottom: 4px;
  line-height: 1.2;
}

.hero-subtitle {
  font-size: 16px;
  font-weight: 400;
  color: var(--damasco-muted, #747474);
}

/* ── Cards ── */
.action-card {
  position: relative;
  overflow: hidden;
  cursor: pointer;
  border: 1px solid var(--damasco-border, #E5E7EB);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  animation: cardIn 0.5s ease-out both;
  animation-delay: var(--delay, 0s);
}

@keyframes cardIn {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}

.action-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(225, 5, 45, 0.12), 0 4px 12px rgba(0, 0, 0, 0.06);
  border-color: rgba(225, 5, 45, 0.2);
}

.card-accent {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
}

.card-icon-wrap {
  transition: transform 0.3s ease;
}

.action-card:hover .card-icon-wrap {
  transform: scale(1.1);
}

.card-title {
  font-size: 18px !important;
  font-weight: 600 !important;
  color: #000000;
  line-height: 1.3 !important;
  padding: 0 !important;
  white-space: normal !important;
}

.card-description {
  font-size: 14px !important;
  font-weight: 300 !important;
  color: var(--damasco-muted, #747474) !important;
  line-height: 1.5 !important;
  opacity: 1 !important;
  padding: 0 !important;
  white-space: normal !important;
}

.card-action-btn {
  font-weight: 500;
  transition: transform 0.2s ease;
}

.action-card:hover .card-action-btn {
  transform: translateX(4px);
}

/* ── Stats ── */
.stats-card {
  background: #F8F9FA !important;
  border: 1px solid var(--damasco-border, #E5E7EB);
}
</style>
