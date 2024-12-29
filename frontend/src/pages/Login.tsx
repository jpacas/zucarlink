import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import styles from './Login.module.css'

const Login: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const [modalMessage, setModalMessage] = useState<string | null>(null)
  const [modalType, setModalType] = useState<'success' | 'error' | null>(null)
  const { login } = useAuth()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const { email, password } = formData

    if (!email || !password) {
      setModalMessage('Todos los campos son obligatorios.')
      setModalType('error')
      return
    }

    try {
      const response = await axios.post(
        'http://localhost:5001/api/users/login',
        {
          email,
          password,
        }
      )

      const { token } = response.data
      const payload = JSON.parse(atob(token.split('.')[1])) // Decodificar el token

      login({ id: payload.id, nombre: payload.nombre })
      localStorage.setItem('token', token)

      setModalMessage('Inicio de sesión exitoso. Bienvenido!')
      setModalType('success')
      setFormData({ email: '', password: '' })
    } catch (error: any) {
      setModalMessage(
        error.response?.data?.message ||
          'Error al iniciar sesión. Por favor, verifica tus credenciales.'
      )
      setModalType('error')
    }
  }

  const closeModal = () => {
    setModalMessage(null)
    setModalType(null)
  }

  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <h2>Inicia Sesión</h2>
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

      {modalMessage && (
        <div
          className={`${styles.modal} ${
            modalType === 'success' ? styles.success : styles.error
          }`}
        >
          <div className={styles.modalContent}>
            <p>{modalMessage}</p>
            <button onClick={closeModal} className={styles.closeButton}>
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Login
