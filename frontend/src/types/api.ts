export interface ToolCall {
  tool: string
  input: Record<string, any>
  output: Record<string, any>
  execution_time_ms: number
}

export interface AgentQueryRequest {
  query: string
  max_iterations?: number
  timeout?: number
}

export interface AgentQueryResponse {
  query: string
  response: string
  tool_calls: ToolCall[]
  iterations: number
  execution_time_seconds: number
  status: 'success' | 'error'
  error?: string | null
}

export interface HealthResponse {
  status: string
  version: string
  timestamp: string
}

// SSE Event types
export type SSEEventType = 'thinking' | 'tool_start' | 'tool_result' | 'response' | 'done' | 'error'

export interface SSEThinkingEvent {
  message: string
}

export interface SSEToolStartEvent {
  tool: string
  input: Record<string, any>
}

export interface SSEToolResultEvent {
  tool: string
  output: Record<string, any>
  execution_time_ms: number
}

export interface SSEResponseEvent {
  content: string
}

export interface SSEDoneEvent {
  iterations: number
  execution_time_seconds: number
  tool_calls: ToolCall[]
}

export interface SSEErrorEvent {
  message: string
}

// App-level types
export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  toolCalls?: ToolCall[]
  sources?: Source[]
  metadata?: {
    iterations?: number
    executionTime?: number
  }
}

export interface Conversation {
  id: string
  title: string
  messages: Message[]
  createdAt: Date
  updatedAt: Date
  pinned: boolean
}

export interface ToolActivity {
  id: string
  tool: string
  input: Record<string, any>
  status: 'running' | 'completed' | 'error'
  output?: Record<string, any>
  executionTimeMs?: number
  startTime: number
}

export interface Source {
  title: string
  url?: string
  snippet?: string
  type: 'web' | 'arxiv' | 'github' | 'wikipedia' | 'weather' | 'math' | 'news'
}

export interface ResearchStats {
  totalSessions: number
  totalDocuments: number
  totalSources: number
  totalTokens: number
  hoursSaved: number
  bookmarks: number
}
