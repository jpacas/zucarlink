import React, { useState } from 'react'
import {
  Box,
  TextField,
  Button,
  Typography,
  Snackbar,
  Alert,
} from '@mui/material'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

const PasswordChangeForm = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [message, setMessage] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/users/${user?.id}/password`,
        passwordData
      )
      setMessage({
        type: 'success',
        text: 'Contraseña actualizada exitosamente',
      })
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })

      setTimeout(() => {
        navigate(`/perfil/${user?.id}`)
      }, 2000)
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Error al cambiar la contraseña',
      })
    }
  }

  return (
    <Box
      sx={{
        mt: 4,
        backgroundColor: '#fff',
        borderRadius: 2,
        boxShadow: 3,
        p: 3,
      }}
    >
      <Typography variant='h5' mb={3}>
        Cambiar Contraseña
      </Typography>
      <form onSubmit={handlePasswordChange}>
        <TextField
          fullWidth
          type='password'
          label='Contraseña Actual'
          value={passwordData.currentPassword}
          onChange={(e) =>
            setPasswordData({
              ...passwordData,
              currentPassword: e.target.value,
            })
          }
          margin='normal'
        />
        <TextField
          fullWidth
          type='password'
          label='Nueva Contraseña'
          value={passwordData.newPassword}
          onChange={(e) =>
            setPasswordData({ ...passwordData, newPassword: e.target.value })
          }
          margin='normal'
        />
        <TextField
          fullWidth
          type='password'
          label='Confirmar Nueva Contraseña'
          value={passwordData.confirmPassword}
          onChange={(e) =>
            setPasswordData({
              ...passwordData,
              confirmPassword: e.target.value,
            })
          }
          margin='normal'
        />
        <Button
          type='submit'
          variant='contained'
          color='primary'
          fullWidth
          sx={{ mt: 3 }}
        >
          Cambiar Contraseña
        </Button>
      </form>
      {message && (
        <Snackbar open autoHideDuration={6000} onClose={() => setMessage(null)}>
          <Alert onClose={() => setMessage(null)} severity={message.type}>
            {message.text}
          </Alert>
        </Snackbar>
      )}
    </Box>
  )
}

export default PasswordChangeForm
