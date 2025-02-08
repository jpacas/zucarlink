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
      await axios.post(`${import.meta.env.VITE_API_URL}/conversations/save`, {
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

    // Mensaje del usuario
    const userMessage = { role: 'user', content: input }

    // Agregar el mensaje del usuario a la conversación mostrada en la UI
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    try {
      // Agregar el mensaje de sistema solo para la petición a OpenAI
      const systemMessage = {
        role: 'system',
        content:
          'Eres un experto técnico en la industria azucarera y te llamas ZucarIA. Las preguntas que te hacen las piensas profundamente y das una respuesta basada en principios tecnicos. Tu audiencia es tecnica asi que no dudes profundizar en principios fisicos, quimicos o matematicos de lo que te consultan. Si tienes dudas sobre el mensaje del usuario, haces preguntas aclaratorias',
      }

      // Mensajes que se envían a OpenAI (incluyendo el mensaje de sistema)
      const messagesToSend = [systemMessage, ...newMessages]

      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'ft:gpt-3.5-turbo-0125:personal::Axk617ow',
          messages: messagesToSend, // Enviamos el sistema, pero sin mostrarlo en la UI
        },
        {
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      )

      // Agregar la respuesta del asistente a la UI
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
    <Box sx={{ maxWidth: 800, margin: 'auto', mt: 8, p: 3 }}>
      <Typography
        variant='h4'
        textAlign='center'
        mb={3}
        color='primary'
        sx={{ fontFamily: 'Inter, sans-serif' }}
      >
        Inteligencia Artificial Azucarera
      </Typography>
      <Paper
        sx={{
          maxHeight: 500,
          overflowY: 'auto',
          p: 3,
          mb: 2,
          borderRadius: 2,
          backgroundColor: '#f5f5f5',
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
            <Typography
              sx={{
                p: 1.5,
                borderRadius: 2,
                backgroundColor: msg.role === 'user' ? '#e3f2fd' : '#fff',
                maxWidth: '70%',
                display: 'block',
              }}
            >
              <strong>{msg.role === 'user' ? 'Tú' : 'ZucarIA'}:</strong>{' '}
              {msg.content}
            </Typography>
          </Box>
        ))}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <CircularProgress size={24} />
          </Box>
        )}
      </Paper>
      <TextField
        fullWidth
        label='Escribe tu mensaje...'
        value={input}
        onChange={(e) => setInput(e.target.value)}
        disabled={loading}
        InputProps={{
          endAdornment: (
            <InputAdornment position='end'>
              <IconButton
                color='primary'
                onClick={sendMessage}
                disabled={loading}
              >
                {loading ? <CircularProgress size={20} /> : <SendIcon />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
    </Box>
  )
}

export default ZucarIA
