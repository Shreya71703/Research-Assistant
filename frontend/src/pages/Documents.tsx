import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  FileText, Upload, Search, Filter, Grid, List, 
  FileCode, FileSpreadsheet, Image as ImageIcon, File, 
  Trash2, ExternalLink, HardDrive, Sparkles, Plus
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useNavigate } from 'react-router-dom'

interface DocumentItem {
  id: string
  name: string
  size: string
  type: 'pdf' | 'docx' | 'markdown' | 'csv' | 'image'
  updatedAt: string
  sessionsLinked: number
}

const MOCK_DOCUMENTS: DocumentItem[] = [
  { id: 'doc-1', name: 'LLM_Agent_Architecture_Paper.pdf', size: '2.4 MB', type: 'pdf', updatedAt: '2 hours ago', sessionsLinked: 4 },
  { id: 'doc-2', name: 'Global_Weather_Telemetry_2026.csv', size: '850 KB', type: 'csv', updatedAt: 'Yesterday', sessionsLinked: 2 },
  { id: 'doc-3', name: 'Quantum_Computing_Benchmarks.docx', size: '1.8 MB', type: 'docx', updatedAt: '3 days ago', sessionsLinked: 5 },
  { id: 'doc-4', name: 'Research_Notes_Draft.md', size: '45 KB', type: 'markdown', updatedAt: 'Jul 24, 2026', sessionsLinked: 1 },
  { id: 'doc-5', name: 'Architecture_Diagram_V2.png', size: '3.1 MB', type: 'image', updatedAt: 'Jul 20, 2026', sessionsLinked: 3 },
]

export default function Documents() {
  const [documents, setDocuments] = useState<DocumentItem[]>(MOCK_DOCUMENTS)
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedType, setSelectedType] = useState<string>('all')
  const navigate = useNavigate()

  const filteredDocs = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = selectedType === 'all' || doc.type === selectedType
    return matchesSearch && matchesType
  })

  const getDocIcon = (type: DocumentItem['type']) => {
    switch (type) {
      case 'pdf': return <FileText className="w-6 h-6 text-red-500" />
      case 'docx': return <FileText className="w-6 h-6 text-blue-500" />
      case 'markdown': return <FileCode className="w-6 h-6 text-indigo-500" />
      case 'csv': return <FileSpreadsheet className="w-6 h-6 text-emerald-500" />
      case 'image': return <ImageIcon className="w-6 h-6 text-violet-500" />
      default: return <File className="w-6 h-6 text-slate-500" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FileText className="w-7 h-7 text-indigo-600" />
            Document Library
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Manage, upload, and semantically index your research documents
          </p>
        </div>
        <Button onClick={() => navigate('/research')} className="rounded-xl shadow-md gap-2">
          <Upload className="w-4 h-4" />
          <span>Upload Document</span>
        </Button>
      </div>

      {/* Upload Zone Banner */}
      <Card className="rounded-2xl border-dashed border-2 border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors p-6 text-center cursor-pointer">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600 mb-3">
            <Upload className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-900">Drag & Drop files here to index</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm">
            Supports PDF, DOCX, Markdown, CSV, and Images up to 25MB for AI semantic search.
          </p>
        </div>
      </Card>

      {/* Filter and View Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input 
            placeholder="Search documents..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-9 h-9 rounded-xl border-slate-200 text-sm"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-between">
          <div className="flex items-center gap-1">
            {['all', 'pdf', 'docx', 'markdown', 'csv'].map(type => (
              <Button
                key={type}
                variant={selectedType === type ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setSelectedType(type)}
                className="rounded-lg text-xs uppercase"
              >
                {type}
              </Button>
            ))}
          </div>

          <div className="flex items-center gap-1 border-l border-slate-200 pl-2">
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="icon"
              className="h-8 w-8 rounded-lg"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="icon"
              className="h-8 w-8 rounded-lg"
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Documents Grid / List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filteredDocs.map((doc, index) => (
            <motion.div
              key={doc.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="rounded-2xl border-slate-200 hover:shadow-md transition-all group">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      {getDocIcon(doc.type)}
                    </div>
                    <Badge variant="secondary" className="text-[10px] uppercase font-mono">{doc.type}</Badge>
                  </div>
                  <CardTitle className="text-sm font-semibold text-slate-900 mt-3 truncate group-hover:text-indigo-600 transition-colors">
                    {doc.name}
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-400">
                    {doc.size} · Updated {doc.updatedAt}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-500">
                    <span>{doc.sessionsLinked} sessions linked</span>
                    <Button onClick={() => navigate('/research')} variant="ghost" size="sm" className="h-7 text-xs text-indigo-600 hover:bg-indigo-50">
                      Research <ExternalLink className="w-3 h-3 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <Card className="rounded-2xl border-slate-200 overflow-hidden">
          <div className="divide-y divide-slate-100">
            {filteredDocs.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2 rounded-lg bg-slate-50">
                    {getDocIcon(doc.type)}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-slate-900 truncate">{doc.name}</div>
                    <div className="text-xs text-slate-400">{doc.size} · Updated {doc.updatedAt}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-slate-500 hidden sm:inline">{doc.sessionsLinked} sessions</span>
                  <Button onClick={() => navigate('/research')} size="sm" variant="outline" className="rounded-lg text-xs">
                    Research
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
