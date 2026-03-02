import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// ─── Client-side cookie helpers for Next.js middleware ───
// The backend sets an HttpOnly access_token cookie on its own domain.
// Next.js middleware runs on the *frontend* domain so it can't see that cookie.
// We mirror the token into a non-HttpOnly cookie that the middleware can read
// for routing decisions only — actual authorisation is enforced by the backend.
function setClientAuthCookie(token: string) {
  if (typeof document === 'undefined') return;
  // maxAge = 1 hour (matches JWT expiry)
  document.cookie = `access_token=${token}; path=/; max-age=3600; SameSite=Lax`;
}

function clearClientAuthCookie() {
  if (typeof document === 'undefined') return;
  document.cookie = 'access_token=; path=/; max-age=0; SameSite=Lax';
}

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
        setClientAuthCookie(token);
        set({
          token,  // kept in memory for Authorization header fallback
          user,
          isAuthenticated: true,
        });
      },

      logout: () => {
        clearClientAuthCookie();
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
        setClientAuthCookie(token);
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
