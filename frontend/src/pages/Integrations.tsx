import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Puzzle, Globe, Cloud, Newspaper, Calculator, BookOpen, 
  Github, CheckCircle2, ShieldAlert, Zap, RefreshCw, Power
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface ToolIntegration {
  id: string
  name: string
  provider: string
  description: string
  category: string
  status: 'active' | 'configured' | 'available'
  icon: any
}

const INTEGRATIONS: ToolIntegration[] = [
  { id: 't-1', name: 'DuckDuckGo Search', provider: 'DuckDuckGo API', description: 'Real-time multi-source web search engine retrieval for current news and articles.', category: 'Web Search', status: 'active', icon: Globe },
  { id: 't-2', name: 'Open-Meteo Weather', provider: 'Open-Meteo Telemetry', description: 'Global meteorological forecasts, geocoding coordinates, and real-time temperatures.', category: 'Weather', status: 'active', icon: Cloud },
  { id: 't-3', name: 'NewsAPI Aggregator', provider: 'NewsAPI Org', description: 'Breaking news aggregator for tech, science, finance, and global headlines.', category: 'News', status: 'active', icon: Newspaper },
  { id: 't-4', name: 'ArXiv Academic Search', provider: 'ArXiv Org API', description: 'Deep search across 2M+ computer science, AI, physics, and math preprints.', category: 'Academic', status: 'active', icon: BookOpen },
  { id: 't-5', name: 'GitHub Repositories', provider: 'GitHub REST API', description: 'Search open-source codebases, stars, issues, releases, and developer repositories.', category: 'Code', status: 'active', icon: Github },
  { id: 't-6', name: 'Math & Logic Engine', provider: 'Python SymPy', description: 'Safe arithmetic evaluator for complex mathematical expressions and equations.', category: 'Math', status: 'active', icon: Calculator },
]

export default function Integrations() {
  const [tools, setTools] = useState<ToolIntegration[]>(INTEGRATIONS)

  const toggleStatus = (id: string) => {
    setTools(prev => prev.map(t => t.id === id ? { ...t, status: t.status === 'active' ? 'available' : 'active' } : t))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <Puzzle className="w-7 h-7 text-indigo-600" />
          Tool Integrations
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Manage integrated LLM agent tools, API providers, and telemetry connections
        </p>
      </div>

      {/* Integrations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tools.map((tool, index) => {
          const Icon = tool.icon
          const isActive = tool.status === 'active'
          return (
            <motion.div
              key={tool.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:shadow-md transition-all">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <CardTitle className="text-base font-semibold text-slate-900 dark:text-white">{tool.name}</CardTitle>
                        <CardDescription className="text-xs text-slate-400">{tool.provider}</CardDescription>
                      </div>
                    </div>
                    {isActive ? (
                      <Badge variant="success" className="bg-emerald-50 text-emerald-700">Active</Badge>
                    ) : (
                      <Badge variant="secondary">Disabled</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 pt-0">
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {tool.description}
                  </p>
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                    <Badge variant="outline" className="text-[10px] uppercase font-mono bg-slate-50 dark:bg-slate-800 dark:text-slate-300">
                      {tool.category}
                    </Badge>
                    <Button 
                      onClick={() => toggleStatus(tool.id)}
                      variant={isActive ? 'outline' : 'default'} 
                      size="sm" 
                      className="rounded-lg text-xs gap-1.5"
                    >
                      <Power className="w-3 h-3" />
                      {isActive ? 'Disable Tool' : 'Enable Tool'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
