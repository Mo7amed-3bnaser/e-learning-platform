import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// No more client-side auth cookies — the server sets HttpOnly cookies.
// This eliminates XSS token theft and prevents auth-role cookie spoofing.

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'student' | 'admin' | 'instructor';
  avatar?: string | null;
}

interface AuthState {
  user: User | null;
  token: string | null;  // in-memory only — NOT persisted to localStorage
  isAuthenticated: boolean;
  _hasHydrated: boolean;
  
  // Actions
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (user: User) => void;
  setToken: (token: string) => void;
  setHasHydrated: (state: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      _hasHydrated: false,

      login: (token: string, user: User) => {
        set({
          token,  // kept in memory for Authorization header fallback
          user,
          isAuthenticated: true,
        });
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth-storage');
          localStorage.removeItem('remembered-login');
        }
      },

      updateUser: (user: User) => {
        set({ user });
      },

      setToken: (token: string) => {
        set({ token, isAuthenticated: true });
      },

      setHasHydrated: (state: boolean) => {
        set({ _hasHydrated: state });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // Only persist user data — token is NOT persisted (lives in memory only).
        // The HttpOnly access_token cookie handles auth across page reloads.
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      // عند انتهاء تحميل البيانات من localStorage
      onRehydrateStorage: () => (state) => {
        if (state) {
          if (state.user) {
            state.isAuthenticated = true;
          } else {
            state.isAuthenticated = false;
          }
          state._hasHydrated = true;
        }
      },
    }
  )
);
