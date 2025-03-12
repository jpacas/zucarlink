import React from 'react'
import {
  AppBar,
  Toolbar,
  Button,
  IconButton,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  Box,
  Avatar,
} from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import LoginIcon from '@mui/icons-material/Login'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import ExitToAppIcon from '@mui/icons-material/ExitToApp'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import logo from '../assets/images/ZL-Horizontal-sinfondo02.png'

const Navbar: React.FC = () => {
  const [drawerOpen, setDrawerOpen] = React.useState(false)
  const { isAuthenticated, user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const toggleDrawer = (open: boolean) => {
    setDrawerOpen(open)
  }

  const getInitials = (name: string): string => {
    const initials = name
      .split(' ')
      .map((word) => word[0])
      .join('')
    return initials.toUpperCase()
  }

  const isActive = (path: string) => location.pathname === path

  return (
    <AppBar
      position='fixed'
      sx={{
        background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
        color: '#1a1a1a',
        px: '5%',
      }}
    >
      <Toolbar
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          py: 1,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            textDecoration: 'none',
            color: '#1a1a1a',
            transition: 'transform 0.3s ease',
            '&:hover': {
              transform: 'scale(1.02)',
            },
          }}
          component={Link}
          to='/'
        >
          <img
            src={logo}
            alt='Zucarlink Logo'
            style={{
              height: '40px',
              marginRight: '10px',
            }}
          />
        </Box>

        {/* Botones principales */}
        <Box
          sx={{
            display: { xs: 'none', md: 'flex' },
            gap: 3,
            justifyContent: 'flex-end',
            alignItems: 'center',
          }}
        >
          <Button
            component={Link}
            to={isAuthenticated && user ? `/perfil/${user.id}` : '/'}
            color={
              isActive(isAuthenticated && user ? `/perfil/${user.id}` : '/')
                ? 'primary'
                : 'inherit'
            }
            sx={{
              fontSize: '1rem',
              fontWeight: isActive(
                isAuthenticated && user ? `/perfil/${user.id}` : '/'
              )
                ? 'bold'
                : 'normal',
              color: '#4a4a4a',
              transition: 'all 0.3s ease',
              '&:hover': {
                color: '#ff6347',
                transform: 'translateY(-2px)',
              },
            }}
          >
            {isAuthenticated ? 'Perfil' : 'Inicio'}
          </Button>
          {isAuthenticated && (
            <>
              <Button
                component={Link}
                to='/directorio'
                color={isActive('/directorio') ? 'primary' : 'inherit'}
                sx={{
                  fontSize: '1rem',
                  fontWeight: isActive('/directorio') ? 'bold' : 'normal',
                  color: '#4a4a4a',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    color: '#ff6347',
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                Directorio
              </Button>

              <Button
                component={Link}
                to='/foro'
                color={isActive('/foro') ? 'primary' : 'inherit'}
                sx={{
                  fontSize: '1rem',
                  fontWeight: isActive('/foro') ? 'bold' : 'normal',
                  color: '#4a4a4a',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    color: '#ff6347',
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                Foro
              </Button>

              <Button
                component={Link}
                to='/zucaria'
                color={isActive('/zucaria') ? 'primary' : 'inherit'}
                sx={{
                  fontSize: '1rem',
                  fontWeight: isActive('/zucaria') ? 'bold' : 'normal',
                  color: '#4a4a4a',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    color: '#ff6347',
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                ZucarIA
              </Button>

              <Button
                component={Link}
                to='/empleos'
                color={isActive('/empleos') ? 'primary' : 'inherit'}
                sx={{
                  fontSize: '1rem',
                  fontWeight: isActive('/empleos') ? 'bold' : 'normal',
                  color: '#4a4a4a',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    color: '#ff6347',
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                Empleos
              </Button>

              <Button
                component={Link}
                to='/maquinarias'
                color={isActive('/maquinarias') ? 'primary' : 'inherit'}
                sx={{
                  fontSize: '1rem',
                  fontWeight: isActive('/maquinarias') ? 'bold' : 'normal',
                  color: '#4a4a4a',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    color: '#ff6347',
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                Equipos
              </Button>
            </>
          )}
          {!isAuthenticated && (
            <>
              <Button
                component={Link}
                to='/services'
                color='inherit'
                sx={{
                  fontSize: '1rem',
                  color: '#4a4a4a',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    color: '#ff6347',
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                Servicios
              </Button>
              <Button
                component={Link}
                to='/empleos'
                color={isActive('/empleos') ? 'primary' : 'inherit'}
                sx={{
                  fontSize: '1rem',
                  fontWeight: isActive('/empleos') ? 'bold' : 'normal',
                  color: '#4a4a4a',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    color: '#ff6347',
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                Empleos
              </Button>
              <Button
                component={Link}
                to='/maquinarias'
                color={isActive('/maquinarias') ? 'primary' : 'inherit'}
                sx={{
                  fontSize: '1rem',
                  fontWeight: isActive('/maquinarias') ? 'bold' : 'normal',
                  color: '#4a4a4a',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    color: '#ff6347',
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                Equipos
              </Button>
            </>
          )}
          <Button
            component={Link}
            to='/contact'
            color={isActive('/contact') ? 'primary' : 'inherit'}
            sx={{
              fontSize: '1rem',
              fontWeight: isActive('/contact') ? 'bold' : 'normal',
              color: '#4a4a4a',
              transition: 'all 0.3s ease',
              '&:hover': {
                color: '#ff6347',
                transform: 'translateY(-2px)',
              },
            }}
          >
            Contacto
          </Button>
          {isAuthenticated && user && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                marginRight: 2,
              }}
            >
              <Avatar
                src={user.avatarUrl || ''}
                alt={user.nombre}
                onClick={() => navigate(`/perfil/${user.id}`)}
                sx={{
                  cursor: 'pointer',
                  width: 40,
                  height: 40,
                  backgroundColor: '#ff6347',
                  color: '#fff',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'scale(1.05)',
                    boxShadow: '0 4px 15px rgba(255, 99, 71, 0.3)',
                  },
                }}
              >
                {!user.avatarUrl &&
                  getInitials(`${user.nombre} ${user.apellido}`)}
              </Avatar>
            </Box>
          )}
          {isAuthenticated ? (
            <Button
              color='error'
              variant='contained'
              onClick={() => {
                logout()
                navigate('/')
              }}
              sx={{
                backgroundColor: '#ff6347',
                color: '#fff',
                textTransform: 'none',
                borderRadius: '50px',
                padding: '8px 24px',
                boxShadow: '0 4px 15px rgba(255, 99, 71, 0.3)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: '#e5533f',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 20px rgba(255, 99, 71, 0.4)',
                },
              }}
              startIcon={<ExitToAppIcon />}
            >
              Salir
            </Button>
          ) : (
            <>
              <Button
                component={Link}
                to='/login'
                sx={{
                  color: '#4a4a4a',
                  textTransform: 'none',
                  border: '2px solid #ff6347',
                  borderRadius: '50px',
                  padding: '6px 20px',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    backgroundColor: '#ff6347',
                    color: '#fff',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 15px rgba(255, 99, 71, 0.3)',
                  },
                }}
                startIcon={<LoginIcon />}
              >
                Ingreso
              </Button>
              <Button
                component={Link}
                to='/register'
                sx={{
                  backgroundColor: '#ff6347',
                  color: '#fff',
                  textTransform: 'none',
                  borderRadius: '50px',
                  padding: '8px 24px',
                  boxShadow: '0 4px 15px rgba(255, 99, 71, 0.3)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    backgroundColor: '#e5533f',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 20px rgba(255, 99, 71, 0.4)',
                  },
                }}
                startIcon={<PersonAddIcon />}
              >
                Registro
              </Button>
            </>
          )}
        </Box>

        {/* Icono del menú para pantallas pequeñas */}
        <IconButton
          sx={{
            display: { xs: 'block', md: 'none' },
            color: '#4a4a4a',
            '&:hover': {
              color: '#ff6347',
            },
          }}
          onClick={() => toggleDrawer(true)}
        >
          <MenuIcon />
        </IconButton>
      </Toolbar>

      {/* Drawer para pantallas pequeñas */}
      <Drawer
        anchor='right'
        open={drawerOpen}
        onClose={() => toggleDrawer(false)}
        PaperProps={{
          sx: {
            width: 280,
            background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
          },
        }}
      >
        <List sx={{ p: 2 }}>
          <ListItemButton
            component={Link}
            to={isAuthenticated && user ? `/perfil/${user.id}` : '/'}
            onClick={() => toggleDrawer(false)}
            sx={{
              borderRadius: '8px',
              mb: 1,
              transition: 'all 0.3s ease',
              '&:hover': {
                backgroundColor: 'rgba(255, 99, 71, 0.1)',
                transform: 'translateX(8px)',
              },
            }}
          >
            <ListItemText
              primary={isAuthenticated ? 'Perfil' : 'Inicio'}
              primaryTypographyProps={{
                sx: {
                  color: '#4a4a4a',
                  fontWeight: isActive(
                    isAuthenticated && user ? `/perfil/${user.id}` : '/'
                  )
                    ? 'bold'
                    : 'normal',
                },
              }}
            />
          </ListItemButton>

          {isAuthenticated && (
            <>
              <ListItemButton
                component={Link}
                to='/directorio'
                onClick={() => toggleDrawer(false)}
                sx={{
                  borderRadius: '8px',
                  mb: 1,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 99, 71, 0.1)',
                    transform: 'translateX(8px)',
                  },
                }}
              >
                <ListItemText
                  primary='Directorio'
                  primaryTypographyProps={{
                    sx: {
                      color: '#4a4a4a',
                      fontWeight: isActive('/directorio') ? 'bold' : 'normal',
                    },
                  }}
                />
              </ListItemButton>

              <ListItemButton
                component={Link}
                to='/foro'
                onClick={() => toggleDrawer(false)}
                sx={{
                  borderRadius: '8px',
                  mb: 1,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 99, 71, 0.1)',
                    transform: 'translateX(8px)',
                  },
                }}
              >
                <ListItemText
                  primary='Foro'
                  primaryTypographyProps={{
                    sx: {
                      color: '#4a4a4a',
                      fontWeight: isActive('/foro') ? 'bold' : 'normal',
                    },
                  }}
                />
              </ListItemButton>

              <ListItemButton
                component={Link}
                to='/zucaria'
                onClick={() => toggleDrawer(false)}
                sx={{
                  borderRadius: '8px',
                  mb: 1,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 99, 71, 0.1)',
                    transform: 'translateX(8px)',
                  },
                }}
              >
                <ListItemText
                  primary='ZucarIA'
                  primaryTypographyProps={{
                    sx: {
                      color: '#4a4a4a',
                      fontWeight: isActive('/zucaria') ? 'bold' : 'normal',
                    },
                  }}
                />
              </ListItemButton>

              <ListItemButton
                component={Link}
                to='/empleos'
                onClick={() => toggleDrawer(false)}
                sx={{
                  borderRadius: '8px',
                  mb: 1,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 99, 71, 0.1)',
                    transform: 'translateX(8px)',
                  },
                }}
              >
                <ListItemText
                  primary='Empleos'
                  primaryTypographyProps={{
                    sx: {
                      color: '#4a4a4a',
                      fontWeight: isActive('/empleos') ? 'bold' : 'normal',
                    },
                  }}
                />
              </ListItemButton>

              <ListItemButton
                component={Link}
                to='/maquinarias'
                onClick={() => toggleDrawer(false)}
                sx={{
                  borderRadius: '8px',
                  mb: 1,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 99, 71, 0.1)',
                    transform: 'translateX(8px)',
                  },
                }}
              >
                <ListItemText
                  primary='Equipos'
                  primaryTypographyProps={{
                    sx: {
                      color: '#4a4a4a',
                      fontWeight: isActive('/maquinarias') ? 'bold' : 'normal',
                    },
                  }}
                />
              </ListItemButton>
            </>
          )}

          {!isAuthenticated && (
            <>
              <ListItemButton
                component={Link}
                to='/services'
                onClick={() => toggleDrawer(false)}
                sx={{
                  borderRadius: '8px',
                  mb: 1,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 99, 71, 0.1)',
                    transform: 'translateX(8px)',
                  },
                }}
              >
                <ListItemText
                  primary='Servicios'
                  primaryTypographyProps={{
                    sx: {
                      color: '#4a4a4a',
                    },
                  }}
                />
              </ListItemButton>
              <ListItemButton
                component={Link}
                to='/empleos'
                onClick={() => toggleDrawer(false)}
                sx={{
                  borderRadius: '8px',
                  mb: 1,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 99, 71, 0.1)',
                    transform: 'translateX(8px)',
                  },
                }}
              >
                <ListItemText
                  primary='Empleos'
                  primaryTypographyProps={{
                    sx: {
                      color: '#4a4a4a',
                      fontWeight: isActive('/empleos') ? 'bold' : 'normal',
                    },
                  }}
                />
              </ListItemButton>
              <ListItemButton
                component={Link}
                to='/maquinarias'
                onClick={() => toggleDrawer(false)}
                sx={{
                  borderRadius: '8px',
                  mb: 1,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 99, 71, 0.1)',
                    transform: 'translateX(8px)',
                  },
                }}
              >
                <ListItemText
                  primary='Equipos'
                  primaryTypographyProps={{
                    sx: {
                      color: '#4a4a4a',
                      fontWeight: isActive('/maquinarias') ? 'bold' : 'normal',
                    },
                  }}
                />
              </ListItemButton>
            </>
          )}

          <ListItemButton
            component={Link}
            to='/contact'
            onClick={() => toggleDrawer(false)}
            sx={{
              borderRadius: '8px',
              mb: 1,
              transition: 'all 0.3s ease',
              '&:hover': {
                backgroundColor: 'rgba(255, 99, 71, 0.1)',
                transform: 'translateX(8px)',
              },
            }}
          >
            <ListItemText
              primary='Contacto'
              primaryTypographyProps={{
                sx: {
                  color: '#4a4a4a',
                  fontWeight: isActive('/contact') ? 'bold' : 'normal',
                },
              }}
            />
          </ListItemButton>

          {isAuthenticated ? (
            <ListItemButton
              onClick={() => {
                logout()
                toggleDrawer(false)
                navigate('/')
              }}
              sx={{
                borderRadius: '8px',
                mb: 1,
                backgroundColor: '#ff6347',
                color: '#fff',
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: '#e5533f',
                  transform: 'translateX(8px)',
                },
              }}
            >
              <ExitToAppIcon sx={{ mr: 2 }} />
              <ListItemText
                primary='Salir'
                primaryTypographyProps={{
                  sx: {
                    color: '#fff',
                  },
                }}
              />
            </ListItemButton>
          ) : (
            <>
              <ListItemButton
                component={Link}
                to='/login'
                onClick={() => toggleDrawer(false)}
                sx={{
                  borderRadius: '8px',
                  mb: 1,
                  border: '2px solid #ff6347',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    backgroundColor: '#ff6347',
                    transform: 'translateX(8px)',
                    '& .MuiListItemText-primary': {
                      color: '#fff',
                    },
                  },
                }}
              >
                <LoginIcon sx={{ mr: 2, color: '#ff6347' }} />
                <ListItemText
                  primary='Ingreso'
                  primaryTypographyProps={{
                    sx: {
                      color: '#4a4a4a',
                    },
                  }}
                />
              </ListItemButton>
              <ListItemButton
                component={Link}
                to='/register'
                onClick={() => toggleDrawer(false)}
                sx={{
                  borderRadius: '8px',
                  mb: 1,
                  backgroundColor: '#ff6347',
                  color: '#fff',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    backgroundColor: '#e5533f',
                    transform: 'translateX(8px)',
                  },
                }}
              >
                <PersonAddIcon sx={{ mr: 2 }} />
                <ListItemText
                  primary='Registro'
                  primaryTypographyProps={{
                    sx: {
                      color: '#fff',
                    },
                  }}
                />
              </ListItemButton>
            </>
          )}
        </List>
      </Drawer>
    </AppBar>
  )
}

export default Navbar
