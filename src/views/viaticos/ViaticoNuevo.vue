<template>
  <div>
    <h2 class="text-h5 mb-4">{{ store.editMode ? `Editar Viático #${store.editingId}` : 'Nuevo Viático' }}</h2>
    <v-card class="pa-6">
      <v-form ref="form">
        <v-row>
          <v-col cols="12" md="6">
            <v-text-field v-model="store.header.nombreSolicitante" label="Nombre del Solicitante" :rules="[v => !!v || 'Requerido']" />
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field v-model="store.header.fechaSolicitud" label="Fecha de Solicitud" type="date" :rules="[v => !!v || 'Requerido']" />
          </v-col>
        </v-row>

        <!-- ═══════════════════════════════════════════════ -->
        <!-- TRAMOS DEL VIAJE (multi-destino)               -->
        <!-- ═══════════════════════════════════════════════ -->
        <v-divider class="my-4" />
        <div class="d-flex align-center mb-3">
          <h3 class="text-h6">Tramos del Viaje</h3>
          <v-chip class="ml-2" size="small" color="primary" variant="tonal">
            {{ store.tramos.length }} tramo{{ store.tramos.length === 1 ? '' : 's' }}
          </v-chip>
        </div>

        <v-card
          v-for="(tramo, idx) in store.tramos"
          :key="idx"
          variant="outlined"
          class="pa-4 mb-3"
        >
          <div class="d-flex align-center mb-2">
            <v-chip size="small" color="primary" variant="flat" class="mr-2">
              Tramo {{ tramo.orden }}
            </v-chip>
            <v-spacer />
            <v-btn
              v-if="store.tramos.length > 1"
              icon="mdi-close"
              size="x-small"
              variant="text"
              color="error"
              @click="onRemoveTramo(idx)"
            />
          </div>
          <v-row dense>
            <v-col cols="12" md="5">
              <!-- Tramo 1: selección libre del origen (solo salidas del catálogo de Peajes) -->
              <v-autocomplete
                v-if="idx === 0"
                v-model="tramo.origen"
                :items="itemsSalidas"
                item-title="nameDestination"
                item-value="nameDestination"
                label="Origen"
                :loading="catalogos.loading"
                :rules="[v => !!v || 'Requerido']"
                @update:model-value="onOrigenChange(idx)"
              />
              <!-- Tramos 2+: origen automático (readonly) -->
              <v-text-field
                v-else
                :model-value="tramo.origen"
                label="Origen"
                readonly
                variant="filled"
                hint="Auto desde tramo anterior"
                persistent-hint
              />
            </v-col>
            <v-col cols="12" md="2" class="d-flex align-center justify-center">
              <v-icon icon="mdi-arrow-right" size="large" color="primary" />
            </v-col>
            <v-col cols="12" md="5">
              <v-autocomplete
                v-model="tramo.destino"
                :items="itemsDestinosDesde(tramo.origen)"
                item-title="nameDestination"
                item-value="nameDestination"
                :label="`Destino${tramo.origen ? ` (rutas desde ${tramo.origen})` : ''}`"
                :loading="catalogos.loading"
                :disabled="!tramo.origen"
                :rules="[v => !!v || 'Requerido']"
                :no-data-text="tramo.origen ? `No hay rutas desde ${tramo.origen}. Click '+ Nueva ruta'` : 'Selecciona primero un origen'"
                @update:model-value="onTramoDestinoChange(idx)"
              />
            </v-col>
            <v-col cols="12" class="d-flex justify-end">
              <v-btn
                variant="text"
                size="small"
                color="primary"
                prepend-icon="mdi-map-marker-plus"
                @click="abrirDialogoNuevaRuta(idx)"
              >
                Nueva ruta
              </v-btn>
            </v-col>
          </v-row>
        </v-card>

        <v-btn
          variant="tonal"
          color="primary"
          prepend-icon="mdi-plus"
          class="mb-4"
          @click="onAddTramo"
        >
          Agregar Tramo
        </v-btn>

        <!-- ═══ DIÁLOGO: Crear nueva ruta ═══ -->
        <v-dialog v-model="dialogoNuevaRuta" max-width="640" persistent>
          <v-card>
            <v-card-title class="d-flex align-center">
              <v-icon class="mr-2" color="primary">mdi-map-marker-plus</v-icon>
              Registrar nueva ruta
            </v-card-title>
            <v-card-text>
              <v-alert type="info" variant="tonal" density="compact" class="mb-4">
                Esta ruta se guarda en el catálogo de Peajes y queda disponible para futuros viáticos.
              </v-alert>
              <v-row dense>
                <v-col cols="12" md="6">
                  <v-combobox
                    v-model="rutaForm.lugarSalida"
                    :items="todosLosNombres"
                    label="Salida"
                    :rules="[v => !!v || 'Requerido']"
                    hint="Puedes escribir uno nuevo si no está en la lista"
                    persistent-hint
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-combobox
                    v-model="rutaForm.destino"
                    :items="todosLosNombres"
                    label="Destino"
                    :rules="[v => !!v || 'Requerido']"
                    hint="Puedes escribir uno nuevo si no está en la lista"
                    persistent-hint
                  />
                </v-col>
                <v-col cols="12" md="4">
                  <v-text-field v-model.number="rutaForm.diasViaje" label="Días de Viaje" type="number" min="0" />
                </v-col>
                <v-col cols="12" md="4">
                  <v-text-field v-model.number="rutaForm.cantPeaje" label="Cant. Peajes" type="number" min="0" />
                </v-col>
                <v-col cols="12" md="4">
                  <v-text-field v-model.number="rutaForm.viaticoDiario" label="Viático Diario (USD)" type="number" min="0" step="0.01" prefix="$" />
                </v-col>
              </v-row>
              <v-alert v-if="errorRuta" type="error" variant="tonal" density="compact" class="mt-3">{{ errorRuta }}</v-alert>
            </v-card-text>
            <v-card-actions>
              <v-spacer />
              <v-btn variant="text" @click="dialogoNuevaRuta = false">Cancelar</v-btn>
              <v-btn color="primary" :loading="guardandoRuta" @click="guardarNuevaRuta">
                Guardar y usar
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>

        <!-- ═══════════════════════════════════════════════ -->
        <!-- FECHAS Y DÍAS                                   -->
        <!-- ═══════════════════════════════════════════════ -->
        <v-divider class="my-4" />
        <v-row>
          <v-col cols="12" md="4">
            <v-text-field v-model="store.header.fechaSalida" label="Fecha de Salida" type="date" :rules="[v => !!v || 'Requerido']" />
          </v-col>
          <v-col cols="12" md="4">
            <v-text-field
              v-model="store.header.fechaRetorno"
              label="Fecha de Retorno"
              type="date"
              :readonly="retornoBloqueado"
              :variant="retornoBloqueado ? 'filled' : 'outlined'"
              :hint="retornoBloqueado ? 'Calculado desde tramos y fecha de salida' : 'Selecciona destinos y fecha de salida'"
              persistent-hint
              :rules="[v => !!v || 'Requerido']"
            />
          </v-col>
          <v-col cols="12" md="4">
            <v-text-field :model-value="store.header.diasDeViaje" label="Días de Viaje" type="number" readonly variant="filled" hint="Suma de días de todos los tramos" persistent-hint />
          </v-col>
        </v-row>

        <!-- ═══════════════════════════════════════════════ -->
        <!-- ESCOLTAS                                        -->
        <!-- ═══════════════════════════════════════════════ -->
        <v-row>
          <v-col cols="12" md="6">
            <v-switch v-model="store.header.viajaEscoltado" label="¿Viaja Escoltado?" color="primary" @update:model-value="onEscoltadoToggle" />
          </v-col>
          <v-col cols="12" v-if="store.header.viajaEscoltado">
            <v-autocomplete
              v-model="store.header.cedulasEscoltas"
              :items="catalogos.escoltas"
              :item-title="escoltaLabel"
              item-value="cedulaEscolta"
              label="Escoltas asignados"
              :loading="catalogos.loading"
              multiple
              chips
              closable-chips
              :rules="[v => (Array.isArray(v) && v.length > 0) || 'Selecciona al menos un escolta']"
            />
          </v-col>
          <v-col cols="12">
            <v-textarea v-model="store.header.observaciones" label="Observaciones" rows="3" />
          </v-col>
        </v-row>

        <v-btn color="primary" class="mt-4" @click="siguiente">
          Siguiente
          <v-icon end icon="mdi-arrow-right" />
        </v-btn>
      </v-form>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useViaticoStore } from '@/stores/viaticoStore'
