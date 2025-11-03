import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

const AuthContext = createContext(null)
const STORAGE_KEY = 'evcoown_auth_v1'

function loadStored() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => loadStored()?.user || null)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ user }))
    } catch {
      // ignore write errors (private mode / quota)
      void 0
    }
  }, [user])

  const login = useCallback(async ({ email, password }) => {
    // TODO: replace with real API call
    if (!email || !password) throw new Error('Missing credentials')
    const fakeUser = { id: 'u_' + Date.now(), email }
    setUser(fakeUser)
    return fakeUser
  }, [])

  const register = useCallback(async ({ name, email, password }) => {
    if (!name || !email || !password) throw new Error('Missing fields')
    // Simulate register then login
    const fakeUser = { id: 'u_' + Date.now(), name, email }
    setUser(fakeUser)
    return fakeUser
  }, [])

  const logout = useCallback(() => {
    setUser(null)
  }, [])

  const value = useMemo(() => ({ user, login, register, logout }), [user, login, register, logout])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
