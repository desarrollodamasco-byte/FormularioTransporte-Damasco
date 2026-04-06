/**
 * Servicio de Reparaciones.
 * Equivalente a: CarRepairServiceService (Angular)
 */
import axios from 'axios'
import type { ReparationInfo, CarRepairsHeader } from '@/interfaces'
import { saveAs } from 'file-saver'

const API = '/api/Reparaciones'

export const reparacionesService = {
    addReparacion: (data: ReparationInfo) =>
        axios.post(`${API}/AgregarReparacion`, data).then(r => r.data),

    getReparaciones: () =>
        axios.get<CarRepairsHeader[]>(`${API}/consulta-reparaciones`).then(r => r.data),

    getPdf: async (id: number) => {
        const response = await axios.get(`${API}/getpdf/${id}`, { responseType: 'blob' })
        saveAs(response.data, `reparacion_${id}.pdf`)
    },
}
