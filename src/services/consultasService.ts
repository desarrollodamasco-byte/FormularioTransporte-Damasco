/**
 * Servicio de Consultas — Datos maestros.
 * Equivalente a: ConsultasServicesService (Angular)
 */
import axios from 'axios'
import type { Chofer, Vehiculo, Escolta, Destino, Peajes, PeajesRequest, Dolar, Banco, DiaExtra } from '@/interfaces'

const API = '/api/Consultas'

export const consultasService = {
    getChoferes: () =>
        axios.get<Chofer[]>(`${API}/getchoferes`).then(r => r.data),

    getChoferById: (cedula: string) =>
        axios.get<Chofer>(`${API}/getchoferes/${cedula}`).then(r => r.data).catch(() => undefined),

    getEscoltas: () =>
        axios.get<Escolta[]>(`${API}/getescoltas`).then(r => r.data),

    getEscoltaById: (cedula: string) =>
        axios.get<Escolta>(`${API}/getescoltas/${cedula}`).then(r => r.data).catch(() => undefined),

    getVehiculos: () =>
        axios.get<Vehiculo[]>(`${API}/getvehiculos`).then(r => r.data),

    getVehiculoById: (placa: string) =>
        axios.get<Vehiculo>(`${API}/getvehiculos/${placa}`).then(r => r.data).catch(() => undefined),

    getDestinos: () =>
        axios.get<Destino[]>(`${API}/getdestinos`).then(r => r.data),

    getPeajes: () =>
        axios.get<Peajes[]>(`${API}/getpeajes`).then(r => r.data),

    getPeajesDetallado: (destino: string, tipo: string, salida: string) =>
        axios.get<Peajes>(`${API}/getpeajes/${destino}/vehiculo/${tipo}/salida/${salida}`).then(r => r.data),

    getPeajesDetalladoPost: (req: PeajesRequest[]) =>
        axios.post<Peajes[]>(`${API}/getdetallepeajes`, req).then(r => r.data),

    getDolar: () =>
        axios.get<Dolar>(`${API}/getdolar`).then(r => r.data),

    getBancos: () =>
        axios.get<Banco[]>(`${API}/getbancos`).then(r => r.data),

    getDiasExtras: () =>
        axios.get<DiaExtra[]>(`${API}/getdiaextra`).then(r => r.data),
}
