import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
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
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    pais: '',
    bio: '',
    avatarUrl: '',
    password: '',
    confirmPassword: '',
  })
  const [message, setMessage] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) {
      setFormData({
        nombre: user.nombre,
        apellido: user.apellido,
        pais: user.pais,
        bio: user.bio || '',
        avatarUrl: user.avatar || '',
        password: '',
        confirmPassword: '',
      })
    }
  }, [user])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const file = e.target.files[0]
      setFormData({ ...formData, avatarUrl: URL.createObjectURL(file) })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.password && formData.password !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'Las contraseñas no coinciden.' })
      return
    }

    setLoading(true)
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/users/${id}`, formData)
      setMessage({ type: 'success', text: 'Perfil actualizado exitosamente.' })
      setTimeout(() => navigate(`/perfil/${id}`), 2000)
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
          src={formData.avatarUrl}
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
          label='Biografía'
          name='bio'
          value={formData.bio}
          onChange={handleChange}
          margin='normal'
          multiline
          rows={3}
        />
        <TextField
          fullWidth
          label='Nueva Contraseña'
          name='password'
          type='password'
          value={formData.password}
          onChange={handleChange}
          margin='normal'
        />
        <TextField
          fullWidth
          label='Confirmar Contraseña'
          name='confirmPassword'
          type='password'
          value={formData.confirmPassword}
          onChange={handleChange}
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
