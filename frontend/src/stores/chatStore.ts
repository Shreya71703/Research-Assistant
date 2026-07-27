import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Conversation, Message } from '../types/api'
import { generateId } from '../lib/utils'

interface ChatState {
  conversations: Conversation[]
  activeConversationId: string | null
  createConversation: (title?: string) => string
  setActiveConversation: (id: string) => void
  addMessage: (conversationId: string, message: Message) => void
  updateLastAssistantMessage: (conversationId: string, content: string, metadata?: any) => void
  deleteConversation: (id: string) => void
  pinConversation: (id: string) => void
  getActiveConversation: () => Conversation | undefined
  searchConversations: (query: string) => Conversation[]
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      conversations: [],
      activeConversationId: null,

      createConversation: (title = 'New Chat') => {
        const id = generateId()
        const newConv: Conversation = {
          id,
          title,
          messages: [],
          createdAt: new Date(),
          updatedAt: new Date(),
          pinned: false
        }
        set(state => ({
          conversations: [newConv, ...state.conversations],
          activeConversationId: id
        }))
        return id
      },

      setActiveConversation: (id) => set({ activeConversationId: id }),

      addMessage: (conversationId, message) => {
        set(state => {
          const convIndex = state.conversations.findIndex(c => c.id === conversationId)
          if (convIndex === -1) return state

          const conv = state.conversations[convIndex]
          
          // Auto-generate title from first user message
          let newTitle = conv.title
          if (conv.messages.length === 0 && message.role === 'user') {
            newTitle = message.content.substring(0, 50) + (message.content.length > 50 ? '...' : '')
          }

          const updatedConv = {
            ...conv,
            title: newTitle,
            messages: [...conv.messages, message],
            updatedAt: new Date()
          }

          const newConversations = [...state.conversations]
          newConversations[convIndex] = updatedConv

          return { conversations: newConversations }
        })
      },

      updateLastAssistantMessage: (conversationId, content, metadata) => {
        set(state => {
          const convIndex = state.conversations.findIndex(c => c.id === conversationId)
          if (convIndex === -1) return state

          const conv = state.conversations[convIndex]
          const messages = [...conv.messages]
          
          for (let i = messages.length - 1; i >= 0; i--) {
            if (messages[i].role === 'assistant') {
              messages[i] = {
                ...messages[i],
                content,
                metadata: metadata ? { ...messages[i].metadata, ...metadata } : messages[i].metadata
              }
              break
            }
          }

          const newConversations = [...state.conversations]
          newConversations[convIndex] = {
            ...conv,
            messages,
            updatedAt: new Date()
          }

          return { conversations: newConversations }
        })
      },

      deleteConversation: (id) => {
        set(state => {
          const newConversations = state.conversations.filter(c => c.id !== id)
          return {
            conversations: newConversations,
            activeConversationId: state.activeConversationId === id 
              ? (newConversations.length > 0 ? newConversations[0].id : null) 
              : state.activeConversationId
          }
        })
      },

      pinConversation: (id) => {
        set(state => {
          const newConversations = state.conversations.map(c => 
            c.id === id ? { ...c, pinned: !c.pinned } : c
          )
          return { conversations: newConversations }
        })
      },

      getActiveConversation: () => {
        const state = get()
        return state.conversations.find(c => c.id === state.activeConversationId)
      },

      searchConversations: (query: string) => {
        const state = get()
        if (!query.trim()) {
          return [...state.conversations].sort((a, b) => {
            if (a.pinned && !b.pinned) return -1
            if (!a.pinned && b.pinned) return 1
            return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          })
        }
        
        const lowerQuery = query.toLowerCase()
        return state.conversations.filter(c => 
          c.title.toLowerCase().includes(lowerQuery) || 
          c.messages.some(m => m.content.toLowerCase().includes(lowerQuery))
        )
      }
    }),
    {
      name: 'chat-storage',
      partialize: (state) => ({ conversations: state.conversations }),
    }
  )
)
