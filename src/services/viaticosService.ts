/**
 * Servicio de Viáticos.
 * Equivalente a: ViaticoServicioService (Angular)
 */
import api from './api'
import type { ViaticoRequest, CabeceraViaticoInterface } from '@/interfaces'
import { saveAs } from 'file-saver'

const API = '/api/Viaticos'

export const viaticosService = {
    addViatico: (data: ViaticoRequest) =>
        api.post(`${API}/AgregarViatico`, data).then(r => r.data),

    editViatico: (id: number, data: ViaticoRequest) =>
        api.put(`${API}/EditarViatico/${id}`, data).then(r => r.data),

    getViatico: (id: number) =>
        api.get(`${API}/viatico/${id}`).then(r => r.data),

    getViaticos: () =>
        api.get<CabeceraViaticoInterface[]>(`${API}/getviaticos`).then(r => r.data),

    getPdf: async (id: number) => {
        const response = await api.get(`${API}/getpdf/${id}`, { responseType: 'blob' })
        saveAs(response.data, `viatico_${id}.pdf`)
    },

    agregarDiaExtra: (id: number, data: any) =>
        api.post(`${API}/AgregarDiaExtra/${id}`, data).then(r => r.data),
}
