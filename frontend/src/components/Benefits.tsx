import React from 'react'
import styles from './Benefits.module.css'
import { FaCheckCircle, FaClock, FaUserShield } from 'react-icons/fa' // Ejemplo de íconos

const Benefits: React.FC = () => {
  return (
    <section className={styles.benefits}>
      <h2 className={styles.title}>Nuestros Beneficios</h2>
      <div className={styles.container}>
        <div className={styles.benefit}>
          <FaCheckCircle className={styles.icon} />
          <h3 className={styles.benefitTitle}>Fácil de Usar</h3>
          <p className={styles.description}>
            Diseñada con una interfaz intuitiva para que cualquier usuario pueda
            aprovecharla al máximo.
          </p>
        </div>
        <div className={styles.benefit}>
          <FaClock className={styles.icon} />
          <h3 className={styles.benefitTitle}>Ahorro de Tiempo</h3>
          <p className={styles.description}>
            Optimiza tus tareas diarias con herramientas rápidas y eficientes.
          </p>
        </div>
        <div className={styles.benefit}>
          <FaUserShield className={styles.icon} />
          <h3 className={styles.benefitTitle}>Seguridad</h3>
          <p className={styles.description}>
            Protección de datos garantizada para que puedas trabajar sin
            preocupaciones.
          </p>
        </div>
      </div>
    </section>
  )
}

export default Benefits