import { useCatalogosStore } from '@/stores/catalogosStore'
import { consultasService } from '@/services/consultasService'

const router = useRouter()
const store = useViaticoStore()
const catalogos = useCatalogosStore()
const form = ref()

const retornoBloqueado = computed(
  () => store.tramos.some(t => !!t.destino) && !!store.header.fechaSalida
)


// ─── Items para los autocompletes basados en el catálogo de Peajes ───
/** Lista única de orígenes que existen como `lugar_salida` en el catálogo de Peajes. */
const itemsSalidas = computed(() => {
  const set = new Set<string>()
  for (const p of catalogos.peajes) {
    const s = (p.lugarSalida || '').trim()
    if (s) set.add(s)
  }
  return [...set].sort().map(s => ({ nameDestination: s }))
})

/** Destinos disponibles desde un origen dado, según el catálogo de Peajes. */
function itemsDestinosDesde(origen: string) {
  const o = (origen || '').trim().toLowerCase()
  if (!o) return []
  const set = new Set<string>()
  for (const p of catalogos.peajes) {
    if ((p.lugarSalida || '').trim().toLowerCase() === o) {
      const d = (p.destino || '').trim()
      if (d) set.add(d)
    }
  }
  return [...set].sort().map(d => ({ nameDestination: d }))
}

