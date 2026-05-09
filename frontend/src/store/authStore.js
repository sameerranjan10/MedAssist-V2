/**
 * store/authStore.js
 * Global auth state using Zustand.
 * Persists token to localStorage for page refreshes.
 */
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useAuthStore = create(
  persist(
    (set, get) => ({
      token: null,
      user: null,     // { id, email, full_name, role }
      isAuthenticated: false,

      login: (tokenData) => {
        set({
          token: tokenData.access_token,
          user: {
            id: tokenData.user_id,
            full_name: tokenData.full_name,
            role: tokenData.role,
          },
          isAuthenticated: true,
        })
      },

      logout: () => {
        set({ token: null, user: null, isAuthenticated: false })
      },

      getRole: () => get().user?.role ?? null,
      getInitials: () => {
        const name = get().user?.full_name ?? ''
        return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
      },
    }),
    { name: 'medassist-auth' }
  )
)

export default useAuthStore
