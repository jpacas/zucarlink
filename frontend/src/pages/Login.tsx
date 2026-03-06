import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axiosInstance from '../utils/axiosConfig'
import { useAuth } from '../context/AuthContext'
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
  Link as MuiLink,
} from '@mui/material'
import { styled } from '@mui/material/styles'

const StyledPaper = styled(Paper)(({ theme }) => ({
  marginTop: theme.spacing(8),
  padding: theme.spacing(4),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  maxWidth: '400px',
  margin: '0 auto',
  border: `1px solid ${theme.palette.divider}`,
  boxShadow: '0 8px 24px rgba(16, 24, 40, 0.08)',
}))

const Login: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [isForgotPassword, setIsForgotPassword] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    // Limpiar mensajes cuando el usuario empieza a escribir
    setErrorMessage(null)
    setSuccessMessage(null)
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await axiosInstance.post('/users/forgot-password', {
        email: formData.email,
      })
      setSuccessMessage(
        'Se ha enviado un correo con las instrucciones para recuperar tu contraseña.'
      )
      setIsForgotPassword(false)
    } catch (error: any) {
      setErrorMessage(
        error.response?.data?.message ||
          'Error al procesar la solicitud. Por favor, verifica tu correo electrónico.'
      )
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const { email, password } = formData

    if (!email || !password) {
      setErrorMessage('Todos los campos son obligatorios.')
      return
    }

    try {
      const response = await axiosInstance.post('/users/login', {
        email,
        password,
      })

      const { token, refreshToken, user } = response.data

      login(user)
      localStorage.setItem('token', token)
      localStorage.setItem('refreshToken', refreshToken)
      navigate(`/perfil/${user.id}`)
    } catch (error: any) {
      setErrorMessage(
        error.response?.data?.message ||
          'Error al iniciar sesión. Por favor, verifica tus credenciales.'
      )
    }
  }

  const toggleForgotPassword = (value: boolean) => {
    setIsForgotPassword(value)
    // Limpiar mensajes cuando se cambia entre formularios
    setErrorMessage(null)
    setSuccessMessage(null)
  }

  return (
    <Container
      component='main'
      maxWidth='xs'
      sx={{ marginTop: { xs: '96px', md: '150px' } }}
    >
      <StyledPaper elevation={3}>
        <Typography component='h1' variant='h5' gutterBottom>
          {isForgotPassword ? 'Recuperar Contraseña' : 'Inicia Sesión'}
        </Typography>

        {errorMessage && (
          <Alert severity='error' sx={{ width: '100%', mb: 2 }}>
            {errorMessage}
          </Alert>
        )}

        {successMessage && (
          <Alert severity='success' sx={{ width: '100%', mb: 2 }}>
            {successMessage}
          </Alert>
        )}

        <Box
          component='form'
          onSubmit={isForgotPassword ? handleForgotPassword : handleSubmit}
          sx={{ mt: 1, width: '100%' }}
        >
          <TextField
            margin='normal'
            required
            fullWidth
            id='email'
            label='Correo Electrónico'
            name='email'
            autoComplete='email'
            autoFocus
            value={formData.email}
            onChange={handleChange}
            variant='outlined'
          />
          {!isForgotPassword && (
            <TextField
              margin='normal'
              required
              fullWidth
              name='password'
              label='Contraseña'
              type='password'
              id='password'
              autoComplete='current-password'
              value={formData.password}
              onChange={handleChange}
              variant='outlined'
            />
          )}
          <Button
            type='submit'
            fullWidth
            variant='contained'
            sx={{ mt: 3, mb: 2 }}
          >
            {isForgotPassword ? 'Enviar Instrucciones' : 'Ingresar'}
          </Button>
          <Box sx={{ textAlign: 'center', mt: 2 }}>
            {!isForgotPassword ? (
              <>
                <Typography variant='body2'>
                  ¿No tienes una cuenta?{' '}
                  <MuiLink
                    component={Link}
                    to='/register'
                    sx={{
                      color: 'primary.main',
                      textDecoration: 'none',
                      '&:hover': {
                        textDecoration: 'underline',
                      },
                    }}
                  >
                    Regístrate aquí
                  </MuiLink>
                </Typography>
                <Typography variant='body2' sx={{ mt: 1 }}>
                  <MuiLink
                    component='button'
                    onClick={() => toggleForgotPassword(true)}
                    sx={{
                      color: 'primary.main',
                      textDecoration: 'none',
                      '&:hover': {
                        textDecoration: 'underline',
                      },
                    }}
                  >
                    ¿Olvidaste tu contraseña?
                  </MuiLink>
                </Typography>
              </>
            ) : (
              <Typography variant='body2'>
                <MuiLink
                  component='button'
                  onClick={() => toggleForgotPassword(false)}
                  sx={{
                    color: 'primary.main',
                    textDecoration: 'none',
                    '&:hover': {
                      textDecoration: 'underline',
                    },
                  }}
                >
                  Volver al inicio de sesión
                </MuiLink>
              </Typography>
            )}
          </Box>
        </Box>
      </StyledPaper>
    </Container>
  )
}

export default Login
