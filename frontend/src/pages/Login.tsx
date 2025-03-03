import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
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
}))

const Login: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const { email, password } = formData

    if (!email || !password) {
      setErrorMessage('Todos los campos son obligatorios.')
      return
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/users/login`,
        {
          email,
          password,
        }
      )

      const { token, user } = response.data
      const payload = JSON.parse(atob(token.split('.')[1]))

      login(user)
      localStorage.setItem('token', token)
      navigate(`/perfil/${payload.id}`)
    } catch (error: any) {
      setErrorMessage(
        error.response?.data?.message ||
          'Error al iniciar sesión. Por favor, verifica tus credenciales.'
      )
    }
  }

  return (
    <Container component='main' maxWidth='xs' sx={{ marginTop: '150px' }}>
      <StyledPaper elevation={3}>
        <Typography component='h1' variant='h5' gutterBottom>
          Inicia Sesión
        </Typography>

        {errorMessage && (
          <Alert severity='error' sx={{ width: '100%', mb: 2 }}>
            {errorMessage}
          </Alert>
        )}

        <Box
          component='form'
          onSubmit={handleSubmit}
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
          <Button
            type='submit'
            fullWidth
            variant='contained'
            sx={{
              mt: 3,
              mb: 2,
              bgcolor: '#ff6347',
              '&:hover': {
                bgcolor: '#e5533f',
              },
            }}
          >
            Ingresar
          </Button>
          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Typography variant='body2'>
              ¿No tienes una cuenta?{' '}
              <MuiLink
                component={Link}
                to='/register'
                sx={{
                  color: '#ff6347',
                  textDecoration: 'none',
                  '&:hover': {
                    textDecoration: 'underline',
                  },
                }}
              >
                Regístrate aquí
              </MuiLink>
            </Typography>
          </Box>
        </Box>
      </StyledPaper>
    </Container>
  )
}

export default Login
