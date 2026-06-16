/**
 * Servicio para la bitácora de Solicitudes de Compra enviadas al
 * sistema central de Damasco (`/api/Compras`).
 */
import api from './api'
import type { SolicitudCompraEnviada } from '@/interfaces'

const API = '/api/Compras'

export const comprasService = {
    list: (filtros?: { tipo?: string; estado?: string }) => {
        const params = new URLSearchParams()
        if (filtros?.tipo) params.set('tipo', filtros.tipo)
        if (filtros?.estado) params.set('estado', filtros.estado)
        const qs = params.toString()
        return api
            .get<SolicitudCompraEnviada[]>(
                `${API}/getsolicitudes${qs ? `?${qs}` : ''}`,
            )
            .then(r => r.data)
    },

    get: (id: number) =>
        api
            .get<SolicitudCompraEnviada>(`${API}/solicitud/${id}`)
            .then(r => r.data),

    retry: (id: number) =>
        api
            .post<SolicitudCompraEnviada>(`${API}/reintentar/${id}`)
            .then(r => r.data),
}
