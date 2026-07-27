import { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Toaster } from 'sonner'
import AppShell from '@/components/layout/AppShell'
import Dashboard from '@/pages/Dashboard'
import Research from '@/pages/Research'
import Settings from '@/pages/Settings'
import History from '@/pages/History'
import Bookmarks from '@/pages/Bookmarks'
import Projects from '@/pages/Projects'
import Documents from '@/pages/Documents'
import KnowledgeBase from '@/pages/KnowledgeBase'
import Analytics from '@/pages/Analytics'
import Reports from '@/pages/Reports'
import Integrations from '@/pages/Integrations'
import Help from '@/pages/Help'
import { useUIStore } from '@/stores/uiStore'

function App() {
  const theme = useUIStore((state) => state.theme)

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [theme])

  return (
    <>
      <Toaster position="top-right" richColors />
      <AppShell>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/research" element={<Research />} />
          <Route path="/research/:id" element={<Research />} />
          <Route path="/history" element={<History />} />
          <Route path="/bookmarks" element={<Bookmarks />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/documents" element={<Documents />} />
          <Route path="/knowledge-base" element={<KnowledgeBase />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/integrations" element={<Integrations />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/help" element={<Help />} />
          <Route path="*" element={<Dashboard />} />
        </Routes>
      </AppShell>
    </>
  )
}

export default App
