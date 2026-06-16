<template>
  <div>
    <h2 class="text-h5 mb-4">Nueva Orden a Proveedor</h2>
    <v-card class="pa-6">
      <v-alert type="info" variant="tonal" density="compact" class="mb-4">
        Al guardar la orden se generará un <b>link único</b> que debes copiar y enviar al proveedor.
        El proveedor abrirá ese link sin necesidad de cuenta y registrará la información de cada gandola.
      </v-alert>

      <v-form ref="form">
        <v-row>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="formData.nombreSolicitante"
              label="Nombre del Solicitante"
              :rules="[v => !!v || 'Requerido']"
            />
          </v-col>
          <v-col cols="12" md="6">
            <v-autocomplete
              v-model="formData.proveedorId"
              :items="catalogos.proveedoresViatico"
              item-title="razonSocial"
              item-value="id"
              label="Proveedor"
              :loading="catalogos.loading"
              :rules="[v => !!v || 'Requerido']"
            >
              <template #item="{ item, props }">
                <v-list-item v-bind="props" :title="item.raw.razonSocial" :subtitle="item.raw.cedulaRif" />
              </template>
              <template #append-item>
                <v-divider class="my-1" />
                <v-list-item
                  prepend-icon="mdi-plus-circle-outline"
                  title="Nuevo proveedor"
                  subtitle="Registrar un proveedor que no está en la lista"
                  base-color="primary"
                  @click="abrirDialogoNuevoProveedor"
                />
              </template>
              <template #no-data>
                <v-list-item
                  prepend-icon="mdi-plus-circle-outline"
                  title="Nuevo proveedor"
                  subtitle="Registrar un proveedor que no está en la lista"
                  base-color="primary"
                  @click="abrirDialogoNuevoProveedor"
                />
              </template>
            </v-autocomplete>
          </v-col>

          <v-col cols="12" md="6">
            <v-text-field
              v-model="formData.fechaViaje"
              label="Fecha de Viaje"
              type="date"
              :rules="[v => !!v || 'Requerido']"
            />
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field
              v-model.number="formData.cantidadGandolas"
              label="Cantidad de Gandolas Necesarias"
              type="number"
              min="1"
              :rules="[v => (v && v >= 1) || 'Mínimo 1']"
            />
          </v-col>

          <v-col cols="12" md="6">
            <v-autocomplete
              v-model="formData.lugarSalida"
              :items="itemsSalidas"
              item-title="nameDestination"
              item-value="nameDestination"
              label="Desde (Origen)"
              prepend-inner-icon="mdi-map-marker"
              :loading="catalogos.loading"
              :rules="[v => !!v || 'Requerido']"
              @update:model-value="onOrigenChange"
            />
          </v-col>
          <v-col cols="12" md="6">
            <v-autocomplete
              v-model="formData.lugarDestino"
              :items="itemsDestinosDesde(formData.lugarSalida)"
              item-title="nameDestination"
              item-value="nameDestination"
              :label="`Hasta (Destino)${formData.lugarSalida ? ` — rutas desde ${formData.lugarSalida}` : ''}`"
              prepend-inner-icon="mdi-map-marker-check"
              :loading="catalogos.loading"
              :disabled="!formData.lugarSalida"
              :rules="[v => !!v || 'Requerido']"
              :no-data-text="formData.lugarSalida ? `No hay rutas desde ${formData.lugarSalida}. Click '+ Nueva ruta'` : 'Selecciona primero un origen'"
            />
          </v-col>
          <v-col cols="12" class="d-flex justify-end">
            <v-btn
              variant="text"
              size="small"
              color="primary"
              prepend-icon="mdi-map-marker-plus"
              @click="abrirDialogoNuevaRuta"
            >
              Nueva ruta
            </v-btn>
          </v-col>

          <v-col cols="12">
            <v-textarea
              v-model="formData.observaciones"
              label="Observaciones (opcional)"
              rows="2"
            />
          </v-col>
        </v-row>

        <!-- ═══ DIÁLOGO: Crear nueva ruta ═══ -->
        <v-dialog v-model="dialogoNuevaRuta" max-width="640" persistent>
          <v-card>
            <v-card-title class="d-flex align-center">
              <v-icon class="mr-2" color="primary">mdi-map-marker-plus</v-icon>
              Registrar nueva ruta
            </v-card-title>
            <v-card-text>
              <v-alert type="info" variant="tonal" density="compact" class="mb-4">
                Esta ruta se guarda en el catálogo de Peajes y queda disponible para futuras órdenes y viáticos.
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

        <!-- ═══ DIÁLOGO: Crear nuevo proveedor ═══ -->
        <v-dialog v-model="dialogoNuevoProveedor" max-width="640" persistent>
          <v-card>
            <v-card-title class="d-flex align-center">
              <v-icon class="mr-2" color="primary">mdi-account-plus</v-icon>
              Registrar nuevo proveedor
            </v-card-title>
            <v-card-text>
              <v-alert type="info" variant="tonal" density="compact" class="mb-4">
                Este proveedor se guarda en el catálogo y queda disponible para futuras órdenes y reparaciones.
              </v-alert>
              <v-row dense>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="proveedorForm.cedulaRif"
                    label="Cédula / RIF *"
                    :rules="[v => !!v || 'Requerido']"
                    hint="Ej: J-123456789 o V-12345678"
                    persistent-hint
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="proveedorForm.razonSocial"
                    label="Razón Social *"
                    :rules="[v => !!v || 'Requerido']"
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="proveedorForm.cedulaRifBeneficiario"
                    label="Cédula/RIF Beneficiario (opcional)"
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="proveedorForm.nombreBeneficiario"
                    label="Nombre Beneficiario (opcional)"
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="proveedorForm.nroCuenta"
                    label="Nro. Cuenta (opcional)"
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-autocomplete
                    v-model="proveedorForm.banco"
                    :items="catalogos.bancos"
                    item-title="bancoName"
                    item-value="bancoName"
                    label="Banco (opcional)"
                  />
                </v-col>
              </v-row>
              <v-alert v-if="errorProveedor" type="error" variant="tonal" density="compact" class="mt-3">
                {{ errorProveedor }}
              </v-alert>
            </v-card-text>
            <v-card-actions>
              <v-spacer />
              <v-btn variant="text" @click="dialogoNuevoProveedor = false">Cancelar</v-btn>
              <v-btn color="primary" :loading="guardandoProveedor" @click="guardarNuevoProveedor">
                Guardar y usar
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>

        <v-alert v-if="error" type="error" variant="tonal" class="mt-2">
          {{ error }}
        </v-alert>

        <v-row class="mt-4">
          <v-col>
            <v-btn variant="outlined" @click="$router.push('/ordenes')">
              <v-icon start icon="mdi-arrow-left" /> Cancelar
            </v-btn>
          </v-col>
          <v-col cols="auto">
            <v-btn color="primary" :loading="guardando" @click="guardar">
              Generar Orden y Link
              <v-icon end icon="mdi-link-plus" />
            </v-btn>
          </v-col>
        </v-row>
      </v-form>
    </v-card>

    <!-- Diálogo: link generado -->
    <v-dialog v-model="dialogLink" max-width="640" persistent>
      <v-card>
        <v-card-title class="d-flex align-center">
          <v-icon class="mr-2" color="success">mdi-check-circle</v-icon>
          Orden creada — {{ ordenCreada?.referencia }}
        </v-card-title>
        <v-card-text>
          <v-alert type="success" variant="tonal" density="compact" class="mb-4">
            Comparte este link con el proveedor. Podrá registrar las gandolas sin necesidad de cuenta.
          </v-alert>
          <v-text-field
            :model-value="linkPublico"
            label="Link para el proveedor"
            readonly
            variant="filled"
            append-inner-icon="mdi-content-copy"
            @click:append-inner="copiarLink"
          />
          <v-alert v-if="copiado" type="success" variant="tonal" density="compact" class="mt-2">
            Link copiado al portapapeles
          </v-alert>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="$router.push('/ordenes')">Volver al listado</v-btn>
          <v-btn color="primary" variant="flat" @click="verDetalle">
            Ver detalle
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ordenesService } from '@/services/ordenesService'
import { consultasService } from '@/services/consultasService'
import { useCatalogosStore } from '@/stores/catalogosStore'
import type { OrdenProveedor } from '@/interfaces'

