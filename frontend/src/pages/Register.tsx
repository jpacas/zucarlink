import React, { useEffect, useState } from 'react'
import {
  Box,
  Button,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
  Avatar,
  CircularProgress,
  Snackbar,
  Alert,
  Divider,
  Stepper,
  Step,
  StepLabel,
  IconButton,
  InputAdornment,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CardActions,
} from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import {
  CheckCircleOutline,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material'
import { useDropzone } from 'react-dropzone'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
//import placeholder from '../assets/images/avatar-generico.jpg' // Asegúrate de tener esta imagen o ajusta la ruta
import {
  fetchPaises,
  fetchAreas,
  fetchIngenios,
  fetchProveedores,
} from '../functions/fetchFunctions'
import { Ingenio, Proveedor, Area } from '../types/interfaces'
import type { Dayjs } from 'dayjs'
import dayjs from 'dayjs'
import { loadStripe } from '@stripe/stripe-js'
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js'

// Definir interfaces para los tipos
interface FormData {
  nombre: string
  apellido: string
  email: string
  fecha_nacimiento: string
  pais: string
  avatarUrl: File | null
  ingenio: string
  area: string | null
  proveedor: string
  password: string
  confirmPassword: string
  paginaWeb: string
  descripcion: string
}

interface Message {
  type: 'success' | 'error'
  text: string
}

interface PlanPrice {
  basic: number
  premium: number
}

interface Plan {
  id: string
  name: string
  price: number
  features: string[]
}

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY)

const plans: Plan[] = [
  {
    id: 'basic',
    name: 'Plan Básico',
    price: 50,
    features: [
      'Perfil de empresa básico',
      'Listado en el directorio',
      'Soporte por email',
    ],
  },
  {
    id: 'premium',
    name: 'Plan Premium',
    price: 100,
    features: [
      'Perfil de empresa destacado',
      'Listado prioritario en el directorio',
      'Soporte prioritario 24/7',
      'Estadísticas detalladas',
    ],
  },
]

