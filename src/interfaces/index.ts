/**
 * Interfaces TypeScript — Migración de las interfaces Angular originales.
 * Mantienen el mismo naming (camelCase) para compatibilidad con la API.
 */

// ══════════════════════════════════════════════════════════════
// Datos Maestros
// ══════════════════════════════════════════════════════════════

export interface Chofer {
    nameChofer: string
    cedulaChofer: string
    telefonoChofer: string
    cargo: string
    cuentaBanco: string
    banco: string
}

export interface Vehiculo {
    plateNumber: string
    carBrand: string
    carModel: string
    carSerial: string
    typeCar: string
}

export interface Escolta {
    nombreEscolta: string
    cedulaEscolta: string
    telefonoEscolta: string
    cuentaBancoEscolta: string
    bancoEscolta: string
}

export interface Destino {
    idDestination: string
    nameDestination: string
    dayDestination: string
}

export interface Peajes {
    lugarSalida: string
    destino: string
    tipoVehiculo: string
    viaticoDiario: number
    diasViaje: number
    cantPeaje: number
    montoPeaje: number
    totalPeaje: number
}

export interface PeajesRequest {
    LugarDestino: string
    TipoVehiculo: string
    Salida: string
}

export interface Dolar {
    dolarValue: number
}

export interface Banco {
    id: number
    nameBanco: string
}

export interface DiaExtra {
    diaExtraTipo: string
    viaticoMonto: number
}

// ══════════════════════════════════════════════════════════════
// Viáticos
// ══════════════════════════════════════════════════════════════

export interface PeajeHeaderRequest {
    nombreSolicitante: string
    fechaSolicitud: string
    diasDeViaje: number
    lugarSalida: string
    lugarDestino: string
    cedulaPago: string
    fechaSalida: string
    fechaRetorno: string
    observaciones?: string
    viajaEscoltado: boolean
}

export interface VehiculoViatico {
    nameDriver: string
    idDriver: string
    invoiceTravel: string
    plateNumber: string
    carBrand: string
    carModel: string
    carSerial: string
    typeCar: string
    nroSolicitud?: number
}

export interface PagoViaticoGeneral {
    amountViatico: number
    totalViaticoUsd: number
    cantidadDias: number
    totalViaticoBs: number
    cantChoferes: number
    cantEscoltas: number
    tipoCambio: number
    totalViaticoChoferesBs: number
    totalViaticoEscolta: number
    montoPeaje: number
    cantidadPeaje: number
    totalAsigPeajeBs: number
    totalApagar: number
    nroSolicitud?: number
}

export interface PagoViaticoDiaExtra {
    tipoViatico: string
    amountViatico: number
    totalViaticoUsd: number
    cantidadDiasExtra: number
    totViatico: number
    cantChoferes: number
    cantEscoltas: number
    tipoCambio: number
    totalViaticoChoferesBs: number
    totalViaticoEscolta: number
    totalApagar: number
    nroSolicitud?: number
}

export interface ViaticoRequest {
    peajeHeaderRequest: PeajeHeaderRequest
    vehiculoViaticos: VehiculoViatico[]
    pagoViaticoGeneral: PagoViaticoGeneral
    pagoViaticoDiaExtra?: PagoViaticoDiaExtra | null
}

export interface CabeceraViaticoInterface {
    nroSolicitud: number
    fechaSolicitud: string
    nombreSolicitante: string
    diasDeViaje: number
    lugarSalida: string
    lugarDestino: string
    cedulaPago: string
    observaciones: string
    fechaSalida: string
    fechaRetorno: string
    viajaEscoltado: boolean
    solictudActiva: boolean
    cantEscoltas: number | null
    cantDiasExtra: number | null
    tipoDiaExtra: string | null
}

// ══════════════════════════════════════════════════════════════
// Reparaciones
// ══════════════════════════════════════════════════════════════

export interface HeaderReparation {
    fechaSolicitud: string
    nombreoRazonSocial: string
    nombreSolicitante: string
    tipoDocumento?: string
    numeroDocumento: string
    description?: string
}

export interface PartsRequest {
    reqCarParts: string
    quantityPartsCar: string
    priceUsd: number
    priceBs: number
    iva: boolean
    ivaPriceUsd: number
    ivaPriceBs: number
    totPriceUsd: number
    totPriceBs: number
}

export interface PaymentInfo {
    nombreBeneficiario: string
    tipoDocumento?: string
    numeroDocumento?: string
    documentoPago?: string
    telefonoPago?: string
    nroCuenta?: string
    banco?: string
    observaciones?: string
    totalReparation?: number
}

export interface ReparationInfo {
    headerReparation: HeaderReparation
    vehiculos: Vehiculo[]
    partsRequests: PartsRequest[]
    infoPayment: PaymentInfo
}

export interface CarRepairsHeader {
    reparationRequestNumber: number
    fechaSolicitud: string
    nombreoRazonSocial: string
    nombreSolicitante: string
    tipoDocumento: string
    numeroDocumento: string
    description: string
}

// ══════════════════════════════════════════════════════════════
// Escoltas
// ══════════════════════════════════════════════════════════════

export interface EscoltaHeader {
    referencia?: string
    nroSolicitud: number
    nombreSolicitante: string
    fechaSolicitud: string
    cedulaEscolta: string
    observaciones: string
}

export interface VehiculoEscoltaInfo {
    fechaSalida: string
    destino: string
    origen: string
    nroFactura: string
    proveedorServicio: string
    nroPlaca: string
    marca: string
    modelo: string
    nroSolicitud?: number
}

export interface ViaticoEscoltaPago {
    viaticoEscoltaDiarioMonto: number
    cantidadDiasDestino: number
    totalViaticoEscoltaUsd: number
    tasaDolar: number
    totalViaticoEscoltaBoli: number
    nroSolicitud?: number
}

export interface ViaticoEscoltaRequest {
    nombreSolicitante: string
    fechaSolicitud: string
    cedulaEscolta: string
    observaciones: string
    escoltaInfo: { cedulaChofer: string }[]
    vehiculoEscoltaInfo: VehiculoEscoltaInfo[]
    viaticoEscoltaPago: ViaticoEscoltaPago
}

export interface EscoltaResponse {
    escoltaHeader: EscoltaHeader
    vehiculoEscoltaInfos: VehiculoEscoltaInfo[]
    personalEscolta: Chofer
    viaticoEscoltaPago: ViaticoEscoltaPago
}
