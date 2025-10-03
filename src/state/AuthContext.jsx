import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import api from '../utils/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [access, setAccess] = useState(localStorage.getItem('access') || null)
  const [refresh, setRefresh] = useState(localStorage.getItem('refresh') || null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (access) {
      localStorage.setItem('access', access)
    } else {
      localStorage.removeItem('access')
    }
    if (refresh) {
      localStorage.setItem('refresh', refresh)
    } else {
      localStorage.removeItem('refresh')
    }
  }, [access, refresh])

  async function fetchProfile(token = access) {
    try {
      const profile = await api.get('/profile/', {
        headers: { Authorization: `Bearer ${token}` },
      })
      setUser(profile.data)
    } catch (e) {
      console.error('Erreur chargement profil:', e)
      setUser(null)
    }
  }

  async function login(email, password) {
    setLoading(true)
    try {
      const { data } = await api.post('/auth/login/', { email, password })
      setAccess(data.access)
      setRefresh(data.refresh)
      await fetchProfile(data.access)
      return { ok: true }
    } catch (e) {
      console.error(e)
      return { ok: false, error: e?.response?.data || 'Erreur de connexion' }
    } finally {
      setLoading(false)
    }
  }

  async function register(payload) {
    setLoading(true)
    try {
      const registerPayload = {
        ...payload,
        password2: payload.password
      }
      await api.post('/auth/register/', registerPayload)
      return await login(payload.email, payload.password)
    } catch (e) {
      console.error(e)
      return { ok: false, error: e?.response?.data || 'Erreur inscription' }
    } finally {
      setLoading(false)
    }
  }

  async function changePassword(oldPassword, newPassword) {
    setLoading(true)
    try {
      await api.post('/auth/change-password/', {
        old_password: oldPassword,
        new_password: newPassword
      })
      return { ok: true, message: 'Mot de passe modifié avec succès !' }
    } catch (e) {
      console.error('Erreur changement mot de passe:', e)
      return { 
        ok: false, 
        error: e?.response?.data || 'Erreur lors du changement de mot de passe' 
      }
    } finally {
      setLoading(false)
    }
  }

  function logout() {
    setUser(null)
    setAccess(null)
    setRefresh(null)
    localStorage.removeItem('access')
    localStorage.removeItem('refresh')
  }

  useEffect(() => {
    if (access) {
      fetchProfile()
    }
  }, [access])

  const value = useMemo(
    () => ({
      user,
      setUser,
      access,
      setAccess,
      refresh,
      setRefresh,
      loading,
      login,
      register,
      logout,
      changePassword,
    }),
    [user, access, refresh, loading]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}