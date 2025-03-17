import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axiosInstance from '../utils/axiosConfig'
import { useAuth } from '../context/AuthContext'
import {
  Box,
  Typography,
  CircularProgress,
  Card,
  CardContent,
  Avatar,
  Grid,
  Container,
  Divider,
  Link,
  Button,
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import IconButton from '@mui/material/IconButton'
import { Proveedor, User } from '../types/interfaces'
import { useChat } from '../context/ChatContext'

const PerfilProveedor: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [proveedor, setProveedor] = useState<Proveedor | null>(null)
  const [miembros, setMiembros] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()
  const { startChat } = useChat()
  const esPropietario = user?.id === id

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [proveedorResponse, miembrosResponse] = await Promise.all([
          axiosInstance.get(`/helper/proveedores/${id}`),
          axiosInstance.get(`/users/proveedor/${id}`),
        ])
        setProveedor(proveedorResponse.data)
        setMiembros(
          Array.isArray(miembrosResponse.data) ? miembrosResponse.data : []
        )
      } catch (err) {
        setError('Error al cargar el perfil del proveedor')
        setMiembros([])
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchData()
    }
  }, [id])

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          marginTop: '64px',
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
          marginTop: '64px',
        }}
      >
        <Typography color='error'>{error}</Typography>
      </Box>
    )
  }

  return (
    <Box
      sx={{
        background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
        minHeight: '100vh',
        pt: 10,
        pb: 8,
      }}
    >
      <Container maxWidth='lg'>
        {proveedor && (
          <>
            <Card
              sx={{
                boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                borderRadius: 3,
                overflow: 'hidden',
                transition: 'transform 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-5px)',
                },
                mb: 6,
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Grid container spacing={4}>
                  <Grid item xs={12} sm={4} sx={{ textAlign: 'center' }}>
                    <Avatar
                      src={proveedor.logo}
                      alt={proveedor.nombre}
                      sx={{
                        width: 180,
                        height: 180,
                        margin: 'auto',
                        border: '3px solid #ff6347',
                        boxShadow: '0 4px 15px rgba(255, 99, 71, 0.2)',
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={8}>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                      }}
                    >
                      <Typography
                        variant='h4'
                        sx={{
                          color: '#1a1a1a',
                          fontWeight: 700,
                          mb: 3,
                          position: 'relative',
                          '&::after': {
                            content: '""',
                            display: 'block',
                            width: '60px',
                            height: '4px',
                            backgroundColor: '#ff6347',
                            mt: 2,
                            borderRadius: '2px',
                          },
                        }}
                      >
                        {proveedor.nombre}
                      </Typography>
                      {esPropietario && (
                        <IconButton
                          onClick={() =>
                            navigate(`/editar-perfil-proveedor/${id}`)
                          }
                          sx={{
                            color: '#ff6347',
                            '&:hover': {
                              backgroundColor: '#ff634710',
                            },
                          }}
                        >
                          <EditIcon />
                        </IconButton>
                      )}
                    </Box>

                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography
                          variant='body1'
                          sx={{ mb: 2, color: '#4a4a4a' }}
                        >
                          <strong>Email:</strong> {proveedor.email}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography
                          variant='body1'
                          sx={{ mb: 2, color: '#4a4a4a' }}
                        >
                          <strong>País:</strong> {proveedor.nombrePais}
                        </Typography>
                      </Grid>
                      {proveedor.paginaWeb && (
                        <Grid item xs={12}>
                          <Typography
                            variant='body1'
                            sx={{ mb: 2, color: '#4a4a4a' }}
                          >
                            <strong>Sitio Web:</strong>{' '}
                            <Link
                              href={proveedor.paginaWeb}
                              target='_blank'
                              rel='noopener noreferrer'
                              sx={{
                                color: '#ff6347',
                                textDecoration: 'none',
                                '&:hover': {
                                  textDecoration: 'underline',
                                },
                              }}
                            >
                              {proveedor.paginaWeb}
                            </Link>
                          </Typography>
                        </Grid>
                      )}
                    </Grid>

                    {proveedor.descripcion && (
                      <>
                        <Divider sx={{ my: 3 }} />
                        <Typography
                          variant='h6'
                          sx={{
                            color: '#1a1a1a',
                            fontWeight: 600,
                            mb: 2,
                          }}
                        >
                          Sobre Nosotros
                        </Typography>
                        <Typography
                          variant='body1'
                          sx={{
                            color: '#4a4a4a',
                            lineHeight: 1.6,
                          }}
                        >
                          {proveedor.descripcion}
                        </Typography>
                      </>
                    )}
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Sección de Miembros */}
            <Box sx={{ mt: 6 }}>
              <Typography
                variant='h5'
                sx={{
                  mb: 4,
                  fontWeight: 700,
                  color: '#1a1a1a',
                  position: 'relative',
                  '&::after': {
                    content: '""',
                    display: 'block',
                    width: '40px',
                    height: '3px',
                    backgroundColor: '#ff6347',
                    mt: 1,
                    borderRadius: '2px',
                  },
                }}
              >
                Miembros de la Empresa
              </Typography>

              <Grid container spacing={3}>
                {Array.isArray(miembros) &&
                  miembros.map((miembro) => (
                    <Grid item xs={12} sm={6} md={4} key={miembro.id}>
                      <Card
                        sx={{
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          borderRadius: '16px',
                          background:
                            'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                          boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          '&:hover': {
                            transform: 'translateY(-8px)',
                            boxShadow: '0 12px 40px rgba(0,0,0,0.12)',
                          },
                        }}
                        onClick={() => navigate(`/perfil/${miembro.id}`)}
                      >
                        <CardContent
                          sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            textAlign: 'center',
                            flexGrow: 1,
                            p: 4,
                            position: 'relative',
                          }}
                        >
                          {miembro.avatarUrl ? (
                            <Box
                              sx={{
                                width: 100,
                                height: 100,
                                borderRadius: '50%',
                                mb: 3,
                                overflow: 'hidden',
                                border: '3px solid #ff6347',
                                boxShadow: '0 4px 15px rgba(255, 99, 71, 0.2)',
                              }}
                            >
                              <img
                                src={miembro.avatarUrl}
                                alt={`${miembro.nombre} ${miembro.apellido}`}
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'cover',
                                }}
                              />
                            </Box>
                          ) : (
                            <Box
                              sx={{
                                width: 100,
                                height: 100,
                                borderRadius: '50%',
                                mb: 3,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: '#f5f5f5',
                                border: '3px solid #ff6347',
                                boxShadow: '0 4px 15px rgba(255, 99, 71, 0.2)',
                              }}
                            >
                              <Typography
                                variant='body2'
                                color='text.secondary'
                              >
                                Sin foto
                              </Typography>
                            </Box>
                          )}
                          <Typography
                            variant='h6'
                            sx={{
                              mb: 2,
                              fontWeight: 600,
                              color: '#1a1a1a',
                            }}
                          >
                            {miembro.nombre} {miembro.apellido}
                          </Typography>
                          <Typography
                            variant='body2'
                            sx={{
                              mb: 1,
                              color: '#4a4a4a',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 0.5,
                            }}
                          >
                            <strong>País:</strong> {miembro.pais}
                          </Typography>
                          {miembro.area && (
                            <Typography
                              variant='body2'
                              sx={{
                                color: '#4a4a4a',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.5,
                              }}
                            >
                              <strong>Área:</strong> {miembro.area}
                            </Typography>
                          )}
                        </CardContent>
                        {user && user.id !== miembro.id && (
                          <Box sx={{ pb: 3, textAlign: 'center' }}>
                            <Button
                              variant='contained'
                              onClick={(e) => {
                                e.stopPropagation()
                                startChat(
                                  miembro.id,
                                  `${miembro.nombre} ${miembro.apellido}`
                                )
                              }}
                              sx={{
                                backgroundColor: '#ff6347',
                                color: '#fff',
                                textTransform: 'none',
                                borderRadius: '50px',
                                padding: '6px 16px',
                                boxShadow: '0 4px 15px rgba(255, 99, 71, 0.3)',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                  backgroundColor: '#e5533f',
                                  transform: 'translateY(-2px)',
                                  boxShadow:
                                    '0 6px 20px rgba(255, 99, 71, 0.4)',
                                },
                              }}
                            >
                              Enviar Mensaje
                            </Button>
                          </Box>
                        )}
                      </Card>
                    </Grid>
                  ))}
              </Grid>

              {(!Array.isArray(miembros) || miembros.length === 0) && (
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: 4,
                    textAlign: 'center',
                    background:
                      'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                    borderRadius: '16px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                  }}
                >
                  <Typography
                    variant='h6'
                    sx={{
                      mb: 2,
                      fontWeight: 600,
                      color: '#1a1a1a',
                    }}
                  >
                    No hay miembros registrados
                  </Typography>
                  <Typography
                    variant='body1'
                    sx={{
                      color: '#4a4a4a',
                      maxWidth: '600px',
                    }}
                  >
                    Por el momento no hay miembros registrados en esta empresa.
                  </Typography>
                </Box>
              )}
            </Box>
          </>
        )}
      </Container>
    </Box>
  )
}

export default PerfilProveedor