/** Al cambiar el origen del tramo 1, si el destino actual ya no es válido, lo limpiamos. */
function onOrigenChange(idx: number) {
  const tramo = store.tramos[idx]
  if (tramo.destino) {
    const validos = itemsDestinosDesde(tramo.origen).map(x => x.nameDestination)
    if (!validos.includes(tramo.destino)) {
      tramo.destino = ''
    }
  }
  store.sincronizarHeaderDesdeTramos()
}

// ─── Diálogo: nueva ruta ───
const dialogoNuevaRuta = ref(false)
const guardandoRuta = ref(false)
const errorRuta = ref('')
const tramoTarget = ref<number | null>(null)
const rutaForm = reactive({
  lugarSalida: '',
  destino: '',
  diasViaje: 0,
  cantPeaje: 0,
  viaticoDiario: 25,
})

/** Universo de nombres sugeridos (combinando destinos + lugares en Peajes). */
const todosLosNombres = computed(() => {
  const set = new Set<string>()
  for (const d of catalogos.destinos) {
    const n = (d.nameDestination || '').trim()
    if (n) set.add(n)
  }
  for (const p of catalogos.peajes) {
    const s = (p.lugarSalida || '').trim()
    if (s) set.add(s)
    const dd = (p.destino || '').trim()
    if (dd) set.add(dd)
  }
  return [...set].sort()
})

function abrirDialogoNuevaRuta(idx: number) {
  tramoTarget.value = idx
  errorRuta.value = ''
  const tramo = store.tramos[idx]
  rutaForm.lugarSalida = (tramo.origen || '').trim()
  rutaForm.destino = (tramo.destino || '').trim()
  rutaForm.diasViaje = 0
  rutaForm.cantPeaje = 0
  rutaForm.viaticoDiario = 25
  dialogoNuevaRuta.value = true
}

async function guardarNuevaRuta() {
  errorRuta.value = ''
  const salida = (rutaForm.lugarSalida || '').trim()
  const destino = (rutaForm.destino || '').trim()
  if (!salida || !destino) {
    errorRuta.value = 'Salida y Destino son requeridos.'
    return
  }
  guardandoRuta.value = true
  try {
    const nueva = await consultasService.createPeaje({
      lugarSalida: salida,
      destino: destino,
      diasViaje: Number(rutaForm.diasViaje) || 0,
      cantPeaje: Number(rutaForm.cantPeaje) || 0,
      viaticoDiario: Number(rutaForm.viaticoDiario) || 0,
    })
    catalogos.upsertPeaje(nueva)

    // Auto-asignar al tramo que disparó el diálogo
    if (tramoTarget.value !== null) {
      const tramo = store.tramos[tramoTarget.value]
      tramo.origen = salida
      tramo.destino = destino
      // Si es un tramo intermedio, encadena el origen al siguiente
      store.onTramoDestinoChange(tramoTarget.value)
      recalcularDiasDesdeTramos()
      autoFechaRetorno()
    }
    dialogoNuevaRuta.value = false
  } catch (e: any) {
    errorRuta.value = e?.response?.data?.error || e.message || 'Error al guardar la ruta'
  } finally {
    guardandoRuta.value = false
  }
}


// ─── Tramos: gestión dinámica ───
function onAddTramo() {
  store.addTramo()
}

