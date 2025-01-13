import React, { useState } from 'react'
import {
  Box,
  Button,
  TextField,
  Typography,
  CircularProgress,
} from '@mui/material'

const Contact: React.FC = () => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message }),
      })

      if (response.ok) {
        setSuccess(true)
        setName('')
        setEmail('')
        setMessage('')
      } else {
        throw new Error('Error al enviar el mensaje')
      }
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Box sx={{ maxWidth: 600, margin: 'auto', padding: 2, marginTop: '64px' }}>
      <Typography variant='h4' component='h1' gutterBottom>
        Contacto
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label='Nombre'
          value={name}
          onChange={(e) => setName(e.target.value)}
          margin='normal'
          required
        />
        <TextField
          fullWidth
          label='Correo Electrónico'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type='email'
          margin='normal'
          required
        />
        <TextField
          fullWidth
          label='Mensaje'
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          multiline
          rows={4}
          margin='normal'
          required
        />
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mt: 2,
          }}
        >
          <Button
            type='submit'
            variant='contained'
            color='primary'
            disabled={isLoading}
          >
            {isLoading ? <CircularProgress size={24} /> : 'Enviar'}
          </Button>
          {success && <Typography color='green'>¡Mensaje enviado!</Typography>}
        </Box>
      </form>
    </Box>
  )
}

export default Contact
