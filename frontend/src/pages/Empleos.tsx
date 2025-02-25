import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Dialog,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import { useSnackbar } from 'notistack'

interface Empleo {
  id: number
  titulo: string
  empresa: string
  ubicacion: string
  tipoContrato: string
  salario: string
  descripcion: string
  requisitos: string
  contacto: string
  usuarioId: number
  createdAt: string
  autor: {
    id: number
    nombre: string
    apellido: string
    avatarUrl: string
  }
}

const Empleos: React.FC = () => {
  const [empleos, setEmpleos] = useState<Empleo[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const { user } = useAuth()
  const { enqueueSnackbar } = useSnackbar()
  const navigate = useNavigate()

  const fetchEmpleos = async () => {
    try {
      setLoading(true)
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/empleos`
      )
      setEmpleos(response.data)
    } catch (error) {
      console.error('Error al cargar empleos:', error)
      enqueueSnackbar('Error al cargar los empleos', { variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEmpleos()
  }, [])

  return (
    <Box sx={{ padding: 3, marginTop: '64px' }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Typography variant='h4'>Ofertas de Empleo</Typography>
        <Button variant='contained' onClick={() => setModalOpen(true)}>
          Publicar Oferta
        </Button>
      </Box>

      <Grid container spacing={3}>
        {empleos.map((empleo) => (
          <Grid item xs={12} sm={6} md={4} key={empleo.id}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer',
                '&:hover': { boxShadow: 6 },
              }}
              onClick={() => navigate(`/empleos/${empleo.id}`)}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant='h6' gutterBottom>
                  {empleo.titulo}
                </Typography>
                <Typography variant='subtitle1' color='primary'>
                  {empleo.empresa}
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  {empleo.ubicacion}
                </Typography>
                <Typography variant='body2' sx={{ mt: 1 }}>
                  {empleo.tipoContrato}
                </Typography>
                {empleo.salario && (
                  <Typography
                    variant='body2'
                    sx={{ fontWeight: 'bold', mt: 1 }}
                  >
                    Salario: {empleo.salario}
                  </Typography>
                )}
                <Typography
                  variant='body2'
                  sx={{
                    mt: 2,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                  }}
                >
                  {empleo.descripcion}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Implementar el modal para crear ofertas */}
    </Box>
  )
}

export default Empleos
