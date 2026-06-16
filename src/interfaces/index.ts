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

export interface Remolque {
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
    cantPeajes?: number
    viaticoDiario?: number
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

export interface ProveedorTaller {
    id: number
    cedulaRif: string
    razonSocial: string
    cedulaRifBeneficiario: string
    nombreBeneficiario: string
    nroCuenta: string
    banco: string
    tipo: 'repuesto' | 'viatico'
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
    cedulasEscoltas?: string[]
    tramos?: ViaticoTramo[]
}

export interface ViaticoTramo {
    orden: number
    origen: string
    destino: string
    pernocta: boolean
    diasViajeTramo: number
    viaticoDiarioTramo: number
    totalViaticoTramo: number
    cantPeajes: number
    montoPeaje: number
    totalPeajes: number
}

/** Precinto que carga una gandola en un tramo específico del viático. */
export interface PrecintoVehiculoTramo {
    ordenTramo: number
    idPrecinto: string
    facturaNumero?: string
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
    plateNumberRemolque?: string
    tieneSegundaPuerta?: boolean
    idPrecintoSegundaPuerta?: string
    /** Precintos que esta gandola lleva en cada tramo del viático. */
    precintosTramos?: PrecintoVehiculoTramo[]
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
    monedaCompraExterna?: MonedaCompra
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
    editable: boolean
    puedeAgregarDiaExtra: boolean
    tramos?: ViaticoTramo[]
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
    tipoSolicitud?: string
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
    monedaCompraExterna?: MonedaCompra
}

export interface CarRepairsHeader {
    reparationRequestNumber: number
    fechaSolicitud: string
    nombreoRazonSocial: string
    nombreSolicitante: string
    tipoDocumento: string
    numeroDocumento: string
    description: string
    tipoSolicitud: string
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
    statusEscolta?: boolean | null
    tramos?: ViaticoEscoltaTramo[]
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
    proveedorId?: number | null
    proveedorRazonSocial?: string
    tieneSegundaPuerta?: boolean
    idPrecintoSegundaPuerta?: string
    precintosTramos?: PrecintoVehiculoTramo[]
    nroSolicitud?: number
}

export interface VehiculoProveedor {
    id?: number
    placa: string
    proveedorId: number
    proveedorRazonSocial?: string
}

export interface ViaticoEscoltaPago {
    viaticoEscoltaDiarioMonto: number
    cantidadDiasDestino: number
    totalViaticoEscoltaUsd: number
    tasaDolar: number
    totalViaticoEscoltaBoli: number
    nroSolicitud?: number
}

export interface ViaticoEscoltaTramo {
    orden: number
    origen: string
    destino: string
    pernocta: boolean
    diasViajeTramo: number
    viaticoDiarioTramo: number
    totalViaticoTramo: number
    cantPeajes: number
    montoPeaje: number
    totalPeajes: number
}

export interface ViaticoEscoltaRequest {
    nombreSolicitante: string
    fechaSolicitud: string
    cedulaEscolta: string
    observaciones: string
    escoltaInfo: { cedulaChofer: string }[]
    vehiculoEscoltaInfo: VehiculoEscoltaInfo[]
    viaticoEscoltaPago: ViaticoEscoltaPago
    tramos?: ViaticoEscoltaTramo[]
    monedaCompraExterna?: MonedaCompra
}

export interface EscoltaResponse {
    escoltaHeader: EscoltaHeader
    vehiculoEscoltaInfos: VehiculoEscoltaInfo[]
    personalEscolta: Chofer
    viaticoEscoltaPago: ViaticoEscoltaPago
}

// ══════════════════════════════════════════════════════════════
// Órdenes a Proveedores
// ══════════════════════════════════════════════════════════════

export type OrdenEstatus = 'pendiente' | 'en_progreso' | 'culminada' | 'cancelada'

export interface OrdenGandola {
    id?: number
    placaVehiculo: string
    marca?: string
    modelo?: string
    tipoVehiculo?: string
    placaRemolque?: string
    nombreChofer: string
    cedulaChofer: string
    telefonoChofer?: string
    observaciones?: string
}

export interface OrdenProveedor {
    id: number
    referencia: string
    token: string
    fechaSolicitud: string
    nombreSolicitante: string
    proveedorId: number
    proveedorRazonSocial?: string
    proveedorCedulaRif?: string
    fechaViaje: string
    lugarSalida: string
    lugarDestino: string
    cantidadGandolas: number
    observaciones?: string
    estatus: OrdenEstatus
    notasProveedor?: string
    fechaCulminacion?: string | null
    gandolas: OrdenGandola[]
    gandolasRegistradas?: number
}

export interface OrdenProveedorRequest {
    nombreSolicitante: string
    proveedorId: number
    fechaViaje: string
    lugarSalida: string
    lugarDestino: string
    cantidadGandolas: number
    observaciones?: string
}

// ══════════════════════════════════════════════════════════════
// Auth (Login centralizado Damasco)
// ══════════════════════════════════════════════════════════════

export type UsuarioRol =
    | 'solicitante' | 'gerente_area' | 'coordinador_admin'
    | 'aprobador' | 'cotización' | 'director' | 'admin'

export interface UsuarioAuth {
    id_usuario: number
    usuario: string
    nombre: string
    roll: UsuarioRol | string
    email: string
    departamento: number | null
    activo: boolean
}

export interface LoginRequest {
    usuario: string
    contrasena: string
}

export interface LoginResponse {
    token: string
    token_type: string
    usuario: UsuarioAuth
}

export interface OrdenProveedorPublic {
    referencia: string
    fechaSolicitud: string
    nombreSolicitante: string
    proveedorRazonSocial: string
    fechaViaje: string
    lugarSalida: string
    lugarDestino: string
    cantidadGandolas: number
    observaciones: string
    estatus: OrdenEstatus
    notasProveedor: string
    fechaCulminacion: string | null
    gandolas: OrdenGandola[]
}

// ══════════════════════════════════════════════════════════════
// Solicitudes de Compra (sistema central)
// ══════════════════════════════════════════════════════════════

export type MonedaCompra = 'USD' | 'EUR' | 'VES'
export type TipoSolicitudCompra = 'viatico' | 'dia_extra' | 'escolta' | 'reparacion'
export type EstadoCompraEnviada = 'enviado' | 'error'

export interface SolicitudCompraEnviada {
    id: number
    tipo: TipoSolicitudCompra
    origenId: number
    origenRef: string
    descripcion: string
    moneda: MonedaCompra | string
    montoTotal: number | string
    nroSolicitudCompra: number | null
    loteOrigen: string
    countSolicitudes: number
    estado: EstadoCompraEnviada
    error: string
    usuarioNombre: string
    fechaEnvio: string
    fechaActualizacion: string
    payloadEnviado?: string
    respuestaRaw?: string
}
