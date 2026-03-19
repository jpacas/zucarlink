import React, { useState, useEffect } from 'react'
import { useParams, Link as RouterLink } from 'react-router-dom'
import axiosInstance from '../utils/axiosConfig'
import {
  Box,
  Typography,
  Avatar,
  Chip,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  CircularProgress,
  Divider,
  Stack,
} from '@mui/material'
import StarIcon from '@mui/icons-material/Star'
import WorkIcon from '@mui/icons-material/Work'
import PlaceIcon from '@mui/icons-material/Place'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import ForumIcon from '@mui/icons-material/Forum'

interface Post {
  id: number | string
  titulo: string
  slug?: string
  views: number
  createdAt: string
}

interface Profile {
  id: string
  nombre: string
  apellido: string
  username: string
  avatarUrl?: string
  acercaDe?: string
  especialidad?: string
  disponibilidadConsultoria: boolean
  reputacion: number
  planType: 'free' | 'pro'
  createdAt: string
  area?: { nombre: string }
  pais?: { nombre: string }
  ingenio?: { nombre: string }
  posts: Post[]
}

const PerfilPublico: React.FC = () => {
  const { username } = useParams<{ username: string }>()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axiosInstance
      .get(`/users/public/${username}`)
      .then((r) => setProfile(r.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [username])

  if (loading)
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', pt: 15 }}>
        <CircularProgress />
      </Box>
    )

  if (!profile)
    return (
      <Box sx={{ pt: 15, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          Usuario no encontrado
        </Typography>
      </Box>
    )

  const memberSince = new Date(profile.createdAt).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
  })

  return (
    <Box
      sx={{
        backgroundColor: 'background.default',
        minHeight: '100vh',
        pt: 10,
        pb: 8,
        px: 3,
      }}
    >
      <Box sx={{ maxWidth: 800, margin: 'auto' }}>
        {/* Profile header */}
        <Paper sx={{ p: 4, mb: 3, borderRadius: 2 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems={{ xs: 'center', sm: 'flex-start' }}>
            <Avatar
              src={profile.avatarUrl}
              alt={`${profile.nombre} ${profile.apellido}`}
              sx={{ width: 100, height: 100, flexShrink: 0 }}
            />
            <Box sx={{ flex: 1, minWidth: 0 }}>
              {/* Name + badges */}
              <Stack direction="row" alignItems="center" flexWrap="wrap" gap={1} mb={0.5}>
                <Typography variant="h5" fontWeight={700}>
                  {profile.nombre} {profile.apellido}
                </Typography>
                {profile.planType === 'pro' && (
                  <Chip label="Pro" color="primary" size="small" sx={{ fontWeight: 700 }} />
                )}
                {profile.disponibilidadConsultoria && (
                  <Chip
                    label="Disponible para consultoría"
                    color="success"
                    size="small"
                    variant="outlined"
                  />
                )}
              </Stack>

              {/* Username */}
              <Typography variant="body2" color="text.secondary" mb={1.5}>
                @{profile.username}
              </Typography>

              {/* Speciality */}
              {profile.especialidad && (
                <Stack direction="row" alignItems="center" spacing={0.5} mb={1}>
                  <WorkIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    {profile.especialidad}
                  </Typography>
                </Stack>
              )}

              {/* Meta info row */}
              <Stack direction="row" flexWrap="wrap" gap={2} mb={1.5}>
                {profile.ingenio && (
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    <WorkIcon fontSize="small" sx={{ color: 'text.disabled' }} />
                    <Typography variant="body2" color="text.secondary">
                      {profile.ingenio.nombre}
                    </Typography>
                  </Stack>
                )}
                {profile.pais && (
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    <PlaceIcon fontSize="small" sx={{ color: 'text.disabled' }} />
                    <Typography variant="body2" color="text.secondary">
                      {profile.pais.nombre}
                    </Typography>
                  </Stack>
                )}
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <StarIcon fontSize="small" sx={{ color: 'warning.main' }} />
                  <Typography variant="body2" color="text.secondary">
                    {profile.reputacion} puntos de reputación
                  </Typography>
                </Stack>
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <CalendarTodayIcon fontSize="small" sx={{ color: 'text.disabled' }} />
                  <Typography variant="body2" color="text.secondary">
                    Miembro desde {memberSince}
                  </Typography>
                </Stack>
              </Stack>
            </Box>
          </Stack>

          {/* Bio */}
          {profile.acercaDe && (
            <>
              <Divider sx={{ my: 3 }} />
              <Typography variant="body1" color="text.primary" sx={{ lineHeight: 1.7 }}>
                {profile.acercaDe}
              </Typography>
            </>
          )}
        </Paper>

        {/* Top posts section */}
        {profile.posts && profile.posts.length > 0 && (
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Stack direction="row" alignItems="center" spacing={1} mb={2}>
              <ForumIcon color="primary" />
              <Typography variant="h6" fontWeight={600}>
                Posts destacados
              </Typography>
            </Stack>
            <Divider sx={{ mb: 1 }} />
            <List disablePadding>
              {profile.posts.map((post, index) => {
                const postPath = post.slug
                  ? `/foro/post/${post.slug}`
                  : `/foro/post/${post.id}`
                return (
                  <React.Fragment key={post.id}>
                    {index > 0 && <Divider component="li" />}
                    <ListItem disablePadding>
                      <ListItemButton
                        component={RouterLink}
                        to={postPath}
                        sx={{ borderRadius: 1, py: 1.5 }}
                      >
                        <ListItemText
                          primary={post.titulo}
                          secondary={`${post.views} vistas · ${new Date(post.createdAt).toLocaleDateString('es-ES')}`}
                          primaryTypographyProps={{ fontWeight: 500 }}
                          secondaryTypographyProps={{ variant: 'caption' }}
                        />
                      </ListItemButton>
                    </ListItem>
                  </React.Fragment>
                )
              })}
            </List>
          </Paper>
        )}
      </Box>
    </Box>
  )
}

export default PerfilPublico
