<template>
  <div>
    <h2 class="text-h5 mb-1 font-weight-bold">
      <v-icon class="mr-2" color="primary">mdi-chart-box</v-icon>
      Auditoría de Transporte
    </h2>
    <p class="text-body-2 text-grey mb-5">Reportes y análisis de gastos por rango de fechas</p>

    <!-- ─── FILTRO DE FECHAS ─── -->
    <v-card class="mb-6 pa-4" color="grey-lighten-5" variant="flat">
      <v-row align="center" dense>
        <v-col cols="12" sm="4" md="3">
          <v-text-field
            v-model="fechaDesde"
            label="Fecha Desde"
            type="date"
            prepend-inner-icon="mdi-calendar-start"
            hide-details
            density="comfortable"
            variant="outlined"
            bg-color="white"
          />
        </v-col>
        <v-col cols="12" sm="4" md="3">
          <v-text-field
            v-model="fechaHasta"
            label="Fecha Hasta"
            type="date"
            prepend-inner-icon="mdi-calendar-end"
            hide-details
            density="comfortable"
            variant="outlined"
            bg-color="white"
          />
        </v-col>
        <v-col cols="12" sm="4" md="2">
          <v-btn
            color="primary"
            size="large"
            block
            :loading="loading"
            @click="cargarDatos"
            prepend-icon="mdi-magnify"
          >
            Consultar
          </v-btn>
        </v-col>
        <v-col cols="12" md="4">
          <v-btn-toggle v-model="rangoRapido" mandatory density="comfortable" color="primary" variant="outlined" divided>
            <v-btn value="7d" size="small">7 días</v-btn>
            <v-btn value="30d" size="small">30 días</v-btn>
            <v-btn value="90d" size="small">3 meses</v-btn>
            <v-btn value="180d" size="small">6 meses</v-btn>
            <v-btn value="365d" size="small">1 año</v-btn>
          </v-btn-toggle>
        </v-col>
      </v-row>
    </v-card>

    <!-- ─── TARJETAS RESUMEN ─── -->
    <v-row v-if="resumen" class="mb-4">
      <v-col cols="12" sm="6" md="3">
        <v-card class="pa-4" :style="cardGradient('#D32F2F', '#EF5350')">
          <div class="d-flex align-center">
            <v-avatar color="rgba(255,255,255,0.2)" size="48">
              <v-icon color="white" size="28">mdi-card-account-details</v-icon>
            </v-avatar>
            <div class="ml-3">
              <p class="text-white text-caption mb-0">Viáticos</p>
              <p class="text-white text-h5 font-weight-bold mb-0">{{ resumen.viaticos.cantidad }}</p>
              <p class="text-white text-caption mb-0 font-weight-medium">Bs. {{ formatNum(resumen.viaticos.totalBs) }}</p>
            </div>
          </div>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card class="pa-4" :style="cardGradient('#1565C0', '#42A5F5')">
          <div class="d-flex align-center">
            <v-avatar color="rgba(255,255,255,0.2)" size="48">
              <v-icon color="white" size="28">mdi-wrench</v-icon>
            </v-avatar>
            <div class="ml-3">
              <p class="text-white text-caption mb-0">Reparaciones</p>
              <p class="text-white text-h5 font-weight-bold mb-0">{{ resumen.reparaciones.cantidad }}</p>
              <p class="text-white text-caption mb-0 font-weight-medium">Bs. {{ formatNum(resumen.reparaciones.totalBs) }}</p>
            </div>
          </div>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card class="pa-4" :style="cardGradient('#2E7D32', '#66BB6A')">
          <div class="d-flex align-center">
            <v-avatar color="rgba(255,255,255,0.2)" size="48">
              <v-icon color="white" size="28">mdi-shield-account</v-icon>
            </v-avatar>
            <div class="ml-3">
              <p class="text-white text-caption mb-0">Escoltas</p>
              <p class="text-white text-h5 font-weight-bold mb-0">{{ resumen.escoltas.cantidad }}</p>
              <p class="text-white text-caption mb-0 font-weight-medium">Bs. {{ formatNum(resumen.escoltas.totalBs) }}</p>
            </div>
          </div>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card class="pa-4" :style="cardGradient('#E65100', '#FFA726')">
          <div class="d-flex align-center">
            <v-avatar color="rgba(255,255,255,0.2)" size="48">
              <v-icon color="white" size="28">mdi-truck</v-icon>
            </v-avatar>
            <div class="ml-3">
              <p class="text-white text-caption mb-0">Fletes</p>
              <p class="text-white text-h5 font-weight-bold mb-0">{{ resumen.fletes.cantidad }}</p>
              <p class="text-white text-caption mb-0 font-weight-medium">Bs. {{ formatNum(resumen.fletes.totalBs) }}</p>
            </div>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- ─── TOTAL GENERAL ─── -->
    <v-card v-if="resumen" class="mb-6 pa-4" variant="tonal" color="primary">
      <div class="d-flex justify-space-between align-center">
        <div>
          <p class="text-body-2 mb-0">Total General del Período</p>
          <p class="text-caption text-grey">{{ resumen.fechaDesde }} → {{ resumen.fechaHasta }}</p>
        </div>
        <p class="text-h4 font-weight-bold text-primary">Bs. {{ formatNum(resumen.totalGeneralBs) }}</p>
      </div>
    </v-card>

    <!-- ─── TABS DE AUDITORÍAS DETALLADAS ─── -->
    <v-card>
      <v-tabs v-model="tab" color="primary" show-arrows>
        <v-tab value="viaticos" prepend-icon="mdi-card-account-details">Viáticos</v-tab>
        <v-tab value="reparaciones" prepend-icon="mdi-wrench">Reparaciones</v-tab>
        <v-tab value="escoltas" prepend-icon="mdi-shield-account">Escoltas</v-tab>
        <v-tab value="chofer" prepend-icon="mdi-account-hard-hat">Por Chofer</v-tab>
        <v-tab value="destino" prepend-icon="mdi-map-marker">Por Destino</v-tab>
        <v-tab value="vehiculo" prepend-icon="mdi-car">Por Vehículo</v-tab>
        <v-tab value="solicitante" prepend-icon="mdi-account-tie">Por Solicitante</v-tab>
      </v-tabs>

      <v-divider />

      <v-tabs-window v-model="tab">

        <!-- ── TAB VIÁTICOS ── -->
        <v-tabs-window-item value="viaticos">
          <div class="pa-4">
            <div v-if="datosViaticos" class="d-flex ga-4 mb-4 flex-wrap">
              <v-chip color="primary" variant="tonal" size="large">
                <v-icon start>mdi-counter</v-icon>
                {{ datosViaticos.totales?.cantidad || 0 }} solicitudes
              </v-chip>
              <v-chip color="success" variant="tonal" size="large">
                <v-icon start>mdi-cash</v-icon>
                Bs. {{ formatNum(datosViaticos.totales?.totalGeneralBs || 0) }}
              </v-chip>
              <v-chip color="info" variant="tonal" size="large">
                <v-icon start>mdi-road-variant</v-icon>
                Peajes: Bs. {{ formatNum(datosViaticos.totales?.totalPeajesBs || 0) }}
              </v-chip>
            </div>
            <div class="d-flex ga-2 mb-3 align-center">
              <v-text-field
                v-model="searchViaticos"
                prepend-inner-icon="mdi-magnify"
                label="Buscar viáticos..."
                hide-details density="compact" variant="outlined"
              />
              <v-btn
                color="success" variant="tonal" size="small"
                prepend-icon="mdi-microsoft-excel"
                @click="exportToExcel(headersViaticos, datosViaticos?.registros || [], 'Viaticos')"
                :disabled="!datosViaticos?.registros?.length"
              >Excel</v-btn>
            </div>
            <v-data-table
              :headers="headersViaticos"
              :items="datosViaticos?.registros || []"
              :search="searchViaticos"
              :loading="loadingViaticos"
              hover
              density="comfortable"
              items-per-page="15"
            >
              <template #item.totalGeneralBs="{ item }">
                <span class="font-weight-bold">Bs. {{ formatNum(item.totalGeneralBs) }}</span>
              </template>
              <template #item.viajaEscoltado="{ item }">
                <v-chip :color="item.viajaEscoltado ? 'success' : 'grey'" variant="flat" size="small">
                  {{ item.viajaEscoltado ? 'Sí' : 'No' }}
                </v-chip>
              </template>
              <template #item.asignacionPeaje="{ item }">
                <span>Bs. {{ formatNum(item.asignacionPeaje) }}</span>
              </template>
              <template #item.totalPeajesBs="{ item }">
                <span class="font-weight-medium text-info">Bs. {{ formatNum(item.totalPeajesBs) }}</span>
              </template>
            </v-data-table>
          </div>
        </v-tabs-window-item>

        <!-- ── TAB REPARACIONES ── -->
        <v-tabs-window-item value="reparaciones">
          <div class="pa-4">
            <div v-if="datosReparaciones" class="d-flex ga-4 mb-4 flex-wrap">
              <v-chip color="primary" variant="tonal" size="large">
                <v-icon start>mdi-counter</v-icon>
                {{ datosReparaciones.totales?.cantidad || 0 }} reparaciones
              </v-chip>
              <v-chip color="error" variant="tonal" size="large">
                <v-icon start>mdi-cash</v-icon>
                Bs. {{ formatNum(datosReparaciones.totales?.totalBs || 0) }}
              </v-chip>
              <v-chip color="info" variant="tonal" size="large">
                <v-icon start>mdi-cog</v-icon>
                {{ datosReparaciones.totales?.totalRepuestos || 0 }} repuestos
              </v-chip>
            </div>
            <div class="d-flex ga-2 mb-3 align-center">
              <v-text-field
                v-model="searchReparaciones"
                prepend-inner-icon="mdi-magnify"
                label="Buscar reparaciones..."
                hide-details density="compact" variant="outlined"
              />
              <v-btn
                color="success" variant="tonal" size="small"
                prepend-icon="mdi-microsoft-excel"
                @click="exportToExcel(headersReparaciones, datosReparaciones?.registros || [], 'Reparaciones')"
                :disabled="!datosReparaciones?.registros?.length"
              >Excel</v-btn>
            </div>
            <v-data-table
              :headers="headersReparaciones"
              :items="datosReparaciones?.registros || []"
              :search="searchReparaciones"
              :loading="loadingReparaciones"
              hover density="comfortable" items-per-page="15"
            >
              <template #item.totalReparacion="{ item }">
                <span class="font-weight-bold text-error">Bs. {{ formatNum(item.totalReparacion) }}</span>
              </template>
            </v-data-table>
          </div>
        </v-tabs-window-item>

        <!-- ── TAB ESCOLTAS ── -->
        <v-tabs-window-item value="escoltas">
          <div class="pa-4">
            <div v-if="datosEscoltas" class="d-flex ga-4 mb-4 flex-wrap">
              <v-chip color="primary" variant="tonal" size="large">
                <v-icon start>mdi-counter</v-icon>
                {{ datosEscoltas.totales?.cantidad || 0 }} solicitudes
              </v-chip>
              <v-chip color="success" variant="tonal" size="large">
                <v-icon start>mdi-cash</v-icon>
                Bs. {{ formatNum(datosEscoltas.totales?.totalBs || 0) }}
              </v-chip>
              <v-chip color="info" variant="tonal" size="large">
                <v-icon start>mdi-currency-usd</v-icon>
                USD {{ formatNum(datosEscoltas.totales?.totalUsd || 0) }}
              </v-chip>
            </div>
            <div class="d-flex ga-2 mb-3 align-center">
              <v-text-field
                v-model="searchEscoltas"
                prepend-inner-icon="mdi-magnify"
                label="Buscar escoltas..."
                hide-details density="compact" variant="outlined"
              />
              <v-btn
                color="success" variant="tonal" size="small"
                prepend-icon="mdi-microsoft-excel"
                @click="exportToExcel(headersEscoltas, datosEscoltas?.registros || [], 'Escoltas')"
                :disabled="!datosEscoltas?.registros?.length"
              >Excel</v-btn>
            </div>
            <v-data-table
              :headers="headersEscoltas"
              :items="datosEscoltas?.registros || []"
              :search="searchEscoltas"
              :loading="loadingEscoltas"
              hover density="comfortable" items-per-page="15"
            >
              <template #item.totalBs="{ item }">
                <span class="font-weight-bold">Bs. {{ formatNum(item.totalBs) }}</span>
              </template>
            </v-data-table>
          </div>
        </v-tabs-window-item>

        <!-- ── TAB GASTOS POR CHOFER ── -->
        <v-tabs-window-item value="chofer">
          <div class="pa-4">
            <div v-if="datosChoferes" class="d-flex ga-4 mb-4 flex-wrap">
              <v-chip color="primary" variant="tonal" size="large">
                <v-icon start>mdi-account-group</v-icon>
                {{ datosChoferes.totalChoferes || 0 }} choferes
              </v-chip>
              <v-chip color="success" variant="tonal" size="large">
                <v-icon start>mdi-cash</v-icon>
                Bs. {{ formatNum(datosChoferes.totalGeneralBs || 0) }}
              </v-chip>
            </div>
            <div class="d-flex ga-2 mb-3 align-center">
              <v-text-field
                v-model="searchChoferes"
                prepend-inner-icon="mdi-magnify"
                label="Buscar chofer..."
                hide-details density="compact" variant="outlined"
              />
              <v-btn
                color="success" variant="tonal" size="small"
                prepend-icon="mdi-microsoft-excel"
                @click="exportToExcel(headersChoferes, datosChoferes?.registros || [], 'Gastos_Por_Chofer')"
                :disabled="!datosChoferes?.registros?.length"
              >Excel</v-btn>
            </div>
            <v-data-table
              :headers="headersChoferes"
              :items="datosChoferes?.registros || []"
              :search="searchChoferes"
              :loading="loadingChoferes"
              hover density="comfortable" items-per-page="15"
            >
              <template #item.totalBs="{ item }">
                <span class="font-weight-bold text-primary">Bs. {{ formatNum(item.totalBs) }}</span>
              </template>
            </v-data-table>
          </div>
        </v-tabs-window-item>

        <!-- ── TAB GASTOS POR DESTINO ── -->
        <v-tabs-window-item value="destino">
          <div class="pa-4">
            <div v-if="datosDestinos" class="d-flex ga-4 mb-4 flex-wrap">
              <v-chip color="primary" variant="tonal" size="large">
                <v-icon start>mdi-map-marker-multiple</v-icon>
                {{ datosDestinos.totalDestinos || 0 }} destinos
              </v-chip>
              <v-chip color="success" variant="tonal" size="large">
                <v-icon start>mdi-cash</v-icon>
                Bs. {{ formatNum(datosDestinos.totalGeneralBs || 0) }}
              </v-chip>
            </div>
            <div class="d-flex ga-2 mb-3 align-center">
              <v-text-field
                v-model="searchDestinos"
                prepend-inner-icon="mdi-magnify"
                label="Buscar destino..."
                hide-details density="compact" variant="outlined"
              />
              <v-btn
                color="success" variant="tonal" size="small"
                prepend-icon="mdi-microsoft-excel"
                @click="exportToExcel(headersDestinos, datosDestinos?.registros || [], 'Gastos_Por_Destino')"
                :disabled="!datosDestinos?.registros?.length"
              >Excel</v-btn>
            </div>
            <v-data-table
              :headers="headersDestinos"
              :items="datosDestinos?.registros || []"
              :search="searchDestinos"
              :loading="loadingDestinos"
              hover density="comfortable" items-per-page="15"
            >
              <template #item.totalBs="{ item }">
                <span class="font-weight-bold text-primary">Bs. {{ formatNum(item.totalBs) }}</span>
              </template>
              <template #item.promedioBs="{ item }">
                <span class="text-grey-darken-1">Bs. {{ formatNum(item.promedioBs) }}</span>
              </template>
            </v-data-table>
          </div>
        </v-tabs-window-item>

        <!-- ── TAB GASTOS POR VEHÍCULO ── -->
        <v-tabs-window-item value="vehiculo">
          <div class="pa-4">
            <div v-if="datosVehiculos" class="d-flex ga-4 mb-4 flex-wrap">
              <v-chip color="primary" variant="tonal" size="large">
                <v-icon start>mdi-car-multiple</v-icon>
                {{ datosVehiculos.totalVehiculos || 0 }} vehículos
              </v-chip>
              <v-chip color="success" variant="tonal" size="large">
                <v-icon start>mdi-cash</v-icon>
                Bs. {{ formatNum(datosVehiculos.totalGeneralBs || 0) }}
              </v-chip>
            </div>
            <div class="d-flex ga-2 mb-3 align-center">
              <v-text-field
                v-model="searchVehiculos"
                prepend-inner-icon="mdi-magnify"
                label="Buscar vehículo..."
                hide-details density="compact" variant="outlined"
              />
              <v-btn
                color="success" variant="tonal" size="small"
                prepend-icon="mdi-microsoft-excel"
                @click="exportToExcel(headersVehiculos, datosVehiculos?.registros || [], 'Gastos_Por_Vehiculo')"
                :disabled="!datosVehiculos?.registros?.length"
              >Excel</v-btn>
            </div>
            <v-data-table
              :headers="headersVehiculos"
              :items="datosVehiculos?.registros || []"
              :search="searchVehiculos"
              :loading="loadingVehiculos"
              hover density="comfortable" items-per-page="15"
            >
              <template #item.costoTotalBs="{ item }">
                <span class="font-weight-bold text-primary">Bs. {{ formatNum(item.costoTotalBs) }}</span>
              </template>
              <template #item.totalViaticoBs="{ item }">
                <span>Bs. {{ formatNum(item.totalViaticoBs) }}</span>
              </template>
              <template #item.totalReparacionBs="{ item }">
                <span class="text-error">Bs. {{ formatNum(item.totalReparacionBs) }}</span>
              </template>
            </v-data-table>
          </div>
        </v-tabs-window-item>

        <!-- ── TAB GASTOS POR SOLICITANTE ── -->
        <v-tabs-window-item value="solicitante">
          <div class="pa-4">
            <div v-if="datosSolicitantes" class="d-flex ga-4 mb-4 flex-wrap">
              <v-chip color="primary" variant="tonal" size="large">
                <v-icon start>mdi-account-multiple</v-icon>
                {{ datosSolicitantes.totalSolicitantes || 0 }} solicitantes
              </v-chip>
              <v-chip color="success" variant="tonal" size="large">
                <v-icon start>mdi-cash</v-icon>
                Bs. {{ formatNum(datosSolicitantes.totalGeneralBs || 0) }}
              </v-chip>
            </div>
            <div class="d-flex ga-2 mb-3 align-center">
              <v-text-field
                v-model="searchSolicitantes"
                prepend-inner-icon="mdi-magnify"
                label="Buscar solicitante..."
                hide-details density="compact" variant="outlined"
              />
              <v-btn
                color="success" variant="tonal" size="small"
                prepend-icon="mdi-microsoft-excel"
                @click="exportToExcel(headersSolicitantes, datosSolicitantes?.registros || [], 'Gastos_Por_Solicitante')"
                :disabled="!datosSolicitantes?.registros?.length"
              >Excel</v-btn>
            </div>
            <v-data-table
              :headers="headersSolicitantes"
              :items="datosSolicitantes?.registros || []"
              :search="searchSolicitantes"
              :loading="loadingSolicitantes"
              hover density="comfortable" items-per-page="15"
            >
              <template #item.totalBs="{ item }">
                <span class="font-weight-bold text-primary">Bs. {{ formatNum(item.totalBs) }}</span>
              </template>
              <template #item.viaticoBs="{ item }">
                <span>Bs. {{ formatNum(item.viaticoBs) }}</span>
              </template>
              <template #item.reparacionBs="{ item }">
                <span class="text-error">Bs. {{ formatNum(item.reparacionBs) }}</span>
              </template>
              <template #item.escoltaBs="{ item }">
                <span class="text-success">Bs. {{ formatNum(item.escoltaBs) }}</span>
              </template>
            </v-data-table>
          </div>
        </v-tabs-window-item>

      </v-tabs-window>
    </v-card>

    <!-- ─── TENDENCIA MENSUAL ─── -->
    <v-card v-if="resumen && resumen.tendenciaMensual.length > 0" class="mt-6 pa-4">
      <h3 class="text-h6 mb-4">
        <v-icon class="mr-1" color="primary">mdi-chart-line</v-icon>
        Tendencia Mensual de Viáticos
      </h3>
      <v-table density="comfortable" hover>
        <thead>
          <tr>
            <th>Mes</th>
            <th class="text-right">Cantidad</th>
            <th class="text-right">Total Bs.</th>
            <th>Proporción</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="t in resumen.tendenciaMensual" :key="t.mes">
            <td class="font-weight-medium">{{ formatMes(t.mes) }}</td>
            <td class="text-right">{{ t.cantidad }}</td>
            <td class="text-right font-weight-bold">Bs. {{ formatNum(t.totalBs) }}</td>
            <td style="width: 40%">
              <v-progress-linear
                :model-value="maxTendencia > 0 ? (t.totalBs / maxTendencia) * 100 : 0"
                color="primary"
                height="22"
                rounded
              >
                <template #default>
                  <span class="text-caption text-white">{{ ((t.totalBs / (resumen?.totalGeneralBs || 1)) * 100).toFixed(1) }}%</span>
                </template>
              </v-progress-linear>
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import {
  auditoriaService,
  type ResumenGeneral,
  type AuditoriaResponse,
  type ViaticoAuditoria,
  type ReparacionAuditoria,
  type EscoltaAuditoria,
  type GastoChofer,
  type GastoDestino,
  type GastoVehiculo,
  type GastoSolicitante,
} from '@/services/auditoriaService'

