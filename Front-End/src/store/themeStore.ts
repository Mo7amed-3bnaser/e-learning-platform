import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

type Theme = 'light' | 'dark';

// sessionStorage: theme resets to light on every new browser session
const sessionStorageAdapter = createJSONStorage(() =>
  typeof window !== 'undefined' ? sessionStorage : localStorage
);

interface ThemeState {
  theme: Theme;
  _hasHydrated: boolean;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  setHasHydrated: (state: boolean) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'light',
      _hasHydrated: false,

      setTheme: (theme) => set({ theme }),

      toggleTheme: () =>
        set((state) => ({
          theme: state.theme === 'light' ? 'dark' : 'light',
        })),

      setHasHydrated: (state) => set({ _hasHydrated: state }),
    }),
    {
      name: 'masar-theme',
      storage: sessionStorageAdapter,
      partialize: (state) => ({ theme: state.theme }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
