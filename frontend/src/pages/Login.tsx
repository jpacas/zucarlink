import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import styles from './Login.module.css'

const Login: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const [errors, setErrors] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const { email, password } = formData

    if (!email || !password) {
      setErrors('Todos los campos son obligatorios.')
      return
    }

    // Aquí puedes manejar el inicio de sesión (ejemplo: enviar datos al backend)
    console.log('Inicio de sesión exitoso:', formData)
    setErrors(null) // Limpiar errores si todo está bien
  }

  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <h2>Inicia Sesión</h2>
        {errors && <div className={styles.error}>{errors}</div>}
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
