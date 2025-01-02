import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'
import { Box, Typography, CircularProgress } from '@mui/material'

interface User {
  id: string
  nombre: string
  apellido: string
  pais: string
  email: string
  bio?: string
  avatarUrl?: string
}

const Perfil: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const [usuario, setUsuario] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUsuario = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5001/api/users/usuarios/${id}`
        )
        setUsuario(response.data)
      } catch (err: any) {
        setError(err.response?.data?.message || 'Error al cargar el usuario.')
      } finally {
        setLoading(false)
      }
    }

    fetchUsuario()
  }, [id])

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          marginTop: '64px', // Ajusta el espacio para el Navbar
        }}
      >
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Box
        sx={{
          textAlign: 'center',
          padding: 3,
          marginTop: '64px', // Ajusta el espacio para el Navbar
        }}
      >
        <Typography color='error'>{error}</Typography>
      </Box>
    )
  }

  return (
    <Box
      sx={{
        maxWidth: '800px',
        margin: 'auto',
        padding: 3,
        backgroundColor: '#fff',
        borderRadius: 2,
        boxShadow: 3,
        marginTop: '64px', // Ajusta el espacio para el Navbar
      }}
    >
      {usuario && (
        <>
          <Typography variant='h4' marginBottom={2}>
            {usuario.nombre} {usuario.apellido}
          </Typography>
          {usuario.avatarUrl && (
            <img
              src={usuario.avatarUrl}
              alt={`${usuario.nombre} ${usuario.apellido}`}
              style={{
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                marginBottom: '1rem',
              }}
            />
          )}
          <Typography variant='body1' marginBottom={2}>
            <strong>País:</strong> {usuario.pais}
          </Typography>
          <Typography variant='body1' marginBottom={2}>
            <strong>Correo:</strong> {usuario.email}
          </Typography>
          {usuario.bio && (
            <Typography variant='body1'>
              <strong>Biografía:</strong> {usuario.bio}
            </Typography>
          )}
        </>
      )}
    </Box>
  )
}

export default Perfil
