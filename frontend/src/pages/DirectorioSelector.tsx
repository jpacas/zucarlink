import React from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Container,
  Button,
} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import BusinessIcon from '@mui/icons-material/Business'
import GroupIcon from '@mui/icons-material/Group'
import LocalShippingIcon from '@mui/icons-material/LocalShipping'
import LockIcon from '@mui/icons-material/Lock'
import { useAuth } from '../context/AuthContext'

const DirectorioSelector: React.FC = () => {
  const navigate = useNavigate()
  const { user: currentUser } = useAuth()

  const options = [
    {
      title: 'Ingenios',
      icon: <BusinessIcon sx={{ fontSize: 60 }} />,
      path: '/directorio/ingenios',
      description: 'Explora el directorio de ingenios azucareros',
      disabled: false,
    },
    {
      title: 'Proveedores',
      icon: <LocalShippingIcon sx={{ fontSize: 60 }} />,
      path: '/directorio/proveedores',
      description: 'Descubre proveedores del sector azucarero',
      disabled: false,
    },
    {
      title: 'Usuarios',
      icon: <GroupIcon sx={{ fontSize: 60 }} />,
      path: '/directorio/usuarios',
      description: 'Conecta con profesionales del sector',
      disabled: !currentUser,
    },
  ]

  return (
    <Box
      sx={{
        backgroundColor: 'background.default',
        minHeight: '100vh',
        pt: 10,
        pb: 8,
      }}
    >
      <Container maxWidth='lg'>
        <Typography
          variant='h3'
          align='center'
          sx={{
            mb: 6,
            fontWeight: 700,
            color: 'text.primary',
            letterSpacing: '-0.5px',
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
          Directorio
        </Typography>
        <Grid container spacing={4} justifyContent='center'>
          {options.map((option) => (
            <Grid item xs={12} sm={6} md={4} key={option.title}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: option.disabled ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  backgroundColor: 'background.paper',
                  border: '1px solid',
                  borderColor: 'divider',
                  boxShadow: '0 8px 24px rgba(16, 24, 40, 0.08)',
                  opacity: option.disabled ? 0.7 : 1,
                  '&:hover': {
                    transform: option.disabled ? 'none' : 'translateY(-8px)',
                    boxShadow: option.disabled
                      ? '0 8px 24px rgba(16, 24, 40, 0.08)'
                      : '0 12px 28px rgba(16, 24, 40, 0.12)',
                  },
                }}
                onClick={() => {
                  if (!option.disabled) {
                    navigate(option.path)
                  }
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
                  <Box
                    sx={{
                      color: 'primary.main',
                      mb: 3,
                      transition: 'transform 0.3s ease',
                      '&:hover': {
                        transform: option.disabled ? 'none' : 'rotate(10deg)',
                      },
                    }}
                  >
                    {option.icon}
                  </Box>
                  <Typography
                    variant='h5'
                    component='h2'
                    sx={{
                      mb: 2,
                      fontWeight: 600,
                      color: 'text.primary',
                    }}
                  >
                    {option.title}
                    {option.disabled && (
                      <LockIcon
                        sx={{
                          ml: 1,
                          fontSize: 20,
                          color: 'primary.main',
                          verticalAlign: 'middle',
                        }}
                      />
                    )}
                  </Typography>
                  <Typography
                    variant='body1'
                    sx={{
                      color: 'text.secondary',
                      lineHeight: 1.7,
                    }}
                  >
                    {option.description}
                  </Typography>
                  {option.disabled && (
                    <Button
                      variant='contained'
                      onClick={(e) => {
                        e.stopPropagation()
                        navigate('/login')
                      }}
                      sx={{
                        mt: 2,
                        transition: 'all 0.3s ease',
                        '&:hover': { transform: 'translateY(-2px)' },
                      }}
                    >
                      Iniciar Sesión
                    </Button>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  )
}

export default DirectorioSelector
