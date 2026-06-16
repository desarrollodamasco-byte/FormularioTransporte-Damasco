/**
 * Store Pinia — Wizard de Viáticos (7 pasos).
 * Soporta múltiples tramos (multi-destino) con cálculo de peajes por tramo.
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { viaticosService } from '@/services/viaticosService'
import type {
    PeajeHeaderRequest, VehiculoViatico, PagoViaticoGeneral,
    PagoViaticoDiaExtra, ViaticoRequest, ViaticoTramo, MonedaCompra
} from '@/interfaces'

function crearTramoVacio(orden: number, origen = ''): ViaticoTramo {
    return {
        orden,
        origen,
        destino: '',
        pernocta: true,
        diasViajeTramo: 1,
        viaticoDiarioTramo: 0,
        totalViaticoTramo: 0,
        cantPeajes: 0,
        montoPeaje: 0,
        totalPeajes: 0,
    }
}

/** Recalcula los totales de un tramo: viático y peajes. */
function recalcularTotalesTramo(t: ViaticoTramo) {
    t.totalViaticoTramo = (t.diasViajeTramo || 0) * (t.viaticoDiarioTramo || 0)
    t.totalPeajes = (t.cantPeajes || 0) * (t.montoPeaje || 0)
}

export const useViaticoStore = defineStore('viatico', () => {
    // ── Paso 2: Header ──
    const header = ref<PeajeHeaderRequest>({
        nombreSolicitante: '',
        fechaSolicitud: new Date().toISOString().slice(0, 10),
        diasDeViaje: 1,
        lugarSalida: '',
        lugarDestino: '',
        cedulaPago: '',
        fechaSalida: '',
        fechaRetorno: '',
        observaciones: '',
        viajaEscoltado: false,
        cedulasEscoltas: [],
    })

    // ── Tramos multi-destino ──
    const tramos = ref<ViaticoTramo[]>([crearTramoVacio(1)])

    const addTramo = () => {
        const ultimo = tramos.value[tramos.value.length - 1]
        tramos.value.push(crearTramoVacio(
            tramos.value.length + 1,
            ultimo?.destino || '', // El origen es el destino anterior
        ))
    }

    const removeTramo = (index: number) => {
        if (tramos.value.length <= 1) return
        tramos.value.splice(index, 1)
        // Recalcular órdenes y encadenar orígenes
        tramos.value.forEach((t, i) => {
            t.orden = i + 1
            if (i > 0) {
                t.origen = tramos.value[i - 1].destino
            }
        })
        sincronizarHeaderDesdeTramos()
    }

    /** Sincroniza lugarSalida/lugarDestino del header desde los tramos */
    const sincronizarHeaderDesdeTramos = () => {
        if (tramos.value.length > 0) {
            header.value.lugarSalida = tramos.value[0].origen
            header.value.lugarDestino = tramos.value[tramos.value.length - 1].destino
        }
    }

    /** Cuando cambia el destino de un tramo, actualiza el origen del siguiente */
    const onTramoDestinoChange = (index: number) => {
        if (index < tramos.value.length - 1) {
            tramos.value[index + 1].origen = tramos.value[index].destino
        }
        sincronizarHeaderDesdeTramos()
    }

    /** Ruta completa como string: "Guatire → Valencia → Zulia" */
    const rutaCompleta = computed(() => {
        if (tramos.value.length === 0) return ''
        const puntos = [tramos.value[0].origen]
        for (const t of tramos.value) {
            if (t.destino) puntos.push(t.destino)
        }
        return puntos.filter(Boolean).join(' → ')
    })

    // ── Paso 3: Vehículos ──
    const vehiculos = ref<VehiculoViatico[]>([])

    const addVehiculo = (v: VehiculoViatico) => {
        vehiculos.value.push({ ...v })
    }

    const removeVehiculo = (index: number) => {
        vehiculos.value.splice(index, 1)
    }

    // ── Paso 4+5: Pago General ──
    const pago = ref<PagoViaticoGeneral>({
        amountViatico: 0,
        cantidadDias: 1,
        totalViaticoUsd: 0,
        cantChoferes: 1,
        cantEscoltas: 0,
        tipoCambio: 0,
        totalViaticoBs: 0,
        totalViaticoChoferesBs: 0,
        totalViaticoEscolta: 0,
        montoPeaje: 0,
        cantidadPeaje: 0,
        totalAsigPeajeBs: 0,
        totalApagar: 0,
    })

    // ── Paso 6: Día Extra (opcional) ──
    const diaExtraActivo = ref(false)
    const diaExtra = ref<PagoViaticoDiaExtra>({
        tipoViatico: '',
        amountViatico: 0,
        totalViaticoUsd: 0,
        cantidadDiasExtra: 0,
        totViatico: 0,
        cantChoferes: 1,
        cantEscoltas: 0,
        tipoCambio: 0,
        totalViaticoChoferesBs: 0,
        totalViaticoEscolta: 0,
        totalApagar: 0,
    })

    // ── Cálculos automáticos ──
    const calcularPago = () => {
        const p = pago.value

        // Refrescar totales por tramo y sumar
        let totalViaticoUsdTramos = 0
        let totalDias = 0
        let totalPeajesBs = 0
        let totalCantPeajes = 0
        for (const t of tramos.value) {
            recalcularTotalesTramo(t)
            totalViaticoUsdTramos += t.totalViaticoTramo
            totalDias += (t.diasViajeTramo || 0)
            totalPeajesBs += t.totalPeajes
            totalCantPeajes += t.cantPeajes
        }

        // Días de viaje = suma de días de todos los tramos
        header.value.diasDeViaje = totalDias
        p.cantidadDias = totalDias

        // Viático USD = suma exacta de cada tramo (sin promedios)
        p.totalViaticoUsd = totalViaticoUsdTramos
        // amountViatico queda en 0: la verdad está en cada tramo, no en un promedio
        p.amountViatico = 0

        // Peajes
        p.cantidadPeaje = totalCantPeajes
        p.totalAsigPeajeBs = totalPeajesBs
        p.montoPeaje = totalCantPeajes > 0 ? totalPeajesBs / totalCantPeajes : 0

        // Conversión y multiplicación por personas
        p.totalViaticoBs = p.totalViaticoUsd * p.tipoCambio
        p.totalViaticoChoferesBs = p.totalViaticoBs * p.cantChoferes
        p.totalViaticoEscolta = p.totalViaticoBs * p.cantEscoltas
        p.totalApagar = p.totalViaticoChoferesBs + p.totalViaticoEscolta + p.totalAsigPeajeBs
    }

    const calcularDiaExtra = () => {
        const d = diaExtra.value
        d.cantChoferes = pago.value.cantChoferes
        d.cantEscoltas = pago.value.cantEscoltas
        d.tipoCambio = pago.value.tipoCambio
        d.totViatico = d.amountViatico * d.cantidadDiasExtra
        d.totalViaticoUsd = d.totViatico
        d.totalViaticoChoferesBs = d.totViatico * d.tipoCambio * d.cantChoferes
        d.totalViaticoEscolta = d.totViatico * d.tipoCambio * d.cantEscoltas
        d.totalApagar = d.totalViaticoChoferesBs + d.totalViaticoEscolta
    }

    // Moneda en que se enviará la solicitud al sistema central de Compras.
    // Default VES porque los viáticos y peajes se pagan en Bolívares al chofer.
    const monedaCompraExterna = ref<MonedaCompra>('VES')

    // ── Payload final ──
    const payload = computed<ViaticoRequest>(() => ({
        peajeHeaderRequest: {
            ...header.value,
            tramos: tramos.value.map(t => ({ ...t })),
        },
        vehiculoViaticos: vehiculos.value.map(v => ({ ...v })),
        pagoViaticoGeneral: { ...pago.value },
        pagoViaticoDiaExtra: diaExtraActivo.value ? { ...diaExtra.value } : null,
        monedaCompraExterna: monedaCompraExterna.value,
    }))

    // ── Submit ──
    const submitting = ref(false)
    const error = ref('')
    const editingId = ref<number | null>(null)
    const editMode = computed(() => editingId.value !== null)

    const submit = async () => {
        submitting.value = true
        error.value = ''
        try {
            if (editingId.value) {
                return await viaticosService.editViatico(editingId.value, payload.value)
            }
            return await viaticosService.addViatico(payload.value)
        } catch (e: any) {
            error.value = e?.response?.data?.error || e?.response?.data?.mensaje || e.message || 'Error al guardar viático'
            throw e
        } finally {
            submitting.value = false
        }
    }

    /**
     * Carga un viático existente del API para edición.
     */
    const loadForEdit = async (id: number) => {
        try {
            const data = await viaticosService.getViatico(id)
            editingId.value = id

            // Header — normalizar fechas a YYYY-MM-DD para que <input type="date"> las acepte
            const toDateOnly = (d?: string) => (d || '').slice(0, 10)
            const h = data.viaticoHeaderResponse
            header.value = {
                nombreSolicitante: h.nombreSolicitante || '',
                fechaSolicitud: toDateOnly(h.fechaSolicitud) || new Date().toISOString().slice(0, 10),
                diasDeViaje: h.diasDeViaje || 1,
                lugarSalida: h.lugarSalida || '',
                lugarDestino: h.lugarDestino || '',
                cedulaPago: h.cedulaPago || '',
                fechaSalida: toDateOnly(h.fechaSalida),
                fechaRetorno: toDateOnly(h.fechaRetorno),
                observaciones: h.observaciones || '',
                viajaEscoltado: h.viajaEscoltado || false,
                cedulasEscoltas: Array.isArray(h.cedulasEscoltas) ? h.cedulasEscoltas : [],
            }

            // Tramos
            const tramosData = data.tramos || h.tramos || []
            if (tramosData.length > 0) {
                tramos.value = tramosData.map((t: any) => ({
                    orden: t.orden || 1,
                    origen: t.origen || '',
                    destino: t.destino || '',
                    pernocta: t.pernocta !== undefined ? !!t.pernocta : true,
                    diasViajeTramo: t.diasViajeTramo || 0,
                    viaticoDiarioTramo: t.viaticoDiarioTramo || 0,
                    totalViaticoTramo: t.totalViaticoTramo || 0,
                    cantPeajes: t.cantPeajes || 0,
                    montoPeaje: t.montoPeaje || 0,
                    totalPeajes: t.totalPeajes || 0,
                }))
            } else {
                // Viático legacy sin tramos → crear un tramo desde header
                tramos.value = [{
                    orden: 1,
                    origen: h.lugarSalida || '',
                    destino: h.lugarDestino || '',
                    pernocta: true,
                    diasViajeTramo: h.diasDeViaje || 1,
                    viaticoDiarioTramo: 0,
                    totalViaticoTramo: 0,
                    cantPeajes: 0,
                    montoPeaje: 0,
                    totalPeajes: 0,
                }]
            }

            // Vehículos
            vehiculos.value = (data.vehiculoViaticos || []).map((v: any) => ({
                nameDriver: v.nameDriver || '',
                idDriver: v.idDriver || '',
                invoiceTravel: v.invoiceTravel || '',
                plateNumber: v.plateNumber || '',
                carBrand: v.carBrand || '',
                carModel: v.carModel || '',
                carSerial: v.carSerial || '',
                typeCar: v.typeCar || '',
                plateNumberRemolque: v.plateNumberRemolque || '',
                tieneSegundaPuerta: !!v.tieneSegundaPuerta,
                idPrecintoSegundaPuerta: v.idPrecintoSegundaPuerta || '',
                precintosTramos: Array.isArray(v.precintosTramos)
                    ? v.precintosTramos.map((p: any) => ({
                        ordenTramo: Number(p.ordenTramo) || 0,
                        idPrecinto: p.idPrecinto || '',
                        facturaNumero: p.facturaNumero || '',
                    }))
                    : [],
            }))

            // Pago
            const p = data.pagoViaticoGeneral
            if (p) {
                pago.value = {
                    amountViatico: p.amountViatico || 0,
                    cantidadDias: p.cantidadDias || 1,
                    totalViaticoUsd: p.totalViaticoUsd || 0,
                    cantChoferes: p.cantChoferes || 1,
                    cantEscoltas: p.cantEscoltas || 0,
                    tipoCambio: p.tipoCambio || 0,
                    totalViaticoBs: p.totalViaticoBs || 0,
                    totalViaticoChoferesBs: p.totalViaticoChoferesBs || 0,
                    totalViaticoEscolta: p.totalViaticoEscolta || 0,
                    montoPeaje: p.montoPeaje || 0,
                    cantidadPeaje: p.cantidadPeaje || 0,
                    totalAsigPeajeBs: p.totalAsigPeajeBs || 0,
                    totalApagar: p.totalApagar || 0,
                }
            }

            // Día extra
            const de = data.pagoViaticoDiaExtra
            if (de) {
                diaExtraActivo.value = true
                diaExtra.value = {
                    tipoViatico: de.tipoViatico || '',
                    amountViatico: de.amountViatico || 0,
                    totalViaticoUsd: de.totViatico || 0,
                    cantidadDiasExtra: de.cantidadDiasExtra || 0,
                    totViatico: de.totViatico || 0,
                    cantChoferes: de.cantChoferes || 1,
                    cantEscoltas: de.cantEscoltas || 0,
                    tipoCambio: de.tipoCambio || 0,
                    totalViaticoChoferesBs: de.totalViaticoChoferesBs || 0,
                    totalViaticoEscolta: de.totalViaticoEscolta || 0,
                    totalApagar: de.totalApagar || 0,
                }
            }
        } catch (e: any) {
            error.value = e.message || 'Error cargando viático'
            throw e
        }
    }

    // ── Reset ──
    const reset = () => {
        editingId.value = null
        header.value = {
            nombreSolicitante: '', fechaSolicitud: new Date().toISOString().slice(0, 10),
            diasDeViaje: 1, lugarSalida: '', lugarDestino: '', cedulaPago: '',
            fechaSalida: '', fechaRetorno: '', observaciones: '', viajaEscoltado: false,
            cedulasEscoltas: [],
        }
        tramos.value = [crearTramoVacio(1)]
        vehiculos.value = []
        pago.value = {
            amountViatico: 0, cantidadDias: 1, totalViaticoUsd: 0, cantChoferes: 1,
            cantEscoltas: 0, tipoCambio: 0, totalViaticoBs: 0, totalViaticoChoferesBs: 0,
            totalViaticoEscolta: 0, montoPeaje: 0, cantidadPeaje: 0, totalAsigPeajeBs: 0,
            totalApagar: 0,
        }
        diaExtraActivo.value = false
        diaExtra.value = {
            tipoViatico: '', amountViatico: 0, totalViaticoUsd: 0, cantidadDiasExtra: 0,
            totViatico: 0, cantChoferes: 1, cantEscoltas: 0, tipoCambio: 0,
            totalViaticoChoferesBs: 0, totalViaticoEscolta: 0, totalApagar: 0,
        }
        error.value = ''
    }

    return {
        header, tramos, vehiculos, pago, diaExtraActivo, diaExtra,
        monedaCompraExterna,
        addTramo, removeTramo, onTramoDestinoChange, sincronizarHeaderDesdeTramos,
        rutaCompleta,
        addVehiculo, removeVehiculo, calcularPago, calcularDiaExtra,
        payload, submitting, error, submit, reset,
        editingId, editMode, loadForEdit,
    }
})