// ── Estado ──
const today = new Date()
const thirtyDaysAgo = new Date(today)
thirtyDaysAgo.setDate(today.getDate() - 30)

const fechaDesde = ref(thirtyDaysAgo.toISOString().slice(0, 10))
const fechaHasta = ref(today.toISOString().slice(0, 10))
const rangoRapido = ref<string>('30d')

const tab = ref('viaticos')
const loading = ref(false)

// Datos
const resumen = ref<ResumenGeneral | null>(null)
const datosViaticos = ref<AuditoriaResponse<ViaticoAuditoria> | null>(null)
const datosReparaciones = ref<AuditoriaResponse<ReparacionAuditoria> | null>(null)
const datosEscoltas = ref<AuditoriaResponse<EscoltaAuditoria> | null>(null)
const datosChoferes = ref<AuditoriaResponse<GastoChofer> | null>(null)
const datosDestinos = ref<AuditoriaResponse<GastoDestino> | null>(null)
const datosVehiculos = ref<AuditoriaResponse<GastoVehiculo> | null>(null)
const datosSolicitantes = ref<AuditoriaResponse<GastoSolicitante> | null>(null)

// Loading por tab
const loadingViaticos = ref(false)
const loadingReparaciones = ref(false)
const loadingEscoltas = ref(false)
const loadingChoferes = ref(false)
const loadingDestinos = ref(false)
const loadingVehiculos = ref(false)
const loadingSolicitantes = ref(false)

