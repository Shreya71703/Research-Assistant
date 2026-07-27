import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  HelpCircle, BookOpen, MessageSquare, Terminal, 
  Sparkles, CheckCircle2, ChevronRight, FileText
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'

const FAQS = [
  { q: 'How does the LangGraph Agent stream tool calls?', a: 'The FastAPI backend communicates over Server-Sent Events (SSE) via POST /agent/stream. Events include thinking, tool_start, tool_result, response, and done.' },
  { q: 'Can I add custom documents to the Knowledge Base?', a: 'Yes! Navigate to the Document Library tab (/documents) or Knowledge Base (/knowledge-base) to drag-and-drop PDFs, DOCX, CSVs, or Markdown files.' },
  { q: 'Which LLM model powers the assistant?', a: 'The backend uses Groq Llama 3.3 70B for sub-second inference latency, combined with LangGraph state machine routing.' },
  { q: 'How do keyboard shortcuts work?', a: 'Press Ctrl+K anytime to open the Universal Command Palette. Press Enter in the research input to send, or Shift+Enter for new line.' },
]

export default function Help() {
  const navigate = useNavigate()

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <HelpCircle className="w-7 h-7 text-indigo-600" />
          Help & Documentation
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Learn how to maximize your research productivity with tool-using AI agents
        </p>
      </div>

      {/* Quick Start Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3">
            <MessageSquare className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-slate-900 dark:text-white text-sm">Interactive Research</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Ask questions, request live web search, weather telemetry, or academic paper lookups.</p>
          <Button onClick={() => navigate('/research')} variant="link" className="px-0 text-xs text-indigo-600 mt-2">
            Start Research <ChevronRight className="w-3 h-3 ml-1" />
          </Button>
        </Card>

        <Card className="rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
          <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-950 text-violet-600 dark:text-violet-400 flex items-center justify-center mb-3">
            <Terminal className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-slate-900 dark:text-white text-sm">Command Palette</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Use Ctrl+K anywhere in the platform to jump to pages, tools, or recent search history.</p>
          <Button onClick={() => navigate('/settings')} variant="link" className="px-0 text-xs text-indigo-600 mt-2">
            View Shortcuts <ChevronRight className="w-3 h-3 ml-1" />
          </Button>
        </Card>

        <Card className="rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
            <BookOpen className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-slate-900 dark:text-white text-sm">Executive Briefings</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Synthesize multi-session findings into PDF, DOCX, or Markdown reports.</p>
          <Button onClick={() => navigate('/reports')} variant="link" className="px-0 text-xs text-indigo-600 mt-2">
            Open Reports <ChevronRight className="w-3 h-3 ml-1" />
          </Button>
        </Card>
      </div>

      {/* FAQ Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Frequently Asked Questions</h2>
        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <Card key={i} className="rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                {faq.q}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-2 pl-6">
                {faq.a}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
