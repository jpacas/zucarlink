import React, { useEffect, useState } from 'react'
import axios from 'axios'
import styles from './Directorio.module.css'

interface User {
  id: string
  nombre: string
  apellido: string
  pais: string
  email: string
}

const Directorio: React.FC = () => {
  const [usuarios, setUsuarios] = useState<User[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        const response = await axios.get(
          'http://localhost:5001/api/users/usuarios'
        )
        setUsuarios(response.data)
      } catch (err: any) {
        setError(err.response?.data?.message || 'Error al cargar los usuarios.')
      }
    }

    fetchUsuarios()
  }, [])

  return (
    <div className={styles.container}>
      <h1>Directorio de Usuarios</h1>
      {error && <p className={styles.error}>{error}</p>}
      <div className={styles.cards}>
        {usuarios.map((usuario) => (
          <div key={usuario.id} className={styles.card}>
            <h2>
              {usuario.nombre} {usuario.apellido}
            </h2>
            <p>
              <strong>País:</strong> {usuario.pais}
            </p>
            <p>
              <strong>Correo:</strong> {usuario.email}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Directorio
