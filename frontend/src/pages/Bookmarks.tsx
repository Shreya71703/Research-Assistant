import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Bookmark, Search, ExternalLink, Trash2, ArrowRight, 
  Sparkles, FileText, Globe, Star
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useNavigate } from 'react-router-dom'

interface BookmarkedItem {
  id: string
  title: string
  snippet: string
  type: 'paper' | 'web' | 'insight'
  url?: string
  date: string
}

const MOCK_BOOKMARKS: BookmarkedItem[] = [
  {
    id: 'b-1',
    title: 'Multi-Agent State Graph Optimization in LangGraph',
    snippet: 'Conditional routing reduces token overhead by 34% when evaluating tool call eligibility prior to invocation.',
    type: 'paper',
    url: 'https://arxiv.org/abs/2401.00000',
    date: 'Jul 26, 2026'
  },
  {
    id: 'b-2',
    title: 'Sub-second LLM Inference Benchmarks',
    snippet: 'Llama 3.3 70B inference via Groq LPUs achieves 300+ tokens/sec stream generation speed.',
    type: 'insight',
    date: 'Jul 24, 2026'
  },
  {
    id: 'b-3',
    title: 'Open-Meteo Weather API Data Contract',
    snippet: 'Real-time global weather forecast parameters including relative humidity, wind speed, and WMO codes.',
    type: 'web',
    url: 'https://open-meteo.com',
    date: 'Jul 20, 2026'
  }
]

export default function Bookmarks() {
  const [bookmarks, setBookmarks] = useState<BookmarkedItem[]>(MOCK_BOOKMARKS)
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate()

  const filteredBookmarks = bookmarks.filter(b => 
    b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.snippet.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const removeBookmark = (id: string) => {
    setBookmarks(prev => prev.filter(b => b.id !== id))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Bookmark className="w-7 h-7 text-indigo-600" />
            Bookmarked Insights
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Your saved research findings, key citations, and code snippets
          </p>
        </div>
        <Button onClick={() => navigate('/research')} className="rounded-xl shadow-md gap-2">
          <Sparkles className="w-4 h-4" />
          <span>New Research</span>
        </Button>
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input 
            placeholder="Search bookmarks..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-9 h-10 rounded-xl border-slate-200 dark:border-slate-800 dark:bg-slate-800 dark:text-white text-sm"
          />
        </div>
      </div>

      {/* Bookmarks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredBookmarks.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="rounded-2xl border-slate-200 dark:border-slate-800 hover:shadow-md transition-all group bg-white dark:bg-slate-900">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-xs uppercase font-mono bg-slate-50 dark:bg-slate-800 dark:text-slate-300">
                    {item.type}
                  </Badge>
                  <button 
                    onClick={() => removeBookmark(item.id)}
                    className="p-1 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <CardTitle className="text-base font-semibold text-slate-900 dark:text-white mt-2 group-hover:text-indigo-600 transition-colors">
                  {item.title}
                </CardTitle>
                <CardDescription className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-1 line-clamp-3">
                  {item.snippet}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-400">
                  <span>Saved {item.date}</span>
                  {item.url ? (
                    <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 font-medium hover:underline flex items-center gap-1">
                      Open Citation <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <Button onClick={() => navigate('/research')} variant="ghost" size="sm" className="h-7 text-xs text-indigo-600">
                      View Session <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
