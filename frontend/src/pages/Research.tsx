import { useState, useRef, useEffect, useCallback, KeyboardEvent } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism'
import {
  Search, Plus, Pin, Trash2, ArrowUp, Square, Paperclip, Mic,
  Copy, BookmarkPlus, RefreshCw, Sparkles, Globe, Cloud, BookOpen,
  Github, BookMarked, Newspaper, Calculator, GraduationCap, Atom,
  ChevronLeft, ChevronRight, ExternalLink, Clock, Wrench, Brain,
  MessageSquare, Loader2, Check, PanelRightOpen, PanelRightClose,
  Zap, BarChart3
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { cn, formatRelativeTime, truncate } from '@/lib/utils'
import { useChatStore } from '@/stores/chatStore'
import { useUIStore } from '@/stores/uiStore'
import { useStreamingChat } from '@/hooks/useStreamingChat'
import type { Message, Conversation, ToolActivity, Source } from '@/types/api'

// Tool icon mapping
const TOOL_ICONS: Record<string, typeof Globe> = {
  search_web: Globe,
  web_search: Globe,
  weather: Cloud,
  get_weather: Cloud,
  math: Calculator,
  calculate: Calculator,
  arxiv: BookOpen,
  search_arxiv: BookOpen,
  github: Github,
  search_github: Github,
  wikipedia: BookMarked,
  search_wikipedia: BookMarked,
  news: Newspaper,
  get_news: Newspaper,
}

const TOOL_COLORS: Record<string, string> = {
  search_web: 'text-blue-600 bg-blue-50',
  web_search: 'text-blue-600 bg-blue-50',
  weather: 'text-sky-600 bg-sky-50',
  get_weather: 'text-sky-600 bg-sky-50',
  math: 'text-emerald-600 bg-emerald-50',
  calculate: 'text-emerald-600 bg-emerald-50',
  arxiv: 'text-violet-600 bg-violet-50',
  search_arxiv: 'text-violet-600 bg-violet-50',
  github: 'text-slate-700 bg-slate-100',
  search_github: 'text-slate-700 bg-slate-100',
  wikipedia: 'text-amber-600 bg-amber-50',
  search_wikipedia: 'text-amber-600 bg-amber-50',
  news: 'text-rose-600 bg-rose-50',
  get_news: 'text-rose-600 bg-rose-50',
}

const SUGGESTED_PROMPTS = [
  { icon: Cloud, text: 'Compare weather in major cities', color: 'text-sky-600 bg-sky-50' },
  { icon: GraduationCap, text: 'Latest AI research papers', color: 'text-violet-600 bg-violet-50' },
  { icon: Atom, text: 'Explain quantum computing', color: 'text-indigo-600 bg-indigo-50' },
  { icon: Calculator, text: 'Calculate compound interest', color: 'text-emerald-600 bg-emerald-50' },
]

export default function Research() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [inputValue, setInputValue] = useState('')
  const [leftPanelOpen, setLeftPanelOpen] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const rightPanelOpen = useUIStore((state) => state.rightPanelOpen)
  const toggleRightPanel = useUIStore((state) => state.toggleRightPanel)
  
  const {
    conversations,
    activeConversationId,
    setActiveConversation,
    createConversation,
    deleteConversation,
    pinConversation,
    searchConversations,
  } = useChatStore()

  const { isStreaming, thinkingMessage, activeTools, sources, sendMessage, cancelStream } = useStreamingChat()

  // Set active conversation from URL param
  useEffect(() => {
    if (id) {
      setActiveConversation(id)
    }
  }, [id, setActiveConversation])

  // Get current conversation
  const activeConversation = conversations.find(c => c.id === activeConversationId)
  const messages = activeConversation?.messages || []

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isStreaming, thinkingMessage])

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px'
    }
  }, [inputValue])

  // Filter conversations
  const filteredConversations = searchQuery
    ? searchConversations(searchQuery)
    : [...conversations].sort((a, b) => {
        if (a.pinned && !b.pinned) return -1
        if (!a.pinned && b.pinned) return 1
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      })

  const pinnedConversations = filteredConversations.filter(c => c.pinned)
  const recentConversations = filteredConversations.filter(c => !c.pinned)

  const handleSend = useCallback(async () => {
    if (!inputValue.trim() || isStreaming) return
    const query = inputValue.trim()
    setInputValue('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
    await sendMessage(query)
  }, [inputValue, isStreaming, sendMessage])

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleNewChat = () => {
    const newId = createConversation()
    navigate(`/research/${newId}`)
  }

  const handleSelectConversation = (convId: string) => {
    setActiveConversation(convId)
    navigate(`/research/${convId}`)
  }

  const handleSuggestedPrompt = (text: string) => {
    setInputValue(text)
    textareaRef.current?.focus()
  }

  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content)
  }

  const getToolIcon = (toolName: string) => {
    return TOOL_ICONS[toolName] || Wrench
  }

  const getToolColor = (toolName: string) => {
    return TOOL_COLORS[toolName] || 'text-slate-600 bg-slate-100'
  }

  return (
    <div className="flex h-[calc(100vh-64px)] bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* LEFT PANEL - Conversation History */}
      <AnimatePresence>
        {leftPanelOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 300, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="hidden md:flex flex-col border-r border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 overflow-hidden shrink-0"
          >
            <div className="p-3 space-y-2">
              <Button onClick={handleNewChat} className="w-full gap-2 rounded-xl" size="sm">
                <Plus className="w-4 h-4" />
                New Chat
              </Button>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9 rounded-lg bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 dark:text-white text-sm"
                />
              </div>
            </div>

            <ScrollArea className="flex-1">
              <div className="px-2 pb-4">
                {pinnedConversations.length > 0 && (
                  <div className="mb-4">
                    <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Pinned</div>
                    {pinnedConversations.map(conv => (
                      <ConversationItem
                        key={conv.id}
                        conversation={conv}
                        isActive={conv.id === activeConversationId}
                        onSelect={() => handleSelectConversation(conv.id)}
                        onPin={() => pinConversation(conv.id)}
                        onDelete={() => deleteConversation(conv.id)}
                      />
                    ))}
                  </div>
                )}

                <div>
                  <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Recent</div>
                  {recentConversations.length > 0 ? (
                    recentConversations.map(conv => (
                      <ConversationItem
                        key={conv.id}
                        conversation={conv}
                        isActive={conv.id === activeConversationId}
                        onSelect={() => handleSelectConversation(conv.id)}
                        onPin={() => pinConversation(conv.id)}
                        onDelete={() => deleteConversation(conv.id)}
                      />
                    ))
                  ) : (
                    <div className="px-3 py-8 text-center">
                      <MessageSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="text-sm text-slate-400">No conversations yet</p>
                    </div>
                  )}
                </div>
              </div>
            </ScrollArea>

            <div className="p-2 border-t border-slate-200">
              <button
                onClick={() => setLeftPanelOpen(false)}
                className="w-full flex items-center justify-center gap-2 py-1.5 text-xs text-slate-500 hover:text-slate-700 transition-colors rounded-lg hover:bg-slate-100"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                Collapse
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Collapsed left panel toggle */}
      {!leftPanelOpen && (
        <button
          onClick={() => setLeftPanelOpen(true)}
          className="hidden md:flex items-center justify-center w-8 border-r border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors"
        >
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>
      )}

      {/* CENTER PANEL - Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Messages area */}
        <ScrollArea className="flex-1">
          <div className="max-w-3xl mx-auto px-4 py-6">
            {messages.length === 0 ? (
              /* Empty State */
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center min-h-[60vh] text-center"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center mb-6 shadow-lg shadow-indigo-500/20">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-semibold text-slate-900 mb-2">
                  What would you like to research?
                </h2>
                <p className="text-slate-500 mb-8 max-w-md">
                  I can search the web, check weather, find papers, explore GitHub repos, and more.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
                  {SUGGESTED_PROMPTS.map((prompt, i) => (
                    <motion.button
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      onClick={() => handleSuggestedPrompt(prompt.text)}
                      className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/50 transition-all text-left group"
                    >
                      <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center shrink-0', prompt.color)}>
                        <prompt.icon className="w-5 h-5" />
                      </div>
                      <span className="text-sm text-slate-700 group-hover:text-slate-900">{prompt.text}</span>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            ) : (
              /* Message Thread */
              <div className="space-y-6">
                {messages.map((message, index) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                    className={cn(
                      'flex',
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    )}
                  >
                    {message.role === 'user' ? (
                      <div className="bg-indigo-600 text-white rounded-2xl rounded-br-sm px-4 py-3 max-w-[80%] shadow-sm">
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      </div>
                    ) : (
                      <div className="max-w-[85%] group">
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl rounded-bl-sm px-5 py-4 shadow-sm">
                          {message.content ? (
                            <div className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed space-y-3">
                              <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={{
                                  p: ({ children }) => <p className="leading-relaxed text-slate-800 dark:text-slate-200 font-normal">{children}</p>,
                                  ul: ({ children }) => <ul className="list-disc pl-5 space-y-1 text-slate-800 dark:text-slate-200">{children}</ul>,
                                  ol: ({ children }) => <ol className="list-decimal pl-5 space-y-1 text-slate-800 dark:text-slate-200">{children}</ol>,
                                  li: ({ children }) => <li className="text-slate-800 dark:text-slate-200 leading-normal">{children}</li>,
                                  h1: ({ children }) => <h1 className="text-lg font-bold text-slate-900 dark:text-white mt-3 mb-1">{children}</h1>,
                                  h2: ({ children }) => <h2 className="text-base font-bold text-slate-900 dark:text-white mt-3 mb-1">{children}</h2>,
                                  h3: ({ children }) => <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-2 mb-1">{children}</h3>,
                                  blockquote: ({ children }) => <blockquote className="border-l-4 border-indigo-300 dark:border-indigo-500 pl-3 py-1 italic text-slate-600 dark:text-slate-300 bg-indigo-50/50 dark:bg-indigo-950/40 rounded-r-lg">{children}</blockquote>,
                                  a: ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 font-medium underline hover:text-indigo-700">{children}</a>,
                                  table: ({ children }) => <div className="overflow-x-auto my-3"><table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-lg text-xs">{children}</table></div>,
                                  thead: ({ children }) => <thead className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold">{children}</thead>,
                                  th: ({ children }) => <th className="px-3 py-2 text-left text-xs font-semibold text-slate-700 dark:text-slate-200 tracking-wider border-b border-slate-200 dark:border-slate-800">{children}</th>,
                                  td: ({ children }) => <td className="px-3 py-2 text-xs text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-800 whitespace-normal">{children}</td>,
                                  code({ className, children, ...props }) {
                                    const match = /language-(\w+)/.exec(className || '')
                                    const isInline = !match
                                    if (isInline) {
                                      return (
                                        <code className="px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 font-mono text-xs font-medium" {...props}>
                                          {children}
                                        </code>
                                      )
                                    }
                                    return (
                                      <div className="relative group/code my-3">
                                        <button
                                          onClick={() => handleCopyMessage(String(children))}
                                          className="absolute top-2 right-2 p-1.5 rounded-md bg-white/80 border border-slate-200 opacity-0 group-hover/code:opacity-100 transition-opacity z-10"
                                        >
                                          <Copy className="w-3.5 h-3.5 text-slate-500" />
                                        </button>
                                        <SyntaxHighlighter
                                          style={oneLight}
                                          language={match[1]}
                                          PreTag="div"
                                          className="rounded-lg !bg-slate-50 text-xs font-mono p-3 border border-slate-200"
                                        >
                                          {String(children).replace(/\n$/, '')}
                                        </SyntaxHighlighter>
                                      </div>
                                    )
                                  }
                                }}
                              >
                                {message.content}
                              </ReactMarkdown>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-slate-400 py-1">
                              <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                              <span className="text-sm">Researching response...</span>
                            </div>
                          )}

                          {/* Message metadata */}
                          {message.metadata?.executionTime && (
                            <div className="flex items-center gap-3 mt-3 pt-3 border-t border-slate-100 text-xs text-slate-400">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {message.metadata.executionTime.toFixed(1)}s
                              </span>
                              {message.metadata.iterations && (
                                <span className="flex items-center gap-1">
                                  <Zap className="w-3 h-3" />
                                  {message.metadata.iterations} iterations
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Message actions */}
                        <div className="flex items-center gap-1 mt-1 ml-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleCopyMessage(message.content)}
                            className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                            title="Copy"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors" title="Bookmark">
                            <BookmarkPlus className="w-3.5 h-3.5" />
                          </button>
                          <button className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors" title="Regenerate">
                            <RefreshCw className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}

                {/* Streaming indicators */}
                {isStreaming && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-3"
                  >
                    {/* Thinking indicator */}
                    {thinkingMessage && (
                      <div className="flex items-center gap-2 text-slate-500 pl-1">
                        <div className="flex gap-1">
                          <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                        <span className="text-sm">{thinkingMessage}</span>
                      </div>
                    )}

                    {/* Active tool cards */}
                    {activeTools.length > 0 && (
                      <div className="flex flex-wrap gap-2 pl-1">
                        {activeTools.map((tool) => {
                          const ToolIcon = getToolIcon(tool.tool)
                          const colorClass = getToolColor(tool.tool)
                          return (
                            <motion.div
                              key={tool.id}
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className={cn(
                                'flex items-center gap-2 px-3 py-2 rounded-xl border',
                                tool.status === 'completed'
                                  ? 'border-emerald-200 bg-emerald-50'
                                  : 'border-slate-200 bg-white'
                              )}
                            >
                              <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center', colorClass)}>
                                <ToolIcon className="w-4 h-4" />
                              </div>
                              <div>
                                <div className="text-xs font-medium text-slate-700 capitalize">
                                  {tool.tool.replace(/_/g, ' ')}
                                </div>
                                {tool.executionTimeMs && (
                                  <div className="text-[10px] text-slate-400">{tool.executionTimeMs.toFixed(0)}ms</div>
                                )}
                              </div>
                              {tool.status === 'running' ? (
                                <Loader2 className="w-4 h-4 text-indigo-500 animate-spin" />
                              ) : (
                                <Check className="w-4 h-4 text-emerald-500" />
                              )}
                            </motion.div>
                          )
                        })}
                      </div>
                    )}
                  </motion.div>
                )}

                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="px-4 pb-4">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-lg p-2 focus-within:border-indigo-500 transition-all">
              <textarea
                ref={textareaRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything... research papers, weather, calculations, web search"
                rows={1}
                className="w-full resize-none bg-transparent px-3 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none"
                style={{ maxHeight: '200px' }}
              />
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-1">
                  <button className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors" title="Attach file">
                    <Paperclip className="w-4 h-4" />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors" title="Voice input">
                    <Mic className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  {inputValue.length > 0 && (
                    <span className="text-xs text-slate-400">{inputValue.length}</span>
                  )}
                  {isStreaming ? (
                    <button
                      onClick={cancelStream}
                      className="w-8 h-8 rounded-lg bg-red-500 hover:bg-red-600 flex items-center justify-center transition-colors"
                    >
                      <Square className="w-3.5 h-3.5 text-white fill-white" />
                    </button>
                  ) : (
                    <button
                      onClick={handleSend}
                      disabled={!inputValue.trim()}
                      className={cn(
                        'w-8 h-8 rounded-lg flex items-center justify-center transition-all',
                        inputValue.trim()
                          ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      )}
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
            <p className="text-center text-[11px] text-slate-400 mt-2">
              Press Enter to send · Shift+Enter for new line
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL - Sources & Activity */}
      <AnimatePresence>
        {rightPanelOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 340, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="hidden xl:flex flex-col border-l border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 overflow-hidden shrink-0"
          >
            <div className="h-12 flex items-center justify-between px-4 border-b border-slate-200/50 dark:border-slate-800 shrink-0">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Research Panel</span>
              <button
                onClick={toggleRightPanel}
                className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-400 transition-colors"
              >
                <PanelRightClose className="w-4 h-4" />
              </button>
            </div>

            <Tabs defaultValue="sources" className="flex-1 flex flex-col">
              <TabsList className="mx-3 mt-3 mb-0 bg-slate-100">
                <TabsTrigger value="sources" className="text-xs">Sources</TabsTrigger>
                <TabsTrigger value="activity" className="text-xs">Activity</TabsTrigger>
                <TabsTrigger value="stats" className="text-xs">Stats</TabsTrigger>
              </TabsList>

              <TabsContent value="sources" className="flex-1 m-0 p-3 overflow-y-auto">
                {sources.length > 0 ? (
                  <div className="space-y-2">
                    {sources.map((source, i) => (
                      <motion.a
                        key={i}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block p-3 rounded-xl border border-slate-200 bg-white hover:border-indigo-200 hover:shadow-sm transition-all group"
                      >
                        <div className="flex items-start gap-2">
                          <Badge variant="secondary" className="text-[10px] shrink-0 capitalize">{source.type}</Badge>
                          <div className="min-w-0">
                            <div className="text-sm font-medium text-slate-800 group-hover:text-indigo-600 transition-colors truncate">
                              {source.title}
                            </div>
                            {source.url && (
                              <div className="flex items-center gap-1 mt-0.5">
                                <ExternalLink className="w-3 h-3 text-slate-400" />
                                <span className="text-xs text-slate-400 truncate">{truncate(source.url, 40)}</span>
                              </div>
                            )}
                            {source.snippet && (
                              <p className="text-xs text-slate-500 mt-1 line-clamp-2">{source.snippet}</p>
                            )}
                          </div>
                        </div>
                      </motion.a>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center py-12">
                    <Globe className="w-8 h-8 text-slate-300 mb-2" />
                    <p className="text-sm text-slate-400">Sources will appear here</p>
                    <p className="text-xs text-slate-300 mt-1">as you research</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="activity" className="flex-1 m-0 p-3 overflow-y-auto">
                {activeTools.length > 0 ? (
                  <div className="space-y-3">
                    {thinkingMessage && (
                      <div className="flex items-start gap-3">
                        <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0 mt-0.5">
                          <Brain className="w-4 h-4 text-indigo-600" />
                        </div>
                        <div>
                          <div className="text-xs font-medium text-slate-700">Thinking</div>
                          <div className="text-xs text-slate-500">{thinkingMessage}</div>
                        </div>
                      </div>
                    )}
                    {activeTools.map((tool, i) => {
                      const ToolIcon = getToolIcon(tool.tool)
                      const colorClass = getToolColor(tool.tool)
                      return (
                        <motion.div
                          key={tool.id}
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="flex items-start gap-3"
                        >
                          <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5', colorClass)}>
                            <ToolIcon className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <div className="text-xs font-medium text-slate-700 capitalize">{tool.tool.replace(/_/g, ' ')}</div>
                              {tool.status === 'running' ? (
                                <Loader2 className="w-3 h-3 text-indigo-500 animate-spin" />
                              ) : (
                                <Badge variant="success" className="text-[10px]">Done</Badge>
                              )}
                            </div>
                            {tool.executionTimeMs && (
                              <div className="text-[10px] text-slate-400 mt-0.5">Completed in {tool.executionTimeMs.toFixed(0)}ms</div>
                            )}
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center py-12">
                    <Wrench className="w-8 h-8 text-slate-300 mb-2" />
                    <p className="text-sm text-slate-400">Agent activity</p>
                    <p className="text-xs text-slate-300 mt-1">will appear here during research</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="stats" className="flex-1 m-0 p-3 overflow-y-auto">
                <div className="space-y-4">
                  <div className="p-3 rounded-xl border border-slate-200 bg-white">
                    <div className="text-xs font-medium text-slate-500 mb-1">Messages</div>
                    <div className="text-2xl font-semibold text-slate-900">{messages.length}</div>
                  </div>
                  <div className="p-3 rounded-xl border border-slate-200 bg-white">
                    <div className="text-xs font-medium text-slate-500 mb-1">Tools Used</div>
                    <div className="text-2xl font-semibold text-slate-900">{activeTools.filter(t => t.status === 'completed').length}</div>
                  </div>
                  <div className="p-3 rounded-xl border border-slate-200 bg-white">
                    <div className="text-xs font-medium text-slate-500 mb-1">Sources Found</div>
                    <div className="text-2xl font-semibold text-slate-900">{sources.length}</div>
                  </div>
                  <div className="p-3 rounded-xl border border-slate-200 bg-white">
                    <div className="text-xs font-medium text-slate-500 mb-1">Total Conversations</div>
                    <div className="text-2xl font-semibold text-slate-900">{conversations.length}</div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Collapsed right panel toggle */}
      {!rightPanelOpen && (
        <button
          onClick={toggleRightPanel}
          className="hidden xl:flex items-center justify-center w-8 border-l border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors"
        >
          <PanelRightOpen className="w-4 h-4 text-slate-400" />
        </button>
      )}
    </div>
  )
}

// Conversation list item component
function ConversationItem({ 
  conversation, 
  isActive, 
  onSelect, 
  onPin, 
  onDelete 
}: {
  conversation: Conversation
  isActive: boolean
  onSelect: () => void
  onPin: () => void
  onDelete: () => void
}) {
  const lastMessage = conversation.messages[conversation.messages.length - 1]
  
  return (
    <button
      onClick={onSelect}
      className={cn(
        'w-full text-left px-3 py-2.5 rounded-lg transition-all group relative',
        isActive
          ? 'bg-indigo-50 border-l-2 border-indigo-600'
          : 'hover:bg-slate-100'
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className={cn(
            'text-sm font-medium truncate',
            isActive ? 'text-indigo-700' : 'text-slate-800'
          )}>
            {conversation.title}
          </div>
          {lastMessage && (
            <div className="text-xs text-slate-400 truncate mt-0.5">
              {truncate(lastMessage.content, 50)}
            </div>
          )}
        </div>
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button
            onClick={(e) => { e.stopPropagation(); onPin() }}
            className="p-1 rounded hover:bg-slate-200 text-slate-400 hover:text-slate-600"
          >
            <Pin className="w-3 h-3" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete() }}
            className="p-1 rounded hover:bg-red-100 text-slate-400 hover:text-red-600"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>
      <div className="text-[10px] text-slate-400 mt-1">
        {formatRelativeTime(conversation.updatedAt)}
      </div>
    </button>
  )
}
