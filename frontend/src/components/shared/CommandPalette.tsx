import * as React from "react"
import { useNavigate } from "react-router-dom"
import { Command } from "cmdk"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Search, 
  FileText, 
  Plus, 
  Upload, 
  LayoutDashboard, 
  MessageSquare, 
  FolderKanban, 
  Settings, 
  Globe, 
  CloudSun, 
  Calculator,
  Clock
} from "lucide-react"

import { useUIStore } from "@/stores/uiStore"
import { useChatStore } from "@/stores/chatStore"

export function CommandPalette() {
  const open = useUIStore((state) => state.commandPaletteOpen)
  const setOpen = useUIStore((state) => state.setCommandPaletteOpen)
  const conversations = useChatStore((state) => state.conversations)
  const navigate = useNavigate()

  // Get recent queries from conversations
  const recentQueries = React.useMemo(() => {
    return conversations
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 5)
      .map(c => c.title)
      .filter(t => t && t !== 'New Chat')
  }, [conversations])

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        setOpen(false)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [open, setOpen])

  const runCommand = React.useCallback((command: () => void) => {
    setOpen(false)
    command()
  }, [setOpen])

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative z-50 w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
          >
            <Command 
              className="flex flex-col w-full h-full"
              shouldFilter={true}
            >
              <div className="flex items-center px-4 py-3 border-b border-slate-100">
                <Search className="w-5 h-5 text-slate-400 shrink-0" />
                <Command.Input 
                  autoFocus
                  placeholder="Search anything..." 
                  className="flex-1 bg-transparent border-0 outline-none px-3 text-slate-900 placeholder:text-slate-400 text-base"
                />
                <kbd className="px-2 py-1 bg-slate-100 text-slate-500 rounded text-xs font-mono font-medium">ESC</kbd>
              </div>

              <Command.List className="max-h-[60vh] overflow-y-auto p-2 scrollbar-none">
                <Command.Empty className="py-12 text-center text-sm text-slate-500">
                  No results found.
                </Command.Empty>

                <Command.Group heading="Quick Actions" className="text-xs font-medium text-slate-500 px-2 py-1.5 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-slate-500">
                  <Command.Item 
                    onSelect={() => runCommand(() => navigate('/research'))}
                    className="flex items-center gap-3 px-3 py-2 text-sm text-slate-700 rounded-xl aria-selected:bg-indigo-50 aria-selected:text-indigo-700 cursor-pointer transition-colors"
                  >
                    <Plus className="w-4 h-4 shrink-0" />
                    <span>New Research</span>
                  </Command.Item>
                  <Command.Item 
                    onSelect={() => runCommand(() => navigate('/documents'))}
                    className="flex items-center gap-3 px-3 py-2 text-sm text-slate-700 rounded-xl aria-selected:bg-indigo-50 aria-selected:text-indigo-700 cursor-pointer transition-colors"
                  >
                    <Upload className="w-4 h-4 shrink-0" />
                    <span>Upload Document</span>
                  </Command.Item>
                </Command.Group>

                <Command.Group heading="Pages" className="mt-2 text-xs font-medium text-slate-500 px-2 py-1.5 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-slate-500">
                  <Command.Item onSelect={() => runCommand(() => navigate('/'))} className="flex items-center justify-between px-3 py-2 text-sm text-slate-700 rounded-xl aria-selected:bg-indigo-50 aria-selected:text-indigo-700 cursor-pointer transition-colors">
                    <div className="flex items-center gap-3">
                      <LayoutDashboard className="w-4 h-4 shrink-0" />
                      <span>Dashboard</span>
                    </div>
                  </Command.Item>
                  <Command.Item onSelect={() => runCommand(() => navigate('/research'))} className="flex items-center justify-between px-3 py-2 text-sm text-slate-700 rounded-xl aria-selected:bg-indigo-50 aria-selected:text-indigo-700 cursor-pointer transition-colors">
                    <div className="flex items-center gap-3">
                      <MessageSquare className="w-4 h-4 shrink-0" />
                      <span>Research</span>
                    </div>
                  </Command.Item>
                  <Command.Item onSelect={() => runCommand(() => navigate('/projects'))} className="flex items-center justify-between px-3 py-2 text-sm text-slate-700 rounded-xl aria-selected:bg-indigo-50 aria-selected:text-indigo-700 cursor-pointer transition-colors">
                    <div className="flex items-center gap-3">
                      <FolderKanban className="w-4 h-4 shrink-0" />
                      <span>Projects</span>
                    </div>
                  </Command.Item>
                  <Command.Item onSelect={() => runCommand(() => navigate('/documents'))} className="flex items-center justify-between px-3 py-2 text-sm text-slate-700 rounded-xl aria-selected:bg-indigo-50 aria-selected:text-indigo-700 cursor-pointer transition-colors">
                    <div className="flex items-center gap-3">
                      <FileText className="w-4 h-4 shrink-0" />
                      <span>Documents</span>
                    </div>
                  </Command.Item>
                  <Command.Item onSelect={() => runCommand(() => navigate('/settings'))} className="flex items-center justify-between px-3 py-2 text-sm text-slate-700 rounded-xl aria-selected:bg-indigo-50 aria-selected:text-indigo-700 cursor-pointer transition-colors">
                    <div className="flex items-center gap-3">
                      <Settings className="w-4 h-4 shrink-0" />
                      <span>Settings</span>
                    </div>
                  </Command.Item>
                </Command.Group>

                <Command.Group heading="Tools" className="mt-2 text-xs font-medium text-slate-500 px-2 py-1.5 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-slate-500">
                  <Command.Item onSelect={() => runCommand(() => navigate('/research'))} className="flex items-center gap-3 px-3 py-2 text-sm text-slate-700 rounded-xl aria-selected:bg-indigo-50 aria-selected:text-indigo-700 cursor-pointer transition-colors">
                    <Globe className="w-4 h-4 shrink-0" />
                    <span>Web Search</span>
                  </Command.Item>
                  <Command.Item onSelect={() => runCommand(() => navigate('/research'))} className="flex items-center gap-3 px-3 py-2 text-sm text-slate-700 rounded-xl aria-selected:bg-indigo-50 aria-selected:text-indigo-700 cursor-pointer transition-colors">
                    <CloudSun className="w-4 h-4 shrink-0" />
                    <span>Weather Check</span>
                  </Command.Item>
                  <Command.Item onSelect={() => runCommand(() => navigate('/research'))} className="flex items-center gap-3 px-3 py-2 text-sm text-slate-700 rounded-xl aria-selected:bg-indigo-50 aria-selected:text-indigo-700 cursor-pointer transition-colors">
                    <Calculator className="w-4 h-4 shrink-0" />
                    <span>Calculator</span>
                  </Command.Item>
                </Command.Group>

                {recentQueries.length > 0 && (
                  <Command.Group heading="Recent Searches" className="mt-2 text-xs font-medium text-slate-500 px-2 py-1.5 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-slate-500">
                    {recentQueries.map((query, i) => (
                      <Command.Item 
                        key={i} 
                        onSelect={() => runCommand(() => navigate('/research'))}
                        className="flex items-center gap-3 px-3 py-2 text-sm text-slate-700 rounded-xl aria-selected:bg-indigo-50 aria-selected:text-indigo-700 cursor-pointer transition-colors"
                      >
                        <Clock className="w-4 h-4 shrink-0" />
                        <span>{query}</span>
                      </Command.Item>
                    ))}
                  </Command.Group>
                )}
              </Command.List>
            </Command>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
