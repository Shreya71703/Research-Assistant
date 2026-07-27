import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { Menu, Search, Plus, Bell, Settings as SettingsIcon, LogOut, User } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useUIStore } from "@/stores/uiStore"

export function TopNav() {
  const toggleSidebar = useUIStore((state) => state.toggleSidebar)
  const setCommandPaletteOpen = useUIStore((state) => state.setCommandPaletteOpen)
  const navigate = useNavigate()

  return (
    <motion.header
      initial={{ y: -64 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 z-40 flex items-center justify-between px-4"
    >
      <div className="flex items-center gap-4 lg:hidden">
        <Button variant="ghost" size="icon" onClick={toggleSidebar}>
          <Menu className="w-5 h-5 text-slate-700 dark:text-slate-200" />
        </Button>
      </div>
      
      {/* Spacer for desktop layout where sidebar is visible */}
      <div className="hidden lg:block w-0 transition-all" />

      <div className="flex-1 max-w-2xl mx-4 flex justify-center lg:justify-start">
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="w-full max-w-md flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/20 rounded-full"
        >
          <Search className="w-4 h-4 shrink-0 text-slate-400 dark:text-slate-500" />
          <span className="text-sm flex-1 text-left">Search anything...</span>
          <div className="hidden sm:flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono font-medium shadow-sm text-slate-600 dark:text-slate-300">Ctrl</kbd>
            <span className="text-xs text-slate-400">+</span>
            <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono font-medium shadow-sm text-slate-600 dark:text-slate-300">K</kbd>
          </div>
        </button>
      </div>

      <div className="flex items-center gap-3">
        <Button 
          className="hidden sm:flex items-center gap-2 rounded-full px-5"
          onClick={() => navigate('/research')}
        >
          <Plus className="w-4 h-4" />
          <span>New Research</span>
        </Button>

        <Button variant="ghost" size="icon" className="relative rounded-full">
          <Bell className="w-5 h-5 text-slate-600" />
          <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="outline-none focus:ring-2 focus:ring-indigo-500 rounded-full">
              <Avatar className="w-9 h-9 border border-slate-200 hover:border-indigo-500 transition-colors">
                <AvatarImage src="" />
                <AvatarFallback className="bg-indigo-50 text-indigo-700">RA</AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 mt-2">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="w-4 h-4 mr-2" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/settings')}>
              <SettingsIcon className="w-4 h-4 mr-2" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600 focus:bg-red-50 focus:text-red-700">
              <LogOut className="w-4 h-4 mr-2" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.header>
  )
}
