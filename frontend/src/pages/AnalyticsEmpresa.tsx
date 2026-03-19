import React, { useState, useEffect } from 'react'
import axiosInstance from '../utils/axiosConfig'
import { useAuth } from '../context/AuthContext'
import {
  Box,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  Divider,
  Chip,
} from '@mui/material'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import VisibilityIcon from '@mui/icons-material/Visibility'
import BuildIcon from '@mui/icons-material/Build'
import WorkIcon from '@mui/icons-material/Work'
import BusinessIcon from '@mui/icons-material/Business'

interface AnalyticsItem {
  id: number
  nombre: string
  vistas: number
  createdAt: string
}

interface AnalyticsData {
  proveedor: {
    id: number
    nombre: string
    vistas: number
    estado: string
    planType: string | null
  }
  maquinarias: AnalyticsItem[]
  empleos: AnalyticsItem[]
  totalVistas: number
  resumen: {
    vistasPerfil: number
    vistasMaquinarias: number
    vistasEmpleos: number
  }
}

const StatCard: React.FC<{
  label: string
  value: number
  icon: React.ReactNode
  color: string
}> = ({ label, value, icon, color }) => (
  <Paper
    elevation={2}
    sx={{
      p: 3,
      borderRadius: 3,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 1,
      borderTop: `4px solid ${color}`,
      height: '100%',
    }}
  >
    <Box sx={{ color, display: 'flex', alignItems: 'center' }}>{icon}</Box>
    <Typography variant='h3' fontWeight={700} sx={{ color }}>
      {value.toLocaleString()}
    </Typography>
    <Typography variant='body2' color='text.secondary' textAlign='center'>
      {label}
    </Typography>
  </Paper>
)

const ListingRow: React.FC<{ item: AnalyticsItem; rank: number }> = ({ item, rank }) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      py: 1.5,
      px: 2,
      borderRadius: 2,
      '&:hover': { backgroundColor: 'action.hover' },
    }}
  >
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <Typography
        variant='body2'
        sx={{
          width: 24,
          height: 24,
          borderRadius: '50%',
          backgroundColor: rank <= 3 ? 'primary.main' : 'action.selected',
          color: rank <= 3 ? 'primary.contrastText' : 'text.secondary',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 700,
          fontSize: '0.75rem',
          flexShrink: 0,
        }}
      >
        {rank}
      </Typography>
      <Box>
        <Typography variant='body1' fontWeight={500}>
          {item.nombre}
        </Typography>
        <Typography variant='caption' color='text.secondary'>
          Publicado: {new Date(item.createdAt).toLocaleDateString('es', { day: 'numeric', month: 'short', year: 'numeric' })}
        </Typography>
      </Box>
    </Box>
    <Chip
      icon={<VisibilityIcon sx={{ fontSize: '0.9rem !important' }} />}
      label={item.vistas.toLocaleString()}
      size='small'
      variant='outlined'
      sx={{ fontWeight: 600 }}
    />
  </Box>
)

