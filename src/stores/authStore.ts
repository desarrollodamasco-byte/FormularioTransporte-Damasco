/**
 * Store Pinia — Sesión del usuario autenticado.
 * Persiste token + usuario en localStorage para sobrevivir refresh.
 */
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { authService } from '@/services/authService'
import type { LoginRequest, UsuarioAuth } from '@/interfaces'

const STORAGE_TOKEN = 'damasco_auth_token'
const STORAGE_USER = 'damasco_auth_user'

function loadStoredUser(): UsuarioAuth | null {
    try {
        const raw = localStorage.getItem(STORAGE_USER)
        return raw ? JSON.parse(raw) as UsuarioAuth : null
    } catch {
        return null
    }
}

export const useAuthStore = defineStore('auth', () => {
    const token = ref<string>(localStorage.getItem(STORAGE_TOKEN) || '')
    const user = ref<UsuarioAuth | null>(loadStoredUser())
    const loading = ref(false)
    const error = ref('')

    const isAuthenticated = computed(() => !!token.value && !!user.value)

    async function login(creds: LoginRequest) {
        loading.value = true
        error.value = ''
        try {
            const resp = await authService.login(creds)
            token.value = resp.token
            user.value = resp.usuario
            localStorage.setItem(STORAGE_TOKEN, resp.token)
            localStorage.setItem(STORAGE_USER, JSON.stringify(resp.usuario))
            return resp
        } catch (e: any) {
            error.value = e?.response?.data?.error
                || e?.response?.data?.detail
                || (e?.response?.status === 401 ? 'Usuario o contraseña incorrectos' : null)
                || e.message
                || 'Error al iniciar sesión'
            throw e
        } finally {
            loading.value = false
        }
    }

    function logout() {
        token.value = ''
        user.value = null
        localStorage.removeItem(STORAGE_TOKEN)
        localStorage.removeItem(STORAGE_USER)
    }

    /** Refresca los datos del usuario actual desde el servidor central. */
    async function refreshMe() {
        if (!token.value) return
        try {
            const me = await authService.me(token.value)
            user.value = me
            localStorage.setItem(STORAGE_USER, JSON.stringify(me))
        } catch {
            // Si /me falla con 401, el interceptor global se encargará del logout.
        }
    }

    return {
        token, user, loading, error,
        isAuthenticated,
        login, logout, refreshMe,
    }
})
