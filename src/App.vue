<template>
  <v-app>
    <router-view />
  </v-app>
</template>

<script setup lang="ts">
</script>

<style>
/* ═══════════════════════════════════════════════════
   Design System Damasco v2.0 — Global Styles
   Font: Poppins | Colors: Red #e1052d, Black #000
   ═══════════════════════════════════════════════════ */

:root {
  /* Brand Tokens */
  --damasco-red: #e1052d;
  --damasco-corporate: #bc1830;
  --damasco-black: #000000;
  --damasco-white: #ffffff;

  /* Feedback */
  --damasco-success: #22C55E;
  --damasco-warning: #F59E0B;
  --damasco-error: #EF4444;

  /* UI Tokens */
  --damasco-muted: #747474;
  --damasco-border: #E5E7EB;
  --damasco-bg: #ffffff;

  /* Spacing (4px grid) */
  --sp-1: 4px;
  --sp-2: 8px;
  --sp-3: 12px;
  --sp-4: 16px;
  --sp-5: 20px;
  --sp-6: 24px;
  --sp-8: 32px;

  /* Radius */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;

  /* Shadows */
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.05), 0 2px 4px rgba(0, 0, 0, 0.04);
  --shadow-lg: 0 10px 25px rgba(0, 0, 0, 0.08), 0 4px 10px rgba(0, 0, 0, 0.04);
}

/* ── Typography ── */
html, body {
  margin: 0;
  padding: 0;
  font-family: 'Poppins', sans-serif !important;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Override Vuetify's default font */
.v-application {
  font-family: 'Poppins', sans-serif !important;
}

.v-application .text-h1,
.v-application .text-h2,
.v-application .text-h3,
.v-application .text-h4,
.v-application .text-h5,
.v-application .text-h6,
.v-application .text-subtitle-1,
.v-application .text-subtitle-2,
.v-application .text-body-1,
.v-application .text-body-2,
.v-application .text-caption,
.v-application .text-overline {
  font-family: 'Poppins', sans-serif !important;
}

/* ── Smooth Transitions ── */
.v-btn,
.v-card,
.v-chip,
.v-list-item {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

/* ── Selection Color ── */
::selection {
  background: rgba(225, 5, 45, 0.15);
  color: #000;
}

/* ── Focus Styles ── */
*:focus-visible {
  outline: 2px solid var(--damasco-red);
  outline-offset: 2px;
}

/* ── Scrollbar ── */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}
::-webkit-scrollbar-thumb {
  background: #c4c4c4;
  border-radius: 4px;
}
::-webkit-scrollbar-thumb:hover {
  background: var(--damasco-muted);
}

/* ── Data Table refinements ── */
.v-data-table .v-data-table__th {
  font-weight: 600 !important;
  font-size: 13px !important;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--damasco-muted) !important;
}

.v-data-table tbody tr:hover {
  background: rgba(225, 5, 45, 0.03) !important;
}

/* ── Card hover lift ── */
.v-card--hover:hover {
  box-shadow: var(--shadow-lg) !important;
  transform: translateY(-2px);
}

/* ── Tabs ── */
.v-tab {
  font-weight: 500 !important;
  letter-spacing: 0.01em !important;
}
</style>
