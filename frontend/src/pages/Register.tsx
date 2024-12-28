import React, { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import styles from './Register.module.css'

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })

  const [modalMessage, setModalMessage] = useState<string | null>(null)
  const [modalType, setModalType] = useState<'success' | 'error' | null>(null)

  const navigate = useNavigate()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const { name, email, password, confirmPassword } = formData

    // Validación básica
    if (!name || !email || !password || !confirmPassword) {
      setModalMessage('Todos los campos son obligatorios.')
      setModalType('error')
      return
    }

    if (password !== confirmPassword) {
      setModalMessage('Las contraseñas no coinciden.')
      setModalType('error')
      return
    }

    try {
      await axios.post('http://localhost:5001/api/users/register', {
        name,
        email,
        password,
      })

      setModalMessage('Usuario registrado exitosamente.')
      setModalType('success')
      setFormData({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
      })

      // Redirigir después de 2 segundos
      setTimeout(() => {
        navigate('/login')
      }, 2000)
    } catch (error: any) {
      setModalMessage(
        error.response?.data?.message ||
          'Error al registrar el usuario. Por favor intenta más tarde.'
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
        <h2>Crear una Cuenta</h2>
        <div className={styles.formGroup}>
          <label htmlFor='name'>Nombre</label>
          <input
            type='text'
            id='name'
            name='name'
            value={formData.name}
            onChange={handleChange}
            placeholder='Ingresa tu nombre'
          />
        </div>
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
            placeholder='Crea una contraseña'
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor='confirmPassword'>Confirmar Contraseña</label>
          <input
            type='password'
            id='confirmPassword'
            name='confirmPassword'
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder='Repite tu contraseña'
          />
        </div>
        <button type='submit' className={styles.submitButton}>
          Registrarse
        </button>
      </form>

      {/* Modal de mensajes */}
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

export default Register
