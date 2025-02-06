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
    <Container maxWidth='md' sx={{ mt: 8, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant='h4' gutterBottom color='primary'>
          Términos de Uso
        </Typography>
        <Typography variant='body1' paragraph>
          Bienvenido a Zucarlink. Al utilizar nuestra plataforma, aceptas estos
          Términos de Uso.
        </Typography>

        <Box mt={2}>
          <Typography variant='h5' gutterBottom>
            1. Responsabilidades del Usuario
          </Typography>
          <List>
            <ListItem>
              • No publicar contenido ofensivo, ilegal o engañoso.
            </ListItem>
            <ListItem>• Respetar a los demás usuarios.</ListItem>
            <ListItem>
              • No usar Zucarlink para actividades fraudulentas.
            </ListItem>
          </List>
        </Box>

        <Box mt={2}>
          <Typography variant='h5' gutterBottom>
            2. Propiedad Intelectual
          </Typography>
          <Typography variant='body1' paragraph>
            Todo el contenido de Zucarlink está protegido por derechos de autor.
            No se permite copiar, distribuir o modificar sin autorización.
          </Typography>
        </Box>

        <Box mt={2}>
          <Typography variant='h5' gutterBottom>
            3. Modificaciones en los Términos
          </Typography>
          <Typography variant='body1' paragraph>
            Nos reservamos el derecho de modificar estos términos en cualquier
            momento. Los cambios serán notificados a los usuarios.
          </Typography>
        </Box>

        <Box mt={2}>
          <Typography variant='h5' gutterBottom>
            4. Contacto
          </Typography>
          <Typography variant='body1'>
            Para cualquier consulta sobre los términos de uso, contáctanos en:
            zucarlink@gmail.com.
          </Typography>
        </Box>
      </Paper>
    </Container>
  )
}

export default TerminosUso
