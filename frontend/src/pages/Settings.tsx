import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User, Settings as SettingsIcon, Shield, Bell, 
  Keyboard, Terminal, Check, Moon, Sun
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUIStore } from '@/stores/uiStore';

export default function Settings() {
  const [name, setName] = useState('Research User');
  const [saved, setSaved] = useState(false);
  const theme = useUIStore((state) => state.theme);
  const setTheme = useUIStore((state) => state.setTheme);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Settings</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your account and platform preferences</p>
      </div>

      <motion.div 
        className="space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="rounded-xl border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-indigo-600" />
              <CardTitle className="dark:text-white">Profile</CardTitle>
            </div>
            <CardDescription>Your personal information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-6">
              <Avatar className="w-20 h-20 border-2 border-slate-100 dark:border-slate-800 shadow-sm">
                <AvatarImage src="" />
                <AvatarFallback className="bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-xl font-medium">RU</AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <Button variant="outline" size="sm" className="dark:border-slate-700 dark:text-slate-200">Change Avatar</Button>
                <p className="text-xs text-slate-500">JPG, GIF or PNG. Max size 2MB.</p>
              </div>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Display Name</label>
                <Input 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  className="rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Role</label>
                <Input 
                  value="Lead Researcher" 
                  disabled 
                  className="rounded-lg bg-slate-50 dark:bg-slate-800/50 dark:border-slate-700 dark:text-slate-400"
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 py-4 flex justify-end">
            <Button 
              className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[100px]"
              onClick={handleSave}
            >
              {saved ? (
                <>
                  <Check className="w-4 h-4 mr-2" /> Saved
                </>
              ) : 'Save Changes'}
            </Button>
          </CardFooter>
        </Card>

        {/* Appearance Settings with Active Dark Mode Toggle */}
        <Card className="rounded-xl border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
          <CardHeader>
            <div className="flex items-center gap-2">
              <SettingsIcon className="w-5 h-5 text-indigo-600" />
              <CardTitle className="dark:text-white">Appearance</CardTitle>
            </div>
            <CardDescription>Customize how the platform looks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              {/* Light Mode Button */}
              <button 
                onClick={() => setTheme('light')}
                className="flex flex-col items-center gap-2 group cursor-pointer"
              >
                <div className={`w-28 h-18 rounded-xl border-2 p-2.5 transition-all ${
                  theme === 'light' 
                    ? 'border-indigo-600 ring-2 ring-indigo-500/20 shadow-md bg-white' 
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-400 bg-white dark:bg-slate-900'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <Sun className="w-4 h-4 text-amber-500" />
                    {theme === 'light' && <div className="w-2 h-2 rounded-full bg-indigo-600" />}
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded mb-1.5"></div>
                  <div className="w-2/3 h-2 bg-slate-100 dark:bg-slate-800 rounded"></div>
                </div>
                <span className={`text-sm font-medium flex items-center gap-1.5 ${theme === 'light' ? 'text-indigo-600 dark:text-indigo-400 font-semibold' : 'text-slate-600 dark:text-slate-400'}`}>
                  Light Mode {theme === 'light' && <Badge variant="success" className="text-[10px] px-1.5 py-0 h-4 bg-indigo-100 text-indigo-700 border-none">Active</Badge>}
                </span>
              </button>
              
              {/* Dark Mode Button */}
              <button 
                onClick={() => setTheme('dark')}
                className="flex flex-col items-center gap-2 group cursor-pointer"
              >
                <div className={`w-28 h-18 rounded-xl border-2 p-2.5 transition-all ${
                  theme === 'dark' 
                    ? 'border-indigo-500 ring-2 ring-indigo-500/20 shadow-md bg-slate-900' 
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-400 bg-white dark:bg-slate-900'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <Moon className="w-4 h-4 text-indigo-400" />
                    {theme === 'dark' && <div className="w-2 h-2 rounded-full bg-indigo-400" />}
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded mb-1.5"></div>
                  <div className="w-2/3 h-2 bg-slate-800 rounded"></div>
                </div>
                <span className={`text-sm font-medium flex items-center gap-1.5 ${theme === 'dark' ? 'text-indigo-400 font-semibold' : 'text-slate-600 dark:text-slate-400'}`}>
                  Dark Mode {theme === 'dark' && <Badge variant="success" className="text-[10px] px-1.5 py-0 h-4 bg-indigo-950 text-indigo-300 border-none">Active</Badge>}
                </span>
              </button>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Terminal className="w-5 h-5 text-indigo-600" />
              <CardTitle className="dark:text-white">API & Engine Configuration</CardTitle>
            </div>
            <CardDescription>Backend connection settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Backend URL</label>
              <div className="flex gap-2">
                <Input value="http://localhost:8000" readOnly className="font-mono text-sm bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-white" />
                <Button variant="outline" className="dark:border-slate-700 dark:text-slate-200">Test Connection</Button>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">LLM Model</label>
              <Input value="Groq Llama 3.3 70B" readOnly className="font-mono text-sm bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-white" />
              <p className="text-xs text-slate-500">Model selection is currently managed by the backend engine.</p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Keyboard className="w-5 h-5 text-indigo-600" />
              <CardTitle className="dark:text-white">Keyboard Shortcuts</CardTitle>
            </div>
            <CardDescription>Work faster with keyboard bindings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { label: 'Command Palette', keys: ['Ctrl', 'K'] },
                { label: 'Send Message', keys: ['Enter'] },
                { label: 'New Line in Input', keys: ['Shift', 'Enter'] },
                { label: 'New Research Session', keys: ['Ctrl', 'N'] },
              ].map((shortcut, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-slate-50 dark:border-slate-800 last:border-0">
                  <span className="text-sm text-slate-600 dark:text-slate-400">{shortcut.label}</span>
                  <div className="flex gap-1">
                    {shortcut.keys.map(k => (
                      <kbd key={k} className="px-2 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs font-mono text-slate-600 dark:text-slate-300 shadow-sm">
                        {k}
                      </kbd>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-slate-200 dark:border-slate-800 shadow-sm bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-950">
          <CardContent className="p-6">
            <div className="flex flex-col items-center justify-center text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-2">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white">Research Assistant v1.0.0</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md">
                Built with React, Tailwind CSS, and Framer Motion. Powered by LangGraph and Groq.
              </p>
            </div>
          </CardContent>
        </Card>

      </motion.div>
    </div>
  );
}
