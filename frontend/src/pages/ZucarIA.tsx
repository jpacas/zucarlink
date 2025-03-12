import React, { useState, useEffect } from 'react'
import axios from 'axios'
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
      setMessages(JSON.parse(savedMessages))
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
      const token = localStorage.getItem('token')
      await axios.post(
        `${import.meta.env.VITE_API_URL}/conversations/save`,
        {
          userId: user.id,
          messages: conversation,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
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

      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'ft:gpt-3.5-turbo-0125:personal::Axk617ow',
          messages: messagesToSend,
        },
        {
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      )

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
        background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
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
            color: '#1a1a1a',
            fontWeight: 700,
            letterSpacing: '-0.5px',
            position: 'relative',
            '&::after': {
              content: '""',
              display: 'block',
              width: '60px',
              height: '4px',
              backgroundColor: '#ff6347',
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
            backgroundColor: '#fff',
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
            transition: 'all 0.3s ease',
            '&:hover': {
              boxShadow: '0 6px 25px rgba(0,0,0,0.1)',
            },
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
                  backgroundColor: msg.role === 'user' ? '#ff6347' : '#fff',
                  color: msg.role === 'user' ? '#fff' : '#4a4a4a',
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
              <CircularProgress size={24} sx={{ color: '#ff6347' }} />
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
              backgroundColor: '#fff',
              borderRadius: 2,
              transition: 'all 0.3s ease',
              '&:hover': {
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#ff6347',
                },
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: '#ff6347',
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
                    color: '#ff6347',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 99, 71, 0.1)',
                    },
                  }}
                >
                  {loading ? (
                    <CircularProgress size={24} sx={{ color: '#ff6347' }} />
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
