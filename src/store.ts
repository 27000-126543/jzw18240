import { create } from 'zustand'
import type { User, ApiResponse } from './types'

interface AppState {
  currentUser: User | null
  login: (email: string, password: string) => Promise<boolean>
  fetchMe: () => Promise<void>
  fetchApi: <T>(url: string, options?: RequestInit) => Promise<T>
}

export const useStore = create<AppState>((set, get) => ({
  currentUser: null,

  login: async (email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data: ApiResponse<User> = await res.json()
      if (data.success) {
        set({ currentUser: data.data })
        return true
      }
      return false
    } catch {
      return false
    }
  },

  fetchMe: async () => {
    try {
      const res = await fetch('/api/auth/me')
      const data: ApiResponse<User> = await res.json()
      if (data.success) {
        set({ currentUser: data.data })
      }
    } catch { void 0 }
  },

  fetchApi: async <T>(url: string, options?: RequestInit): Promise<T> => {
    const res = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    })
    const data: ApiResponse<T> = await res.json()
    if (data.success) {
      return data.data
    }
    throw new Error(data.error || '请求失败')
  },
}))

if (!useStore.getState().currentUser) {
  useStore.getState().fetchMe()
}
