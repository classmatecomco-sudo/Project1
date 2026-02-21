"use client"

import React, { createContext, useCallback, useContext, useEffect, useState } from "react"
import {
  getSession,
  syncSessionFromSupabase,
  signup as clientSignup,
  login as clientLogin,
  logout as clientLogout,
  type User,
} from "./auth-client"
import { createClient } from "@/lib/supabase/client"

type AuthContextValue = {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<{ error?: string }>
  signup: (email: string, password: string, name: string) => Promise<{ error?: string }>
  logout: () => Promise<void>
  refresh: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export type { User }

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const synced = await syncSessionFromSupabase()
    setUser(synced ?? getSession())
  }, [])

  useEffect(() => {
    let mounted = true
    const supabase = createClient()
    if (!supabase) {
      setUser(getSession())
      setLoading(false)
      return
    }
    syncSessionFromSupabase().then((u) => {
      if (mounted) setUser(u ?? getSession())
    }).finally(() => {
      if (mounted) setLoading(false)
    })
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      syncSessionFromSupabase().then((u) => {
        if (mounted) setUser(u ?? null)
      })
    })
    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const result = await clientLogin(email, password)
    if (result.error) return { error: result.error }
    setUser(result.user ?? null)
    return {}
  }, [])

  const signup = useCallback(async (email: string, password: string, name: string) => {
    const result = await clientSignup(email, password, name)
    if (result.error) return { error: result.error }
    setUser(result.user ?? null)
    return {}
  }, [])

  const logout = useCallback(async () => {
    clientLogout()
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
