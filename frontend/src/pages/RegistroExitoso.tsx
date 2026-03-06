import { useEffect, useState, useRef } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import {
  Box,
  Typography,
  CircularProgress,
  Paper,
  Container,
} from '@mui/material'
import { CheckCircleOutline } from '@mui/icons-material'

const RegistroExitoso = () => {
  const [searchParams] = useSearchParams()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const hasRegistered = useRef(false)

  useEffect(() => {
    const verificarPago = async () => {
      // Si ya se verificó, no continuar
      if (hasRegistered.current) {
        console.log('Verificación ya fue ejecutada anteriormente')
        return
      }

      // Marcar como verificado inmediatamente
      hasRegistered.current = true

      try {
        const paymentIntent = searchParams.get('payment_intent')
        const paymentIntentClientSecret = searchParams.get(
          'payment_intent_client_secret'
        )

        if (!paymentIntent || !paymentIntentClientSecret) {
          throw new Error('Información de pago incompleta')
        }

        // Limpiar storage
        window.localStorage.removeItem('proveedorPais')
        window.localStorage.removeItem('proveedorWeb')
        window.localStorage.removeItem('proveedorDescripcion')
        window.localStorage.removeItem('proveedorLogo')
        window.sessionStorage.removeItem('proveedorData')

        // Redirigir al registro después de 3 segundos
        setTimeout(() => {
          navigate('/register')
        }, 3000)
      } catch (error: any) {
        console.error('Error al verificar pago:', error)
        setError(error.message || 'Error al verificar el pago')
        // Si hay error, permitir otro intento
        hasRegistered.current = false
      } finally {
        setLoading(false)
      }
    }

    verificarPago()
  }, [navigate, searchParams])

  if (loading) {
    return (
      <Container maxWidth='sm'>
        <Paper
          elevation={3}
          sx={{
            p: 4,
            mt: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            borderRadius: '16px',
            backgroundColor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: '0 8px 24px rgba(16, 24, 40, 0.08)',
          }}
        >
          <CircularProgress size={60} sx={{ color: 'primary.main', mb: 2 }} />
          <Typography variant='h6' sx={{ mt: 2, color: 'text.primary' }}>
            Procesando su registro...
          </Typography>
        </Paper>
      </Container>
    )
  }

  if (error) {
    return (
      <Container maxWidth='sm'>
        <Paper
          elevation={3}
          sx={{
            p: 4,
            mt: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            borderRadius: '16px',
            backgroundColor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: '0 8px 24px rgba(16, 24, 40, 0.08)',
          }}
        >
          <Typography variant='h6' color='error' align='center'>
            {error}
          </Typography>
        </Paper>
      </Container>
    )
  }

  return (
    <Container maxWidth='sm'>
      <Paper
        elevation={3}
        sx={{
          p: 4,
          mt: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          borderRadius: '16px',
          backgroundColor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: '0 8px 24px rgba(16, 24, 40, 0.08)',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 12px 28px rgba(16, 24, 40, 0.12)',
          },
        }}
      >
        <Box
          sx={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            backgroundColor: 'success.light',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 3,
          }}
        >
          <CheckCircleOutline sx={{ fontSize: 50, color: 'success.main' }} />
        </Box>
        <Typography
          variant='h4'
          gutterBottom
          sx={{
            fontWeight: 'bold',
            background: 'linear-gradient(45deg, #2e7d32, #4caf50)',
            backgroundClip: 'text',
            textFillColor: 'transparent',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          ¡Registro Exitoso!
        </Typography>
        <Typography
          variant='h6'
          sx={{ mt: 2, color: 'text.secondary', textAlign: 'center' }}
        >
          Su empresa ha sido registrada correctamente
        </Typography>
        <Typography
          variant='body1'
          sx={{ mt: 3, color: 'text.secondary', textAlign: 'center' }}
        >
          Será redirigido al inicio de sesión en unos momentos...
        </Typography>
      </Paper>
    </Container>
  )
}

export default RegistroExitoso
