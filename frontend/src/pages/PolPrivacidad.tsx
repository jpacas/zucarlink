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
    <Container maxWidth='md' sx={{ mt: 8, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant='h4' gutterBottom color='primary'>
          Política de Privacidad
        </Typography>
        <Typography variant='body1' paragraph>
          En Zucarlink, nos tomamos en serio la privacidad de nuestros usuarios.
          Esta política describe cómo recopilamos, usamos y protegemos tu
          información personal.
        </Typography>

        <Box mt={2}>
          <Typography variant='h5' gutterBottom>
            1. Información que Recopilamos
          </Typography>
          <List>
            <ListItem>
              • Datos personales como nombre, correo electrónico, país y datos
              de perfil.
            </ListItem>
            <ListItem>
              • Información sobre interacciones dentro de la plataforma.
            </ListItem>
            <ListItem>
              • Datos de navegación, cookies y preferencias de usuario.
            </ListItem>
          </List>
        </Box>

        <Box mt={2}>
          <Typography variant='h5' gutterBottom>
            2. Uso de la Información
          </Typography>
          <Typography variant='body1' paragraph>
            Utilizamos los datos recopilados para personalizar la experiencia
            del usuario, conectar usuarios y mejorar la seguridad.
          </Typography>
        </Box>

        <Box mt={2}>
          <Typography variant='h5' gutterBottom>
            3. Protección y Almacenamiento de Datos
          </Typography>
          <Typography variant='body1' paragraph>
            Implementamos medidas de seguridad y no compartimos datos con
            terceros sin consentimiento, salvo requerimientos legales.
          </Typography>
        </Box>

        <Box mt={2}>
          <Typography variant='h5' gutterBottom>
            4. Derechos del Usuario
          </Typography>
          <Typography variant='body1' paragraph>
            Los usuarios pueden acceder, corregir o eliminar su información
            personal.
          </Typography>
        </Box>

        <Box mt={2}>
          <Typography variant='h5' gutterBottom>
            5. Cambios en la Política
          </Typography>
          <Typography variant='body1' paragraph>
            Zucarlink puede actualizar esta política y notificará a los
            usuarios.
          </Typography>
        </Box>

        <Box mt={2}>
          <Typography variant='h5' gutterBottom>
            6. Contacto
          </Typography>
          <Typography variant='body1'>
            Si tienes dudas, contáctanos en: zucarlink@gmail.com.
          </Typography>
        </Box>
      </Paper>
    </Container>
  )
}

export default PolPrivacidad
