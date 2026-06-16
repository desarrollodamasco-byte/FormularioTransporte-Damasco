/**
 * Vue Router — Rutas equivalentes al proyecto Angular original.
 * Todas las rutas usan lazy loading para optimización.
 */
import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const routes: RouteRecordRaw[] = [
    // ── Login (público, sin layout) ──
    {
        path: '/login',
        name: 'login',
        component: () => import('@/views/auth/LoginPage.vue'),
        meta: { public: true },
    },

    {
        path: '/',
        component: () => import('@/layouts/MainLayout.vue'),
        meta: { requiresAuth: true },
        children: [
            // ── Home ──
            {
                path: '',
                redirect: '/home/inicio',
            },
            {
                path: 'home/inicio',
                name: 'home',
                component: () => import('@/views/home/HomePage.vue'),
            },

            // ── Viáticos y Peajes (7 pasos) ──
            {
                path: 'formulario-viatico',
                redirect: '/formulario-viatico/info-general-viatico',
            },
            {
                path: 'formulario-viatico/info-general-viatico',
                name: 'viatico-index',
                component: () => import('@/views/viaticos/ViaticoIndex.vue'),
            },
            {
                path: 'formulario-viatico/inicio-viatico',
                name: 'viatico-nuevo',
                component: () => import('@/views/viaticos/ViaticoNuevo.vue'),
            },
            {
                path: 'formulario-viatico/info-vehiculo-viatico',
                name: 'viatico-vehiculo',
                component: () => import('@/views/viaticos/ViaticoVehiculo.vue'),
            },
            {
                path: 'formulario-viatico/info-pago-viatico',
                name: 'viatico-pago',
                component: () => import('@/views/viaticos/ViaticoPago.vue'),
            },
            {
                path: 'formulario-viatico/resumen-viatico',
                name: 'viatico-resumen',
                component: () => import('@/views/viaticos/ViaticoResumen.vue'),
            },
            // Compatibilidad con enlaces antiguos: el paso "Estimado" se
            // fusionó con el "Resumen" — redirigir al resumen.
            {
                path: 'formulario-viatico/info-total-viatico',
                redirect: '/formulario-viatico/resumen-viatico',
            },

            // ── Reparaciones (5 pasos) ──
            {
                path: 'formulario-reparaciones',
                redirect: '/formulario-reparaciones/incio-rep',
            },
            {
                path: 'formulario-reparaciones/incio-rep',
                name: 'reparacion-index',
                component: () => import('@/views/reparaciones/ReparacionIndex.vue'),
            },
            {
                path: 'formulario-reparaciones/info-vehiculo',
                name: 'reparacion-vehiculo',
                component: () => import('@/views/reparaciones/ReparacionVehiculo.vue'),
            },
            {
                path: 'formulario-reparaciones/info-vehiculo-rep',
                name: 'reparacion-repuestos',
                component: () => import('@/views/reparaciones/ReparacionRepuestos.vue'),
            },
            {
                path: 'formulario-reparaciones/info-pago-rep',
                name: 'reparacion-pago',
                component: () => import('@/views/reparaciones/ReparacionPago.vue'),
            },
            {
                path: 'formulario-reparaciones/resumen-reparacion',
                name: 'reparacion-resumen',
                component: () => import('@/views/reparaciones/ReparacionResumen.vue'),
            },

            // ── Escoltas (listado + 2 pasos) ──
            {
                path: 'formulario-escoltas',
                name: 'escoltas-listado',
                component: () => import('@/views/escoltas/EscoltaListado.vue'),
            },
            {
                path: 'formulario-escoltas/inicio-viatico-escolta',
                name: 'escolta-index',
                component: () => import('@/views/escoltas/EscoltaIndex.vue'),
            },
            {
                path: 'formulario-escoltas/info-pago-escolta',
                name: 'escolta-resumen',
                component: () => import('@/views/escoltas/EscoltaResumen.vue'),
            },

            // ── Auxilio Vial ──
            {
                path: 'auxilio-vial',
                name: 'auxilio-vial-index',
                component: () => import('@/views/auxilio-vial/AuxilioVialIndex.vue'),
            },
            {
                path: 'auxilio-vial/nuevo',
                name: 'auxilio-vial-nuevo',
                component: () => import('@/views/auxilio-vial/AuxilioVialNuevo.vue'),
            },

            // ── Aprobaciones ──
            {
                path: 'aprobaciones',
                redirect: '/aprobaciones/index-aprobaciones',
            },
            {
                path: 'aprobaciones/index-aprobaciones',
                name: 'aprobaciones',
                component: () => import('@/views/aprobaciones/AprobacionesIndex.vue'),
            },

            // ── Auditoría ──
            {
                path: 'auditoria',
                redirect: '/auditoria/dashboard',
            },
            {
                path: 'auditoria/dashboard',
                name: 'auditoria',
                component: () => import('@/views/auditoria/AuditoriaIndex.vue'),
            },

            // ── Solicitudes de Compra (central) ──
            {
                path: 'compras',
                name: 'compras-index',
                component: () => import('@/views/compras/SolicitudesCompraIndex.vue'),
            },

            // ── Órdenes a Proveedores ──
            {
                path: 'ordenes',
                name: 'ordenes-index',
                component: () => import('@/views/ordenes/OrdenesIndex.vue'),
            },
            {
                path: 'ordenes/nueva',
                name: 'orden-nueva',
                component: () => import('@/views/ordenes/OrdenNueva.vue'),
            },
            {
                path: 'ordenes/:id',
                name: 'orden-detalle',
                component: () => import('@/views/ordenes/OrdenDetalle.vue'),
            },
        ]
    },

    // ── Vista pública del proveedor (sin layout principal) ──
    {
        path: '/orden-proveedor/:token',
        name: 'orden-proveedor-publica',
        component: () => import('@/views/ordenes/OrdenProveedorPublica.vue'),
        meta: { public: true },
    },

    // Catch-all
    { path: '/:pathMatch(.*)*', redirect: '/' },
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

// ── Guard: si la ruta no es pública y no hay sesión → /login?next=... ──
router.beforeEach((to) => {
    const esPublica = to.matched.some(r => r.meta?.public)
    if (esPublica) return true

    const auth = useAuthStore()
    if (!auth.isAuthenticated) {
        return {
            path: '/login',
            query: { next: to.fullPath },
        }
    }
    return true
})

export default router