// Search
const searchViaticos = ref('')
const searchReparaciones = ref('')
const searchEscoltas = ref('')
const searchChoferes = ref('')
const searchDestinos = ref('')
const searchVehiculos = ref('')
const searchSolicitantes = ref('')

// ── Headers ──
const headersViaticos = [
  { title: '#', key: 'nroSolicitud', width: '70px' },
  { title: 'Fecha', key: 'fechaSolicitud', width: '110px' },
  { title: 'Solicitante', key: 'nombreSolicitante' },
  { title: 'Destino', key: 'lugarDestino' },
  { title: 'Días', key: 'diasDeViaje', width: '70px' },
  { title: 'Chofer(es)', key: 'choferes' },
  { title: 'Placa(s)', key: 'placas', width: '120px' },
  { title: 'Escoltado', key: 'viajaEscoltado', width: '100px' },
  { title: 'Asig. Peaje', key: 'asignacionPeaje', width: '120px' },
  { title: 'Cant. Peajes', key: 'cantPeajes', width: '110px' },
  { title: 'Total Peajes', key: 'totalPeajesBs', width: '130px' },
  { title: 'Total Bs.', key: 'totalGeneralBs', width: '130px' },
]

const headersReparaciones = [
  { title: '#', key: 'nroSolicitud', width: '70px' },
  { title: 'Fecha', key: 'fechaSolicitud', width: '110px' },
  { title: 'Solicitante', key: 'nombreSolicitante' },
  { title: 'Proveedor', key: 'nombreProveedor' },
  { title: 'RIF', key: 'rif', width: '120px' },
  { title: 'Repuestos', key: 'cantRepuestos', width: '100px' },
  { title: 'Total Bs.', key: 'totalReparacion', width: '130px' },
]

