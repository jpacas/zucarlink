import React from 'react'
import {
  Box,
  Button,
  Typography,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material'
import {
  CheckCircleOutline,
  Factory,
  Business,
  Store,
} from '@mui/icons-material'

interface UserTypeSelectorProps {
  onSelect: (userType: 'ingenio' | 'proveedor' | 'empresa_proveedora') => void
}

const userTypes = [
  {
    type: 'ingenio' as const,
    title: 'Usuarios de Ingenios',
    description:
      'Personal que trabaja en ingenios azucareros. Debes de registrarte con tu correo profesional.',
    icon: Factory,
    features: [
      'Acceso a ZucarIA',
      'Compra/Venta de equipos',
      'Foro técnico',
      'Directorios azucareros',
    ],
  },
  {
    type: 'empresa_proveedora' as const,
    title: 'Empresas Proveedoras',
    description:
      'Empresas que proporcionan servicios y productos al sector azucarero.',
    icon: Business,
    features: [
      'Perfil de empresa destacado',
      'Listado en el directorio',
      'Publicación de ofertas',
      'Acceso a foro técnico',
    ],
  },
  {
    type: 'proveedor' as const,
    title: 'Usuarios de Empresas Proveedoras',
    description: 'Personal de empresas proveedoras del sector azucarero.',
    icon: Store,
    features: [
      'Acceso a ZucarIA',
      'Compra/Venta de equipos',
      'Foro técnico',
      'Directorios azucareros',
    ],
  },
]

const UserTypeSelector: React.FC<UserTypeSelectorProps> = ({ onSelect }) => {
  return (
    <Box>
      <Typography
        variant='h4'
        textAlign='center'
        mb={2}
        sx={{
          color: 'text.primary',
          fontWeight: 700,
          letterSpacing: '-0.5px',
        }}
      >
        Únete a Zucarlink
      </Typography>
      <Typography
        variant='body1'
        textAlign='center'
        mb={6}
        color='text.secondary'
        sx={{ maxWidth: 600, margin: '0 auto 48px' }}
      >
        Selecciona el tipo de usuario que mejor se ajuste a tu perfil
      </Typography>

      <Grid container spacing={4}>
        {userTypes.map(({ type, title, description, icon: Icon, features }) => (
          <Grid item xs={12} md={4} key={type}>
            <Box
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'visible',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  '& .MuiCardContent-root': {
                    boxShadow: '0 12px 40px rgba(0,0,0,0.12)',
                  },
                },
              }}
            >
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 3,
                  overflow: 'visible',
                  background: 'transparent',
                  boxShadow: 'none',
                }}
              >
                <CardContent
                  sx={{
                    flexGrow: 1,
                    textAlign: 'center',
                    p: 4,
                    borderRadius: 3,
                    transition: 'all 0.3s ease',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                    backgroundColor: '#fff',
                    border: '1px solid',
                    borderColor: 'primary.light',
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                  }}
                >
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      backgroundColor: 'primary.light',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 24px',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'rotate(10deg)',
                        backgroundColor: 'primary.main',
                      },
                    }}
                  >
                    <Icon sx={{ fontSize: 40, color: '#fff' }} />
                  </Box>
                  <Typography
                    variant='h5'
                    gutterBottom
                    fontWeight='bold'
                    color='primary.main'
                    sx={{ mb: 2 }}
                  >
                    {title}
                  </Typography>
                  <Typography
                    variant='body1'
                    color='text.secondary'
                    paragraph
                    sx={{ mb: 3, flexGrow: 1 }}
                  >
                    {description}
                  </Typography>
                  <List sx={{ mb: 3, flexGrow: 1 }}>
                    {features.map((feature) => (
                      <ListItem key={feature} sx={{ py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <CheckCircleOutline
                            color='primary'
                            fontSize='small'
                            sx={{
                              color: 'primary.main',
                              opacity: 0.8,
                              '&:hover': {
                                opacity: 1,
                              },
                            }}
                          />
                        </ListItemIcon>
                        <ListItemText primary={feature} />
                      </ListItem>
                    ))}
                  </List>
                  <Button
                    variant='contained'
                    color='primary'
                    fullWidth
                    size='large'
                    onClick={() => onSelect(type)}
                    sx={{
                      py: 1.5,
                      borderRadius: 2,
                      textTransform: 'none',
                      fontSize: '1.1rem',
                      fontWeight: 'bold',
                      boxShadow: 2,
                      backgroundColor: 'primary.light',
                      '&:hover': {
                        boxShadow: 4,
                        backgroundColor: 'primary.main',
                      },
                    }}
                  >
                    Registrarse
                  </Button>
                </CardContent>
              </Card>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}

export default UserTypeSelector
