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
  const [filtros, setFiltros] = useState({ nombre: '', pais: '' })
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

  const handleFiltroChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFiltros({ ...filtros, [e.target.name]: e.target.value })
  }

  const usuariosFiltrados = usuarios.filter(
    (usuario) =>
      usuario.nombre
        .toLowerCase()
        .includes(filtros.nombre.toLowerCase().trim()) &&
      usuario.pais.toLowerCase().includes(filtros.pais.toLowerCase().trim())
  )

  return (
    <div className={styles.container}>
      <h1>Directorio de Usuarios</h1>
      <div className={styles.wrapper}>
        {/* Sidebar de Filtros */}
        <aside className={styles.sidebar}>
          <h2>Filtros</h2>
          <div className={styles.formGroup}>
            <label htmlFor='nombre'>Nombre</label>
            <input
              type='text'
              id='nombre'
              name='nombre'
              placeholder='Buscar por nombre'
              value={filtros.nombre}
              onChange={handleFiltroChange}
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor='pais'>País</label>
            <input
              type='text'
              id='pais'
              name='pais'
              placeholder='Buscar por país'
              value={filtros.pais}
              onChange={handleFiltroChange}
            />
          </div>
        </aside>
        {/* Resultados */}
        <main className={styles.main}>
          {error && <p className={styles.error}>{error}</p>}
          <div className={styles.cards}>
            {usuariosFiltrados.map((usuario) => (
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
        </main>
      </div>
    </div>
  )
}

export default Directorio
