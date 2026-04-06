/**
 * Servicio de Auditoría — Reportes y análisis.
 */
import api from './api'

const API = '/api/Auditoria'

export interface ResumenGeneral {
    fechaDesde: string
    fechaHasta: string
    viaticos: { cantidad: number; totalBs: number }
    reparaciones: { cantidad: number; totalBs: number }
    escoltas: { cantidad: number; totalBs: number; totalUsd: number }
    fletes: { cantidad: number; totalBs: number }
    totalGeneralBs: number
    tendenciaMensual: { mes: string; totalBs: number; cantidad: number }[]
}

export interface ViaticoAuditoria {
    nroSolicitud: number
    referencia: string
    fechaSolicitud: string
    nombreSolicitante: string
    lugarSalida: string
    lugarDestino: string
    diasDeViaje: number
    fechaSalida: string
    fechaRetorno: string
    viajaEscoltado: boolean
    cedulaPago: string
    choferes: string
    placas: string
    totalPagoBs: number
    totalExtraBs: number
    totalGeneralBs: number
    viaticoUsd: number
    tipoCambio: number
    asignacionPeaje: number
    cantPeajes: number
    totalPeajesBs: number
}

export interface ReparacionAuditoria {
    nroSolicitud: number
    referencia: string
    fechaSolicitud: string
    nombreSolicitante: string
    nombreProveedor: string
    rif: string
    totalReparacion: number
    cantRepuestos: number
    descripcion: string
    nombreBeneficiario: string
    banco: string
}

export interface EscoltaAuditoria {
    nroSolicitud: number
    referencia: string
    fechaSolicitud: string
    nombreSolicitante: string
    nombreEscolta: string
    cedulaEscolta: string
    observaciones: string
    viaticoDiarioUsd: number
    cantidadDias: number
    totalUsd: number
    tasaDolar: number
    totalBs: number
}

export interface GastoChofer {
    cedulaChofer: string
    nombreChofer: string
    cantidadViajes: number
    vehiculosUsados: number
    placas: string
    totalBs: number
}

export interface GastoDestino {
    destino: string
    cantidadViajes: number
    totalDiasViaje: number
    promedioDias: number
    totalBs: number
    promedioBs: number
}

export interface GastoVehiculo {
    placa: string
    marca: string
    modelo: string
    tipoVehiculo: string
    viajesCount: number
    reparacionesCount: number
    totalViaticoBs: number
    totalReparacionBs: number
    costoTotalBs: number
}

export interface GastoSolicitante {
    nombre: string
    viaticosCount: number
    reparacionesCount: number
    escoltasCount: number
    totalSolicitudes: number
    viaticoBs: number
    reparacionBs: number
    escoltaBs: number
    totalBs: number
}

export interface AuditoriaResponse<T> {
    fechaDesde: string
    fechaHasta: string
    totales?: Record<string, number>
    totalChoferes?: number
    totalDestinos?: number
    totalVehiculos?: number
    totalSolicitantes?: number
    totalGeneralBs?: number
    registros: T[]
}

function buildParams(fechaDesde: string, fechaHasta: string) {
    return { params: { fecha_desde: fechaDesde, fecha_hasta: fechaHasta } }
}

export const auditoriaService = {
    getResumenGeneral: (fechaDesde: string, fechaHasta: string) =>
        api.get<ResumenGeneral>(`${API}/resumen-general`, buildParams(fechaDesde, fechaHasta))
            .then(r => r.data),

    getViaticos: (fechaDesde: string, fechaHasta: string) =>
        api.get<AuditoriaResponse<ViaticoAuditoria>>(`${API}/viaticos`, buildParams(fechaDesde, fechaHasta))
            .then(r => r.data),

    getReparaciones: (fechaDesde: string, fechaHasta: string) =>
        api.get<AuditoriaResponse<ReparacionAuditoria>>(`${API}/reparaciones`, buildParams(fechaDesde, fechaHasta))
            .then(r => r.data),

    getEscoltas: (fechaDesde: string, fechaHasta: string) =>
        api.get<AuditoriaResponse<EscoltaAuditoria>>(`${API}/escoltas`, buildParams(fechaDesde, fechaHasta))
            .then(r => r.data),

    getGastosPorChofer: (fechaDesde: string, fechaHasta: string) =>
        api.get<AuditoriaResponse<GastoChofer>>(`${API}/gastos-por-chofer`, buildParams(fechaDesde, fechaHasta))
            .then(r => r.data),

    getGastosPorDestino: (fechaDesde: string, fechaHasta: string) =>
        api.get<AuditoriaResponse<GastoDestino>>(`${API}/gastos-por-destino`, buildParams(fechaDesde, fechaHasta))
            .then(r => r.data),

    getGastosPorVehiculo: (fechaDesde: string, fechaHasta: string) =>
        api.get<AuditoriaResponse<GastoVehiculo>>(`${API}/gastos-por-vehiculo`, buildParams(fechaDesde, fechaHasta))
            .then(r => r.data),

    getGastosPorSolicitante: (fechaDesde: string, fechaHasta: string) =>
        api.get<AuditoriaResponse<GastoSolicitante>>(`${API}/gastos-por-solicitante`, buildParams(fechaDesde, fechaHasta))
            .then(r => r.data),
}
