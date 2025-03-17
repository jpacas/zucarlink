import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axiosInstance from '../utils/axiosConfig'
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
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

const ResetPassword: React.FC = () => {
  const { token } = useParams()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: '',
  })
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const { newPassword, confirmPassword } = formData

    if (!newPassword || !confirmPassword) {
      setErrorMessage('Todos los campos son obligatorios.')
      return
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Las contraseñas no coinciden.')
      return
    }

    try {
      await axiosInstance.post(`/users/reset-password/${token}`, {
        newPassword,
      })
      setSuccessMessage('Contraseña actualizada exitosamente.')
      setTimeout(() => {
        navigate('/login')
      }, 3000)
    } catch (error: any) {
      setErrorMessage(
        error.response?.data?.message ||
          'Error al restablecer la contraseña. Por favor, intenta nuevamente.'
      )
    }
  }

  return (
    <Container component='main' maxWidth='xs' sx={{ marginTop: '150px' }}>
      <StyledPaper elevation={3}>
        <Typography component='h1' variant='h5' gutterBottom>
          Restablecer Contraseña
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
          onSubmit={handleSubmit}
          sx={{ mt: 1, width: '100%' }}
        >
          <TextField
            margin='normal'
            required
            fullWidth
            name='newPassword'
            label='Nueva Contraseña'
            type='password'
            id='newPassword'
            autoComplete='new-password'
            value={formData.newPassword}
            onChange={handleChange}
            variant='outlined'
          />
          <TextField
            margin='normal'
            required
            fullWidth
            name='confirmPassword'
            label='Confirmar Contraseña'
            type='password'
            id='confirmPassword'
            autoComplete='new-password'
            value={formData.confirmPassword}
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
            Restablecer Contraseña
          </Button>
        </Box>
      </StyledPaper>
    </Container>
  )
}

export default ResetPassword
