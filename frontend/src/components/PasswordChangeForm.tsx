import React, { useState } from 'react'
import {
  Box,
  TextField,
  Button,
  Typography,
  Snackbar,
  Alert,
} from '@mui/material'
import axiosInstance from '../utils/axiosConfig'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { LockReset as LockResetIcon } from '@mui/icons-material'

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
      await axiosInstance.put(`/users/${user?.id}/password`, passwordData)

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
    <Box>
      <Typography
        variant='h5'
        sx={{
          textAlign: 'center',
          mb: 4,
          color: 'text.primary',
          fontWeight: 700,
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
          fullWidth
          startIcon={<LockResetIcon />}
          sx={{
            mt: 4,
            mb: 2,
            padding: '12px',
            transition: 'transform 0.3s ease',
            '&:hover': { transform: 'translateY(-2px)' },
          }}
        >
          Cambiar Contraseña
        </Button>
      </form>
      {message && (
        <Snackbar
          open
          autoHideDuration={6000}
          onClose={() => setMessage(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert
            onClose={() => setMessage(null)}
            severity={message.type}
            sx={{
              width: '100%',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              borderRadius: 2,
              backgroundColor:
                message.type === 'success' ? 'primary.main' : undefined,
              color: message.type === 'success' ? '#fff' : undefined,
              '& .MuiAlert-icon': {
                color: message.type === 'success' ? '#fff' : undefined,
              },
            }}
          >
            {message.text}
          </Alert>
        </Snackbar>
      )}
    </Box>
  )
}

export default PasswordChangeForm
