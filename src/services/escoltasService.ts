/**
 * Servicio de Escoltas.
 * Equivalente a: EscoltasController en el frontend Angular.
 */
import axios from 'axios'
import type { ViaticoEscoltaRequest, EscoltaHeader, EscoltaResponse } from '@/interfaces'
import { saveAs } from 'file-saver'

const API = '/api/Escoltas'

export const escoltasService = {
    addViaticoEscolta: (data: ViaticoEscoltaRequest) =>
        axios.post(API, data).then(r => r.data),

    getViaticosEscoltas: () =>
        axios.get<EscoltaHeader[]>(`${API}/viaticos-escoltas`).then(r => r.data),

    getViaticoEscolta: (id: number) =>
        axios.get<EscoltaResponse>(`${API}/viatico-escolta/${id}`).then(r => r.data),

    getPdf: async (id: number) => {
        const response = await axios.get(`${API}/getpdf/${id}`, { responseType: 'blob' })
        saveAs(response.data, `escolta_${id}.pdf`)
    },
}