function onRemoveTramo(index: number) {
  store.removeTramo(index)
  recalcularDiasDesdeTramos()
}

function onTramoDestinoChange(index: number) {
  store.onTramoDestinoChange(index)
  recalcularDiasDesdeTramos()
  autoFechaRetorno()
}

/**
 * Calcula diasDeViaje sumando los días de cada tramo.
 * Lee primero del catálogo de PEAJES (datos por segmento exacto),
 * y cae al catálogo de DESTINOS solo si la ruta no está en Peajes.
 * Respeta días = 0 (tramos de tránsito sin pernocta).
 */
function recalcularDiasDesdeTramos() {
  let totalDias = 0
  for (const tramo of store.tramos) {
    const o = (tramo.origen || '').trim().toLowerCase()
    const d = (tramo.destino || '').trim().toLowerCase()

    // 1) Buscar en Peajes (segmento exacto)
    const peaje = catalogos.peajes.find(p =>
      (p.lugarSalida || '').trim().toLowerCase() === o
      && (p.destino || '').trim().toLowerCase() === d
    )

    let dias: number | null = null
    let viaticoDiario: number | null = null

    if (peaje) {
      const raw = (peaje as any).diasViaje
      const n = typeof raw === 'number' ? raw : Number(raw)
      if (!isNaN(n)) dias = n
      if (peaje.viaticoDiario) viaticoDiario = peaje.viaticoDiario
    }

    // 2) Fallback a catálogo de Destinos
    if (dias === null) {
      const dest = catalogos.destinos.find(x => x.nameDestination === tramo.destino)
      const rawD = dest?.dayDestination
      if (rawD != null && rawD !== '') {
        const n = Number(rawD)
        if (!isNaN(n)) dias = n
      }
      if (viaticoDiario === null && dest?.viaticoDiario) {
        viaticoDiario = dest.viaticoDiario
      }
    }

    // Si seguimos sin valor, default a 0 (transit) en vez de 1
    if (dias === null) dias = 0

    tramo.diasViajeTramo = dias
    if (!tramo.viaticoDiarioTramo && viaticoDiario != null) {
      tramo.viaticoDiarioTramo = viaticoDiario
    }
    totalDias += dias
  }
  store.header.diasDeViaje = totalDias
}

/**
 * Auto-calcula fechaRetorno = salida + (totalDias - 1).
 */
function autoFechaRetorno() {
  if (!store.header.fechaSalida) return
  const salida = new Date(store.header.fechaSalida + 'T00:00:00')
  // 0 días = ida y vuelta el mismo día; N días = salida + (N - 1)
  const offset = Math.max(0, (store.header.diasDeViaje || 0) - 1)
  salida.setDate(salida.getDate() + offset)
  store.header.fechaRetorno = salida.toISOString().split('T')[0]
}

/**
 * Calcula automáticamente diasDeViaje a partir de fechaSalida y fechaRetorno.
 * Solo se usa si no hay tramos con destinos definidos (fallback manual).
 */
function calcularDiasManual() {
  const { fechaSalida, fechaRetorno } = store.header
  if (fechaSalida && fechaRetorno) {
    const salida = new Date(fechaSalida + 'T00:00:00')
    const retorno = new Date(fechaRetorno + 'T00:00:00')
    const diffMs = retorno.getTime() - salida.getTime()
    const dias = Math.round(diffMs / (1000 * 60 * 60 * 24)) + 1
    store.header.diasDeViaje = dias > 0 ? dias : 1
  }
}

// Auto-calcular cuando cambien las fechas
watch(() => store.header.fechaSalida, () => {
  if (store.tramos.some(t => !!t.destino)) {
    autoFechaRetorno()
  } else {
    calcularDiasManual()
  }
})

watch(() => store.header.fechaRetorno, () => {
  if (!store.tramos.some(t => !!t.destino)) {
    calcularDiasManual()
  }
})

const escoltaLabel = (e: { cedulaEscolta: string; nombreEscolta: string }) => {
  const ced = (e.cedulaEscolta || '').trim()
  const nom = (e.nombreEscolta || '').trim()
  return nom ? `${ced} — ${nom}` : ced
}

const onEscoltadoToggle = (val: boolean | null) => {
  if (!val) store.header.cedulasEscoltas = []
}

const siguiente = async () => {
  const { valid } = await form.value.validate()
  if (valid) {
    router.push('/formulario-viatico/info-vehiculo-viatico')
  }
}
</script>
