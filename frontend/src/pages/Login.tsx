import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import styles from './Login.module.css'

const Login: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const { email, password } = formData

    if (!email || !password) {
      setErrorMessage('Todos los campos son obligatorios.')
      return
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/users/login`,
        {
          email,
          password,
        }
      )

      const { token } = response.data
      const payload = JSON.parse(atob(token.split('.')[1])) // Decodificar el token

      login({
        id: payload.id,
        nombre: payload.nombre,
        apellido: payload.apellido,
        avatar: payload.avatar,
      })
      localStorage.setItem('token', token)

      // Redirigir al perfil después del inicio de sesión exitoso
      navigate(`/perfil/${payload.id}`)
    } catch (error: any) {
      setErrorMessage(
        error.response?.data?.message ||
          'Error al iniciar sesión. Por favor, verifica tus credenciales.'
      )
    }
  }

  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <h2>Inicia Sesión</h2>
        {errorMessage && <p className={styles.error}>{errorMessage}</p>}
        <div className={styles.formGroup}>
          <label htmlFor='email'>Correo Electrónico</label>
          <input
            type='email'
            id='email'
            name='email'
            value={formData.email}
            onChange={handleChange}
            placeholder='Ingresa tu correo electrónico'
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor='password'>Contraseña</label>
          <input
            type='password'
            id='password'
            name='password'
            value={formData.password}
            onChange={handleChange}
            placeholder='Ingresa tu contraseña'
          />
        </div>
        <button type='submit' className={styles.submitButton}>
          Ingresar
        </button>
        <div className={styles.links}>
          <p>
            ¿No tienes una cuenta?{' '}
            <Link to='/register' className={styles.link}>
              Regístrate aquí
            </Link>
          </p>
        </div>
      </form>
    </div>
  )
}

export default Login
