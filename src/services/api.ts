/**
 * Instancia centralizada de Axios.
 * Toma la URL base del backend desde la variable de entorno VITE_API_BASE_URL.
 *
 * Interceptores:
 *   - Request:  añade `Authorization: Bearer <token>` si hay sesión.
 *   - Response: si recibe 401, hace logout y redirige a /login.
 */
import axios from 'axios'

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || '',
    timeout: 30000,
})

// Lee el token directo de localStorage (evita ciclo con authStore).
const STORAGE_TOKEN = 'damasco_auth_token'

api.interceptors.request.use((config) => {
    const token = localStorage.getItem(STORAGE_TOKEN)
    if (token) {
        if (config.headers && typeof (config.headers as any).set === 'function') {
            (config.headers as any).set('Authorization', `Bearer ${token}`)
        } else {
            (config.headers as any) = {
                ...(config.headers as any),
                Authorization: `Bearer ${token}`,
            }
        }
    }
    return config
})

api.interceptors.response.use(
    (resp) => resp,
    (error) => {
        const status = error?.response?.status
        // 401 → token inválido/expirado → limpiar sesión y forzar login.
        // Evitamos el redirect si ya estamos en /login o en una vista pública.
        if (status === 401) {
            const path = window.location.pathname
            const enLogin = path.startsWith('/login')
            const enPublica = path.startsWith('/orden-proveedor/')
            if (!enLogin && !enPublica) {
                localStorage.removeItem(STORAGE_TOKEN)
                localStorage.removeItem('damasco_auth_user')
                const next = encodeURIComponent(window.location.pathname + window.location.search)
                window.location.href = `/login?next=${next}`
            }
        }
        return Promise.reject(error)
    },
)

export default api
