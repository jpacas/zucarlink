import React, { useEffect } from 'react'
import { Box } from '@mui/material'
import { ChatWindow } from './ChatWindow'
import { useChat } from '../context/ChatContext'

interface ChatLayoutProps {
  children: React.ReactNode
}

export const ChatLayout: React.FC<ChatLayoutProps> = ({ children }) => {
  const {
    activeChats,
    currentChat,
    closeChat,
    hasUnreadMessages,
    isMinimized,
    setIsMinimized,
  } = useChat()

  // Maximizar el chat cuando hay mensajes no leídos
  useEffect(() => {
    if (hasUnreadMessages) {
      setIsMinimized(false)
    }
  }, [hasUnreadMessages, setIsMinimized])

  const handleMinimize = () => {
    setIsMinimized(!isMinimized)
  }

  const handleClose = () => {
    if (currentChat) {
      closeChat(currentChat.userId)
    }
    setIsMinimized(true)
  }

  return (
    <Box sx={{ position: 'relative', minHeight: '100vh' }}>
      {children}
      {activeChats.length > 0 && (
        <ChatWindow
          isMinimized={isMinimized}
          onMinimize={handleMinimize}
          onClose={handleClose}
        />
      )}
    </Box>
  )
}
