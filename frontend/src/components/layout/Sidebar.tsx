import { NavLink } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { 
  LayoutDashboard, 
  MessageSquare, 
  Clock, 
  Bookmark,
  FolderKanban,
  FileText,
  Database,
  BarChart3,
  TrendingUp,
  Puzzle,
  Settings,
  HelpCircle,
  Sparkles,
  ChevronLeft
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

const NAV_GROUPS = [
  {
    label: "MAIN",
    items: [
      { icon: LayoutDashboard, label: "Dashboard", path: "/" },
      { icon: MessageSquare, label: "Research", path: "/research" },
      { icon: Clock, label: "History", path: "/history" },
      { icon: Bookmark, label: "Bookmarks", path: "/bookmarks" },
    ]
  },
  {
    label: "WORKSPACE",
    items: [
      { icon: FolderKanban, label: "Projects", path: "/projects" },
      { icon: FileText, label: "Documents", path: "/documents" },
      { icon: Database, label: "Knowledge Base", path: "/knowledge-base" },
    ]
  },
  {
    label: "INSIGHTS",
    items: [
      { icon: BarChart3, label: "Reports", path: "/reports" },
      { icon: TrendingUp, label: "Analytics", path: "/analytics" },
    ]
  },
  {
    label: "SYSTEM",
    items: [
      { icon: Puzzle, label: "Integrations", path: "/integrations" },
      { icon: Settings, label: "Settings", path: "/settings" },
      { icon: HelpCircle, label: "Help", path: "/help" },
    ]
  }
]

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 72 : 280 }}
      className="fixed top-0 left-0 hidden lg:flex flex-col h-screen bg-slate-50/80 dark:bg-slate-900/80 border-r border-slate-200 dark:border-slate-800 overflow-hidden shrink-0 z-30"
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200/50 dark:border-slate-800 shrink-0">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shrink-0 shadow-sm">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="font-semibold text-slate-900 dark:text-white whitespace-nowrap"
              >
                Research Assistant
              </motion.span>
            )}
          </AnimatePresence>
        </div>
        <button
          onClick={onToggle}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
        >
          <motion.div animate={{ rotate: collapsed ? 180 : 0 }}>
            <ChevronLeft className="w-5 h-5" />
          </motion.div>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-4 scrollbar-none">
        {NAV_GROUPS.map((group, i) => (
          <div key={i} className="mb-6 px-3">
            {!collapsed ? (
              <div className="px-3 mb-2 text-[11px] font-semibold text-slate-400 dark:text-slate-500 tracking-wider uppercase">
                {group.label}
              </div>
            ) : (
              <div className="h-4 mb-2" />
            )}
            <div className="space-y-1">
              {group.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/'}
                  className={({ isActive }) => cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 relative group",
                    isActive 
                      ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-medium" 
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white"
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  {({ isActive }) => (
                    <>
                      {isActive && !collapsed && (
                        <motion.div
                          layoutId="activeNavIndicator"
                          className="absolute left-0 w-1 h-5 bg-indigo-600 rounded-r-full"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        />
                      )}
                      <item.icon className="w-5 h-5 shrink-0" />
                      <AnimatePresence>
                        {!collapsed && (
                          <motion.span
                            initial={{ opacity: 0, width: 0 }}
                            animate={{ opacity: 1, width: "auto" }}
                            exit={{ opacity: 0, width: 0 }}
                            className="whitespace-nowrap text-sm"
                          >
                            {item.label}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-slate-200/50 shrink-0">
        <div className="flex items-center gap-3 overflow-hidden">
          <Avatar className="w-9 h-9 border border-slate-200 shrink-0">
            <AvatarImage src="" />
            <AvatarFallback className="bg-indigo-50 text-indigo-600 text-sm">RA</AvatarFallback>
          </Avatar>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="flex flex-col whitespace-nowrap"
              >
                <span className="text-sm font-medium text-slate-900">Researcher</span>
                <span className="text-xs text-slate-500">Pro Plan</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.aside>
  )
}
