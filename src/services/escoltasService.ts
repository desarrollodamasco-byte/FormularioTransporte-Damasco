/**
 * Servicio de Escoltas.
 * Equivalente a: EscoltasController en el frontend Angular.
 */
import api from './api'
import type { ViaticoEscoltaRequest, EscoltaHeader, EscoltaResponse } from '@/interfaces'
import { saveAs } from 'file-saver'

const API = '/api/Escoltas'

export const escoltasService = {
    addViaticoEscolta: (data: ViaticoEscoltaRequest) =>
        api.post(API, data).then(r => r.data),

    getViaticosEscoltas: () =>
        api.get<EscoltaHeader[]>(`${API}/viaticos-escoltas`).then(r => r.data),

    getViaticoEscolta: (id: number) =>
        api.get<EscoltaResponse>(`${API}/viatico-escolta/${id}`).then(r => r.data),

    getPdf: async (id: number) => {
        const response = await api.get(`${API}/getpdf/${id}`, { responseType: 'blob' })
        saveAs(response.data, `escolta_${id}.pdf`)
    },
}
