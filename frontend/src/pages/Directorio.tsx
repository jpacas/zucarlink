import React, { useEffect, useState } from 'react'
import axios from 'axios'
import {
  Box,
  Grid,
  TextField,
  Card,
  CardContent,
  Typography,
  Autocomplete,
  FormControlLabel,
  Checkbox,
  FormGroup,
  Container,
} from '@mui/material'
import { User, Ingenio, Area, Proveedor } from '../types/interfaces'
import { useNavigate, useParams } from 'react-router-dom'
import LanguageIcon from '@mui/icons-material/Language'
import EmailIcon from '@mui/icons-material/Email'

interface DirectorioProps {}

const Directorio: React.FC<DirectorioProps> = () => {
  const { tipo } = useParams<{ tipo: string }>()
  const [usuarios, setUsuarios] = useState<User[]>([])
  const [ingenios, setIngenios] = useState<Ingenio[]>([])
  const [proveedores, setProveedores] = useState<Proveedor[]>([])
  const [filtros, setFiltros] = useState({
    nombre: '',
    pais: '',
    ingenio: '',
    area: '',
    tipoUsuario: {
      ingenio: false,
      proveedor: false,
    },
  })
  const [error, setError] = useState<string | null>(null)
  const [paises, setPaises] = useState<string[]>([])
  const [ingeniosList, setIngeniosList] = useState<Ingenio[]>([])
  //const [proveedoresList, setProveedoresList] = useState<Proveedor[]>([])
  const [ingeniosFiltrados, setIngeniosFiltrados] = useState<Ingenio[]>([])
  const [areas, setAreas] = useState<Area[]>([])
  const navigate = useNavigate()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [paisesRes, areasRes] = await Promise.all([
          axios.get<{ nombre: string }[]>(
            `${import.meta.env.VITE_API_URL}/helper/paises`
          ),
          axios.get<{ nombre: string }[]>(
            `${import.meta.env.VITE_API_URL}/helper/areas`
          ),
        ])

        setPaises(paisesRes.data.map((pais) => pais.nombre))
        setAreas(areasRes.data.map((area) => area.nombre))

        if (tipo === 'usuarios') {
          const usuariosRes = await axios.get<User[]>(
            `${import.meta.env.VITE_API_URL}/users/usuarios`
          )
          setUsuarios(usuariosRes.data)
        } else if (tipo === 'ingenios') {
          const ingeniosRes = await axios.get<Ingenio[]>(
            `${import.meta.env.VITE_API_URL}/helper/ingenios`
          )
          setIngenios(ingeniosRes.data)
          setIngeniosList(ingeniosRes.data)
        } else if (tipo === 'proveedores') {
          const proveedoresRes = await axios.get<Proveedor[]>(
            `${import.meta.env.VITE_API_URL}/helper/proveedores`
          )
          setProveedores(proveedoresRes.data)
        }
      } catch (err) {
        if (axios.isAxiosError(err)) {
          setError(err.response?.data?.message || 'Error al cargar los datos.')
        } else {
          setError('Error desconocido.')
        }
      }
    }

    fetchData()
  }, [tipo])

  useEffect(() => {
    if (filtros.pais && tipo === 'ingenios') {
      const ingeniosPorPais = ingeniosList.filter(
        (ingenio) => ingenio.pais.toLowerCase() === filtros.pais.toLowerCase()
      )
      setIngeniosFiltrados(ingeniosPorPais)
    } else {
      setIngeniosFiltrados(ingeniosList)
    }
  }, [filtros.pais, ingeniosList, tipo])

  const handleFiltroChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFiltros({ ...filtros, [e.target.name]: e.target.value })
  }

  const handleTipoUsuarioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFiltros({
      ...filtros,
      tipoUsuario: {
        ...filtros.tipoUsuario,
        [e.target.name]: e.target.checked,
      },
    })
  }

  const filtrarElementos = () => {
    if (tipo === 'usuarios') {
      return usuarios.filter((usuario) => {
        const matchNombre =
          usuario.nombre
            .toLowerCase()
            .includes(filtros.nombre.toLowerCase().trim()) ||
          usuario.apellido
            .toLowerCase()
            .includes(filtros.nombre.toLowerCase().trim())

        const matchPais =
          !filtros.pais ||
          usuario.pais?.toLowerCase() === filtros.pais?.toLowerCase()

        const matchIngenio =
          !filtros.ingenio || usuario.ingenio === filtros.ingenio

        const matchArea = !filtros.area || usuario.area === filtros.area

        const matchTipoUsuario =
          (!filtros.tipoUsuario.ingenio && !filtros.tipoUsuario.proveedor) ||
          (filtros.tipoUsuario.ingenio && filtros.tipoUsuario.proveedor) ||
          (filtros.tipoUsuario.ingenio && !usuario.proveedor) ||
          (filtros.tipoUsuario.proveedor && usuario.proveedor)

        return (
          matchNombre &&
          matchPais &&
          matchIngenio &&
          matchArea &&
          matchTipoUsuario
        )
      })
    } else if (tipo === 'ingenios') {
      return ingenios.filter((ingenio) => {
        const matchNombre = ingenio.nombre
          .toLowerCase()
          .includes(filtros.nombre.toLowerCase().trim())
        const matchPais =
          !filtros.pais ||
          ingenio.pais.toLowerCase() === filtros.pais.toLowerCase()
        return matchNombre && matchPais
      })
    } else if (tipo === 'proveedores') {
      return (proveedores || []).filter((proveedor) => {
        const matchNombre = proveedor.nombre
          .toLowerCase()
          .includes(filtros.nombre.toLowerCase().trim())
        const matchPais =
          !filtros.pais ||
          proveedor.pais?.toLowerCase() === filtros.pais?.toLowerCase()
        return matchNombre && matchPais
      })
    }
    return []
  }

  const renderFiltros = () => {
    return (
      <Box
        sx={{
          background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
          p: 4,
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
          position: 'sticky',
          top: '80px',
        }}
      >
        <Typography
          variant='h5'
          sx={{
            mb: 3,
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
          Filtros
        </Typography>
        <TextField
          fullWidth
          label={tipo === 'usuarios' ? 'Nombre o Apellido' : 'Nombre'}
          name='nombre'
          value={filtros.nombre}
          onChange={handleFiltroChange}
          variant='outlined'
          margin='normal'
          sx={{
            '& .MuiOutlinedInput-root': {
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
        {(tipo === 'usuarios' ||
          tipo === 'ingenios' ||
          tipo === 'proveedores') && (
          <Autocomplete
            options={paises}
            value={filtros.pais || null}
            onChange={(_, value) =>
              setFiltros({ ...filtros, pais: value || '' })
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label='País'
                margin='normal'
                fullWidth
                sx={{
                  '& .MuiOutlinedInput-root': {
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
            )}
          />
        )}
        {tipo === 'usuarios' && (
          <>
            <Autocomplete
              options={ingeniosFiltrados.map((ing) => ing.nombre)}
              value={filtros.ingenio || null}
              onChange={(_, value) =>
                setFiltros({ ...filtros, ingenio: value || '' })
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label='Ingenio'
                  margin='normal'
                  fullWidth
                  disabled={ingeniosFiltrados.length === 0}
                  helperText={
                    filtros.pais && ingeniosFiltrados.length === 0
                      ? 'No hay ingenios disponibles para el país seleccionado'
                      : ''
                  }
                  sx={{
                    '& .MuiOutlinedInput-root': {
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
              )}
            />
            <Autocomplete
              options={areas}
              value={filtros.area || null}
              onChange={(_, value) =>
                setFiltros({ ...filtros, area: value || '' })
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label='Área'
                  margin='normal'
                  fullWidth
                  sx={{
                    '& .MuiOutlinedInput-root': {
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
              )}
            />
            <FormGroup sx={{ mt: 3 }}>
              <Typography
                variant='subtitle1'
                sx={{
                  fontWeight: 600,
                  color: '#1a1a1a',
                  mb: 1,
                }}
              >
                Tipo de Usuario
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  gap: { xs: 0, sm: 2 },
                }}
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={filtros.tipoUsuario.ingenio}
                      onChange={handleTipoUsuarioChange}
                      name='ingenio'
                      sx={{
                        color: '#ff6347',
                        '&.Mui-checked': {
                          color: '#ff6347',
                        },
                      }}
                    />
                  }
                  label='Ingenio'
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={filtros.tipoUsuario.proveedor}
                      onChange={handleTipoUsuarioChange}
                      name='proveedor'
                      sx={{
                        color: '#ff6347',
                        '&.Mui-checked': {
                          color: '#ff6347',
                        },
                      }}
                    />
                  }
                  label='Proveedor'
                />
              </Box>
            </FormGroup>
          </>
        )}
      </Box>
    )
  }

  const renderCard = (item: User | Ingenio | Proveedor) => {
    if (tipo === 'usuarios') {
      const usuario = item as User
      return (
        <Card
          sx={{
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            '&:hover': {
              transform: 'translateY(-8px)',
              boxShadow: '0 12px 40px rgba(0,0,0,0.12)',
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
              flexGrow: 1,
              p: 4,
            }}
          >
            {usuario.avatarUrl ? (
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
                  src={usuario.avatarUrl}
                  alt={`${usuario.nombre} ${usuario.apellido}`}
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
                <Typography variant='body2' color='text.secondary'>
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
              {usuario.nombre} {usuario.apellido}
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
              <strong>País:</strong> {usuario.pais}
            </Typography>
            {usuario.proveedor ? (
              <Typography
                variant='body2'
                sx={{
                  color: '#4a4a4a',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                }}
              >
                <strong>Empresa:</strong> {usuario.proveedor}
              </Typography>
            ) : (
              <>
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
                  <strong>Ingenio:</strong> {usuario.ingenio}
                </Typography>
                <Typography
                  variant='body2'
                  sx={{
                    color: '#4a4a4a',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                  }}
                >
                  <strong>Área:</strong> {usuario.area}
                </Typography>
              </>
            )}
          </CardContent>
        </Card>
      )
    } else if (tipo === 'ingenios') {
      const ingenio = item as Ingenio
      return (
        <Card
          sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
            '&:hover': {
              transform: 'translateY(-8px)',
              boxShadow: '0 12px 40px rgba(0,0,0,0.12)',
            },
          }}
        >
          <CardContent
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              p: 4,
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
              {ingenio.nombre}
            </Typography>
            <Typography
              variant='body1'
              sx={{
                mb: 2,
                color: '#4a4a4a',
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
              }}
            >
              <strong>País:</strong> {ingenio.pais}
            </Typography>
            {ingenio.webpage && (
              <Box
                sx={{
                  mt: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <LanguageIcon sx={{ color: '#ff6347' }} />
                <Typography
                  variant='body2'
                  component='a'
                  href={ingenio.webpage}
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
                  Sitio web
                </Typography>
              </Box>
            )}
            {ingenio.correo && (
              <Box
                sx={{
                  mt: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <EmailIcon sx={{ color: '#ff6347' }} />
                <Typography
                  variant='body2'
                  component='a'
                  href={`mailto:${ingenio.correo}`}
                  sx={{
                    color: '#ff6347',
                    textDecoration: 'none',
                    '&:hover': {
                      textDecoration: 'underline',
                    },
                  }}
                >
                  Contacto
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      )
    } else if (tipo === 'proveedores') {
      const proveedor = item as Proveedor
      return (
        <Card
          sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
            '&:hover': {
              transform: 'translateY(-8px)',
              boxShadow: '0 12px 40px rgba(0,0,0,0.12)',
            },
          }}
        >
          <CardContent
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              p: 4,
            }}
          >
            {proveedor.logo ? (
              <Box
                sx={{
                  width: 120,
                  height: 120,
                  mb: 3,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <img
                  src={proveedor.logo}
                  alt={proveedor.nombre}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                  }}
                />
              </Box>
            ) : (
              <Box
                sx={{
                  width: 120,
                  height: 120,
                  mb: 3,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#f5f5f5',
                  borderRadius: '8px',
                }}
              >
                <Typography variant='body2' color='text.secondary'>
                  Sin logo
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
              {proveedor.nombre}
            </Typography>
            {proveedor.pais && (
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
                <strong>País:</strong> {proveedor.pais}
              </Typography>
            )}
            {proveedor.descripcion && (
              <Typography
                variant='body2'
                sx={{
                  mb: 2,
                  color: '#4a4a4a',
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  lineHeight: 1.7,
                }}
              >
                {proveedor.descripcion}
              </Typography>
            )}
            {proveedor.webpage && (
              <Box
                sx={{
                  mt: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <LanguageIcon sx={{ color: '#ff6347' }} />
                <Typography
                  variant='body2'
                  component='a'
                  href={proveedor.webpage}
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
                  Sitio web
                </Typography>
              </Box>
            )}
            {proveedor.email && (
              <Box
                sx={{
                  mt: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <EmailIcon sx={{ color: '#ff6347' }} />
                <Typography
                  variant='body2'
                  component='a'
                  href={`mailto:${proveedor.email}`}
                  sx={{
                    color: '#ff6347',
                    textDecoration: 'none',
                    '&:hover': {
                      textDecoration: 'underline',
                    },
                  }}
                >
                  Contacto
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      )
    }
  }

  const elementosFiltrados = filtrarElementos()

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
        <Grid container spacing={4} direction={{ xs: 'column', md: 'row' }}>
          {/* Sidebar de Filtros */}
          <Grid
            item
            sx={{
              flex: { xs: '1 1 auto', md: '0 0 25%' },
              maxWidth: { xs: '100%', md: '25%' },
            }}
          >
            {renderFiltros()}
          </Grid>
          {/* Resultados */}
          <Grid
            item
            sx={{ flex: { xs: '1 1 auto', md: '1' }, maxWidth: '100%' }}
          >
            {error && (
              <Typography color='error' textAlign='center' sx={{ mb: 3 }}>
                {error}
              </Typography>
            )}
            <Grid container spacing={3}>
              {elementosFiltrados.length > 0 ? (
                elementosFiltrados.map((item, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    {renderCard(item)}
                  </Grid>
                ))
              ) : (
                <Grid item xs={12}>
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
                      {tipo === 'proveedores'
                        ? 'No hay proveedores registrados'
                        : tipo === 'ingenios'
                        ? 'No hay ingenios registrados'
                        : 'No hay usuarios registrados'}
                    </Typography>
                    <Typography
                      variant='body1'
                      sx={{
                        color: '#4a4a4a',
                        maxWidth: '600px',
                      }}
                    >
                      {tipo === 'proveedores'
                        ? 'Por el momento no hay proveedores registrados en el directorio. Vuelve más tarde para ver los proveedores disponibles.'
                        : tipo === 'ingenios'
                        ? 'Por el momento no hay ingenios registrados en el directorio. Vuelve más tarde para ver los ingenios disponibles.'
                        : 'Por el momento no hay usuarios registrados en el directorio. Vuelve más tarde para ver los usuarios disponibles.'}
                    </Typography>
                  </Box>
                </Grid>
              )}
            </Grid>
          </Grid>
        </Grid>
      </Container>
    </Box>
  )
}

export default Directorio
