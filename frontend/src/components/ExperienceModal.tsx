import { forwardRef } from 'react'
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

const ExperienceModal = forwardRef<HTMLDivElement, ExperienceModalProps>(
  function ExperienceModal(
    {
      experienceData,
      setExperienceData,
      paises,
      ingenios,
      areas,
      onSave,
      onClose,
      onDelete,
      formatDate,
    },
    ref
  ) {
    return (
      <Box
        ref={ref}
        tabIndex={-1}
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: { xs: '90%', sm: 600 },
          maxHeight: '90vh',
          overflowY: 'auto',
          bgcolor: '#fff',
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
          p: 4,
          outline: 'none',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 3,
          }}
        >
          <Typography
            variant='h5'
            sx={{
              fontWeight: 700,
              color: '#1a1a1a',
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
            {experienceData.id ? 'Editar Experiencia' : 'Agregar Experiencia'}
          </Typography>
          <IconButton
            onClick={onClose}
            sx={{
              color: '#4a4a4a',
              '&:hover': {
                backgroundColor: '#ff634710',
                color: '#ff6347',
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>

        <Divider sx={{ mb: 3 }} />

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
            sx={{
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#e0e0e0',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: '#ff6347',
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: '#ff6347',
              },
            }}
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
            sx={{
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#e0e0e0',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: '#ff6347',
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: '#ff6347',
              },
            }}
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
          sx={{
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: '#e0e0e0',
              },
              '&:hover fieldset': {
                borderColor: '#ff6347',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#ff6347',
              },
            },
            '& .MuiInputLabel-root.Mui-focused': {
              color: '#ff6347',
            },
          }}
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
              sx={{
                color: '#e0e0e0',
                '&.Mui-checked': {
                  color: '#ff6347',
                },
              }}
            />
          }
          label='Actualmente trabajo aquí'
          sx={{ my: 1 }}
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
              alert(
                'La fecha de fin no puede ser anterior a la fecha de inicio.'
              )
              return
            }
            setExperienceData({
              ...experienceData,
              fechaFin: e.target.value,
            })
          }}
          disabled={experienceData.actualmenteTrabaja}
          sx={{
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: '#e0e0e0',
              },
              '&:hover fieldset': {
                borderColor: '#ff6347',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#ff6347',
              },
            },
            '& .MuiInputLabel-root.Mui-focused': {
              color: '#ff6347',
            },
          }}
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
          sx={{
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: '#e0e0e0',
              },
              '&:hover fieldset': {
                borderColor: '#ff6347',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#ff6347',
              },
            },
            '& .MuiInputLabel-root.Mui-focused': {
              color: '#ff6347',
            },
          }}
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
            sx={{
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#e0e0e0',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: '#ff6347',
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: '#ff6347',
              },
            }}
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
          sx={{
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: '#e0e0e0',
              },
              '&:hover fieldset': {
                borderColor: '#ff6347',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#ff6347',
              },
            },
            '& .MuiInputLabel-root.Mui-focused': {
              color: '#ff6347',
            },
          }}
        />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button
            variant='contained'
            onClick={onSave}
            sx={{
              backgroundColor: '#ff6347',
              color: '#fff',
              textTransform: 'none',
              borderRadius: '50px',
              padding: '10px 30px',
              boxShadow: '0 4px 15px rgba(255, 99, 71, 0.3)',
              transition: 'all 0.3s ease',
              '&:hover': {
                backgroundColor: '#e5533f',
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 20px rgba(255, 99, 71, 0.4)',
              },
            }}
          >
            {experienceData.id ? 'Guardar Cambios' : 'Agregar Experiencia'}
          </Button>

          {experienceData.id && onDelete && (
            <IconButton
              color='error'
              onClick={onDelete}
              sx={{
                '&:hover': {
                  backgroundColor: '#ff000010',
                },
              }}
            >
              <DeleteIcon />
            </IconButton>
          )}
        </Box>
      </Box>
    )
  }
)

ExperienceModal.displayName = 'ExperienceModal'

export default ExperienceModal