const router = useRouter()
const catalogos = useCatalogosStore()
const form = ref()

// Garantiza que los catálogos (peajes, proveedores) estén cargados.
// Si la primera carga falló o aún no terminó, re-fetcheamos lo necesario.
onMounted(async () => {
  await catalogos.cargar()
  if (catalogos.peajes.length === 0) {
    try {
      const peajes = await consultasService.getPeajes()
      for (const p of peajes) catalogos.upsertPeaje(p)
    } catch (e) {
      console.error('Fallback getPeajes en OrdenNueva:', e)
    }
  }
})

// ─── Items para los autocompletes basados en el catálogo de Peajes ───
const itemsSalidas = computed(() => {
  const set = new Set<string>()
  for (const p of catalogos.peajes) {
    const s = (p.lugarSalida || '').trim()
    if (s) set.add(s)
  }
  return [...set].sort().map(s => ({ nameDestination: s }))
})

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

/** Al cambiar el origen, si el destino actual ya no es válido, lo limpiamos. */
function onOrigenChange() {
  if (!formData.lugarDestino) return
  const validos = itemsDestinosDesde(formData.lugarSalida).map(x => x.nameDestination)
  if (!validos.includes(formData.lugarDestino)) {
    formData.lugarDestino = ''
  }
}

// ─── Diálogo: nueva ruta ───
const dialogoNuevaRuta = ref(false)
const guardandoRuta = ref(false)
const errorRuta = ref('')
const rutaForm = reactive({
  lugarSalida: '',
  destino: '',
  diasViaje: 0,
  cantPeaje: 0,
  viaticoDiario: 25,
})

