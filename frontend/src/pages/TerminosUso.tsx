import React from 'react'
import {
  Container,
  Typography,
  List,
  ListItem,
  Box,
  Paper,
} from '@mui/material'

const TerminosUso: React.FC = () => {
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
            Términos de Uso
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
            Bienvenido a Zucarlink. Al utilizar nuestra plataforma, aceptas
            estos Términos de Uso.
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
              1. Responsabilidades del Usuario
            </Typography>
            <List sx={{ pl: 2, color: '#4a4a4a' }}>
              <ListItem sx={{ display: 'list-item', listStyleType: 'disc' }}>
                No publicar contenido ofensivo, ilegal o engañoso.
              </ListItem>
              <ListItem sx={{ display: 'list-item', listStyleType: 'disc' }}>
                Respetar a los demás usuarios.
              </ListItem>
              <ListItem sx={{ display: 'list-item', listStyleType: 'disc' }}>
                No usar Zucarlink para actividades fraudulentas.
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
              2. Propiedad Intelectual
            </Typography>
            <Typography
              variant='body1'
              paragraph
              sx={{
                color: '#4a4a4a',
                lineHeight: 1.7,
              }}
            >
              Todo el contenido de Zucarlink está protegido por derechos de
              autor. No se permite copiar, distribuir o modificar sin
              autorización.
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
              3. Modificaciones en los Términos
            </Typography>
            <Typography
              variant='body1'
              paragraph
              sx={{
                color: '#4a4a4a',
                lineHeight: 1.7,
              }}
            >
              Nos reservamos el derecho de modificar estos términos en cualquier
              momento. Los cambios serán notificados a los usuarios.
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
              4. Contacto
            </Typography>
            <Typography
              variant='body1'
              sx={{
                color: '#4a4a4a',
                lineHeight: 1.7,
              }}
            >
              Para cualquier consulta sobre los términos de uso, contáctanos en:
              zucarlink@gmail.com.
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  )
}

export default TerminosUso
