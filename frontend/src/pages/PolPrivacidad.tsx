import React from 'react'
import {
  Container,
  Typography,
  List,
  ListItem,
  Box,
  Paper,
} from '@mui/material'

const PolPrivacidad: React.FC = () => {
  return (
    <Box
      sx={{
        background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
        minHeight: '100vh',
        pt: 10,
        pb: 8,
      }}
    >
      <Container maxWidth='md'>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, md: 6 },
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
          }}
        >
          <Typography
            variant='h3'
            sx={{
              mb: 4,
              fontWeight: 700,
              color: '#1a1a1a',
              letterSpacing: '-0.5px',
              textAlign: 'center',
              position: 'relative',
              '&::after': {
                content: '""',
                display: 'block',
                width: '60px',
                height: '4px',
                backgroundColor: '#ff6347',
                margin: '16px auto',
                borderRadius: '2px',
              },
            }}
          >
            Política de Privacidad
          </Typography>
          <Typography
            variant='body1'
            paragraph
            sx={{
              color: '#4a4a4a',
              lineHeight: 1.7,
              mb: 4,
            }}
          >
            En Zucarlink, nos tomamos en serio la privacidad de nuestros
            usuarios. Esta política describe cómo recopilamos, usamos y
            protegemos tu información personal.
          </Typography>

          <Box mt={4}>
            <Typography
              variant='h5'
              gutterBottom
              sx={{
                color: '#1a1a1a',
                fontWeight: 600,
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
              1. Información que Recopilamos
            </Typography>
            <List sx={{ pl: 2, color: '#4a4a4a' }}>
              <ListItem sx={{ display: 'list-item', listStyleType: 'disc' }}>
                Datos personales como nombre, correo electrónico, país y datos
                de perfil.
              </ListItem>
              <ListItem sx={{ display: 'list-item', listStyleType: 'disc' }}>
                Información sobre interacciones dentro de la plataforma.
              </ListItem>
              <ListItem sx={{ display: 'list-item', listStyleType: 'disc' }}>
                Datos de navegación, cookies y preferencias de usuario.
              </ListItem>
            </List>
          </Box>

          <Box mt={4}>
            <Typography
              variant='h5'
              gutterBottom
              sx={{
                color: '#1a1a1a',
                fontWeight: 600,
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
              2. Uso de la Información
            </Typography>
            <Typography
              variant='body1'
              paragraph
              sx={{
                color: '#4a4a4a',
                lineHeight: 1.7,
              }}
            >
              Utilizamos los datos recopilados para personalizar la experiencia
              del usuario, conectar usuarios y mejorar la seguridad.
            </Typography>
          </Box>

          <Box mt={4}>
            <Typography
              variant='h5'
              gutterBottom
              sx={{
                color: '#1a1a1a',
                fontWeight: 600,
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
              3. Protección y Almacenamiento de Datos
            </Typography>
            <Typography
              variant='body1'
              paragraph
              sx={{
                color: '#4a4a4a',
                lineHeight: 1.7,
              }}
            >
              Implementamos medidas de seguridad y no compartimos datos con
              terceros sin consentimiento, salvo requerimientos legales.
            </Typography>
          </Box>

          <Box mt={4}>
            <Typography
              variant='h5'
              gutterBottom
              sx={{
                color: '#1a1a1a',
                fontWeight: 600,
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
              4. Derechos del Usuario
            </Typography>
            <Typography
              variant='body1'
              paragraph
              sx={{
                color: '#4a4a4a',
                lineHeight: 1.7,
              }}
            >
              Los usuarios pueden acceder, corregir o eliminar su información
              personal.
            </Typography>
          </Box>

          <Box mt={4}>
            <Typography
              variant='h5'
              gutterBottom
              sx={{
                color: '#1a1a1a',
                fontWeight: 600,
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
              5. Cambios en la Política
            </Typography>
            <Typography
              variant='body1'
              paragraph
              sx={{
                color: '#4a4a4a',
                lineHeight: 1.7,
              }}
            >
              Zucarlink puede actualizar esta política y notificará a los
              usuarios.
            </Typography>
          </Box>

          <Box mt={4}>
            <Typography
              variant='h5'
              gutterBottom
              sx={{
                color: '#1a1a1a',
                fontWeight: 600,
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
              6. Contacto
            </Typography>
            <Typography
              variant='body1'
              sx={{
                color: '#4a4a4a',
                lineHeight: 1.7,
              }}
            >
              Si tienes dudas, contáctanos en: zucarlink@gmail.com.
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  )
}

export default PolPrivacidad
