<template>
  <v-layout>
    <!-- Sidebar — Deep Black with white logo -->
    <v-navigation-drawer
      v-model="drawer"
      :rail="rail"
      permanent
      color="#000000"
      elevation="0"
      class="damasco-sidebar"
    >
      <!-- Logo Header -->
      <div
        class="sidebar-logo-wrap"
        :class="{ 'sidebar-logo-wrap--rail': rail }"
        @click="rail = !rail"
      >
        <div v-if="!rail" class="sidebar-logo">
          <svg viewBox="0 0 1652 199" fill="none" xmlns="http://www.w3.org/2000/svg" class="logo-svg">
            <path d="M102.399 4.016H30.137L0 53.415h102.399c25.6 0 45.205 19.478 45.205 46.185 0 27.109-18.957 45.383-45.205 45.383H47.635V75.504H0v118.074h102.399c52.982 0 92.03-41.567 92.03-96.588C194.591 42.37 155.867 4.016 102.399 4.016Z" fill="#ffffff"/>
            <path d="M621.201 128.717L635.784 195.586H683.581L644.371 26.507C640.158 8.635 629.465 0 617.475 0c-12.476 0-20.901 8.032-26.41 20.482l-24.79 54.62c-13.61 29.519-19.767 43.776-24.79 57.23-5.346-13.454-11.341-27.912-25.113-57.431L491.582 20.683C486.073 8.032 477.648.201 465.334.201c-11.99 0-23.008 8.635-27.058 26.507L398.094 195.787h47.149l14.582-66.869c4.699-21.486 8.101-37.551 10.37-52.812 4.86 12.852 10.369 26.507 21.873 52.812l20.901 48.596c8.101 18.876 16.04 21.486 27.544 21.486 11.666 0 19.443-2.61 27.544-21.486l20.901-48.194c10.694-25.101 16.527-39.559 21.55-53.214 2.592 15.261 5.833 30.723 10.693 52.611Z" fill="#ffffff"/>
            <path d="M1066.61 82.331h-84.419c-11.179 0-16.526-3.815-16.526-13.454 0-9.84 5.347-13.253 16.526-13.253h107.589l30.78-49.999H985.918c-47.149 0-66.592 23.494-66.592 59.84 0 33.133 18.309 55.222 58.167 55.222h84.415c11.34 0 16.52 4.016 16.52 13.856 0 10.04-5.02 14.056-16.52 14.056H944.602l-30.785 49.397h144.523c47.31 0 66.59-23.495 66.59-62.853-.16-35.141-20.57-52.812-58.32-52.812Z" fill="#ffffff"/>
            <path d="M1226.69 56.226h75.18l29.81-48.194h-104.83c-51.85 0-90.09 36.547-90.09 90.966 0 53.816 38.24 94.58 90.09 94.58h75.18l29.81-47.591h-104.83c-25.28 0-43.91-18.073-43.91-44.379-.16-26.707 18.63-45.382 43.59-45.382Z" fill="#ffffff"/>
            <path d="M1446.55 8.032c-71.77 0-107.74 28.916-107.74 94.179 0 65.262 35.8 94.379 107.74 94.379 71.62 0 107.75-29.117 107.75-94.379-.16-65.263-36.29-94.179-107.75-94.179Zm0 141.168c-45.85 0-62.38-7.631-62.38-46.989 0-39.358 16.53-46.587 62.38-46.587 45.86 0 62.38 7.43 62.38 46.587-.16 39.358-16.69 46.989-62.38 46.989Z" fill="#ffffff"/>
            <path d="m389.02 196.189-81.66-188.558h-40.02L185.68 196.189h42.45l16.527-37.752h85.225l16.364 37.752h42.774ZM264.91 111.85l22.521-52.009 22.522 52.009H264.91Z" fill="#ffffff"/>
            <path d="M780.633 7.631 698.973 196.189h42.45l16.527-37.752h85.225l16.364 37.752h42.775L820.653 7.631h-40.02Zm-2.43 104.219 22.521-52.009 22.522 52.009h-45.043Z" fill="#ffffff"/>
            <path d="M1629.32 58.033a26.07 26.07 0 0 0 2.59-11.044c0-6.225-1.62-11.245-4.86-15.261-3.24-3.816-7.45-5.824-12.64-5.824h-16.36c-3.08 0-4.7 2.008-4.7 5.824v49.999c0 2.008.48 3.414 1.46 4.418 .97 1.004 2.59 1.406 4.86 1.406 2.1 0 3.56-.401 4.53-1.004.97-.603 1.3-2.209 1.3-4.82V67.873h4.54l8.1 15.864c1.29 2.61 3.08 3.815 5.67 3.815h3.72c1.3 0 2.27-.401 2.92-1.004.65-.603 1.13-1.406 1.13-2.611 0-1.205-.32-2.41-.97-3.414l-8.26-15.462a17.31 17.31 0 0 0 6.97-7.028Zm-11.83-5.422c-1.14 1.406-2.59 2.209-4.38 2.209h-7.61V40.161h7.78c1.62 0 3.07.603 4.21 1.808 1.13 1.204 1.78 3.012 1.78 5.22 0 2.008-.49 3.816-1.78 5.422Z" fill="#ffffff"/>
            <path d="M1628.83 6.024h-35.64c-12.8 0-23.17 12.852-23.17 28.716v44.178c0 15.863 10.37 28.715 23.17 28.715h35.64c12.8 0 23.17-12.852 23.17-28.715V34.74c0-15.864-10.37-28.716-23.17-28.716Zm17.5 72.893c0 11.848-7.78 21.688-17.5 21.688h-35.64c-9.56 0-17.5-9.64-17.5-21.688V34.74c0-11.848 7.77-21.687 17.5-21.687h35.64c9.56 0 17.5 9.639 17.5 21.687v44.177Z" fill="#ffffff"/>
          </svg>
          <span class="sidebar-subtitle">Control</span>
        </div>
        <div v-else class="sidebar-logo-mini">
          <svg viewBox="0 0 200 200" class="logo-mini-svg">
            <path d="M102.399 4.016H30.137L0 53.415h102.399c25.6 0 45.205 19.478 45.205 46.185 0 27.109-18.957 45.383-45.205 45.383H47.635V75.504H0v118.074h102.399c52.982 0 92.03-41.567 92.03-96.588C194.591 42.37 155.867 4.016 102.399 4.016Z" fill="#ffffff"/>
          </svg>
        </div>
      </div>

      <v-divider class="mx-3" color="rgba(255,255,255,0.12)" />

      <!-- Navigation -->
      <v-list nav density="comfortable" class="mt-2 px-2">
        <v-list-item
          v-for="item in menuItems"
          :key="item.title"
          :prepend-icon="item.icon"
          :title="item.title"
          rounded="lg"
          class="sidebar-item mb-1"
          :class="{ 'sidebar-item--active': isActive(item.route) }"
          @click="router.push(item.route)"
        />
      </v-list>

      <!-- Bottom branding -->
      <template #append>
        <div v-if="!rail" class="sidebar-footer px-4 pb-4">
          <v-divider class="mb-3" color="rgba(255,255,255,0.08)" />
          <p class="text-caption" style="color: rgba(255,255,255,0.35); font-size: 11px;">
            Damasco® v2.0
          </p>
        </div>
      </template>
    </v-navigation-drawer>

    <!-- Top Bar — Primary Red -->
    <v-app-bar color="#e1052d" density="comfortable" elevation="0" class="damasco-appbar">
      <v-app-bar-nav-icon
        @click="rail = !rail"
        color="white"
      />
      <v-toolbar-title class="text-white font-weight-medium" style="font-size: 18px;">
        Control de Transporte
      </v-toolbar-title>
      <v-spacer />

      <!-- Usuario actual + menú -->
      <v-menu offset="8">
        <template #activator="{ props }">
          <v-btn
            v-bind="props"
            variant="text" color="white"
            class="text-none"
          >
            <v-icon start>mdi-account-circle-outline</v-icon>
            <span class="d-none d-sm-inline">
              {{ auth.user?.nombre || auth.user?.usuario || 'Usuario' }}
            </span>
            <v-icon end size="small">mdi-chevron-down</v-icon>
          </v-btn>
        </template>
        <v-list density="compact" min-width="240">
          <v-list-item v-if="auth.user">
            <v-list-item-title class="font-weight-bold">
              {{ auth.user.nombre || auth.user.usuario }}
            </v-list-item-title>
            <v-list-item-subtitle>{{ auth.user.email || '—' }}</v-list-item-subtitle>
            <template #append>
              <v-chip size="x-small" color="primary" variant="tonal">
                {{ auth.user.roll }}
              </v-chip>
            </template>
          </v-list-item>
          <v-divider class="my-1" />
          <v-list-item prepend-icon="mdi-logout" base-color="error" @click="cerrarSesion">
            <v-list-item-title>Cerrar sesión</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-app-bar>

    <!-- Content Area -->
    <v-main class="damasco-main">
      <v-container fluid class="pa-6">
        <router-view />
      </v-container>
    </v-main>
  </v-layout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCatalogosStore } from '@/stores/catalogosStore'
