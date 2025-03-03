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
        background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
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
            background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
          }}
        >
          <Typography
            variant='h3'
            align='center'
            sx={{
              mb: 4,
              fontWeight: 700,
              color: '#1a1a1a',
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
            ¿Tienes alguna pregunta o sugerencia?
          </Typography>
          <Typography
            variant='h6'
            align='center'
            sx={{
              mb: 6,
              color: '#4a4a4a',
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
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': {
                    borderColor: '#ff6347',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#ff6347',
                  },
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#ff6347',
                },
              }}
            />
            <TextField
              fullWidth
              label='Correo Electrónico'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type='email'
              margin='normal'
              required
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': {
                    borderColor: '#ff6347',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#ff6347',
                  },
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#ff6347',
                },
              }}
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
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': {
                    borderColor: '#ff6347',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#ff6347',
                  },
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#ff6347',
                },
              }}
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
                disabled={isLoading}
                startIcon={
                  isLoading ? <CircularProgress size={20} /> : <SendIcon />
                }
                sx={{
                  backgroundColor: '#ff6347',
                  color: '#fff',
                  padding: '12px 32px',
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  textTransform: 'none',
                  borderRadius: '50px',
                  boxShadow: '0 4px 15px rgba(255, 99, 71, 0.3)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    backgroundColor: '#e5533f',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 20px rgba(255, 99, 71, 0.4)',
                  },
                  '&:active': {
                    transform: 'translateY(0)',
                  },
                  '&.Mui-disabled': {
                    backgroundColor: '#ffaa99',
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
            backgroundColor: '#ff6347',
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
