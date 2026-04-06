/**
 * Servicio de Consultas — Datos maestros.
 * Equivalente a: ConsultasServicesService (Angular)
 */
import api from './api'
import type { Chofer, Vehiculo, Escolta, Destino, Peajes, PeajesRequest, Dolar, Banco, DiaExtra } from '@/interfaces'

const API = '/api/Consultas'

export const consultasService = {
    getChoferes: () =>
        api.get<Chofer[]>(`${API}/getchoferes`).then(r => r.data),

    getChoferById: (cedula: string) =>
        api.get<Chofer>(`${API}/getchoferes/${cedula}`).then(r => r.data).catch(() => undefined),

    getEscoltas: () =>
        api.get<Escolta[]>(`${API}/getescoltas`).then(r => r.data),

    getEscoltaById: (cedula: string) =>
        api.get<Escolta>(`${API}/getescoltas/${cedula}`).then(r => r.data).catch(() => undefined),

    getVehiculos: () =>
        api.get<Vehiculo[]>(`${API}/getvehiculos`).then(r => r.data),

    getVehiculoById: (placa: string) =>
        api.get<Vehiculo>(`${API}/getvehiculos/${placa}`).then(r => r.data).catch(() => undefined),

    getDestinos: () =>
        api.get<Destino[]>(`${API}/getdestinos`).then(r => r.data),

    getPeajes: () =>
        api.get<Peajes[]>(`${API}/getpeajes`).then(r => r.data),

    getPeajesDetallado: (destino: string, tipo: string, salida: string) =>
        api.get<Peajes>(`${API}/getpeajes/${destino}/vehiculo/${tipo}/salida/${salida}`).then(r => r.data),

    getPeajesDetalladoPost: (req: PeajesRequest[]) =>
        api.post<Peajes[]>(`${API}/getdetallepeajes`, req).then(r => r.data),

    getDolar: () =>
        api.get<Dolar>(`${API}/getdolar`).then(r => r.data),

    getBancos: () =>
        api.get<Banco[]>(`${API}/getbancos`).then(r => r.data),

    getDiasExtras: () =>
        api.get<DiaExtra[]>(`${API}/getdiaextra`).then(r => r.data),
}
