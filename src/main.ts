import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import '@mdi/font/css/materialdesignicons.css'

const vuetify = createVuetify({
    components,
    directives,
    theme: {
        defaultTheme: 'light',
        themes: {
            light: {
                colors: {
                    primary: '#D32F2F',
                    secondary: '#424242',
                    accent: '#FF5252',
                    background: '#FAFAFA',
                    surface: '#FFFFFF',
                }
            }
        }
    },
    defaults: {
        VBtn: { variant: 'flat', rounded: 'lg' },
        VCard: { rounded: 'lg', elevation: 2 },
        VTextField: { variant: 'outlined', density: 'comfortable' },
        VSelect: { variant: 'outlined', density: 'comfortable' },
    }
})

const app = createApp(App)
app.use(vuetify)
app.use(router)
app.mount('#app')
