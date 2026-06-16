import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import '@mdi/font/css/materialdesignicons.css'

/**
 * Vuetify Theme — Design System Damasco v2.0
 *
 * Brand colors:
 *   Primary Red:    #e1052d  (Pantone 185 C)
 *   Corporate Red:  #bc1830  (Pantone 186 C)
 *   Deep Black:     #000000  (Pantone Black 6C)
 *   Pure White:     #ffffff
 *
 * Typography: Poppins (loaded via index.html)
 */
const vuetify = createVuetify({
    components,
    directives,
    theme: {
        defaultTheme: 'damascoLight',
        themes: {
            damascoLight: {
                dark: false,
                colors: {
                    // Brand
                    primary: '#e1052d',
                    secondary: '#bc1830',
                    accent: '#e1052d',
                    // Surfaces
                    background: '#ffffff',
                    surface: '#ffffff',
                    'surface-variant': '#F8F9FA',
                    // Feedback
                    success: '#22C55E',
                    warning: '#F59E0B',
                    error: '#EF4444',
                    info: '#3B82F6',
                    // Text
                    'on-primary': '#ffffff',
                    'on-secondary': '#ffffff',
                    'on-surface': '#000000',
                    'on-background': '#000000',
                }
            },
            damascoDark: {
                dark: true,
                colors: {
                    primary: '#e1052d',
                    secondary: '#bc1830',
                    accent: '#e1052d',
                    background: '#000000',
                    surface: '#1a1a1a',
                    'surface-variant': '#2a2a2a',
                    success: '#22C55E',
                    warning: '#F59E0B',
                    error: '#EF4444',
                    info: '#3B82F6',
                    'on-primary': '#ffffff',
                    'on-secondary': '#ffffff',
                    'on-surface': '#ffffff',
                    'on-background': '#ffffff',
                }
            }
        }
    },
    defaults: {
        VBtn: {
            variant: 'flat',
            rounded: 'lg',
            style: 'text-transform: none; font-weight: 500; letter-spacing: 0.01em;',
        },
        VCard: {
            rounded: 'xl',
            elevation: 1,
        },
        VTextField: {
            variant: 'outlined',
            density: 'comfortable',
            rounded: 'lg',
        },
        VSelect: {
            variant: 'outlined',
            density: 'comfortable',
            rounded: 'lg',
        },
        VAutocomplete: {
            variant: 'outlined',
            density: 'comfortable',
            rounded: 'lg',
        },
        VTextarea: {
            variant: 'outlined',
            density: 'comfortable',
            rounded: 'lg',
        },
        VChip: {
            rounded: 'lg',
        },
        VDataTable: {
            hover: true,
            density: 'comfortable',
        },
        VTab: {
            style: 'text-transform: none; font-weight: 500;',
        },
    }
})

const app = createApp(App)
app.use(createPinia())
app.use(vuetify)
app.use(router)
app.mount('#app')
