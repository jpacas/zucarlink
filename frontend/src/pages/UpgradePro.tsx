import React from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import { Link } from 'react-router-dom'
import { useSnackbar } from 'notistack'

const UpgradePro: React.FC = () => {
  const { enqueueSnackbar } = useSnackbar()

  const handleSubscribe = () => {
    enqueueSnackbar('Próximamente disponible', { variant: 'info' })
  }

  const benefits = [
    'ZucarIA ilimitada',
    'Perfil verificado con badge destacado',
    'Acceso a contenido premium',
    'Disponibilidad para consultoría',
  ]

  return (
    <Box
      sx={{
        pt: 10,
        pb: 8,
        minHeight: '100vh',
        bgcolor: 'background.default',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        px: 2,
      }}
    >
      <Typography variant='h4' fontWeight={700} gutterBottom align='center'>
        Ingeniero Pro
      </Typography>
      <Typography
        variant='subtitle1'
        color='text.secondary'
        align='center'
        sx={{ mb: 4, maxWidth: 520 }}
      >
        Accede a las herramientas avanzadas de la red técnica azucarera
      </Typography>

      <Card
        elevation={4}
        sx={{
          maxWidth: 420,
          width: '100%',
          borderRadius: 3,
          border: '2px solid',
          borderColor: 'primary.main',
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Typography variant='h3' fontWeight={800} align='center' color='primary' gutterBottom>
            $15
            <Typography component='span' variant='h6' color='text.secondary' fontWeight={400}>
              {' '}
              / mes
            </Typography>
          </Typography>

          <Divider sx={{ my: 2 }} />

          <List disablePadding>
            {benefits.map((benefit) => (
              <ListItem key={benefit} disableGutters sx={{ py: 0.5 }}>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <CheckCircleIcon color='primary' fontSize='small' />
                </ListItemIcon>
                <ListItemText primary={benefit} />
              </ListItem>
            ))}
          </List>

          <Button
            variant='contained'
            color='primary'
            fullWidth
            size='large'
            onClick={handleSubscribe}
            sx={{ mt: 3, borderRadius: 2, fontWeight: 700 }}
          >
            Suscribirse
          </Button>
        </CardContent>
      </Card>

      <Typography variant='body2' color='text.secondary' sx={{ mt: 4 }}>
        ¿Eres una empresa?{' '}
        <Link to='/services' style={{ textDecoration: 'none', color: 'inherit', fontWeight: 600 }}>
          Ver planes para empresas →
        </Link>
      </Typography>
    </Box>
  )
}

export default UpgradePro
