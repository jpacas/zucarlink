import React, { useState } from 'react'
import {
  Box,
  Button,
  TextField,
  Typography,
  CircularProgress,
  Container,
  Paper,
  Alert,
  Snackbar,
} from '@mui/material'
import { Send as SendIcon } from '@mui/icons-material'

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

  const handleCloseSnackbar = () => {
    setSuccess(false)
  }

  return (
    <Box
      sx={{
        backgroundColor: 'background.default',
        minHeight: '100vh',
        pt: 10,
        pb: 8,
      }}
    >
      <Container maxWidth='md'>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, md: 6 },
            borderRadius: '16px',
            backgroundColor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: '0 8px 24px rgba(16, 24, 40, 0.08)',
          }}
        >
          <Typography
            variant='h3'
            align='center'
            sx={{
              mb: 4,
              fontWeight: 700,
              color: 'text.primary',
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
            ¿Tienes alguna pregunta o sugerencia?
          </Typography>
          <Typography
            variant='h6'
            align='center'
            sx={{
              mb: 6,
              color: 'text.secondary',
              fontWeight: 500,
            }}
          >
            Contáctanos mediante el siguiente formulario
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
              rows={6}
              margin='normal'
              required
            />
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                mt: 4,
              }}
            >
              <Button
                type='submit'
                variant='contained'
                size='large'
                disabled={isLoading}
                startIcon={
                  isLoading ? <CircularProgress size={20} /> : <SendIcon />
                }
                sx={{
                  fontSize: '1.1rem',
                  transition: 'all 0.3s ease',
                  '&:hover': { transform: 'translateY(-2px)' },
                  '&:active': {
                    transform: 'translateY(0)',
                  },
                }}
              >
                {isLoading ? 'Enviando...' : 'Enviar Mensaje'}
              </Button>
            </Box>
          </form>
        </Paper>
      </Container>

      <Snackbar
        open={success}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity='success'
          sx={{
            width: '100%',
            backgroundColor: 'primary.main',
            color: '#fff',
            '& .MuiAlert-icon': {
              color: '#fff',
            },
          }}
        >
          ¡Mensaje enviado con éxito!
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default Contact
