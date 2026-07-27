import { useEffect } from "react"
import { useLocation } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { Sidebar } from "./Sidebar"
import { TopNav } from "./TopNav"
import { CommandPalette } from "@/components/shared/CommandPalette"
import { useUIStore } from "@/stores/uiStore"

interface AppShellProps {
  children: React.ReactNode
}

export default function AppShell({ children }: AppShellProps) {
  const sidebarCollapsed = useUIStore((state) => state.sidebarCollapsed)
  const setSidebarCollapsed = useUIStore((state) => state.setSidebarCollapsed)
  const setCommandPaletteOpen = useUIStore((state) => state.setCommandPaletteOpen)

  const location = useLocation()

  // Handle Ctrl+K shortcut for command palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault()
        setCommandPaletteOpen(true)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [setCommandPaletteOpen])

  // Automatically collapse sidebar on smaller screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarCollapsed(true)
      }
    }
    window.addEventListener("resize", handleResize)
    handleResize()
    return () => window.removeEventListener("resize", handleResize)
  }, [setSidebarCollapsed])

  // Check if we're on the research page (needs full-width layout without padding)
  const isResearchPage = location.pathname.startsWith('/research')

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden font-sans">
      <TopNav />

      {/* Desktop Sidebar */}
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      <main 
        className="flex-1 flex flex-col min-w-0 overflow-hidden pt-16"
        style={{ 
          marginLeft: sidebarCollapsed ? '72px' : '280px',
          transition: 'margin-left 0.3s ease'
        }}
      >
        {isResearchPage ? (
          // Research page gets full height without padding
          <div className="flex-1 overflow-hidden">
            {children}
          </div>
        ) : (
          // All other pages get scrollable content with padding
          <div className="flex-1 overflow-y-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8"
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>
        )}
      </main>

      <CommandPalette />
    </div>
  )
}
