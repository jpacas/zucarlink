import React, { useState, useEffect } from 'react'
import axiosInstance from '../utils/axiosConfig'
import {
  Box,
  TextField,
  Typography,
  Paper,
  IconButton,
  InputAdornment,
  CircularProgress,
} from '@mui/material'
import SendIcon from '@mui/icons-material/Send'
import { useAuth } from '../context/AuthContext'

const ZucarIA: React.FC = () => {
  const { user } = useAuth()
  const [messages, setMessages] = useState<{ role: string; content: string }[]>(
    []
  )
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const savedMessages = localStorage.getItem('zucarIA_conversation')
    if (savedMessages) {
      try {
        setMessages(JSON.parse(savedMessages))
      } catch (error) {
        console.error('Error al parsear mensajes guardados:', error)
        localStorage.removeItem('zucarIA_conversation')
      }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('zucarIA_conversation', JSON.stringify(messages))
  }, [messages])

  const saveConversationToDB = async (
    conversation: { role: string; content: string }[]
  ) => {
    if (!user?.id) return

    try {
      await axiosInstance.post('/zucaria/save', {
        userId: user.id,
        messages: conversation,
      })
    } catch (error) {
      console.error(
        'Error al guardar la conversación en la base de datos:',
        error
      )
    }
  }

  const sendMessage = async () => {
    if (!input.trim()) return

    const userMessage = { role: 'user', content: input }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    try {
      const systemMessage = {
        role: 'system',
        content:
          'Eres un experto técnico en la industria azucarera y te llamas ZucarIA. Las preguntas que te hacen las piensas profundamente y das una respuesta basada en principios tecnicos. Tu audiencia es tecnica asi que no dudes profundizar en principios fisicos, quimicos o matematicos de lo que te consultan. Si tienes dudas sobre el mensaje del usuario, haces preguntas aclaratorias',
      }

      const messagesToSend = [systemMessage, ...newMessages]

      const response = await axiosInstance.post('/zucaria/chat', {
        messages: messagesToSend,
      })

      const updatedMessages = [
        ...newMessages,
        {
          role: 'assistant',
          content: response.data.choices[0].message.content,
        },
      ]
      setMessages(updatedMessages)
      saveConversationToDB(updatedMessages)
    } catch (error) {
      console.error('Error al obtener respuesta:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box
      sx={{
        backgroundColor: 'background.default',
        minHeight: '100vh',
        pt: 10,
        pb: 8,
        px: 3,
      }}
    >
      <Box sx={{ maxWidth: 800, margin: 'auto' }}>
        <Typography
          variant='h3'
          textAlign='center'
          mb={4}
          sx={{
            color: 'text.primary',
            fontWeight: 700,
            letterSpacing: '-0.5px',
            position: 'relative',
            '&::after': {
              content: '""',
              display: 'block',
              width: '60px',
              height: '4px',
              backgroundColor: 'primary.main',
              margin: '16px auto',
              borderRadius: '2px',
            },
          }}
        >
          Inteligencia Artificial Azucarera
        </Typography>
        <Paper
          sx={{
            maxHeight: 500,
            overflowY: 'auto',
            p: 3,
            mb: 3,
            borderRadius: 2,
            backgroundColor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: '0 8px 24px rgba(16, 24, 40, 0.08)',
          }}
        >
          {messages.map((msg, index) => (
            <Box
              key={index}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
                mb: 2,
              }}
            >
              <Paper
                sx={{
                  p: 2,
                  borderRadius: 2,
                  backgroundColor:
                    msg.role === 'user' ? 'primary.main' : 'background.paper',
                  color: msg.role === 'user' ? '#fff' : 'text.secondary',
                  maxWidth: '70%',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                  },
                }}
              >
                <Typography variant='subtitle2' fontWeight='bold' mb={0.5}>
                  {msg.role === 'user' ? 'Tú' : 'ZucarIA'}
                </Typography>
                <Typography
                  sx={{
                    lineHeight: 1.6,
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {msg.content}
                </Typography>
              </Paper>
            </Box>
          ))}
          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <CircularProgress size={24} sx={{ color: 'primary.main' }} />
            </Box>
          )}
        </Paper>
        <TextField
          fullWidth
          placeholder='Escribe tu mensaje...'
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              sendMessage()
            }
          }}
          multiline
          maxRows={4}
          sx={{
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'background.paper',
              borderRadius: 2,
              transition: 'all 0.3s ease',
              '&:hover': {
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'primary.main',
                },
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: 'primary.main',
                borderWidth: 2,
              },
            },
          }}
          InputProps={{
            endAdornment: (
              <InputAdornment position='end'>
                <IconButton
                  color='primary'
                  onClick={sendMessage}
                  disabled={loading}
                  sx={{
                    color: 'primary.main',
                    '&:hover': {
                      backgroundColor: 'rgba(228, 93, 69, 0.08)',
                    },
                  }}
                >
                  {loading ? (
                    <CircularProgress size={24} sx={{ color: 'primary.main' }} />
                  ) : (
                    <SendIcon />
                  )}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Box>
    </Box>
  )
}

export default ZucarIA
