/**
 * Store Pinia — Auxilio Vial (asistencia mecánica en ruta).
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { auxilioVialService } from '@/services/auxilioVialService'
import { useCatalogosStore } from '@/stores/catalogosStore'

export const useAuxilioVialStore = defineStore('auxilioVial', () => {
    const catalogos = useCatalogosStore()

    // ── Header ──
    const header = ref({
        viaticoPrincipalId: null as number | null,
        nombreSolicitante: '',
        nombreMecanico: '',
        cedulaMecanico: '',
        fechaSolicitud: new Date().toISOString().slice(0, 10),
        fechaSalida: '',
        fechaRetorno: '',
        lugarSalida: '',
        lugarDestino: '',
        diasDeViaje: 1,
        descripcion: '',
        observaciones: '',
    })

    // ── Vehículo ──
    const vehiculo = ref({
        placa: '',
        marca: '',
        modelo: '',
        tipoVehiculo: '',
    })

    // ── Pago (viáticos + peajes) ──
    const pago = ref({
        viaticoDiario: 0,
        cantDiasViaje: 1,
        tipoCambio: 0,
        totViaticoUsd: 0,
        totViaticoBs: 0,
        asignacionPeaje: 0,
        cantPeajes: 0,
        totPeajes: 0,
        totalPagarBs: 0,
    })

    // ── Cálculos ──
    const calcularPago = () => {
        const p = pago.value
        p.tipoCambio = catalogos.dolar.dolarValue || 0
        p.totViaticoUsd = p.viaticoDiario * p.cantDiasViaje
        p.totViaticoBs = p.totViaticoUsd * p.tipoCambio
        p.totPeajes = p.asignacionPeaje * p.cantPeajes
        p.totalPagarBs = p.totViaticoBs + p.totPeajes
    }

    // ── Payload ──
    const payload = computed(() => ({
        header: { ...header.value },
        vehiculo: { ...vehiculo.value },
        pago: { ...pago.value },
    }))

    // ── Submit ──
    const submitting = ref(false)
    const error = ref('')

    const submit = async () => {
        submitting.value = true
        error.value = ''
        try {
            const result = await auxilioVialService.addAuxilio(payload.value)
            return result
        } catch (e: any) {
            error.value = e?.response?.data?.error || e.message || 'Error al guardar auxilio vial'
            throw e
        } finally {
            submitting.value = false
        }
    }

    // ── Reset ──
    const reset = () => {
        header.value = {
            viaticoPrincipalId: null,
            nombreSolicitante: '',
            nombreMecanico: '',
            cedulaMecanico: '',
            fechaSolicitud: new Date().toISOString().slice(0, 10),
            fechaSalida: '',
            fechaRetorno: '',
            lugarSalida: '',
            lugarDestino: '',
            diasDeViaje: 1,
            descripcion: '',
            observaciones: '',
        }
        vehiculo.value = { placa: '', marca: '', modelo: '', tipoVehiculo: '' }
        pago.value = {
            viaticoDiario: 0, cantDiasViaje: 1, tipoCambio: 0,
            totViaticoUsd: 0, totViaticoBs: 0,
            asignacionPeaje: 0, cantPeajes: 0, totPeajes: 0,
            totalPagarBs: 0,
        }
        error.value = ''
    }

    return {
        header, vehiculo, pago,
        calcularPago, payload,
        submitting, error, submit, reset,
    }
})
