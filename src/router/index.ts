/**
 * Vue Router — Rutas equivalentes al proyecto Angular original.
 * Todas las rutas usan lazy loading para optimización.
 */
import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
    {
        path: '/',
        component: () => import('@/layouts/MainLayout.vue'),
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
                path: 'formulario-viatico/info-total-viatico',
                name: 'viatico-estimado',
                component: () => import('@/views/viaticos/ViaticoEstimado.vue'),
            },
            {
                path: 'formulario-viatico/info-diaextra-viatico',
                name: 'viatico-diaextra',
                component: () => import('@/views/viaticos/ViaticoDiaExtra.vue'),
            },
            {
                path: 'formulario-viatico/resumen-viatico',
                name: 'viatico-resumen',
                component: () => import('@/views/viaticos/ViaticoResumen.vue'),
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

            // ── Escoltas (2 pasos) ──
            {
                path: 'formulario-escoltas',
                redirect: '/formulario-escoltas/inicio-viatico-escolta',
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
        ]
    },

    // Catch-all
    { path: '/:pathMatch(.*)*', redirect: '/' },
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

export default router