/** Universo de nombres sugeridos para el diálogo de nueva ruta. */
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

function abrirDialogoNuevaRuta() {
  errorRuta.value = ''
  rutaForm.lugarSalida = (formData.lugarSalida || '').trim()
  rutaForm.destino = (formData.lugarDestino || '').trim()
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
    // Auto-asignar al formulario
    formData.lugarSalida = salida
    formData.lugarDestino = destino
    dialogoNuevaRuta.value = false
  } catch (e: any) {
    errorRuta.value = e?.response?.data?.error || e.message || 'Error al guardar la ruta'
  } finally {
    guardandoRuta.value = false
  }
}

// ─── Diálogo: nuevo proveedor ───
const dialogoNuevoProveedor = ref(false)
const guardandoProveedor = ref(false)
const errorProveedor = ref('')
const proveedorForm = reactive({
  cedulaRif: '',
  razonSocial: '',
  cedulaRifBeneficiario: '',
  nombreBeneficiario: '',
  nroCuenta: '',
  banco: '',
})

function abrirDialogoNuevoProveedor() {
  errorProveedor.value = ''
  proveedorForm.cedulaRif = ''
  proveedorForm.razonSocial = ''
  proveedorForm.cedulaRifBeneficiario = ''
  proveedorForm.nombreBeneficiario = ''
  proveedorForm.nroCuenta = ''
  proveedorForm.banco = ''
  dialogoNuevoProveedor.value = true
}

async function guardarNuevoProveedor() {
  errorProveedor.value = ''
  const cedulaRif = (proveedorForm.cedulaRif || '').trim()
  const razonSocial = (proveedorForm.razonSocial || '').trim()
  if (!cedulaRif || !razonSocial) {
    errorProveedor.value = 'Cédula/RIF y Razón Social son requeridos.'
    return
  }
  guardandoProveedor.value = true
  try {
    const nuevo = await consultasService.createProveedor({
      cedulaRif,
      razonSocial,
      cedulaRifBeneficiario: proveedorForm.cedulaRifBeneficiario.trim(),
      nombreBeneficiario: proveedorForm.nombreBeneficiario.trim(),
      nroCuenta: proveedorForm.nroCuenta.trim(),
      banco: proveedorForm.banco.trim(),
    })
    catalogos.upsertProveedor(nuevo)
    formData.proveedorId = nuevo.id
    dialogoNuevoProveedor.value = false
  } catch (e: any) {
    errorProveedor.value = e?.response?.data?.error || e.message || 'Error al guardar el proveedor'
  } finally {
    guardandoProveedor.value = false
  }
}

const formData = reactive({
  nombreSolicitante: '',
  proveedorId: null as number | null,
  fechaViaje: new Date().toISOString().slice(0, 10),
  lugarSalida: '',
  lugarDestino: '',
  cantidadGandolas: 1,
  observaciones: '',
})

const guardando = ref(false)
const error = ref('')

const dialogLink = ref(false)
const ordenCreada = ref<OrdenProveedor | null>(null)
const copiado = ref(false)

const linkPublico = computed(() =>
  ordenCreada.value ? ordenesService.publicUrl(ordenCreada.value.token) : ''
)

async function guardar() {
  error.value = ''
  const { valid } = await form.value.validate()
  if (!valid) return
  guardando.value = true
  try {
    ordenCreada.value = await ordenesService.create({
      nombreSolicitante: formData.nombreSolicitante,
      proveedorId: formData.proveedorId!,
      fechaViaje: formData.fechaViaje,
      lugarSalida: formData.lugarSalida,
      lugarDestino: formData.lugarDestino,
      cantidadGandolas: formData.cantidadGandolas,
      observaciones: formData.observaciones,
    })
    dialogLink.value = true
  } catch (e: any) {
    error.value = e?.response?.data?.error
      || (e?.response?.data ? JSON.stringify(e.response.data) : null)
      || e.message
      || 'Error al crear la orden'
  } finally {
    guardando.value = false
  }
}

async function copiarLink() {
  if (!linkPublico.value) return
  try {
    await navigator.clipboard.writeText(linkPublico.value)
    copiado.value = true
    setTimeout(() => (copiado.value = false), 2500)
  } catch {
    // sin permisos de clipboard — silencioso
  }
}

function verDetalle() {
  if (ordenCreada.value) router.push(`/ordenes/${ordenCreada.value.id}`)
}
</script>
