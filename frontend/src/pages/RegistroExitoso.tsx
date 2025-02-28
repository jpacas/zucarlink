import { useEffect, useState, useRef } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Box, Typography, CircularProgress } from '@mui/material'
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
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
        }}
      >
        <CircularProgress />
        <Typography variant='h6' sx={{ mt: 2 }}>
          Procesando su registro...
        </Typography>
      </Box>
    )
  }

  if (error) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
        }}
      >
        <Typography variant='h6' color='error'>
          {error}
        </Typography>
      </Box>
    )
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
      }}
    >
      <Typography variant='h4' gutterBottom>
        ¡Registro Exitoso!
      </Typography>
      <Typography variant='subtitle1'>
        Su empresa ha sido registrada correctamente.
      </Typography>
      <Typography variant='body1' sx={{ mt: 2 }}>
        Será redirigido al inicio de sesión en unos momentos...
      </Typography>
    </Box>
  )
}

export default RegistroExitoso
