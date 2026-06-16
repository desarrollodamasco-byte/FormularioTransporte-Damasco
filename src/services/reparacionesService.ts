/**
 * Servicio de Reparaciones.
 * Equivalente a: CarRepairServiceService (Angular)
 */
import api from './api'
import type { ReparationInfo, CarRepairsHeader } from '@/interfaces'
import { saveAs } from 'file-saver'

const API = '/api/Reparaciones'

export const reparacionesService = {
    /** Crea una reparación. Si pasas `archivo`, se envía como multipart/form-data
     *  con el JSON en el campo `payload` y el archivo en `archivo`. */
    addReparacion: (data: ReparationInfo, archivo?: File | null) => {
        if (archivo) {
            const fd = new FormData()
            fd.append('payload', JSON.stringify(data))
            fd.append('archivo', archivo)
            return api.post(`${API}/AgregarReparacion`, fd, {
                headers: { 'Content-Type': 'multipart/form-data' },
            }).then(r => r.data)
        }
        return api.post(`${API}/AgregarReparacion`, data).then(r => r.data)
    },

    getReparaciones: () =>
        api.get<CarRepairsHeader[]>(`${API}/consulta-reparaciones`).then(r => r.data),

    getReparacion: (id: number) =>
        api.get(`${API}/reparacion/${id}`).then(r => r.data),

    editReparacion: (id: number, data: any) =>
        api.put(`${API}/EditarReparacion/${id}`, data).then(r => r.data),

    getPdf: async (id: number) => {
        const response = await api.get(`${API}/getpdf/${id}`, { responseType: 'blob' })
        saveAs(response.data, `reparacion_${id}.pdf`)
    },
}
