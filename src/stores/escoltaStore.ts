/**
 * Store Pinia — Wizard de Escoltas (2 pasos).
 * Soporta múltiples tramos (multi-destino) y múltiples vehículos (gandolas)
 * con cálculo de viático y peajes por tramo.
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { escoltasService } from '@/services/escoltasService'
import type { VehiculoEscoltaInfo, ViaticoEscoltaPago, ViaticoEscoltaRequest, ViaticoEscoltaTramo, MonedaCompra } from '@/interfaces'

function crearTramoVacio(orden: number, origen = ''): ViaticoEscoltaTramo {
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

function recalcularTotalesTramo(t: ViaticoEscoltaTramo) {
    t.totalViaticoTramo = (t.diasViajeTramo || 0) * (t.viaticoDiarioTramo || 0)
    t.totalPeajes = (t.cantPeajes || 0) * (t.montoPeaje || 0)
}

export const useEscoltaStore = defineStore('escolta', () => {
    // ── Cabecera del viático ──
    const nombreSolicitante = ref('')
    const fechaSolicitud = ref(new Date().toISOString().slice(0, 10))
    const cedulaEscolta = ref('')
    const observaciones = ref('')

    // Fecha de salida común a todos los vehículos del viático.
    const fechaSalida = ref('')

    // ── Vehículos (gandolas) registrados en este viático ──
    const vehiculos = ref<VehiculoEscoltaInfo[]>([])

    const addVehiculo = (v: VehiculoEscoltaInfo) => {
        vehiculos.value.push(v)
    }

    const removeVehiculo = (idx: number) => {
        vehiculos.value.splice(idx, 1)
    }

    // ── Tramos multi-destino ──
    const tramos = ref<ViaticoEscoltaTramo[]>([crearTramoVacio(1)])

    const addTramo = () => {
        const ultimo = tramos.value[tramos.value.length - 1]
        tramos.value.push(crearTramoVacio(
            tramos.value.length + 1,
            ultimo?.destino || '',
        ))
    }

    const removeTramo = (index: number) => {
        if (tramos.value.length <= 1) return
        tramos.value.splice(index, 1)
        tramos.value.forEach((t, i) => {
            t.orden = i + 1
            if (i > 0) {
                t.origen = tramos.value[i - 1].destino
            }
        })
    }

    const onTramoDestinoChange = (index: number) => {
        if (index < tramos.value.length - 1) {
            tramos.value[index + 1].origen = tramos.value[index].destino
        }
    }

    const rutaCompleta = computed(() => {
        if (tramos.value.length === 0) return ''
        const puntos = [tramos.value[0].origen]
        for (const t of tramos.value) {
            if (t.destino) puntos.push(t.destino)
        }
        return puntos.filter(Boolean).join(' → ')
    })

    const origenGlobal = computed(() => tramos.value[0]?.origen || '')
    const destinoGlobal = computed(
        () => tramos.value[tramos.value.length - 1]?.destino || '',
    )

    // ── Paso 2: Pago ──
    const pago = ref<ViaticoEscoltaPago>({
        viaticoEscoltaDiarioMonto: 0,
        cantidadDiasDestino: 1,
        totalViaticoEscoltaUsd: 0,
        tasaDolar: 0,
        totalViaticoEscoltaBoli: 0,
    })

    /** Suma exacta tramo a tramo, sin promedios.
     *  Los viáticos de escolta NO incluyen peajes — total = viático × tasa. */
    const calcularPago = () => {
        const p = pago.value
        let totalUsd = 0
        let totalDias = 0
        for (const t of tramos.value) {
            // Asegurar peajes en cero a nivel de cada tramo.
            t.cantPeajes = 0
            t.montoPeaje = 0
            t.totalPeajes = 0
            recalcularTotalesTramo(t)
            totalUsd += t.totalViaticoTramo
            totalDias += (t.diasViajeTramo || 0)
        }
        p.cantidadDiasDestino = totalDias
        p.totalViaticoEscoltaUsd = totalUsd
        p.viaticoEscoltaDiarioMonto = 0
        p.totalViaticoEscoltaBoli = totalUsd * p.tasaDolar
    }

    const totalPeajesBs = computed(() =>
        tramos.value.reduce((s, t) => s + (t.cantPeajes || 0) * (t.montoPeaje || 0), 0)
    )

    // Default VES: el viático del escolta se paga en Bolívares al beneficiario.
    const monedaCompraExterna = ref<MonedaCompra>('VES')

    // ── Payload final ──
    // Cada vehículo registra el origen/destino global de la ruta y la fecha de salida.
    const payload = computed<ViaticoEscoltaRequest>(() => ({
        nombreSolicitante: nombreSolicitante.value,
        fechaSolicitud: fechaSolicitud.value,
        cedulaEscolta: cedulaEscolta.value,
        observaciones: observaciones.value,
        escoltaInfo: [{ cedulaChofer: cedulaEscolta.value }],
        vehiculoEscoltaInfo: vehiculos.value.map(v => ({
            ...v,
            origen: origenGlobal.value,
            destino: destinoGlobal.value,
            fechaSalida: fechaSalida.value,
        })),
        viaticoEscoltaPago: { ...pago.value },
        tramos: tramos.value.map(t => ({ ...t })),
        monedaCompraExterna: monedaCompraExterna.value,
    }))

    // ── Submit ──
    const submitting = ref(false)
    const error = ref('')

    const submit = async () => {
        submitting.value = true
        error.value = ''
        try {
            const result = await escoltasService.addViaticoEscolta(payload.value)
            return result
        } catch (e: any) {
            error.value = e?.response?.data?.mensaje || e.message || 'Error al guardar escolta'
            throw e
        } finally {
            submitting.value = false
        }
    }

    // ── Reset ──
    const reset = () => {
        nombreSolicitante.value = ''
        fechaSolicitud.value = new Date().toISOString().slice(0, 10)
        cedulaEscolta.value = ''
        observaciones.value = ''
        fechaSalida.value = ''
        vehiculos.value = []
        tramos.value = [crearTramoVacio(1)]
        pago.value = {
            viaticoEscoltaDiarioMonto: 0, cantidadDiasDestino: 1,
            totalViaticoEscoltaUsd: 0, tasaDolar: 0, totalViaticoEscoltaBoli: 0,
        }
        error.value = ''
    }

    return {
        nombreSolicitante, fechaSolicitud, cedulaEscolta, observaciones,
        fechaSalida,
        vehiculos, addVehiculo, removeVehiculo,
        tramos, pago, calcularPago, totalPeajesBs,
        monedaCompraExterna,
        addTramo, removeTramo, onTramoDestinoChange,
        rutaCompleta, origenGlobal, destinoGlobal,
        payload, submitting, error, submit, reset,
    }
})
