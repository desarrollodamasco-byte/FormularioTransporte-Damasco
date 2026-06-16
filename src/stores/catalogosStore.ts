/**
 * Store Pinia — Catálogos (datos maestros).
 * Carga UNA SOLA VEZ los datos del API y los reutiliza en todas las vistas.
 * Elimina las llamadas redundantes que causaban lentitud en cada navegación.
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { consultasService } from '@/services/consultasService'
import type { Chofer, Vehiculo, Escolta, Destino, Peajes, Dolar, Banco, DiaExtra, ProveedorTaller, Remolque, VehiculoProveedor } from '@/interfaces'
import axios from 'axios'

export const useCatalogosStore = defineStore('catalogos', () => {
    // ── Data ──
    const choferes = ref<Chofer[]>([])
    const vehiculos = ref<Vehiculo[]>([])
    const escoltas = ref<Escolta[]>([])
    const mecanicos = ref<Chofer[]>([])
    const destinos = ref<Destino[]>([])
    const peajes = ref<Peajes[]>([])
    const bancos = ref<Banco[]>([])
    const diasExtras = ref<DiaExtra[]>([])
    const proveedores = ref<ProveedorTaller[]>([])
    const remolques = ref<Remolque[]>([])
    const vehiculosProveedor = ref<VehiculoProveedor[]>([])
    const dolar = ref<Dolar>({ dolarValue: 0 })
    const euro = ref<Dolar>({ dolarValue: 0 })

    // Fuente del dólar: 'dolarapi' | 'api_interno' | 'manual' | ''
    const dolarFuente = ref('')
    const dolarFechaActualizacion = ref('')
    // Fuente del euro: 'dolarapi' | 'manual' | ''
    const euroFuente = ref('')
    const euroFechaActualizacion = ref('')

    // ── Flags ──
    const loaded = ref(false)
    const loading = ref(false)
    const error = ref('')

    /**
     * Obtiene la tasa del dólar.
     * 1. Intenta desde https://ve.dolarapi.com/v1/dolares/oficial (BCV oficial)
     * 2. Si falla, usa el API interno del backend
     * 3. Si ambos fallan, el usuario la ingresa manualmente
     */
    async function fetchDolar(): Promise<Dolar> {
        // 1. Intentar API externa (dolarapi.com)
        try {
            const resp = await axios.get('https://ve.dolarapi.com/v1/dolares/oficial', {
                timeout: 5000,
            })
            const data = resp.data
            if (data && data.promedio && data.promedio > 0) {
                dolarFuente.value = 'dolarapi'
                dolarFechaActualizacion.value = data.fechaActualizacion || ''
                console.log(`Tasa dolar desde dolarapi.com: ${data.promedio}`)
                return { dolarValue: data.promedio }
            }
        } catch (e) {
            console.warn('dolarapi.com no disponible, usando API interno:', e)
        }

        // 2. Fallback: API interno del backend
        try {
            const dl = await consultasService.getDolar()
            if (dl && dl.dolarValue && dl.dolarValue > 0) {
                dolarFuente.value = 'api_interno'
                dolarFechaActualizacion.value = ''
                console.log(`Tasa dolar desde API interno: ${dl.dolarValue}`)
                return dl
            }
        } catch (e) {
            console.warn('API interno de dolar tampoco disponible:', e)
        }

        // 3. No se pudo obtener — el usuario deberá ingresarla manualmente
        dolarFuente.value = 'manual'
        return { dolarValue: 0 }
    }

    /**
     * Obtiene la tasa del euro oficial desde dolarapi.com.
     * Si falla, el usuario la ingresa manualmente.
     */
    async function fetchEuro(): Promise<Dolar> {
        try {
            const resp = await axios.get('https://ve.dolarapi.com/v1/euros/oficial', {
                timeout: 5000,
            })
            const data = resp.data
            if (data && data.promedio && data.promedio > 0) {
                euroFuente.value = 'dolarapi'
                euroFechaActualizacion.value = data.fechaActualizacion || ''
                console.log(`Tasa euro desde dolarapi.com: ${data.promedio}`)
                return { dolarValue: data.promedio }
            }
        } catch (e) {
            console.warn('dolarapi.com (euros) no disponible:', e)
        }
        euroFuente.value = 'manual'
        return { dolarValue: 0 }
    }

    /**
     * Carga todos los catálogos en paralelo.
     * Si ya están cargados, retorna inmediatamente (caché en memoria).
     * Llamar con force=true para forzar recarga.
     */
    async function cargar(force = false) {
        if (loaded.value && !force) return
        if (loading.value) return // evitar cargas duplicadas

        loading.value = true
        error.value = ''

        try {
            const [c, v, e, d, p, b, dx, pv, mc, rm, vp, dl, eu] = await Promise.all([
                consultasService.getChoferes().catch(err => { console.error('getChoferes:', err); return [] as Chofer[] }),
                consultasService.getVehiculos().catch(err => { console.error('getVehiculos:', err); return [] as Vehiculo[] }),
                consultasService.getEscoltas().catch(err => { console.error('getEscoltas:', err); return [] as any[] }),
                consultasService.getDestinos().catch(err => { console.error('getDestinos:', err); return [] as Destino[] }),
                consultasService.getPeajes().catch(err => { console.error('getPeajes:', err); return [] as Peajes[] }),
                consultasService.getBancos().catch(err => { console.error('getBancos:', err); return [] as Banco[] }),
                consultasService.getDiasExtras().catch(err => { console.error('getDiasExtras:', err); return [] as DiaExtra[] }),
                consultasService.getProveedores().catch(err => { console.error('getProveedores:', err); return [] as ProveedorTaller[] }),
                consultasService.getMecanicos().catch(err => { console.error('getMecanicos:', err); return [] as Chofer[] }),
                consultasService.getRemolques().catch(err => { console.error('getRemolques:', err); return [] as Remolque[] }),
                consultasService.getVehiculosProveedor().catch(err => { console.error('getVehiculosProveedor:', err); return [] as VehiculoProveedor[] }),
                fetchDolar(),
                fetchEuro(),
            ])

            choferes.value = c
            vehiculos.value = v
            // getescoltas devuelve formato EmpleadoTransporte (nameChofer/cedulaChofer)
            // pero la interfaz Escolta espera nombreEscolta/cedulaEscolta → mapear
            escoltas.value = (e as any[]).map(emp => ({
                nombreEscolta: emp.nombreEscolta || emp.nameChofer || '',
                cedulaEscolta: emp.cedulaEscolta || emp.cedulaChofer || '',
                telefonoEscolta: emp.telefonoEscolta || emp.telefonoChofer || '',
                cuentaBancoEscolta: emp.cuentaBancoEscolta || emp.cuentaBanco || '',
                bancoEscolta: emp.bancoEscolta || emp.banco || '',
            }))
            destinos.value = d
            peajes.value = p
            bancos.value = b
            diasExtras.value = dx
            proveedores.value = pv
            mecanicos.value = mc
            remolques.value = rm
            vehiculosProveedor.value = vp
            dolar.value = dl
            euro.value = eu

            loaded.value = true
        } catch (err: any) {
            error.value = err.message || 'Error cargando catálogos'
            console.error('Error cargando catálogos:', err)
        } finally {
            loading.value = false
        }
    }

    /**
     * Forzar recarga solo del dólar (para refrescar sin recargar todo).
     */
    async function recargarDolar() {
        dolar.value = await fetchDolar()
    }

    /** Forzar recarga solo del euro. */
    async function recargarEuro() {
        euro.value = await fetchEuro()
    }

    // ── Helpers de búsqueda ──
    function getChoferByCedula(cedula: string) {
        return choferes.value.find(c => c.cedulaChofer?.trim() === cedula?.trim())
    }

    function getVehiculoByPlaca(placa: string) {
        return vehiculos.value.find(v => v.plateNumber?.trim() === placa?.trim())
    }

    function getEscoltaByCedula(cedula: string) {
        return escoltas.value.find(e => e.cedulaEscolta?.trim() === cedula?.trim())
    }

    function getDestinoByCodigo(id: string) {
        return destinos.value.find(d => d.idDestination === id)
    }

    /** Inserta o reemplaza un remolque en el catálogo local (sin re-fetch). */
    function upsertRemolque(r: Remolque) {
        const key = (s: string) => (s || '').trim().toUpperCase()
        const target = key(r.plateNumber)
        const idx = remolques.value.findIndex(x => key(x.plateNumber) === target)
        if (idx >= 0) {
            remolques.value.splice(idx, 1, r)
        } else {
            remolques.value.push(r)
        }
    }

    /** Inserta o reemplaza un proveedor/taller en el catálogo local (sin re-fetch). */
    function upsertProveedor(pv: ProveedorTaller) {
        const key = (s: string) => (s || '').trim().toUpperCase()
        const target = key(pv.cedulaRif)
        const idx = proveedores.value.findIndex(x => key(x.cedulaRif) === target)
        if (idx >= 0) {
            proveedores.value.splice(idx, 1, pv)
        } else {
            proveedores.value.push(pv)
        }
    }

    /** Inserta o reemplaza un peaje en el catálogo local (sin re-fetch). */
    function upsertPeaje(p: Peajes) {
        const key = (s: string, d: string) =>
            `${(s || '').trim().toLowerCase()}|${(d || '').trim().toLowerCase()}`
        const target = key(p.lugarSalida, p.destino)
        const idx = peajes.value.findIndex(x => key(x.lugarSalida, x.destino) === target)
        if (idx >= 0) {
            peajes.value.splice(idx, 1, p)
        } else {
            peajes.value.push(p)
        }
    }

    /** Inserta o reemplaza un vehículo de proveedor en el catálogo local. */
    function upsertVehiculoProveedor(v: VehiculoProveedor) {
        const key = (s: string) => (s || '').trim().toUpperCase()
        const target = key(v.placa)
        const idx = vehiculosProveedor.value.findIndex(x => key(x.placa) === target)
        if (idx >= 0) {
            vehiculosProveedor.value.splice(idx, 1, v)
        } else {
            vehiculosProveedor.value.push(v)
        }
    }

    // ── Computed: proveedores filtrados por tipo ──
    // Permisivo con datos legados: cualquier proveedor que no sea explícitamente
    // 'viatico' cae como proveedor de repuesto/insumo. Esto cubre filas con
    // tipo='' o NULL en BD antiguas.
    const proveedoresRepuesto = computed(() =>
        proveedores.value.filter(p => (p.tipo || 'repuesto') !== 'viatico')
    )
    const proveedoresViatico = computed(() =>
        proveedores.value.filter(p => p.tipo === 'viatico')
    )

    return {
        // Data
        choferes, vehiculos, escoltas, destinos, peajes, bancos, diasExtras, proveedores, mecanicos, remolques, vehiculosProveedor, dolar, euro,
        dolarFuente, dolarFechaActualizacion, euroFuente, euroFechaActualizacion,
        // Computed
        proveedoresRepuesto, proveedoresViatico,
        // State
        loaded, loading, error,
        // Actions
        cargar, recargarDolar, recargarEuro, upsertPeaje, upsertRemolque, upsertProveedor, upsertVehiculoProveedor,
        // Helpers
        getChoferByCedula, getVehiculoByPlaca, getEscoltaByCedula, getDestinoByCodigo,
    }
})