const Register: React.FC = () => {
  const [step, setStep] = useState<'initial' | 'form'>('initial')
  const [userType, setUserType] = useState<
    'ingenio' | 'proveedor' | 'empresa_proveedora' | null
  >(null)
  const [formPart, setFormPart] = useState<1 | 2>(1)
  const [paises, setPaises] = useState<string[]>([])
  const [areas, setAreas] = useState<Area[]>([])
  const [ingenios, setIngenios] = useState<Ingenio[]>([])
  const [proveedores, setProveedores] = useState<Proveedor[]>([])
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    nombre: '',
    apellido: '',
    email: '',
    fecha_nacimiento: '',
    pais: '',
    avatarUrl: null,
    ingenio: '',
    area: null,
    proveedor: '',
    password: '',
    confirmPassword: '',
    paginaWeb: '',
    descripcion: '',
  })
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<Message | null>(null)
  const navigate = useNavigate()
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [registrationStep, setRegistrationStep] = useState<
    'form' | 'plan' | 'payment'
  >('form')

  const steps = ['Información Personal', 'Detalles de Usuario']

  // Lista de países (puedes obtenerla de una API si prefieres)
  useEffect(() => {
    fetchPaises().then(({ paises, error }) => {
      if (error) {
        setMessage({ type: 'error', text: error })
      } else {
        setPaises(paises || [])
      }
    })
    fetchAreas().then(({ areas, error }) => {
      if (error) {
        setMessage({ type: 'error', text: error })
      } else {
        setAreas(areas || [])
      }
    })
    fetchIngenios().then(({ ingenios, error }) => {
      if (error) {
        setMessage({ type: 'error', text: error })
      } else {
        setIngenios(ingenios || [])
      }
    })
    fetchProveedores().then(({ proveedores, error }) => {
      if (error) {
        setMessage({ type: 'error', text: error })
      } else {
        setProveedores(proveedores || [])
      }
    })
  }, [])

  // Filtra los ingenios según el país seleccionado
  const ingeniosFiltrados = ingenios.filter(
    (ingenio) => ingenio.pais === formData.pais
  )

  // Maneja la selección del tipo de usuario
  const handleUserTypeSelection = (
    type: 'ingenio' | 'proveedor' | 'empresa_proveedora'
  ) => {
    setUserType(type)
    setStep('form')
  }

  // Maneja cambios en los campos del formulario
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
    },
    maxSize: 2 * 1024 * 1024, // 2MB
    onDrop: (acceptedFiles) => {
      setFormData((prev) => ({ ...prev, avatarUrl: acceptedFiles[0] }))
      setPreview(URL.createObjectURL(acceptedFiles[0]))
    },
  })

  // Maneja la selección de la foto de perfil
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const file = e.target.files[0]
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg']
      if (!allowedTypes.includes(file.type)) {
        setMessage({
          type: 'error',
          text: 'Tipo de archivo no permitido. Solo se aceptan imágenes (JPEG/PNG).',
        })
        return
      }
      if (file.size > 2 * 1024 * 1024) {
        setMessage({
          type: 'error',
          text: 'El archivo es demasiado grande. Máximo 2 MB.',
        })
        return
      }
      setFormData((prev) => ({ ...prev, fotoPerfil: file }))
      setPreview(URL.createObjectURL(file))
    }
  }

  // Maneja la navegación entre partes del formulario
  const handleNext = () => {
    if (formPart === 1) {
      if (
        !formData.nombre ||
        !formData.apellido ||
        !formData.email ||
        !formData.fecha_nacimiento ||
        !formData.pais
      ) {
        setMessage({
          type: 'error',
          text: 'Por favor completa todos los campos obligatorios.',
        })
        return
      }
      setFormPart(2)
    }
  }

  // Añade esta función de utilidad
  const formatWebUrl = (url: string): string => {
    if (!url) return ''

    // Si ya tiene http:// o https://, dejarlo como está
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url
    }

    // Si empieza con www., añadir https://
    if (url.startsWith('www.')) {
      return `https://${url}`
    }

    // Si no tiene ningún prefijo, añadir https://www.
    return `https://www.${url}`
  }

  // Maneja el envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const formDataToSend = new FormData()

      if (userType === 'empresa_proveedora') {
        if (registrationStep === 'form') {
          setRegistrationStep('plan')
          return
        }

        if (registrationStep === 'plan' && selectedPlan) {
          try {
            const response = await axios.post(
              `${import.meta.env.VITE_API_URL}/payments/create-payment-intent`,
              {
                plan: selectedPlan,
                email: formData.email,
              }
            )
            setClientSecret(response.data.clientSecret)
            setRegistrationStep('payment')
            return
          } catch (error) {
            setMessage({
              type: 'error',
              text: 'Error al iniciar el proceso de pago',
            })
            return
          }
        }

        formDataToSend.append('nombre', formData.nombre)
        formDataToSend.append('pais', formData.pais)
        formDataToSend.append('email', formData.email)
        formDataToSend.append('paginaWeb', formatWebUrl(formData.paginaWeb))
        formDataToSend.append('descripcion', formData.descripcion)
        if (formData.avatarUrl) {
          formDataToSend.append('logo', formData.avatarUrl)
        }

        await axios.post(
          `${import.meta.env.VITE_API_URL}/helper/registerProveedor`,
          formDataToSend,
          {
            headers: { 'Content-Type': 'multipart/form-data' },
          }
        )

        setMessage({
          type: 'success',
          text: 'Empresa registrada exitosamente.',
        })
        setTimeout(() => navigate('/login'), 2000)
      } else {
        if (formData.password !== formData.confirmPassword) {
          setMessage({ type: 'error', text: 'Las contraseñas no coinciden.' })
          return
        }

        if (userType === 'ingenio' && (!formData.ingenio || !formData.area)) {
          setMessage({
            type: 'error',
            text: 'Por favor completa los campos de ingenio y área.',
          })
          return
        }

        if (userType === 'proveedor' && !formData.proveedor) {
          setMessage({
            type: 'error',
            text: 'Por favor ingresa el nombre del proveedor.',
          })
          return
        }

        Object.keys(formData).forEach((key) => {
          const value = (formData as any)[key]
          // Enviar area como null si es proveedor o no está definido
          if (key === 'area' && userType === 'proveedor') {
            formDataToSend.append(key, '') // Enviar como cadena vacía o null según lo que acepte tu backend
          } else {
            formDataToSend.append(key, value !== null ? value : '')
          }
        })
        if (formData.avatarUrl) {
          formDataToSend.append('avatar', formData.avatarUrl)
        }

        await axios.post(
          `${import.meta.env.VITE_API_URL}/users/register`,
          formDataToSend,
          {
            headers: { 'Content-Type': 'multipart/form-data' },
          }
        )

        setMessage({
          type: 'success',
          text: 'Usuario registrado exitosamente.',
        })
        setTimeout(() => navigate('/login'), 2000)
      }
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Error al registrar.',
      })
    } finally {
      setLoading(false)
    }
  }

  // Pantalla inicial con los tres botones
  if (step === 'initial') {
    return (
      <Box
        sx={{
          maxWidth: '600px',
          margin: 'auto',
          padding: 4,
          backgroundColor: '#fff',
          borderRadius: 2,
          boxShadow: 3,
          marginTop: '64px',
          textAlign: 'center',
        }}
      >
        <Typography variant='h4' mb={3}>
          Registro de Usuario
        </Typography>
        <Button
          variant='contained'
          color='primary'
          fullWidth
          sx={{ mb: 2 }}
          onClick={() => handleUserTypeSelection('ingenio')}
        >
          Usuarios de Ingenios
        </Button>
        <Button
          variant='contained'
          color='secondary'
          fullWidth
          sx={{ mb: 2 }}
          onClick={() => handleUserTypeSelection('proveedor')}
        >
          Usuarios de Proveedores
        </Button>
        <Button
          variant='contained'
          color='info'
          fullWidth
          onClick={() => handleUserTypeSelection('empresa_proveedora')}
        >
          Empresa Proveedora
        </Button>
      </Box>
    )
  }

  // Formulario
  return (
    <Box
      sx={{
        maxWidth: '600px',
        margin: 'auto',
        padding: 4,
        backgroundColor: '#fff',
        borderRadius: 2,
        boxShadow: 3,
        marginTop: '64px',
      }}
    >
      <Typography variant='h4' mb={3} textAlign='center'>
        Registro de{' '}
        {userType === 'ingenio'
          ? 'Usuario de Ingenio'
          : userType === 'proveedor'
          ? 'Usuario Proveedor'
          : 'Empresa Proveedora'}
      </Typography>
      <Divider sx={{ my: 2 }} />
      <form onSubmit={handleSubmit}>
        {/* Formulario para usuarios de ingenio y proveedor */}
        {(userType === 'ingenio' || userType === 'proveedor') && (
          <>
            <Stepper activeStep={formPart - 1} sx={{ mb: 3 }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
            {formPart === 1 && (
              <>
                <Typography variant='h6' mb={2}>
                  Información Personal
                </Typography>
                <TextField
                  fullWidth
                  label='Nombre'
                  name='nombre'
                  value={formData.nombre}
                  onChange={handleChange}
                  margin='normal'
                  required
                />
                <TextField
                  fullWidth
                  label='Apellido'
                  name='apellido'
                  value={formData.apellido}
                  onChange={handleChange}
                  margin='normal'
                  required
                />
                <TextField
                  fullWidth
                  label='Correo Electrónico'
                  name='email'
                  type='email'
                  value={formData.email}
                  onChange={handleChange}
                  margin='normal'
                  required
                />
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    label='Fecha de Nacimiento *'
                    format='DD/MM/YYYY'
                    value={
                      formData.fecha_nacimiento
                        ? dayjs(formData.fecha_nacimiento)
                        : null
                    }
                    onChange={(newValue: Dayjs | null) =>
                      setFormData((prev) => ({
                        ...prev,
                        fecha_nacimiento: newValue
                          ? newValue.format('YYYY-MM-DD')
                          : '',
                      }))
                    }
                    slotProps={{
                      textField: { fullWidth: true, margin: 'normal' },
                    }}
                  />
                </LocalizationProvider>
                <Autocomplete
                  options={paises}
                  value={formData.pais}
                  onChange={(_, value) =>
                    setFormData((prev) => ({ ...prev, pais: value || '' }))
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label='País'
                      margin='normal'
                      fullWidth
                      required
                    />
                  )}
                />
                <Box
                  {...getRootProps()}
                  sx={{
                    textAlign: 'center',
                    padding: 2,
                    border: '2px dashed gray',
                    borderRadius: 2,
                    cursor: 'pointer',
                    marginTop: 2,
                    marginBottom: 4,
                    backgroundColor: '#fafafa',
                    transition: 'border .24s ease-in-out',
                    maxWidth: '400px',
                    margin: '2rem auto',
                    '&:hover': {
                      border: '2px dashed #1976d2',
                      backgroundColor: '#f0f7ff',
                    },
                  }}
                >
                  <input {...getInputProps()} />
                  <Typography variant='subtitle1' gutterBottom>
                    Foto de Perfil
                  </Typography>
                  {preview ? (
                    <Box>
                      <Avatar
                        src={preview}
                        sx={{ width: 100, height: 100, margin: 'auto', mb: 2 }}
                      />
                      <Typography variant='body2' color='textSecondary'>
                        Click o arrastra para cambiar la imagen
                      </Typography>
                    </Box>
                  ) : (
                    <Box>
                      <Avatar
                        sx={{ width: 100, height: 100, margin: 'auto', mb: 2 }}
                      />
                      <Typography variant='body1' gutterBottom>
                        Arrastra y suelta una imagen aquí
                      </Typography>
                      <Typography variant='body2' color='textSecondary'>
                        o haz click para seleccionar
                      </Typography>
                      <Typography
                        variant='caption'
                        display='block'
                        color='textSecondary'
                        sx={{ mt: 1 }}
                      >
                        Formatos permitidos: JPG, PNG (Máx. 2MB)
                      </Typography>
                    </Box>
                  )}
                </Box>
                <Button
                  variant='contained'
                  color='primary'
                  fullWidth
                  onClick={handleNext}
                  sx={{ mt: 2 }}
                >
                  Siguiente
                </Button>
              </>
            )}

            {formPart === 2 && userType === 'ingenio' && (
              <>
                <Typography variant='h6' mb={2}>
                  Detalles de Usuario
                </Typography>
                <FormControl fullWidth margin='normal'>
                  <InputLabel>Ingenio</InputLabel>
                  <Select
                    name='ingenio'
                    value={formData.ingenio}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        ingenio: e.target.value,
                      }))
                    }
                    required
                  >
                    {ingeniosFiltrados.map((ingenio) => (
                      <MenuItem key={ingenio.nombre} value={ingenio.nombre}>
                        {ingenio.nombre}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl fullWidth margin='normal'>
                  <InputLabel>Área</InputLabel>
                  <Select
                    name='area'
                    value={formData.area}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, area: e.target.value }))
                    }
                    required
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
                  label='Contraseña'
                  name='password'
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  margin='normal'
                  required
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position='end'>
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <Visibility /> : <VisibilityOff />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  fullWidth
                  label='Confirmar Contraseña'
                  name='confirmPassword'
                  type={showPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  margin='normal'
                  required
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position='end'>
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <Visibility /> : <VisibilityOff />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                  <Button
                    variant='outlined'
                    color='secondary'
                    fullWidth
                    onClick={() => setFormPart(1)}
                  >
                    Volver
                  </Button>
                  <Button
                    type='submit'
                    variant='contained'
                    color='primary'
                    fullWidth
                    disabled={loading}
                    startIcon={loading && <CircularProgress size={20} />}
                  >
                    {loading ? 'Registrando...' : 'Registrarse'}
                  </Button>
                </Box>
              </>
            )}

            {formPart === 2 && userType === 'proveedor' && (
              <>
                <Typography variant='h6' mb={2}>
                  Detalles de Usuario
                </Typography>
                <FormControl fullWidth margin='normal'>
                  <InputLabel>Proveedor</InputLabel>
                  <Select
                    name='proveedor'
                    value={formData.proveedor}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        proveedor: e.target.value,
                      }))
                    }
                    required
                  >
                    {proveedores.map((proveedor) => (
                      <MenuItem key={proveedor} value={proveedor}>
                        {proveedor}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField
                  fullWidth
                  label='Contraseña'
                  name='password'
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  margin='normal'
                  required
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position='end'>
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <Visibility /> : <VisibilityOff />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  fullWidth
                  label='Confirmar Contraseña'
                  name='confirmPassword'
                  type={showPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  margin='normal'
                  required
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position='end'>
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <Visibility /> : <VisibilityOff />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                  <Button
                    variant='outlined'
                    color='secondary'
                    fullWidth
                    onClick={() => setFormPart(1)}
                  >
                    Volver
                  </Button>
                  <Button
                    type='submit'
                    variant='contained'
                    color='primary'
                    fullWidth
                    disabled={loading}
                  >
                    {loading ? <CircularProgress size={24} /> : 'Registrarse'}
                  </Button>
                </Box>
              </>
            )}
          </>
        )}

        {/* Formulario para empresa proveedora */}
        {userType === 'empresa_proveedora' && (
          <>
            {registrationStep === 'form' && (
              <>
                <TextField
                  fullWidth
                  label='Nombre de la Empresa'
                  name='nombre'
                  value={formData.nombre}
                  onChange={handleChange}
                  margin='normal'
                  required
                />
                <Autocomplete
                  options={paises}
                  value={formData.pais}
                  onChange={(_, value) =>
                    setFormData((prev) => ({ ...prev, pais: value || '' }))
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label='País'
                      margin='normal'
                      fullWidth
                      required
                    />
                  )}
                />
                <TextField
                  fullWidth
                  label='Correo Electrónico'
                  name='email'
                  type='email'
                  value={formData.email}
                  onChange={handleChange}
                  margin='normal'
                  required
                />
                <TextField
                  fullWidth
                  label='Página Web'
                  name='paginaWeb'
                  value={formData.paginaWeb || ''}
                  onChange={handleChange}
                  margin='normal'
                  placeholder='ejemplo.com'
                  helperText="Puedes ingresar el dominio sin 'http://' o 'www'"
                />
                <TextField
                  fullWidth
                  label='Descripción de la Empresa'
                  name='descripcion'
                  value={formData.descripcion || ''}
                  onChange={handleChange}
                  margin='normal'
                  multiline
                  rows={4}
                  required
                />
                <Box
                  {...getRootProps()}
                  sx={{
                    textAlign: 'center',
                    padding: 2,
                    border: '2px dashed gray',
                    borderRadius: 2,
                    cursor: 'pointer',
                    marginTop: 2,
                    marginBottom: 4,
                    backgroundColor: '#fafafa',
                    transition: 'border .24s ease-in-out',
                    maxWidth: '400px',
                    margin: '2rem auto',
                    '&:hover': {
                      border: '2px dashed #1976d2',
                      backgroundColor: '#f0f7ff',
                    },
                  }}
                >
                  <input {...getInputProps()} />
                  <Typography variant='subtitle1' gutterBottom>
                    Logo de la Empresa
                  </Typography>
                  {preview ? (
                    <Box>
                      <Avatar
                        src={preview}
                        sx={{ width: 100, height: 100, margin: 'auto', mb: 2 }}
                      />
                      <Typography variant='body2' color='textSecondary'>
                        Click o arrastra para cambiar el logo
                      </Typography>
                    </Box>
                  ) : (
                    <Box>
                      <Avatar
                        sx={{ width: 100, height: 100, margin: 'auto', mb: 2 }}
                      />
                      <Typography variant='body1' gutterBottom>
                        Arrastra y suelta el logo aquí
                      </Typography>
                      <Typography variant='body2' color='textSecondary'>
                        o haz click para seleccionar
                      </Typography>
                      <Typography
                        variant='caption'
                        display='block'
                        color='textSecondary'
                        sx={{ mt: 1 }}
                      >
                        Formatos permitidos: JPG, PNG (Máx. 2MB)
                      </Typography>
                    </Box>
                  )}
                </Box>
                <Button
                  type='submit'
                  variant='contained'
                  color='primary'
                  fullWidth
                  disabled={loading}
                >
                  {loading ? (
                    <CircularProgress size={24} />
                  ) : (
                    'Registrar Empresa'
                  )}
                </Button>
              </>
            )}

            {registrationStep === 'plan' && (
              <Box sx={{ mt: 2 }}>
                <Typography variant='h6' gutterBottom>
                  Selecciona un Plan
                </Typography>
                <Grid container spacing={3}>
                  {plans.map((plan) => (
                    <Grid item xs={12} md={6} key={plan.id}>
                      <Card
                        sx={{
                          height: '100%',
                          border:
                            selectedPlan === plan.id
                              ? '2px solid primary.main'
                              : 'none',
                        }}
                      >
                        <CardContent>
                          <Typography variant='h5' component='div'>
                            {plan.name}
                          </Typography>
                          <Typography
                            variant='h4'
                            color='primary'
                            sx={{ my: 2 }}
                          >
                            ${plan.price}/mes
                          </Typography>
                          <List>
                            {plan.features.map((feature, index) => (
                              <ListItem key={index}>
                                <ListItemIcon>
                                  <CheckCircleOutline color='primary' />
                                </ListItemIcon>
                                <ListItemText primary={feature} />
                              </ListItem>
                            ))}
                          </List>
                        </CardContent>
                        <CardActions>
                          <Button
                            fullWidth
                            variant={
                              selectedPlan === plan.id
                                ? 'contained'
                                : 'outlined'
                            }
                            onClick={() => setSelectedPlan(plan.id)}
                          >
                            Seleccionar Plan
                          </Button>
                        </CardActions>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
                <Button
                  fullWidth
                  variant='contained'
                  sx={{ mt: 3 }}
                  disabled={!selectedPlan}
                  onClick={handleSubmit}
                >
                  Continuar al Pago
                </Button>
              </Box>
            )}

            {registrationStep === 'payment' && clientSecret && (
              <Box sx={{ mt: 2 }}>
                <Typography variant='h6' gutterBottom>
                  Información de Pago
                </Typography>
                <Elements stripe={stripePromise} options={{ clientSecret }}>
                  <PaymentForm clientSecret={clientSecret} />
                </Elements>
              </Box>
            )}
          </>
        )}
      </form>

      {message && (
        <Snackbar open autoHideDuration={6000} onClose={() => setMessage(null)}>
          <Alert
            onClose={() => setMessage(null)}
            severity={message.type}
            sx={{ width: '100%' }}
          >
            {message.text}
          </Alert>
        </Snackbar>
      )}
    </Box>
  )
}

const PaymentForm: React.FC<{ clientSecret: string }> = ({ clientSecret }) => {
  const stripe = useStripe()
  const elements = useElements()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/registro-exitoso`,
      },
    })

    if (error) {
      console.error(error)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      <Button
        type='submit'
        variant='contained'
        fullWidth
        sx={{ mt: 2 }}
        disabled={!stripe}
      >
        Pagar y Completar Registro
      </Button>
    </form>
  )
}

export default Register
