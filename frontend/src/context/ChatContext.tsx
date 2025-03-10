import React, { createContext, useContext, useEffect, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import { useAuth } from './AuthContext'

// Agregar el tipo NodeJS
declare global {
  namespace NodeJS {
    interface Timeout {}
  }
}

interface Message {
  from: string
  to: string
  content: string
  timestamp: Date
}

interface ActiveChat {
  userId: string
  userName: string
  unreadCount: number
}

interface ChatContextType {
  socket: Socket | null
  messages: Message[]
  sendMessage: (recipientId: string, content: string) => void
  activeChats: ActiveChat[]
  currentChat: ActiveChat | null
  switchChat: (userId: string) => void
  startChat: (userId: string, userName: string) => void
  closeChat: (userId: string) => void
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [activeChats, setActiveChats] = useState<ActiveChat[]>([])
  const [currentChat, setCurrentChat] = useState<ActiveChat | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      const newSocket = io('http://localhost:5001', {
        auth: { userId: user.id },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 45000,
        withCredentials: true,
        autoConnect: false,
        path: '/socket.io/',
        forceNew: true,
        closeOnBeforeunload: true,
      })

      // Limpiar cualquier conexión existente
      if (socket) {
        socket.disconnect()
        socket.close()
      }

      // Configurar eventos antes de conectar
      newSocket.on('connect_error', (error) => {
        console.error('Error de conexión:', error)
        setIsConnected(false)
      })

      newSocket.on('connect', () => {
        console.log('Conectado al servidor de chat')
        setIsConnected(true)
        setupPing()
      })

      newSocket.on('connect_confirmed', (data) => {
        console.log('Conexión confirmada para usuario:', data.userId)
        if (currentChat) {
          newSocket.emit('get_message_history', {
            otherUserId: currentChat.userId,
          })
        }
      })

      let pingInterval: ReturnType<typeof setInterval>

      const setupPing = () => {
        if (pingInterval) clearInterval(pingInterval)
        pingInterval = setInterval(() => {
          if (newSocket.connected) {
            newSocket.emit('ping')
          }
        }, 25000)
      }

      // Intentar conectar después de configurar los eventos
      try {
        newSocket.connect()
      } catch (error) {
        console.error('Error al conectar:', error)
      }

      newSocket.on('disconnect', (reason) => {
        console.log('Desconectado del servidor:', reason)
        setIsConnected(false)
        if (pingInterval) {
          clearInterval(pingInterval)
        }
        // Intentar reconectar si la desconexión no fue intencional
        if (reason === 'io server disconnect' || reason === 'transport close') {
          setTimeout(() => {
            if (!newSocket.connected) {
              newSocket.connect()
            }
          }, 1000)
        }
      })

      newSocket.on('reconnect', (attemptNumber) => {
        console.log(
          'Reconectado al servidor después de',
          attemptNumber,
          'intentos'
        )
        setIsConnected(true)
        setupPing()
      })

      newSocket.on('reconnect_attempt', () => {
        console.log('Intentando reconectar...')
      })

      newSocket.on('reconnect_error', (error) => {
        console.error('Error de reconexión:', error)
      })

      newSocket.on('reconnect_failed', () => {
        console.error('Falló la reconexión después de todos los intentos')
      })

      newSocket.on('pong', () => {
        console.log('Pong recibido del servidor')
      })

      newSocket.on('message_sent', (message: Message) => {
        console.log('Mensaje enviado confirmado:', message)
      })

      newSocket.on('message_error', (error) => {
        console.error('Error al enviar mensaje:', error)
      })

      newSocket.on('history_error', (error) => {
        console.error('Error al obtener historial:', error)
      })

      newSocket.on('private_message', (message: Message) => {
        setMessages((prev) => [...prev, message])
        setActiveChats((prev) => {
          const updatedChats = [...prev]
          const chatIndex = updatedChats.findIndex(
            (chat) => chat.userId === message.from
          )

          if (chatIndex !== -1) {
            if (currentChat?.userId !== message.from) {
              updatedChats[chatIndex].unreadCount += 1
            }
          }
          return updatedChats
        })
      })

      newSocket.on('message_history', (history: Message[]) => {
        setMessages(history)
      })

      setSocket(newSocket)

      return () => {
        if (pingInterval) clearInterval(pingInterval)
        newSocket.disconnect()
        newSocket.close()
      }
    }
  }, [user])

  const sendMessage = async (recipientId: string, content: string) => {
    if (!socket) {
      console.error('No hay socket inicializado')
      return
    }

    if (!isConnected) {
      console.error('No hay conexión con el servidor de chat')
      try {
        await socket.connect()
      } catch (error) {
        console.error('Error al intentar reconectar:', error)
        return
      }
    }

    try {
      socket.emit('private_message', { recipientId, content })
      // Optimistic update
      const messageData = {
        from: user?.id || '',
        to: recipientId,
        content,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, messageData])
    } catch (error) {
      console.error('Error al enviar mensaje:', error)
    }
  }

  const startChat = (userId: string, userName: string) => {
    const existingChat = activeChats.find((chat) => chat.userId === userId)
    if (!existingChat) {
      const newChat: ActiveChat = {
        userId,
        userName,
        unreadCount: 0,
      }
      setActiveChats((prev) => [...prev, newChat])
      setCurrentChat(newChat)
      // Solicitar historial de mensajes cuando se inicia un nuevo chat
      if (socket && socket.connected) {
        socket.emit('get_message_history', { otherUserId: userId })
      }
    } else {
      setCurrentChat(existingChat)
    }
  }

  const switchChat = (userId: string) => {
    const chat = activeChats.find((c) => c.userId === userId)
    if (chat) {
      setCurrentChat(chat)
      setActiveChats((prev) =>
        prev.map((c) => (c.userId === userId ? { ...c, unreadCount: 0 } : c))
      )
      // Solicitar historial de mensajes al cambiar de chat
      if (socket && socket.connected) {
        socket.emit('get_message_history', { otherUserId: userId })
      }
    }
  }

  const closeChat = (userId: string) => {
    setActiveChats((prev) => prev.filter((chat) => chat.userId !== userId))
    if (currentChat?.userId === userId) {
      setCurrentChat(null)
    }
  }

  return (
    <ChatContext.Provider
      value={{
        socket,
        messages,
        sendMessage,
        activeChats,
        currentChat,
        switchChat,
        startChat,
        closeChat,
      }}
    >
      {children}
    </ChatContext.Provider>
  )
}

export const useChat = () => {
  const context = useContext(ChatContext)
  if (context === undefined) {
    throw new Error('useChat debe ser usado dentro de un ChatProvider')
  }
  return context
}
