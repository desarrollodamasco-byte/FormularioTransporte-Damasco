/**
 * Servicio de Auxilio Vial.
 */
import api from './api'
import { saveAs } from 'file-saver'

const API = '/api/AuxilioVial'

export const auxilioVialService = {
    getAuxilios: () =>
        api.get(`${API}/getauxilios/`).then(r => r.data),

    addAuxilio: (data: any) =>
        api.post(`${API}/AgregarAuxilio`, data).then(r => r.data),

    getAuxilio: (id: number) =>
        api.get(`${API}/auxilio/${id}`).then(r => r.data),

    editAuxilio: (id: number, data: any) =>
        api.put(`${API}/EditarAuxilio/${id}`, data).then(r => r.data),

    getPdf: async (id: number) => {
        const response = await api.get(`${API}/getpdf/${id}`, { responseType: 'blob' })
        saveAs(response.data, `auxilio_vial_${id}.pdf`)
    },
}
