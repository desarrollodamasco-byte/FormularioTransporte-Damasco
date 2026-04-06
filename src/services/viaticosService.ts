/**
 * Servicio de Viáticos.
 * Equivalente a: ViaticoServicioService (Angular)
 */
import axios from 'axios'
import type { ViaticoRequest, CabeceraViaticoInterface } from '@/interfaces'
import { saveAs } from 'file-saver'

const API = '/api/Viaticos'

export const viaticosService = {
    addViatico: (data: ViaticoRequest) =>
        axios.post(`${API}/AgregarViatico`, data).then(r => r.data),

    getViaticos: () =>
        axios.get<CabeceraViaticoInterface[]>(`${API}/getviaticos`).then(r => r.data),

    getPdf: async (id: number) => {
        const response = await axios.get(`${API}/getpdf/${id}`, { responseType: 'blob' })
        saveAs(response.data, `viatico_${id}.pdf`)
    },
}
