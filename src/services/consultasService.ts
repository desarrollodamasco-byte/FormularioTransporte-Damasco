/**
 * Servicio de Consultas — Datos maestros.
 * Equivalente a: ConsultasServicesService (Angular)
 */
import api from './api'
import type { Chofer, Vehiculo, Escolta, Destino, Peajes, PeajesRequest, Dolar, Banco, DiaExtra, ProveedorTaller, Remolque, VehiculoProveedor } from '@/interfaces'

const API = '/api/Consultas'

export const consultasService = {
    getChoferes: () =>
        api.get<Chofer[]>(`${API}/getchoferes`).then(r => r.data),

    getChoferById: (cedula: string) =>
        api.get<Chofer>(`${API}/getchoferes/${cedula}`).then(r => r.data).catch(() => undefined),

    getEscoltas: () =>
        api.get<Escolta[]>(`${API}/getescoltas`).then(r => r.data),

    getMecanicos: () =>
        api.get<Chofer[]>(`${API}/getmecanicos`).then(r => r.data),

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

    /** Crea (o actualiza si ya existe) una ruta Salida → Destino en el catálogo. */
    createPeaje: (data: {
        lugarSalida: string
        destino: string
        diasViaje: number
        cantPeaje: number
        viaticoDiario: number
    }) =>
        api.post<Peajes>(`${API}/createpeaje`, data).then(r => r.data),

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

    getProveedores: () =>
        api.get<ProveedorTaller[]>(`${API}/getproveedores`).then(r => r.data),

    /** Crea o actualiza un Proveedor/Taller (upsert por cédula/RIF). */
    createProveedor: (data: {
        cedulaRif: string
        razonSocial: string
        cedulaRifBeneficiario?: string
        nombreBeneficiario?: string
        nroCuenta?: string
        banco?: string
    }) =>
        api.post<ProveedorTaller>(`${API}/createproveedor`, data).then(r => r.data),

    getRemolques: () =>
        api.get<Remolque[]>(`${API}/getremolques`).then(r => r.data),

    /** Crea o actualiza un remolque en el catálogo (upsert por placa). */
    createRemolque: (data: {
        plateNumber: string
        carBrand?: string
        carModel?: string
        carSerial?: string
        typeCar?: string
    }) =>
        api.post<Remolque>(`${API}/createremolque`, data).then(r => r.data),

    /** Lista los vehículos de proveedores. Si `proveedorId` se pasa, filtra. */
    getVehiculosProveedor: (proveedorId?: number) =>
        api
            .get<VehiculoProveedor[]>(`${API}/getvehiculosproveedor`, {
                params: proveedorId ? { proveedorId } : undefined,
            })
            .then(r => r.data),

    /** Crea o actualiza un vehículo del catálogo (upsert por placa). */
    createVehiculoProveedor: (data: { placa: string; proveedorId: number }) =>
        api
            .post<VehiculoProveedor>(`${API}/createvehiculoproveedor`, data)
            .then(r => r.data),
}
