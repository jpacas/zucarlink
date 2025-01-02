import React, { useEffect, useState } from 'react'
import axios from 'axios'
import {
  Box,
  Grid,
  TextField,
  Card,
  CardContent,
  Typography,
} from '@mui/material'
import { useNavigate } from 'react-router-dom'

interface User {
  id: string
  nombre: string
  apellido: string
  pais: string
  email: string
  avatarUrl?: string // URL de la foto de perfil
}

const Directorio: React.FC = () => {
  const [usuarios, setUsuarios] = useState<User[]>([])
  const [filtros, setFiltros] = useState({ nombre: '', pais: '' })
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        const response = await axios.get(
          'http://localhost:5001/api/users/usuarios'
        )
        setUsuarios(response.data)
      } catch (err: any) {
        setError(err.response?.data?.message || 'Error al cargar los usuarios.')
      }
    }

    fetchUsuarios()
  }, [])

  // Filtrar usuarios
  const usuariosFiltrados = usuarios.filter(
    (usuario) =>
      usuario.nombre
        .toLowerCase()
        .includes(filtros.nombre.toLowerCase().trim()) &&
      usuario.pais.toLowerCase().includes(filtros.pais.toLowerCase().trim())
  )

  const handleFiltroChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFiltros({ ...filtros, [e.target.name]: e.target.value })
  }

  return (
    <Box
      sx={{
        backgroundColor: '#f9f9f9',
        minHeight: '100vh',
        padding: 3,
        marginTop: '64px', // Ajustar la distancia para evitar solapamiento con el Navbar
      }}
    >
      <Typography
        variant='h3'
        textAlign='center'
        marginBottom={4}
        color='primary'
      >
        Directorio de Usuarios
      </Typography>
      <Grid
        container
        spacing={4}
        direction={{ xs: 'column', md: 'row' }} // Cambia la dirección en pantallas pequeñas
      >
        {/* Sidebar de Filtros */}
        <Grid
          item
          sx={{
            flex: { xs: '1 1 auto', md: '0 0 25%' }, // Ocupa toda la fila en pantallas pequeñas
            maxWidth: { xs: '100%', md: '25%' }, // Ajusta el ancho según el tamaño de pantalla
          }}
        >
          <Box
            sx={{
              backgroundColor: '#fff',
              padding: 3,
              borderRadius: 2,
              boxShadow: 3,
            }}
          >
            <Typography variant='h5' marginBottom={2} color='primary'>
              Filtros
            </Typography>
            <TextField
              fullWidth
              label='Nombre'
              name='nombre'
              value={filtros.nombre}
              onChange={handleFiltroChange}
              variant='outlined'
              margin='normal'
            />
            <TextField
              fullWidth
              label='País'
              name='pais'
              value={filtros.pais}
              onChange={handleFiltroChange}
              variant='outlined'
              margin='normal'
            />
          </Box>
        </Grid>
        {/* Resultados */}
        <Grid
          item
          sx={{
            flex: { xs: '1 1 auto', md: '1' }, // Ajusta dinámicamente el ancho
            maxWidth: '100%',
          }}
        >
          {error && (
            <Typography color='error' textAlign='center'>
              {error}
            </Typography>
          )}
          <Grid container spacing={3}>
            {usuariosFiltrados.map((usuario) => (
              <Grid item xs={12} sm={6} md={4} key={usuario.id}>
                <Card
                  sx={{
                    cursor: 'pointer',
                    transition: 'transform 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                    },
                  }}
                  onClick={() => navigate(`/perfil/${usuario.id}`)}
                >
                  <CardContent
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center',
                    }}
                  >
                    {/* Mostrar la foto de perfil */}
                    {usuario.avatarUrl ? (
                      <img
                        src={usuario.avatarUrl}
                        alt={`${usuario.nombre} ${usuario.apellido}`}
                        style={{
                          width: '100px',
                          height: '100px',
                          borderRadius: '50%',
                          marginBottom: '1rem',
                          objectFit: 'cover',
                        }}
                      />
                    ) : (
                      <Typography variant='body2' color='text.secondary'>
                        Sin foto
                      </Typography>
                    )}
                    <Typography variant='h6'>
                      {usuario.nombre} {usuario.apellido}
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                      <strong>País:</strong> {usuario.pais}
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                      <strong>Correo:</strong> {usuario.email}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>
    </Box>
  )
}

export default Directorio
