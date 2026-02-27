import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// ── Cookie helpers for middleware auth ──
function setAuthCookies(token: string, role: string) {
  if (typeof document === 'undefined') return;
  const maxAge = 60 * 60 * 24 * 30; // 30 days
  document.cookie = `auth-token=${token}; path=/; max-age=${maxAge}; SameSite=Lax`;
  document.cookie = `auth-role=${role}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

function clearAuthCookies() {
  if (typeof document === 'undefined') return;
  document.cookie = 'auth-token=; path=/; max-age=0';
  document.cookie = 'auth-role=; path=/; max-age=0';
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
  token: string | null;
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
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      _hasHydrated: false,

      login: (token: string, user: User) => {
        set({
          token,
          user,
          isAuthenticated: true,
        });
        setAuthCookies(token, user.role);
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
        clearAuthCookies();
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth-storage');
          localStorage.removeItem('remembered-login');
        }
      },

      updateUser: (user: User) => {
        set({ user });
        // Sync role cookie when user is updated
        const currentToken = get().token;
        if (currentToken) {
          setAuthCookies(currentToken, user.role);
        }
      },

      setToken: (token: string) => {
        set({ token, isAuthenticated: true });
        const currentUser = get().user;
        if (currentUser) {
          setAuthCookies(token, currentUser.role);
        }
      },

      setHasHydrated: (state: boolean) => {
        set({ _hasHydrated: state });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      // عند انتهاء تحميل البيانات من localStorage
      onRehydrateStorage: () => (state) => {
        if (state) {
          // التأكد من أن isAuthenticated متزامن مع وجود token و user
          if (state.token && state.user) {
            state.isAuthenticated = true;
            // Sync cookies on rehydration so middleware has fresh data
            setAuthCookies(state.token, state.user.role);
          } else {
            clearAuthCookies();
          }
          state._hasHydrated = true;
        }
      },
    }
  )
);
