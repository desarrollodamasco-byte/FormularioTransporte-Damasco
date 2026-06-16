/**
 * Store Pinia — Wizard de Reparaciones (5 pasos).
 * Acumula datos entre pasos y envía al backend.
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { reparacionesService } from '@/services/reparacionesService'
import type { HeaderReparation, Vehiculo, PartsRequest, PaymentInfo, ReparationInfo, MonedaCompra } from '@/interfaces'

export const useReparacionStore = defineStore('reparacion', () => {
    // ── Paso 1: Header + Vehículo ──
    const header = ref<HeaderReparation>({
        fechaSolicitud: new Date().toISOString().slice(0, 10),
        nombreoRazonSocial: '',
        nombreSolicitante: '',
        tipoDocumento: '',
        numeroDocumento: '',
        description: '',
        tipoSolicitud: 'Reparación',
    })

    const vehiculo = ref<Vehiculo>({
        plateNumber: '',
        carBrand: '',
        carModel: '',
        carSerial: '',
        typeCar: '',
    })

    // ── Paso 2: Repuestos ──
    const repuestos = ref<PartsRequest[]>([])

    const addRepuesto = () => {
        repuestos.value.push({
            reqCarParts: '',
            quantityPartsCar: '1',
            priceUsd: 0,
            priceBs: 0,
            iva: false,
            ivaPriceUsd: 0,
            ivaPriceBs: 0,
            totPriceUsd: 0,
            totPriceBs: 0,
        })
    }

    const removeRepuesto = (index: number) => {
        repuestos.value.splice(index, 1)
    }

    /** Recalcula totales tomando el USD como fuente (caso típico: el usuario tipea el USD). */
    const calcularRepuesto = (index: number, tipoCambio: number) => {
        const r = repuestos.value[index]
        r.priceBs = (r.priceUsd || 0) * (tipoCambio || 0)
        recalcularTotales(r)
    }

    /** Recalcula tomando el Bs como fuente: USD = Bs / tasa. Útil cuando el usuario solo conoce el precio en Bs. */
    const calcularRepuestoDesdeBs = (index: number, tipoCambio: number) => {
        const r = repuestos.value[index]
        r.priceUsd = tipoCambio > 0 ? (r.priceBs || 0) / tipoCambio : 0
        recalcularTotales(r)
    }

    function recalcularTotales(r: PartsRequest) {
        const qty = Number(r.quantityPartsCar) || 0
        let baseUsd = qty * (r.priceUsd || 0)
        let baseBs = qty * (r.priceBs || 0)
        if (r.iva) {
            r.ivaPriceUsd = baseUsd * 0.16
            r.ivaPriceBs = baseBs * 0.16
        } else {
            r.ivaPriceUsd = 0
            r.ivaPriceBs = 0
        }
        r.totPriceUsd = baseUsd + r.ivaPriceUsd
        r.totPriceBs = baseBs + r.ivaPriceBs
    }

    const totalRepuestosUsd = computed(() =>
        repuestos.value.reduce((sum, r) => sum + (r.totPriceUsd || 0), 0))

    const totalRepuestosBs = computed(() =>
        repuestos.value.reduce((sum, r) => sum + (r.totPriceBs || 0), 0))

    // ── Paso 3: Pago ──
    const payment = ref<PaymentInfo>({
        nombreBeneficiario: '',
        tipoDocumento: '',
        numeroDocumento: '',
        telefonoPago: '',
        nroCuenta: '',
        banco: '',
        observaciones: '',
    })

    // ── Payload final ──
    const monedaCompraExterna = ref<MonedaCompra>('USD')

    // Archivo adjunto opcional (cotización, factura, foto). Se envía al
    // backend como multipart/form-data; se comparte con Compras via URL pública.
    const archivoAdjunto = ref<File | null>(null)

    const payload = computed<ReparationInfo>(() => ({
        headerReparation: { ...header.value },
        vehiculos: [{ ...vehiculo.value }],
        partsRequests: repuestos.value.map(r => ({ ...r })),
        infoPayment: { ...payment.value },
        monedaCompraExterna: monedaCompraExterna.value,
    }))

    // ── Submit ──
    const submitting = ref(false)
    const error = ref('')

    const submit = async () => {
        submitting.value = true
        error.value = ''
        try {
            const result = await reparacionesService.addReparacion(
                payload.value, archivoAdjunto.value)
            return result
        } catch (e: any) {
            error.value = formatearErrorBackend(e) || 'Error al guardar reparación'
            throw e
        } finally {
            submitting.value = false
        }
    }

    /** Convierte una respuesta de error de DRF (puede ser {mensaje:...} o
     *  un objeto de errores de validación por campo) en un mensaje legible. */
    function formatearErrorBackend(e: any): string {
        const data = e?.response?.data
        if (!data) return e?.message || ''
        // Caso 1: backend devolvió {mensaje: '...'}
        if (typeof data === 'string') return data
        if (data.mensaje) return data.mensaje
        if (data.detail) return data.detail
        if (data.error) return data.error
        // Caso 2: errores de validación DRF — recorrer recursivamente
        const partes: string[] = []
        const recorrer = (obj: any, prefix = '') => {
            if (Array.isArray(obj)) {
                obj.forEach((v, i) => recorrer(v, `${prefix}[${i}]`))
            } else if (obj && typeof obj === 'object') {
                for (const [k, v] of Object.entries(obj)) {
                    recorrer(v, prefix ? `${prefix}.${k}` : k)
                }
            } else {
                partes.push(prefix ? `${prefix}: ${obj}` : String(obj))
            }
        }
        recorrer(data)
        return partes.slice(0, 6).join(' · ')
    }

    // ── Reset ──
    const reset = () => {
        header.value = {
            fechaSolicitud: new Date().toISOString().slice(0, 10),
            nombreoRazonSocial: '', nombreSolicitante: '', tipoDocumento: '',
            numeroDocumento: '', description: '', tipoSolicitud: 'Reparación',
        }
        vehiculo.value = { plateNumber: '', carBrand: '', carModel: '', carSerial: '', typeCar: '' }
        repuestos.value = []
        payment.value = {
            nombreBeneficiario: '', tipoDocumento: '', numeroDocumento: '',
            telefonoPago: '', nroCuenta: '', banco: '', observaciones: '',
        }
        monedaCompraExterna.value = 'USD'
        archivoAdjunto.value = null
        error.value = ''
    }

    return {
        header, vehiculo, repuestos, payment,
        monedaCompraExterna, archivoAdjunto,
        addRepuesto, removeRepuesto, calcularRepuesto, calcularRepuestoDesdeBs,
        totalRepuestosUsd, totalRepuestosBs,
        payload, submitting, error, submit, reset,
    }
})
