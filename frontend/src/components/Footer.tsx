import React from 'react'
import { Link as RouterLink } from 'react-router-dom'
import {
  Box,
  Container,
  Typography,
  Link,
  Grid,
  IconButton,
  Stack,
} from '@mui/material'
import FacebookIcon from '@mui/icons-material/Facebook'
import TwitterIcon from '@mui/icons-material/Twitter'
import InstagramIcon from '@mui/icons-material/Instagram'
import LinkedInIcon from '@mui/icons-material/LinkedIn'

const Footer: React.FC = () => {
  return (
    <Box
      component='footer'
      sx={{
        backgroundColor: 'background.paper',
        borderTop: '1px solid',
        borderColor: 'divider',
        pt: 6,
        pb: 3,
        mt: 'auto',
      }}
    >
      <Container maxWidth='lg'>
        <Grid container spacing={4} justifyContent='space-between'>
          {/* Sección de Contacto */}
          <Grid item xs={12} sm={4}>
            <Typography
              variant='h6'
              sx={{
                color: 'text.primary',
                fontWeight: 700,
                mb: 2,
                position: 'relative',
                '&::after': {
                  content: '""',
                  display: 'block',
                  width: '40px',
                  height: '3px',
                  backgroundColor: 'primary.main',
                  mt: 1,
                  borderRadius: '2px',
                },
              }}
            >
              Contáctanos
            </Typography>
            <Typography
              variant='body2'
              sx={{
                color: 'text.secondary',
                lineHeight: 1.7,
                transition: 'color 0.3s ease',
                '&:hover': {
                  color: 'primary.main',
                },
              }}
            >
              Email: zucarlink@gmail.com
            </Typography>
          </Grid>

          {/* Sección de Enlaces */}
          <Grid item xs={12} sm={4}>
            <Typography
              variant='h6'
              sx={{
                color: 'text.primary',
                fontWeight: 700,
                mb: 2,
                position: 'relative',
                '&::after': {
                  content: '""',
                  display: 'block',
                  width: '40px',
                  height: '3px',
                  backgroundColor: 'primary.main',
                  mt: 1,
                  borderRadius: '2px',
                },
              }}
            >
              Enlaces
            </Typography>
            <Stack spacing={1}>
              <Link
                component={RouterLink}
                to='/privacidad'
                sx={{
                  color: 'text.secondary',
                  textDecoration: 'none',
                  transition: 'color 0.3s ease',
                  '&:hover': {
                    color: 'primary.main',
                  },
                }}
              >
                Política de Privacidad
              </Link>
              <Link
                component={RouterLink}
                to='/uso'
                sx={{
                  color: 'text.secondary',
                  textDecoration: 'none',
                  transition: 'color 0.3s ease',
                  '&:hover': {
                    color: 'primary.main',
                  },
                }}
              >
                Términos de Uso
              </Link>
            </Stack>
          </Grid>

          {/* Sección de Redes Sociales */}
          <Grid item xs={12} sm={4}>
            <Typography
              variant='h6'
              sx={{
                color: 'text.primary',
                fontWeight: 700,
                mb: 2,
                position: 'relative',
                '&::after': {
                  content: '""',
                  display: 'block',
                  width: '40px',
                  height: '3px',
                  backgroundColor: 'primary.main',
                  mt: 1,
                  borderRadius: '2px',
                },
              }}
            >
              Síguenos
            </Typography>
            <Stack direction='row' spacing={1}>
              <IconButton
                href='https://www.facebook.com/ZucarLink'
                target='_blank'
                rel='noopener noreferrer'
                sx={{
                  color: 'text.secondary',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    color: 'primary.main',
                    transform: 'translateY(-3px)',
                  },
                }}
              >
                <FacebookIcon />
              </IconButton>
              <IconButton
                href='https://x.com/ZucarLink'
                target='_blank'
                rel='noopener noreferrer'
                sx={{
                  color: 'text.secondary',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    color: 'primary.main',
                    transform: 'translateY(-3px)',
                  },
                }}
              >
                <TwitterIcon />
              </IconButton>
              <IconButton
                href='https://www.instagram.com/zucarlink'
                target='_blank'
                rel='noopener noreferrer'
                sx={{
                  color: 'text.secondary',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    color: 'primary.main',
                    transform: 'translateY(-3px)',
                  },
                }}
              >
                <InstagramIcon />
              </IconButton>
              <IconButton
                href='https://www.linkedin.com/company/zucarlink'
                target='_blank'
                rel='noopener noreferrer'
                sx={{
                  color: 'text.secondary',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    color: 'primary.main',
                    transform: 'translateY(-3px)',
                  },
                }}
              >
                <LinkedInIcon />
              </IconButton>
            </Stack>
          </Grid>
        </Grid>

        {/* Copyright */}
        <Typography
          variant='body2'
          align='center'
          sx={{
            mt: 4,
            pt: 3,
            borderTop: '1px solid rgba(0,0,0,0.1)',
            color: 'text.secondary',
          }}
        >
          © {new Date().getFullYear()} Zucarlink. Todos los derechos reservados.
        </Typography>
      </Container>
    </Box>
  )
}

export default Footer
