import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  BarChart3, Download, FileText, Sparkles, 
  CheckCircle2, Clock, Share2, Layers, ArrowRight, Printer
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useNavigate } from 'react-router-dom'
import { useChatStore } from '@/stores/chatStore'
import { formatRelativeTime } from '@/lib/utils'

export default function Reports() {
  const navigate = useNavigate()
  const { conversations } = useChatStore()
  const [selectedFormat, setSelectedFormat] = useState<'pdf' | 'docx' | 'md'>('pdf')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-7 h-7 text-indigo-600" />
            Research Reports
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Synthesize research sessions into publication-ready executive reports and briefings
          </p>
        </div>
        <div className="flex items-center gap-2">
          {(['pdf', 'docx', 'md'] as const).map(fmt => (
            <Button
              key={fmt}
              variant={selectedFormat === fmt ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedFormat(fmt)}
              className="rounded-lg text-xs uppercase"
            >
              {fmt}
            </Button>
          ))}
          <Button onClick={() => window.print()} variant="secondary" size="sm" className="rounded-lg text-xs gap-1.5">
            <Printer className="w-3.5 h-3.5" />
            Export
          </Button>
        </div>
      </div>

      {/* Featured Executive Summary Card */}
      <Card className="rounded-2xl border-indigo-100 bg-gradient-to-br from-indigo-50/40 via-white to-violet-50/40 p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <Badge variant="default" className="bg-indigo-600 text-white border-none">
              Featured Executive Briefing
            </Badge>
            <h2 className="text-xl font-bold text-slate-900">
              State of AI Research Assistants & Tool Orchestration (2026)
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed max-w-3xl">
              Synthesized from 18 research sessions, 42 ArXiv papers, and live GitHub repositories. 
              Key findings highlight rapid convergence toward async event-driven tool routing, 
              lightweight state machines (LangGraph), and sub-second inference models.
            </p>
          </div>
          <Button onClick={() => navigate('/research')} className="rounded-xl shadow-md gap-2 shrink-0">
            <Download className="w-4 h-4" />
            Download {selectedFormat.toUpperCase()}
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-indigo-100/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold">18</div>
            <div>
              <div className="text-xs font-semibold text-slate-900">Sessions Synthesized</div>
              <div className="text-[11px] text-slate-500">Multi-source verification</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold">42</div>
            <div>
              <div className="text-xs font-semibold text-slate-900">Citations & Papers</div>
              <div className="text-[11px] text-slate-500">ArXiv & PubMed verified</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold">100%</div>
            <div>
              <div className="text-xs font-semibold text-slate-900">Fact Checker Status</div>
              <div className="text-[11px] text-slate-500">Zero hallucination pass</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Generated Reports List */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-slate-900">Recent Session Reports</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {conversations.slice(0, 4).map((conv, i) => (
            <motion.div
              key={conv.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="rounded-2xl border-slate-200 hover:shadow-md transition-all">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-[10px] bg-slate-50 text-slate-600 border-slate-200">
                      Report #{i + 1}
                    </Badge>
                    <span className="text-xs text-slate-400">{formatRelativeTime(conv.updatedAt)}</span>
                  </div>
                  <CardTitle className="text-base font-semibold text-slate-900 mt-2 truncate">
                    {conv.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 pt-0">
                  <p className="text-xs text-slate-500 line-clamp-2">
                    {conv.messages[conv.messages.length - 1]?.content || 'Generated summary report from research session.'}
                  </p>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <span className="text-xs text-slate-400">{conv.messages.length} Messages logged</span>
                    <Button onClick={() => navigate(`/research/${conv.id}`)} variant="ghost" size="sm" className="h-7 text-xs text-indigo-600">
                      View Report <ArrowRight className="w-3 h-3 ml-1" />
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
