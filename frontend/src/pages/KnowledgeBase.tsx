import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Database, Search, Layers, Cpu, Server, CheckCircle2, 
  Sparkles, RefreshCw, Zap, BookOpen, HardDrive, ArrowUpRight
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useNavigate } from 'react-router-dom'

const COLLECTIONS = [
  { id: 'col-1', name: 'AI & Machine Learning', chunks: 1420, filesCount: 18, model: 'text-embedding-3-small', status: 'indexed' },
  { id: 'col-2', name: 'Meteorological & Climate', chunks: 850, filesCount: 9, model: 'text-embedding-3-small', status: 'indexed' },
  { id: 'col-3', name: 'Quantum Physics Papers', chunks: 2100, filesCount: 24, model: 'text-embedding-3-small', status: 'indexing' },
  { id: 'col-4', name: 'Financial Sentiment Logs', chunks: 620, filesCount: 7, model: 'text-embedding-3-small', status: 'indexed' },
]

export default function KnowledgeBase() {
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Database className="w-7 h-7 text-indigo-600" />
            Knowledge Base & Embeddings
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Vector database telemetry, collection indices, and semantic retrieval status
          </p>
        </div>
        <Button onClick={() => navigate('/research')} className="rounded-xl shadow-md gap-2">
          <RefreshCw className="w-4 h-4" />
          <span>Re-index All</span>
        </Button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="rounded-2xl border-slate-200">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">4,990</div>
              <div className="text-xs text-slate-500 font-medium">Vector Chunks</div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-slate-200">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center shrink-0">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">58</div>
              <div className="text-xs text-slate-500 font-medium">Indexed Files</div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-slate-200">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">1536</div>
              <div className="text-xs text-slate-500 font-medium">Embedding Dim</div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-slate-200">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">99.4%</div>
              <div className="text-xs text-slate-500 font-medium">Retrieval Recall</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Semantic Search Box */}
      <Card className="rounded-2xl border-slate-200 bg-white p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input 
            placeholder="Test semantic search across your vector database..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-10 h-11 rounded-xl border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
      </Card>

      {/* Collections List */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Indexed Vector Collections</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {COLLECTIONS.map((col, index) => (
            <motion.div
              key={col.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="rounded-2xl border-slate-200 hover:shadow-md transition-all">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-semibold text-slate-900">{col.name}</CardTitle>
                    {col.status === 'indexed' ? (
                      <Badge variant="success" className="bg-emerald-50 text-emerald-700">Indexed</Badge>
                    ) : (
                      <Badge variant="warning" className="bg-amber-50 text-amber-700 animate-pulse">Indexing...</Badge>
                    )}
                  </div>
                  <CardDescription className="text-xs text-slate-400">
                    Model: {col.model}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <span>{col.chunks} Chunks</span>
                    <span>{col.filesCount} Files</span>
                  </div>
                  <Progress value={col.status === 'indexed' ? 100 : 65} className="h-1.5 bg-slate-100" />
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs text-slate-400">Cosine Similarity Index</span>
                    <Button onClick={() => navigate('/research')} variant="ghost" size="sm" className="h-7 text-xs text-indigo-600">
                      Query <ArrowUpRight className="w-3 h-3 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