import { useAuthStore } from '@/stores/authStore'

const route = useRoute()
const router = useRouter()
const drawer = ref(true)
const rail = ref(false)
const catalogos = useCatalogosStore()
const auth = useAuthStore()

function cerrarSesion() {
  auth.logout()
  router.push('/login')
}

// Pre-cargar todos los catálogos al montar el layout.
// Quedan en caché para todas las vistas hijas.
onMounted(() => {
  catalogos.cargar()
})

const menuItems = [
  { title: 'Inicio', icon: 'mdi-home-outline', route: '/home' },
  { title: 'Viáticos y peajes', icon: 'mdi-card-account-details-outline', route: '/formulario-viatico' },
  { title: 'Solicitudes Rep/Insumos', icon: 'mdi-wrench-outline', route: '/formulario-reparaciones' },
  { title: 'Viáticos (Escoltas)', icon: 'mdi-shield-account-outline', route: '/formulario-escoltas' },
  { title: 'Auxilio Vial', icon: 'mdi-tow-truck', route: '/auxilio-vial' },
  { title: 'Órdenes - Fletes', icon: 'mdi-clipboard-list-outline', route: '/ordenes' },
  { title: 'Solicitudes de Compra', icon: 'mdi-cart-arrow-up', route: '/compras' },
  { title: 'Aprobaciones', icon: 'mdi-check-circle-outline', route: '/aprobaciones' },
  { title: 'Control', icon: 'mdi-chart-box-outline', route: '/auditoria' },
]