const headersEscoltas = [
  { title: '#', key: 'nroSolicitud', width: '70px' },
  { title: 'Fecha', key: 'fechaSolicitud', width: '110px' },
  { title: 'Solicitante', key: 'nombreSolicitante' },
  { title: 'Nombre Escolta', key: 'nombreEscolta' },
  { title: 'Cédula Escolta', key: 'cedulaEscolta', width: '130px' },
  { title: 'Días', key: 'cantidadDias', width: '70px' },
  { title: 'USD/Día', key: 'viaticoDiarioUsd', width: '100px' },
  { title: 'Total USD', key: 'totalUsd', width: '110px' },
  { title: 'Total Bs.', key: 'totalBs', width: '130px' },
]

const headersChoferes = [
  { title: 'Cédula', key: 'cedulaChofer', width: '110px' },
  { title: 'Nombre', key: 'nombreChofer' },
  { title: 'Viajes', key: 'cantidadViajes', width: '90px' },
  { title: 'Vehículos', key: 'vehiculosUsados', width: '100px' },
  { title: 'Placas', key: 'placas' },
  { title: 'Total Bs.', key: 'totalBs', width: '140px' },
]

const headersDestinos = [
  { title: 'Destino', key: 'destino' },
  { title: 'Viajes', key: 'cantidadViajes', width: '90px' },
  { title: 'Días Totales', key: 'totalDiasViaje', width: '110px' },
  { title: 'Prom. Días', key: 'promedioDias', width: '110px' },
  { title: 'Total Bs.', key: 'totalBs', width: '140px' },
  { title: 'Prom. Bs.', key: 'promedioBs', width: '130px' },
]

