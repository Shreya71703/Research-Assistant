import {
  AgentQueryRequest,
  AgentQueryResponse,
  HealthResponse,
  SSEThinkingEvent,
  SSEToolStartEvent,
  SSEToolResultEvent,
  SSEResponseEvent,
  SSEDoneEvent,
  SSEErrorEvent,
  Source
} from '../types/api'

// Production API Base URL fallback
const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')

export async function checkHealth(): Promise<HealthResponse> {
  const res = await fetch(`${API_BASE}/health`)
  if (!res.ok) throw new Error('Health check failed')
  return res.json()
}

export async function queryAgent(request: AgentQueryRequest): Promise<AgentQueryResponse> {
  const res = await fetch(`${API_BASE}/agent/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request)
  })
  if (!res.ok) throw new Error('Agent query failed')
  return res.json()
}

export interface StreamCallbacks {
  onThinking?: (event: SSEThinkingEvent) => void
  onToolStart?: (event: SSEToolStartEvent) => void
  onToolResult?: (event: SSEToolResultEvent) => void
  onResponse?: (event: SSEResponseEvent) => void
  onDone?: (event: SSEDoneEvent) => void
  onError?: (event: SSEErrorEvent) => void
}

export function streamAgent(request: AgentQueryRequest, callbacks: StreamCallbacks): AbortController {
  const controller = new AbortController()

  fetch(`${API_BASE}/agent/stream`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
    signal: controller.signal
  }).then(async (response) => {
    if (!response.body) throw new Error('No response body')
    
    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''
    let currentEvent = 'message'
    let eventDataBuffer = ''

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        // Keep unfinished line fragment in buffer
        buffer = lines.pop() || ''

        for (const line of lines) {
          const trimmed = line.trim()
          
          if (!trimmed) {
            // Empty line marks end of an SSE event block
            if (eventDataBuffer) {
              try {
                const parsedData = JSON.parse(eventDataBuffer)
                switch (currentEvent) {
                  case 'thinking': callbacks.onThinking?.(parsedData); break
                  case 'tool_start': callbacks.onToolStart?.(parsedData); break
                  case 'tool_result': callbacks.onToolResult?.(parsedData); break
                  case 'response': callbacks.onResponse?.(parsedData); break
                  case 'done': callbacks.onDone?.(parsedData); break
                  case 'error': callbacks.onError?.(parsedData); break
                }
              } catch (e) {
                console.error('Failed to parse SSE data:', eventDataBuffer, e)
              }
              currentEvent = 'message'
              eventDataBuffer = ''
            }
          } else if (trimmed.startsWith('event:')) {
            currentEvent = trimmed.substring(6).trim()
          } else if (trimmed.startsWith('data:')) {
            const chunk = trimmed.substring(5).trim()
            eventDataBuffer += (eventDataBuffer ? '\n' : '') + chunk
          }
        }
      }

      // Flush remaining event in buffer if stream closes
      if (eventDataBuffer) {
        try {
          const parsedData = JSON.parse(eventDataBuffer)
          switch (currentEvent) {
            case 'thinking': callbacks.onThinking?.(parsedData); break
            case 'tool_start': callbacks.onToolStart?.(parsedData); break
            case 'tool_result': callbacks.onToolResult?.(parsedData); break
            case 'response': callbacks.onResponse?.(parsedData); break
            case 'done': callbacks.onDone?.(parsedData); break
            case 'error': callbacks.onError?.(parsedData); break
          }
        } catch (e) {
          console.error('Failed to parse trailing SSE data:', eventDataBuffer, e)
        }
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log('Stream aborted')
      } else {
        callbacks.onError?.({ message: err.message || 'Stream error' })
      }
    }
  }).catch(err => {
    callbacks.onError?.({ message: err.message || 'Failed to start stream' })
  })

  return controller
}

export function determineSourceType(toolName: string): Source['type'] {
  if (toolName.includes('arxiv')) return 'arxiv'
  if (toolName.includes('github')) return 'github'
  if (toolName.includes('wiki')) return 'wikipedia'
  if (toolName.includes('weather')) return 'weather'
  if (toolName.includes('math')) return 'math'
  if (toolName.includes('news')) return 'news'
  return 'web'
}

export function extractSourcesFromToolResult(
  toolName: string, 
  input: Record<string, any> | null, 
  output: Record<string, any>
): Source[] {
  const sources: Source[] = []
  const type = determineSourceType(toolName)

  if (toolName === 'web_search' || toolName === 'search_web') {
    if (output.results && Array.isArray(output.results)) {
      output.results.forEach((item: any) => {
        sources.push({
          title: item.title || 'Web Result',
          url: item.url || item.href,
          snippet: item.snippet || item.body,
          type: 'web'
        })
      })
    }
  } else if (toolName === 'arxiv_search') {
    if (output.papers && Array.isArray(output.papers)) {
      output.papers.forEach((p: any) => {
        sources.push({
          title: p.title || 'ArXiv Paper',
          url: p.pdf_url || p.entry_id,
          snippet: p.summary,
          type: 'arxiv'
        })
      })
    }
  } else if (toolName === 'github_search') {
    if (output.repositories && Array.isArray(output.repositories)) {
      output.repositories.forEach((r: any) => {
        sources.push({
          title: r.full_name || r.name,
          url: r.html_url,
          snippet: r.description,
          type: 'github'
        })
      })
    }
  } else if (toolName === 'wikipedia_search') {
    if (output.title) {
      sources.push({
        title: output.title,
        url: output.url || `https://en.wikipedia.org/wiki/${encodeURIComponent(output.title)}`,
        snippet: output.summary,
        type: 'wikipedia'
      })
    }
  }

  return sources
}

export function extractSourcesFromToolCalls(toolCalls: any[]): Source[] {
  const allSources: Source[] = []
  toolCalls.forEach((tc) => {
    const s = extractSourcesFromToolResult(tc.tool, tc.input, tc.output)
    s.forEach(src => {
      if (!allSources.some(existing => existing.url === src.url)) {
        allSources.push(src)
      }
    })
  })
  return allSources
}
