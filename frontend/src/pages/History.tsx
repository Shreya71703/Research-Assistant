import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Clock, Search, Trash2, ArrowRight, MessageSquare, 
  Calendar, Zap, Pin, Download
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useChatStore } from '@/stores/chatStore'
import { useNavigate } from 'react-router-dom'
import { formatRelativeTime, truncate } from '@/lib/utils'

export default function History() {
  const { conversations, deleteConversation, pinConversation } = useChatStore()
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate()

  const filteredConversations = conversations.filter(c => 
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.messages.some(m => m.content.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Clock className="w-7 h-7 text-indigo-600" />
            Research History
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Browse, search, and manage all your past interactive research sessions
          </p>
        </div>
        <Button onClick={() => navigate('/research')} className="rounded-xl shadow-md gap-2">
          <MessageSquare className="w-4 h-4" />
          <span>New Research Session</span>
        </Button>
      </div>

      {/* Search Input */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input 
            placeholder="Search across all conversation history and responses..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-9 h-10 rounded-xl border-slate-200 text-sm"
          />
        </div>
      </div>

      {/* Conversation Cards List */}
      {filteredConversations.length > 0 ? (
        <div className="space-y-3">
          {filteredConversations.map((conv, i) => {
            const lastMsg = conv.messages[conv.messages.length - 1]
            return (
              <motion.div
                key={conv.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <Card className="rounded-2xl border-slate-200 hover:shadow-md transition-all group">
                  <div className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {conv.pinned && <Badge variant="warning" className="text-[10px] bg-amber-50 text-amber-700">Pinned</Badge>}
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatRelativeTime(conv.updatedAt)}
                        </span>
                        <span className="text-xs text-slate-400">· {conv.messages.length} messages</span>
                      </div>
                      <h3 className="text-base font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                        {conv.title}
                      </h3>
                      {lastMsg && (
                        <p className="text-xs text-slate-500 line-clamp-1">
                          {truncate(lastMsg.content, 120)}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        onClick={() => pinConversation(conv.id)}
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-lg text-slate-400 hover:text-amber-500"
                        title="Pin conversation"
                      >
                        <Pin className={`w-4 h-4 ${conv.pinned ? 'fill-amber-400 text-amber-400' : ''}`} />
                      </Button>
                      <Button
                        onClick={() => deleteConversation(conv.id)}
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-lg text-slate-400 hover:text-red-600"
                        title="Delete conversation"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => navigate(`/research/${conv.id}`)}
                        variant="outline"
                        size="sm"
                        className="rounded-lg text-xs gap-1 hover:bg-indigo-50 hover:text-indigo-600 border-slate-200"
                      >
                        <span>Open Session</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )
          })}
        </div>
      ) : (
        <Card className="rounded-2xl border-slate-200 p-12 text-center">
          <Clock className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-900">No session history found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Start a new research session to query web search, weather telemetry, ArXiv papers, or calculations.
          </p>
        </Card>
      )}
    </div>
  )
}