const headersVehiculos = [
  { title: 'Placa', key: 'placa', width: '110px' },
  { title: 'Marca', key: 'marca' },
  { title: 'Modelo', key: 'modelo' },
  { title: 'Tipo', key: 'tipoVehiculo' },
  { title: 'Viajes', key: 'viajesCount', width: '80px' },
  { title: 'Reparaciones', key: 'reparacionesCount', width: '110px' },
  { title: 'Viáticos Bs.', key: 'totalViaticoBs', width: '120px' },
  { title: 'Reparac. Bs.', key: 'totalReparacionBs', width: '120px' },
  { title: 'Costo Total', key: 'costoTotalBs', width: '130px' },
]

const headersSolicitantes = [
  { title: 'Solicitante', key: 'nombre' },
  { title: 'Viáticos', key: 'viaticosCount', width: '90px' },
  { title: 'Reparaciones', key: 'reparacionesCount', width: '110px' },
  { title: 'Escoltas', key: 'escoltasCount', width: '90px' },
  { title: 'Total Sol.', key: 'totalSolicitudes', width: '90px' },
  { title: 'Viáticos Bs.', key: 'viaticoBs', width: '120px' },
  { title: 'Reparac. Bs.', key: 'reparacionBs', width: '120px' },
  { title: 'Escolta Bs.', key: 'escoltaBs', width: '120px' },
  { title: 'Total Bs.', key: 'totalBs', width: '130px' },
]

