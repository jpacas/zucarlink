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
import axios from 'axios'

const RegistroExitoso = () => {
  const [searchParams] = useSearchParams()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const hasRegistered = useRef(false)

  useEffect(() => {
    const registrarProveedor = async () => {
      // Si ya se registró, no continuar
      if (hasRegistered.current) {
        console.log('Registro ya fue ejecutado anteriormente')
        return
      }

      // Marcar como registrado inmediatamente
      hasRegistered.current = true

      try {
        const paymentIntent = searchParams.get('payment_intent')
        const paymentIntentClientSecret = searchParams.get(
          'payment_intent_client_secret'
        )

        if (!paymentIntent || !paymentIntentClientSecret) {
          throw new Error('Información de pago incompleta')
        }

        // Obtener los datos del proveedor desde sessionStorage
        const proveedorDataStr = window.sessionStorage.getItem('proveedorData')
        if (!proveedorDataStr) {
          throw new Error('Datos del proveedor no encontrados')
        }

        const proveedorData = JSON.parse(proveedorDataStr)

        // Crear FormData con los datos del proveedor
        const formData = new FormData()
        formData.append('nombre', proveedorData.nombre)
        formData.append('email', proveedorData.email)
        formData.append('pais', proveedorData.pais)
        formData.append('paginaWeb', proveedorData.paginaWeb)
        formData.append('descripcion', proveedorData.descripcion)

        // Si hay un logo en los datos, agregarlo al FormData
        if (proveedorData.logo) {
          // Convertir el Data URL a Blob
          const blob = await (await fetch(proveedorData.logo)).blob()
          formData.append('logo', blob, 'logo.png')
        }

        // Agregar información del plan
        formData.append('plan', proveedorData.plan)
        formData.append('paymentIntent', paymentIntent)

        // Registrar el proveedor
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/helper/registerProveedor`,
          formData,
          {
            headers: { 'Content-Type': 'multipart/form-data' },
          }
        )

        console.log('Respuesta del registro:', response.data)

        // Limpiar storage
        window.localStorage.removeItem('proveedorPais')
        window.localStorage.removeItem('proveedorWeb')
        window.localStorage.removeItem('proveedorDescripcion')
        window.localStorage.removeItem('proveedorLogo')
        window.sessionStorage.removeItem('proveedorData')

        // Redirigir al login después de 3 segundos
        setTimeout(() => {
          navigate('/login')
        }, 3000)
      } catch (error: any) {
        console.error('Error al registrar proveedor:', error)
        setError(
          error.response?.data?.message ||
            error.message ||
            'Error al registrar el proveedor'
        )
        // Si hay error, permitir otro intento
        hasRegistered.current = false
      } finally {
        setLoading(false)
      }
    }

    registrarProveedor()
  }, []) // Solo ejecutar una vez al montar

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
            borderRadius: 2,
            background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
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
            borderRadius: 2,
            background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
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
          borderRadius: 2,
          background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 8px 30px rgba(0,0,0,0.1)',
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