const isActive = (itemRoute: string) => {
  return route.path.startsWith(itemRoute)
}
</script>

<style scoped>
/* ── Sidebar ── */
.damasco-sidebar {
  border-right: none !important;
}

.sidebar-logo-wrap {
  padding: 20px 16px 16px;
  cursor: pointer;
  transition: padding 0.3s ease;
}

.sidebar-logo-wrap--rail {
  padding: 16px 8px;
}

.sidebar-logo {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.logo-svg {
  width: 160px;
  height: auto;
  transition: transform 0.3s ease;
}

.sidebar-logo-wrap:hover .logo-svg {
  transform: scale(1.02);
}

.sidebar-subtitle {
  font-size: 11px;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.5);
  letter-spacing: 0.15em;
  text-transform: uppercase;
  padding-left: 2px;
}

.sidebar-logo-mini {
  display: flex;
  justify-content: center;
  align-items: center;
}

.logo-mini-svg {
  width: 28px;
  height: 28px;
}

/* ── Menu Items ── */
.sidebar-item {
  color: rgba(255, 255, 255, 0.7) !important;
  font-size: 14px !important;
  font-weight: 400 !important;
  min-height: 44px;
  transition: all 0.2s ease !important;
}

.sidebar-item:hover {
  color: #ffffff !important;
  background: rgba(255, 255, 255, 0.08) !important;
}

.sidebar-item--active {
  color: #ffffff !important;
  background: #e1052d !important;
  font-weight: 500 !important;
}

.sidebar-item--active:hover {
  background: #cc0428 !important;
}

/* ── App Bar ── */
.damasco-appbar {
  border-bottom: 3px solid #bc1830 !important;
}

/* ── Main Content ── */
.damasco-main {
  background: #F8F9FA;
}

/* ── Sidebar fixed positioning ── */
.damasco-sidebar {
  position: fixed !important;
  top: 0;
  bottom: 0;
  overflow-y: auto;
}
</style>
