/**
 * Servicio para Órdenes a Proveedores.
 * Internos: bajo /api/Ordenes/  (autenticación a futuro)
 * Públicos: bajo /api/Ordenes/publica/{token}/  (sin login, identifica al proveedor por token)
 */
import api from './api'
import type {
    OrdenProveedor, OrdenProveedorRequest, OrdenProveedorPublic, OrdenGandola,
} from '@/interfaces'

const API = '/api/Ordenes'

export const ordenesService = {
    // ── Internos ──
    list: (params?: { estatus?: string; proveedorId?: number }) =>
        api.get<OrdenProveedor[]>(`${API}/`, { params }).then(r => r.data),

    get: (id: number) =>
        api.get<OrdenProveedor>(`${API}/${id}/`).then(r => r.data),

    create: (data: OrdenProveedorRequest) =>
        api.post<OrdenProveedor>(`${API}/`, data).then(r => r.data),

    update: (id: number, data: Partial<OrdenProveedorRequest>) =>
        api.put<OrdenProveedor>(`${API}/${id}/`, data).then(r => r.data),

    cancelar: (id: number) =>
        api.post<OrdenProveedor>(`${API}/${id}/cancelar/`).then(r => r.data),

    reabrir: (id: number) =>
        api.post<OrdenProveedor>(`${API}/${id}/reabrir/`).then(r => r.data),

    // ── Públicos (link al proveedor) ──
    publica: {
        get: (token: string) =>
            api.get<OrdenProveedorPublic>(`${API}/publica/${token}/`).then(r => r.data),

        setGandolas: (token: string, gandolas: OrdenGandola[]) =>
            api.post<OrdenProveedorPublic>(
                `${API}/publica/${token}/gandolas/`,
                { gandolas },
            ).then(r => r.data),

        culminar: (token: string, notasProveedor = '') =>
            api.post<OrdenProveedorPublic>(
                `${API}/publica/${token}/culminar/`,
                { notasProveedor },
            ).then(r => r.data),
    },

    /** Arma el URL público para copiar y enviar al proveedor. */
    publicUrl(token: string): string {
        return `${window.location.origin}/orden-proveedor/${token}`
    },
}
