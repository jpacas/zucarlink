import React from 'react'
import {
  Box,
  Typography,
  IconButton,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  FormControlLabel,
  Checkbox,
  Button,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import DeleteIcon from '@mui/icons-material/Delete'
import { Experience, Ingenio } from '../types/interfaces'

interface ExperienceModalProps {
  experienceData: Experience
  setExperienceData: (data: Experience) => void
  paises: string[]
  ingenios: Ingenio[]
  areas: string[]
  onSave: () => void
  onClose: () => void
  onDelete?: () => void
  formatDate: (date: string) => string
}

const ExperienceModal: React.FC<ExperienceModalProps> = ({
  experienceData,
  setExperienceData,
  paises,
  ingenios,
  areas,
  onSave,
  onClose,
  onDelete,
  formatDate,
}) => {
  return (
    <Box
      sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 600,
        bgcolor: 'background.paper',
        borderRadius: 2,
        boxShadow: 24,
        p: 4,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
        }}
      >
        <Typography variant='h6' component='h2' sx={{ fontWeight: 'bold' }}>
          {experienceData.id
            ? 'Editar Experiencia'
            : 'Agregar Experiencia Laboral'}
        </Typography>
        <IconButton onClick={onClose} sx={{ color: 'gray' }}>
          <CloseIcon />
        </IconButton>
      </Box>

      <Divider sx={{ mb: 2 }} />

      <FormControl fullWidth margin='dense'>
        <InputLabel>País</InputLabel>
        <Select
          value={experienceData.pais || ''}
          label='País'
          onChange={(e) =>
            setExperienceData({
              ...experienceData,
              pais: e.target.value,
              ingenio: '',
            })
          }
        >
          {paises.map((pais) => (
            <MenuItem key={pais} value={pais}>
              {pais}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl fullWidth margin='dense' disabled={!experienceData.pais}>
        <InputLabel>Ingenio</InputLabel>
        <Select
          value={experienceData.ingenio || ''}
          label='Ingenio'
          onChange={(e) =>
            setExperienceData({
              ...experienceData,
              ingenio: e.target.value,
            })
          }
        >
          {ingenios
            .filter((ingenio) => ingenio.pais === experienceData.pais)
            .map((ingenio) => (
              <MenuItem key={ingenio.nombre} value={ingenio.nombre}>
                {ingenio.nombre}
              </MenuItem>
            ))}
        </Select>
      </FormControl>

      <TextField
        fullWidth
        type='date'
        label='Fecha de Inicio'
        InputLabelProps={{ shrink: true }}
        margin='dense'
        value={
          experienceData.fechaInicio
            ? formatDate(experienceData.fechaInicio)
            : ''
        }
        onChange={(e) =>
          setExperienceData({
            ...experienceData,
            fechaInicio: e.target.value,
          })
        }
      />

      <FormControlLabel
        control={
          <Checkbox
            checked={experienceData.actualmenteTrabaja}
            onChange={(e) =>
              setExperienceData({
                ...experienceData,
                actualmenteTrabaja: e.target.checked,
                fechaFin: '',
              })
            }
          />
        }
        label='Actualmente trabajo aquí'
      />

      <TextField
        fullWidth
        type='date'
        label='Fecha de Fin'
        InputLabelProps={{ shrink: true }}
        margin='dense'
        value={
          experienceData.fechaFin ? formatDate(experienceData.fechaFin) : ''
        }
        onChange={(e) => {
          if (
            experienceData.fechaInicio &&
            e.target.value < experienceData.fechaInicio
          ) {
            alert('La fecha de fin no puede ser anterior a la fecha de inicio.')
            return
          }
          setExperienceData({
            ...experienceData,
            fechaFin: e.target.value,
          })
        }}
        disabled={experienceData.actualmenteTrabaja}
      />

      <TextField
        fullWidth
        label='Cargo'
        margin='dense'
        value={experienceData.cargo}
        onChange={(e) =>
          setExperienceData({
            ...experienceData,
            cargo: e.target.value,
          })
        }
      />

      <FormControl fullWidth margin='dense'>
        <InputLabel>Área de Trabajo</InputLabel>
        <Select
          value={experienceData.area || ''}
          label='Área de Trabajo'
          onChange={(e) =>
            setExperienceData({
              ...experienceData,
              area: e.target.value,
            })
          }
        >
          {areas.map((area) => (
            <MenuItem key={area} value={area}>
              {area}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <TextField
        fullWidth
        label='Descripción'
        margin='dense'
        multiline
        rows={3}
        value={experienceData.acercaDe}
        onChange={(e) =>
          setExperienceData({
            ...experienceData,
            acercaDe: e.target.value,
          })
        }
      />

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
        <Button variant='contained' color='primary' onClick={onSave}>
          {experienceData.id ? 'Guardar Cambios' : 'Agregar Experiencia'}
        </Button>

        {experienceData.id && onDelete && (
          <IconButton color='error' onClick={onDelete}>
            <DeleteIcon />
          </IconButton>
        )}
      </Box>
    </Box>
  )
}

export default ExperienceModal
