import { useState, useRef, useEffect } from 'react'
import { useChatStore } from '../stores/chatStore'
import { streamAgent, extractSourcesFromToolResult } from '../lib/api'
import { Message, ToolActivity, Source } from '../types/api'
import { generateId } from '../lib/utils'

export function useStreamingChat() {
  const [isStreaming, setIsStreaming] = useState(false)
  const [thinkingMessage, setThinkingMessage] = useState<string>('')
  const [activeTools, setActiveTools] = useState<ToolActivity[]>([])
  const [sources, setSources] = useState<Source[]>([])
  const abortControllerRef = useRef<AbortController | null>(null)
  
  const { 
    activeConversationId, 
    createConversation, 
    addMessage, 
    updateLastAssistantMessage 
  } = useChatStore()

  useEffect(() => {
    return () => {
      cancelStream()
    }
  }, [])

  const cancelStream = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
    setIsStreaming(false)
    setThinkingMessage('')
    setActiveTools([])
  }

  const sendMessage = async (query: string) => {
    if (!query.trim()) return

    let conversationId = activeConversationId
    if (!conversationId) {
      conversationId = createConversation()
    }

    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content: query,
      timestamp: new Date()
    }
    addMessage(conversationId, userMessage)

    const assistantMsgId = generateId()
    const assistantMessage: Message = {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      timestamp: new Date()
    }
    addMessage(conversationId, assistantMessage)

    setIsStreaming(true)
    setThinkingMessage('Starting thinking process...')
    setActiveTools([])
    setSources([])
    
    let currentContent = ''
    let currentSources: Source[] = []

    abortControllerRef.current = streamAgent(
      { query },
      {
        onThinking: (event) => {
          setThinkingMessage(event.message)
        },
        onToolStart: (event) => {
          setActiveTools(prev => [
            ...prev,
            {
              id: generateId(),
              tool: event.tool,
              input: event.input,
              status: 'running',
              startTime: Date.now()
            }
          ])
        },
        onToolResult: (event) => {
          setActiveTools(prev => {
            const newTools = [...prev]
            // find the most recent running instance of this tool
            const idx = newTools.map(t => t.tool === event.tool && t.status === 'running').lastIndexOf(true)
            if (idx !== -1) {
              newTools[idx] = {
                ...newTools[idx],
                status: 'completed',
                output: event.output,
                executionTimeMs: event.execution_time_ms
              }
            }
            return newTools
          })
          
          const newSources = extractSourcesFromToolResult(event.tool, null, event.output)
          if (newSources.length > 0) {
            currentSources = [...currentSources, ...newSources]
            setSources(currentSources)
          }
        },
        onResponse: (event) => {
          currentContent = event.content
          updateLastAssistantMessage(conversationId, currentContent)
        },
        onDone: (event) => {
          // Extract any sources from completed tool_calls if not extracted yet
          if (event.tool_calls && event.tool_calls.length > 0) {
            event.tool_calls.forEach((tc) => {
              const extraSources = extractSourcesFromToolResult(tc.tool, tc.input, tc.output)
              if (extraSources.length > 0) {
                extraSources.forEach(es => {
                  if (!currentSources.some(cs => cs.url === es.url)) {
                    currentSources.push(es)
                  }
                })
              }
            })
            setSources([...currentSources])
          }

          const finalMsgContent = currentContent.trim()
          updateLastAssistantMessage(
            conversationId, 
            finalMsgContent || 'Responded successfully.', 
            {
              iterations: event.iterations,
              executionTime: event.execution_time_seconds
            }
          )
          setIsStreaming(false)
          setThinkingMessage('')
        },
        onError: (event) => {
          const errText = currentContent 
            ? `${currentContent}\n\n**Error:** ${event.message}`
            : `**Error:** ${event.message}`
          updateLastAssistantMessage(conversationId, errText)
          setIsStreaming(false)
          setThinkingMessage('')
        }
      }
    )
  }

  return {
    isStreaming,
    thinkingMessage,
    activeTools,
    sources,
    sendMessage,
    cancelStream
  }
}
