import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  FolderKanban, Plus, Search, Calendar, Users, 
  MoreVertical, CheckCircle2, Clock, Sparkles, 
  FileText, ArrowRight, Tag, Star
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useNavigate } from 'react-router-dom'

interface Project {
  id: string
  title: string
  description: string
  category: string
  progress: number
  status: 'planning' | 'in_progress' | 'review' | 'completed'
  deadline: string
  collaborators: string[]
  sessionsCount: number
  pinned: boolean
}

const INITIAL_PROJECTS: Project[] = [
  {
    id: 'proj-1',
    title: 'LLM Agent Architectures 2026',
    description: 'Comprehensive research into multi-agent orchestration, tool routing, and memory retrieval mechanisms.',
    category: 'AI Research',
    progress: 75,
    status: 'in_progress',
    deadline: 'Aug 15, 2026',
    collaborators: ['RA', 'JD', 'AS'],
    sessionsCount: 12,
    pinned: true
  },
  {
    id: 'proj-2',
    title: 'Climate Impact Telemetry',
    description: 'Aggregating global meteorological data, news sentiment, and academic findings for climate forecasting.',
    category: 'Environmental',
    progress: 40,
    status: 'in_progress',
    deadline: 'Sep 01, 2026',
    collaborators: ['RA', 'EL'],
    sessionsCount: 8,
    pinned: true
  },
  {
    id: 'proj-3',
    title: 'Quantum Computing Benchmarks',
    description: 'Analyzing recent ArXiv papers on qubit stability, error correction algorithms, and commercial applications.',
    category: 'Quantum Physics',
    progress: 90,
    status: 'review',
    deadline: 'Jul 30, 2026',
    collaborators: ['RA'],
    sessionsCount: 15,
    pinned: false
  },
  {
    id: 'proj-4',
    title: 'Financial Market Sentiment',
    description: 'Automated news analysis and economic indicator tracking for tech sector earnings evaluations.',
    category: 'Finance',
    progress: 100,
    status: 'completed',
    deadline: 'Jul 20, 2026',
    collaborators: ['RA', 'MK'],
    sessionsCount: 6,
    pinned: false
  }
]

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState<'all' | 'in_progress' | 'review' | 'completed'>('all')
  const navigate = useNavigate()

  const filteredProjects = projects.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = activeFilter === 'all' || p.status === activeFilter
    return matchesSearch && matchesFilter
  })

  const togglePin = (id: string) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, pinned: !p.pinned } : p))
  }

  const getStatusBadge = (status: Project['status']) => {
    switch (status) {
      case 'in_progress':
        return <Badge variant="default" className="bg-indigo-50 text-indigo-700 border-indigo-200">In Progress</Badge>
      case 'review':
        return <Badge variant="warning" className="bg-amber-50 text-amber-700 border-amber-200">In Review</Badge>
      case 'completed':
        return <Badge variant="success" className="bg-emerald-50 text-emerald-700 border-emerald-200">Completed</Badge>
      default:
        return <Badge variant="secondary">Planning</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FolderKanban className="w-7 h-7 text-indigo-600" />
            Research Projects
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Organize, track, and collaborate on your active research initiatives
          </p>
        </div>
        <Button onClick={() => navigate('/research')} className="rounded-xl shadow-md gap-2">
          <Plus className="w-4 h-4" />
          <span>New Project</span>
        </Button>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input 
            placeholder="Search projects..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-9 h-9 rounded-xl border-slate-200 text-sm"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {(['all', 'in_progress', 'review', 'completed'] as const).map(filter => (
            <Button
              key={filter}
              variant={activeFilter === filter ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveFilter(filter)}
              className="rounded-lg text-xs capitalize whitespace-nowrap"
            >
              {filter.replace('_', ' ')}
            </Button>
          ))}
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredProjects.map((project, index) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="rounded-2xl border-slate-200 hover:shadow-lg transition-all duration-200 group relative">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs bg-slate-50 text-slate-600 border-slate-200">
                      {project.category}
                    </Badge>
                    {getStatusBadge(project.status)}
                  </div>
                  <button 
                    onClick={() => togglePin(project.id)}
                    className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-amber-500 transition-colors"
                  >
                    <Star className={`w-4 h-4 ${project.pinned ? 'fill-amber-400 text-amber-400' : ''}`} />
                  </button>
                </div>
                <CardTitle className="text-lg font-bold text-slate-900 mt-2 group-hover:text-indigo-600 transition-colors">
                  {project.title}
                </CardTitle>
                <CardDescription className="text-slate-500 text-sm line-clamp-2 mt-1">
                  {project.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4 pt-0">
                {/* Progress bar */}
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5 font-medium">
                    <span>Progress</span>
                    <span>{project.progress}%</span>
                  </div>
                  <Progress value={project.progress} className="h-2 bg-slate-100" />
                </div>

                {/* Details Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-500">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5" title="Research Sessions">
                      <FileText className="w-3.5 h-3.5 text-slate-400" />
                      <span>{project.sessionsCount} sessions</span>
                    </div>
                    <div className="flex items-center gap-1.5" title="Deadline">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{project.deadline}</span>
                    </div>
                  </div>

                  <div className="flex items-center -space-x-1.5">
                    {project.collaborators.map((c, i) => (
                      <Avatar key={i} className="w-6 h-6 border-2 border-white text-[10px]">
                        <AvatarFallback className="bg-indigo-100 text-indigo-700 font-semibold">{c}</AvatarFallback>
                      </Avatar>
                    ))}
                  </div>
                </div>

                <Button 
                  onClick={() => navigate('/research')}
                  variant="outline" 
                  className="w-full mt-2 rounded-xl border-slate-200 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-colors gap-2 text-xs font-medium"
                >
                  <span>Open Research Workspace</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