// ── Computed ──
const maxTendencia = computed(() => {
  if (!resumen.value) return 1
  return Math.max(...resumen.value.tendenciaMensual.map(t => t.totalBs), 1)
})

// ── Helpers ──
function exportToExcel(
  headers: { title: string; key: string }[],
  data: Record<string, any>[],
  sheetName: string
) {
  if (!data.length) return
  // Map raw data using header titles as column names
  const rows = data.map(row => {
    const mapped: Record<string, any> = {}
    for (const h of headers) {
      let val = row[h.key]
      // Convert booleans to readable text
      if (typeof val === 'boolean') val = val ? 'Sí' : 'No'
      mapped[h.title] = val
    }
    return mapped
  })
  const ws = XLSX.utils.json_to_sheet(rows)
  // Auto-size columns based on header length
  ws['!cols'] = headers.map(h => ({ wch: Math.max(h.title.length + 2, 14) }))
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, sheetName.substring(0, 31))
  const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  const fileName = `${sheetName}_${fechaDesde.value}_${fechaHasta.value}.xlsx`
  saveAs(new Blob([buf], { type: 'application/octet-stream' }), fileName)
}

function formatNum(n: number): string {
  return n.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function formatMes(mes: string): string {
  if (!mes) return ''
  const [y, m] = mes.split('-')
  const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
  return `${meses[parseInt(m) - 1]} ${y}`
}

function cardGradient(from: string, to: string) {
  return {
    background: `linear-gradient(135deg, ${from} 0%, ${to} 100%)`,
    borderRadius: '12px',
  }
}

// ── Rango rápido ──
watch(rangoRapido, (val) => {
  const hoy = new Date()
  let dias = 30
  if (val === '7d') dias = 7
  else if (val === '30d') dias = 30
  else if (val === '90d') dias = 90
  else if (val === '180d') dias = 180
  else if (val === '365d') dias = 365

  const desde = new Date(hoy)
  desde.setDate(hoy.getDate() - dias)
  fechaDesde.value = desde.toISOString().slice(0, 10)
  fechaHasta.value = hoy.toISOString().slice(0, 10)
  cargarDatos()
})

// ── Caché por tab (evita recargar datos al cambiar tabs) ──
const cacheKey = ref('')  // "fd|fh" de la última carga
const tabsLoaded = ref<Set<string>>(new Set())

function invalidateCache() {
  const newKey = `${fechaDesde.value}|${fechaHasta.value}`
  if (newKey !== cacheKey.value) {
    cacheKey.value = newKey
    tabsLoaded.value.clear()
    datosViaticos.value = null
    datosReparaciones.value = null
    datosEscoltas.value = null
    datosChoferes.value = null
    datosDestinos.value = null
    datosVehiculos.value = null
    datosSolicitantes.value = null
  }
}

// ── Cargar datos ──
async function cargarDatos() {
  loading.value = true
  invalidateCache()
  const fd = fechaDesde.value
  const fh = fechaHasta.value

  try {
    // Cargar resumen siempre (rápido: solo aggregates)
    resumen.value = await auditoriaService.getResumenGeneral(fd, fh)

    // Cargar tab activo
    await cargarTabActual(fd, fh)
  } catch (e) {
    console.error('Error cargando auditoría:', e)
  } finally {
    loading.value = false
  }
}

async function cargarTabActual(fd: string, fh: string) {
  const t = tab.value
  // Ya cargado para este rango → no recargar
  if (tabsLoaded.value.has(t)) return

  try {
    switch (t) {
      case 'viaticos':
        loadingViaticos.value = true
        datosViaticos.value = await auditoriaService.getViaticos(fd, fh)
        loadingViaticos.value = false
        break
      case 'reparaciones':
        loadingReparaciones.value = true
        datosReparaciones.value = await auditoriaService.getReparaciones(fd, fh)
        loadingReparaciones.value = false
        break
      case 'escoltas':
        loadingEscoltas.value = true
        datosEscoltas.value = await auditoriaService.getEscoltas(fd, fh)
        loadingEscoltas.value = false
        break
      case 'chofer':
        loadingChoferes.value = true
        datosChoferes.value = await auditoriaService.getGastosPorChofer(fd, fh)
        loadingChoferes.value = false
        break
      case 'destino':
        loadingDestinos.value = true
        datosDestinos.value = await auditoriaService.getGastosPorDestino(fd, fh)
        loadingDestinos.value = false
        break
      case 'vehiculo':
        loadingVehiculos.value = true
        datosVehiculos.value = await auditoriaService.getGastosPorVehiculo(fd, fh)
        loadingVehiculos.value = false
        break
      case 'solicitante':
        loadingSolicitantes.value = true
        datosSolicitantes.value = await auditoriaService.getGastosPorSolicitante(fd, fh)
        loadingSolicitantes.value = false
        break
    }
    tabsLoaded.value.add(t)
  } catch (e) {
    console.error(`Error cargando tab ${t}:`, e)
  }
}

// Cuando cambia el tab, cargar datos si no están en caché
watch(tab, async () => {
  await cargarTabActual(fechaDesde.value, fechaHasta.value)
})

// ── Init ──
onMounted(() => {
  cargarDatos()
})
</script>
