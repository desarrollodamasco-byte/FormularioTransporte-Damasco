/**
 * Instancia centralizada de Axios.
 * Toma la URL base del backend desde la variable de entorno VITE_API_BASE_URL.
 */
import axios from 'axios'

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || '',
    timeout: 30000,
})

export default api
