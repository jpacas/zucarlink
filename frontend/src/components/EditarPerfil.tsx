import React, { useState, useEffect } from 'react'

import {
  Box,
  TextField,
  Button,
  Typography,
  Snackbar,
  Alert,
  Avatar,
} from '@mui/material'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'

const EditarPerfil: React.FC = () => {
  const { user } = useAuth()
  console.log('USER: ', user)
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    pais: '',
    acercaDe: '',
    area: '',
    avatarUrl: '',
    password: '',
    confirmPassword: '',
  })

  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  })
  const [avatar, setAvatar] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [message, setMessage] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) {
      setFormData({
        nombre: user.nombre || '',
        apellido: user.apellido || '',
        pais: user.pais || '',
        area: user.area || '',
        acercaDe: user.acercaDe || '',
        avatarUrl: user.avatar || '',
        password: '',
        confirmPassword: '',
      })
    }
  }, [user])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    if (name === 'password' || name === 'confirmPassword') {
      setPasswordData({ ...passwordData, [name]: value })
    } else {
      setFormData({ ...formData, [name]: value })
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const file = e.target.files[0]
      setAvatar(file)
      setAvatarPreview(URL.createObjectURL(file))
    }
  }

  const validarFormulario = (): boolean => {
    if (
      !formData.nombre.trim() ||
      !formData.apellido.trim() ||
      !formData.pais.trim()
    ) {
      setMessage({
        type: 'error',
        text: 'Los campos de Nombre, Apellido y País son obligatorios.',
      })
      return false
    }

    if (passwordData.newPassword || passwordData.confirmNewPassword) {
      if (passwordData.newPassword.length < 6) {
        setMessage({
          type: 'error',
          text: 'La nueva contraseña debe tener al menos 6 caracteres.',
        })
        return false
      }
      if (passwordData.newPassword !== passwordData.confirmNewPassword) {
        setMessage({ type: 'error', text: 'Las contraseñas no coinciden.' })
        return false
      }
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validarFormulario()) return

    setLoading(true)
    try {
      const formDataToSend = new FormData()
      formDataToSend.append('nombre', formData.nombre)
      formDataToSend.append('apellido', formData.apellido)
      formDataToSend.append('pais', formData.pais)
      formDataToSend.append('area', formData.area)
      formDataToSend.append('acercaDe', formData.acercaDe)
      if (avatar) {
        formDataToSend.append('avatar', avatar)
      }

      await axios.put(
        `${import.meta.env.VITE_API_URL}/users/${user?.id}`,
        formDataToSend,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      )

      // Si el usuario quiere cambiar la contraseña
      if (passwordData.newPassword) {
        await axios.put(
          `${import.meta.env.VITE_API_URL}/users/${user?.id}/password`,
          {
            oldPassword: passwordData.oldPassword,
            newPassword: passwordData.newPassword,
          }
        )
      }

      setMessage({ type: 'success', text: 'Perfil actualizado exitosamente.' })
    } catch (error) {
      setMessage({ type: 'error', text: 'Error al actualizar el perfil.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box
      sx={{
        maxWidth: '600px',
        margin: 'auto',
        padding: 4,
        backgroundColor: '#fff',
        borderRadius: 2,
        boxShadow: 3,
        marginTop: '64px',
      }}
    >
      <Typography variant='h4' mb={3} textAlign='center'>
        Editar Perfil
      </Typography>
      <Box sx={{ textAlign: 'center', marginBottom: 2 }}>
        <Avatar
          src={avatarPreview || formData.avatarUrl}
          alt='Avatar'
          sx={{ width: 100, height: 100, margin: 'auto' }}
        />
        <input type='file' accept='image/*' onChange={handleFileChange} />
      </Box>
      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label='Nombre'
          name='nombre'
          value={formData.nombre}
          onChange={handleChange}
          margin='normal'
        />
        <TextField
          fullWidth
          label='Apellido'
          name='apellido'
          value={formData.apellido}
          onChange={handleChange}
          margin='normal'
        />
        <TextField
          fullWidth
          label='País'
          name='pais'
          value={formData.pais}
          onChange={handleChange}
          margin='normal'
        />
        <TextField
          fullWidth
          label='Área de Trabajo'
          name='area'
          value={formData.area}
          onChange={handleChange}
          margin='normal'
        />
        <TextField
          fullWidth
          label='Biografía'
          name='acercaDe'
          value={formData.acercaDe}
          onChange={handleChange}
          margin='normal'
          multiline
          rows={3}
        />

        <Typography variant='h6' mt={3} mb={1}>
          Cambio de Contraseña (Opcional)
        </Typography>
        <TextField
          fullWidth
          label='Nueva Contraseña'
          name='newPassword'
          type='password'
          value={passwordData.newPassword}
          onChange={(e) =>
            setPasswordData({ ...passwordData, newPassword: e.target.value })
          }
          margin='normal'
        />
        <TextField
          fullWidth
          label='Confirmar Contraseña'
          name='confirmNewPassword'
          type='password'
          value={passwordData.confirmNewPassword}
          onChange={(e) =>
            setPasswordData({
              ...passwordData,
              confirmNewPassword: e.target.value,
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
          disabled={loading}
        >
          {loading ? 'Guardando...' : 'Guardar Cambios'}
        </Button>
      </form>
      {message && (
        <Snackbar open autoHideDuration={6000} onClose={() => setMessage(null)}>
          <Alert
            onClose={() => setMessage(null)}
            severity={message.type}
            sx={{ width: '100%' }}
          >
            {message.text}
          </Alert>
        </Snackbar>
      )}
    </Box>
  )
}

export default EditarPerfil
