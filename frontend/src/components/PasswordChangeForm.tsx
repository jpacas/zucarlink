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
      const token = localStorage.getItem('token')
      await axios.put(
        `${import.meta.env.VITE_API_URL}/users/${user?.id}/password`,
        passwordData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
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
    <Box>
      <Typography
        variant='h5'
        sx={{
          textAlign: 'center',
          mb: 4,
          color: '#1a1a1a',
          fontWeight: 700,
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
          sx={{
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: '#e0e0e0',
              },
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
          type='password'
          label='Nueva Contraseña'
          value={passwordData.newPassword}
          onChange={(e) =>
            setPasswordData({ ...passwordData, newPassword: e.target.value })
          }
          margin='normal'
          sx={{
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: '#e0e0e0',
              },
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
          sx={{
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: '#e0e0e0',
              },
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
        <Button
          type='submit'
          variant='contained'
          fullWidth
          startIcon={<LockResetIcon />}
          sx={{
            mt: 4,
            mb: 2,
            backgroundColor: '#ff6347',
            color: '#fff',
            textTransform: 'none',
            borderRadius: '50px',
            padding: '12px',
            boxShadow: '0 4px 15px rgba(255, 99, 71, 0.3)',
            transition: 'all 0.3s ease',
            '&:hover': {
              backgroundColor: '#e5533f',
              transform: 'translateY(-2px)',
              boxShadow: '0 6px 20px rgba(255, 99, 71, 0.4)',
            },
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
                message.type === 'success' ? '#ff6347' : undefined,
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