const AnalyticsEmpresa: React.FC = () => {
  const { user } = useAuth()
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.proveedorId) {
      setLoading(false)
      return
    }
    axiosInstance
      .get(`/analytics/empresa/${user.proveedorId}`)
      .then((r) => setAnalytics(r.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [user])

  if (!user?.proveedorId) {
    return (
      <Box sx={{ pt: 15, textAlign: 'center', px: 3 }}>
        <BusinessIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
        <Typography variant='h6' color='text.secondary'>
          Esta sección es solo para empresas proveedoras
        </Typography>
      </Box>
    )
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', pt: 15 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (!analytics) {
    return (
      <Box sx={{ pt: 15, textAlign: 'center' }}>
        <Typography color='text.secondary'>No se pudieron cargar los datos.</Typography>
      </Box>
    )
  }

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
      <Box sx={{ maxWidth: 900, margin: 'auto' }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
          <TrendingUpIcon sx={{ fontSize: 32, color: 'primary.main' }} />
          <Typography variant='h4' fontWeight={700}>
            Analytics de mi empresa
          </Typography>
        </Box>
        <Typography variant='body1' color='text.secondary' sx={{ mb: 4 }}>
          {analytics.proveedor.nombre} &mdash; rendimiento de visibilidad
        </Typography>

        {/* Total vistas highlight */}
        <Paper
          elevation={3}
          sx={{
            p: 3,
            mb: 4,
            borderRadius: 3,
            background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box>
            <Typography variant='overline' sx={{ opacity: 0.85, letterSpacing: 1.5 }}>
              Total de vistas acumuladas
            </Typography>
            <Typography variant='h2' fontWeight={800}>
              {analytics.totalVistas.toLocaleString()}
            </Typography>
          </Box>
          <VisibilityIcon sx={{ fontSize: 72, opacity: 0.25 }} />
        </Paper>

        {/* Summary cards */}
        <Grid container spacing={3} sx={{ mb: 5 }}>
          <Grid item xs={12} sm={4}>
            <StatCard
              label='Vistas al perfil'
              value={analytics.resumen.vistasPerfil}
              icon={<BusinessIcon sx={{ fontSize: 32 }} />}
              color='#1976d2'
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <StatCard
              label='Vistas maquinarias'
              value={analytics.resumen.vistasMaquinarias}
              icon={<BuildIcon sx={{ fontSize: 32 }} />}
              color='#2e7d32'
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <StatCard
              label='Vistas empleos'
              value={analytics.resumen.vistasEmpleos}
              icon={<WorkIcon sx={{ fontSize: 32 }} />}
              color='#e65100'
            />
          </Grid>
        </Grid>

        {/* Maquinarias list */}
        <Paper elevation={2} sx={{ borderRadius: 3, mb: 4, overflow: 'hidden' }}>
          <Box
            sx={{
              px: 3,
              py: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              backgroundColor: 'action.hover',
            }}
          >
            <BuildIcon color='action' />
            <Typography variant='h6' fontWeight={600}>
              Maquinarias
            </Typography>
            <Chip label={analytics.maquinarias.length} size='small' />
          </Box>
          <Divider />
          {analytics.maquinarias.length === 0 ? (
            <Box sx={{ px: 3, py: 4, textAlign: 'center' }}>
              <Typography color='text.secondary'>No hay maquinarias publicadas aún.</Typography>
            </Box>
          ) : (
            <Box sx={{ py: 1 }}>
              {analytics.maquinarias.map((item, idx) => (
                <React.Fragment key={item.id}>
                  <ListingRow item={item} rank={idx + 1} />
                  {idx < analytics.maquinarias.length - 1 && (
                    <Divider sx={{ mx: 2 }} />
                  )}
                </React.Fragment>
              ))}
            </Box>
          )}
        </Paper>

        {/* Empleos list */}
        <Paper elevation={2} sx={{ borderRadius: 3, overflow: 'hidden' }}>
          <Box
            sx={{
              px: 3,
              py: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              backgroundColor: 'action.hover',
            }}
          >
            <WorkIcon color='action' />
            <Typography variant='h6' fontWeight={600}>
              Empleos
            </Typography>
            <Chip label={analytics.empleos.length} size='small' />
          </Box>
          <Divider />
          {analytics.empleos.length === 0 ? (
            <Box sx={{ px: 3, py: 4, textAlign: 'center' }}>
              <Typography color='text.secondary'>No hay empleos publicados aún.</Typography>
            </Box>
          ) : (
            <Box sx={{ py: 1 }}>
              {analytics.empleos.map((item, idx) => (
                <React.Fragment key={item.id}>
                  <ListingRow item={item} rank={idx + 1} />
                  {idx < analytics.empleos.length - 1 && (
                    <Divider sx={{ mx: 2 }} />
                  )}
                </React.Fragment>
              ))}
            </Box>
          )}
        </Paper>
      </Box>
    </Box>
  )
}

export default AnalyticsEmpresa
