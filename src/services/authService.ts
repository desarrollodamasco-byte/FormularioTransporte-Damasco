/**
 * Servicio del login centralizado de Damasco.
 *
 * Las peticiones van DIRECTO al servidor central (no a nuestro backend):
 *   https://compra.aplicacionesdamasco.com/api/auth/...
 *
 * Nuestro backend solo VERIFICA el JWT que llega en cada request, no
 * re-llama al central salvo para validar.
 *
 * El dominio se puede override desde frontend/.env.development con
 * VITE_AUTH_BASE_URL (útil para apuntar a dev. mientras migran).
 */
import axios from 'axios'
import type { LoginRequest, LoginResponse, UsuarioAuth } from '@/interfaces'

const AUTH_BASE = import.meta.env.VITE_AUTH_BASE_URL
    || 'https://compra.aplicacionesdamasco.com'

const authApi = axios.create({
    baseURL: AUTH_BASE,
    timeout: 15000,
})

export const authService = {
    /** Login: devuelve token + datos del usuario. */
    login: (data: LoginRequest) =>
        authApi.post<LoginResponse>('/api/auth/login', data).then(r => r.data),

    /** Devuelve los datos actualizados del usuario del token. */
    me: (token: string) =>
        authApi.get<UsuarioAuth>('/api/auth/me', {
            headers: { Authorization: `Bearer ${token}` },
        }).then(r => r.data),
}
