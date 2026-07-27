import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UIState {
  sidebarCollapsed: boolean
  commandPaletteOpen: boolean
  rightPanelOpen: boolean
  activePage: string
  theme: 'light' | 'dark'
  toggleSidebar: () => void
  toggleCommandPalette: () => void
  toggleRightPanel: () => void
  setSidebarCollapsed: (v: boolean) => void
  setCommandPaletteOpen: (v: boolean) => void
  setActivePage: (page: string) => void
  setTheme: (theme: 'light' | 'dark') => void
  toggleTheme: () => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      sidebarCollapsed: false,
      commandPaletteOpen: false,
      rightPanelOpen: true,
      activePage: 'dashboard',
      theme: 'light',
      
      toggleSidebar: () => set(state => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      toggleCommandPalette: () => set(state => ({ commandPaletteOpen: !state.commandPaletteOpen })),
      toggleRightPanel: () => set(state => ({ rightPanelOpen: !state.rightPanelOpen })),
      setSidebarCollapsed: (v: boolean) => set({ sidebarCollapsed: v }),
      setCommandPaletteOpen: (v: boolean) => set({ commandPaletteOpen: v }),
      setActivePage: (page: string) => set({ activePage: page }),
      
      setTheme: (theme: 'light' | 'dark') => {
        set({ theme })
        if (theme === 'dark') {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
      },

      toggleTheme: () => {
        const nextTheme = get().theme === 'light' ? 'dark' : 'light'
        get().setTheme(nextTheme)
      }
    }),
    {
      name: 'ui-storage',
      partialize: (state) => ({ theme: state.theme, sidebarCollapsed: state.sidebarCollapsed })
    }
  )
)
