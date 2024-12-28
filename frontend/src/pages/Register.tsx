import React, { useState } from 'react'
import styles from './Register.module.css'
import { Link } from 'react-router-dom'

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })

  const [errors, setErrors] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const { name, email, password, confirmPassword } = formData

    if (!name || !email || !password || !confirmPassword) {
      setErrors('Todos los campos son obligatorios.')
      return
    }

    if (password !== confirmPassword) {
      setErrors('Las contraseñas no coinciden.')
      return
    }

    // Aquí puedes manejar el envío del formulario (ejemplo: enviar datos al backend)
    console.log('Registro exitoso:', formData)
    setErrors(null) // Limpiar errores si todo está bien
  }

  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <h2>Crear una Cuenta</h2>
        {errors && <div className={styles.error}>{errors}</div>}
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
        <div className={styles.links}>
          <p>
            ¿Ya tienes una cuenta?{' '}
            <Link to='/login' className={styles.link}>
              Inicia sesión aquí
            </Link>
          </p>
        </div>
      </form>
    </div>
  )
}

export default Register
