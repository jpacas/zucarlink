import React, { useState, useEffect, useRef } from 'react'
import { useChat } from '../context/ChatContext'
import { useAuth } from '../context/AuthContext'
import { Box, Typography, Button, TextField } from '@mui/material'

interface ChatWindowProps {
  isMinimized: boolean
  onMinimize: () => void
  onClose: () => void
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  isMinimized,
  onMinimize,
  onClose,
}) => {
  const { activeChats, messages, sendMessage, currentChat, switchChat } =
    useChat()
  const { user } = useAuth()
  const [newMessage, setNewMessage] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isMinimized])

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    if (newMessage.trim() && currentChat) {
      sendMessage(currentChat.userId, newMessage.trim())
      setNewMessage('')
    }
  }

  if (isMinimized) {
    return (
      <Box
        sx={{
          position: 'fixed',
          bottom: 0,
          right: '1rem',
          display: 'flex',
          gap: 1,
        }}
      >
        {activeChats.map((chat) => (
          <Button
            key={chat.userId}
            onClick={() => {
              switchChat(chat.userId)
              onMinimize()
            }}
            variant='contained'
            sx={{
              backgroundColor: '#ff6347',
              borderRadius: '8px 8px 0 0',
              textTransform: 'none',
              '&:hover': {
                backgroundColor: '#e5533f',
              },
              position: 'relative',
            }}
          >
            <Typography
              sx={{
                maxWidth: 150,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {chat.userName}
            </Typography>
            {chat.unreadCount > 0 && (
              <Box
                sx={{
                  position: 'absolute',
                  top: -8,
                  right: -8,
                  backgroundColor: '#dc3545',
                  color: 'white',
                  borderRadius: '50%',
                  padding: '2px 6px',
                  fontSize: '0.75rem',
                  fontWeight: 'bold',
                  border: '2px solid white',
                }}
              >
                {chat.unreadCount}
              </Box>
            )}
          </Button>
        ))}
      </Box>
    )
  }

  if (!currentChat) return null

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 0,
        right: '1rem',
        width: '24rem',
        bgcolor: 'background.paper',
        borderRadius: '8px 8px 0 0',
        boxShadow: 3,
        border: 1,
        borderColor: 'divider',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          p: 2,
          bgcolor: '#ff6347',
          color: 'white',
          borderRadius: '8px 8px 0 0',
        }}
      >
        <Typography variant='subtitle1' sx={{ fontWeight: 600 }}>
          {currentChat.userName}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            onClick={onMinimize}
            sx={{ minWidth: 'auto', p: 0.5, color: 'white' }}
          >
            <Box
              component='svg'
              sx={{ width: 20, height: 20 }}
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M20 12H4'
              />
            </Box>
          </Button>
          <Button
            onClick={onClose}
            sx={{ minWidth: 'auto', p: 0.5, color: 'white' }}
          >
            <Box
              component='svg'
              sx={{ width: 20, height: 20 }}
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M6 18L18 6M6 6l12 12'
              />
            </Box>
          </Button>
        </Box>
      </Box>

      {/* Messages */}
      <Box
        sx={{
          flexGrow: 1,
          height: '24rem',
          overflowY: 'auto',
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        {messages
          .filter(
            (msg) =>
              (msg.from === user?.id && msg.to === currentChat.userId) ||
              (msg.to === user?.id && msg.from === currentChat.userId)
          )
          .map((message, index) => (
            <Box
              key={index}
              sx={{
                display: 'flex',
                justifyContent:
                  message.from === user?.id ? 'flex-end' : 'flex-start',
              }}
            >
              <Box
                sx={{
                  maxWidth: '70%',
                  p: 1.5,
                  borderRadius: 2,
                  ...(message.from === user?.id
                    ? {
                        bgcolor: '#ff6347',
                        color: 'white',
                        borderBottomRightRadius: 0,
                      }
                    : {
                        bgcolor: 'grey.100',
                        borderBottomLeftRadius: 0,
                      }),
                }}
              >
                <Typography variant='body2'>{message.content}</Typography>
                <Typography variant='caption' sx={{ opacity: 0.75 }}>
                  {new Date(message.timestamp).toLocaleTimeString()}
                </Typography>
              </Box>
            </Box>
          ))}
        <div ref={messagesEndRef} />
      </Box>

      {/* Input */}
      <Box
        component='form'
        onSubmit={handleSend}
        sx={{
          p: 2,
          borderTop: 1,
          borderColor: 'divider',
          display: 'flex',
          gap: 1,
        }}
      >
        <TextField
          size='small'
          fullWidth
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder='Escribe un mensaje...'
          sx={{
            '& .MuiOutlinedInput-root': {
              '&:hover fieldset': {
                borderColor: '#ff6347',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#ff6347',
              },
            },
          }}
        />
        <Button
          type='submit'
          variant='contained'
          sx={{
            bgcolor: '#ff6347',
            '&:hover': {
              bgcolor: '#e5533f',
            },
          }}
        >
          Enviar
        </Button>
      </Box>
    </Box>
  )
}
