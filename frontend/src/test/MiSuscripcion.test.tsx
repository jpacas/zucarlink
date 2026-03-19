import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'

vi.mock('../utils/axiosConfig', () => ({
  default: {
    get: vi.fn().mockRejectedValue({ response: { status: 400 } }),
    post: vi.fn(),
  },
}))

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ user: { id: 1, nombre: 'Juan' }, isAuthenticated: true }),
}))

import MiSuscripcion from '../pages/MiSuscripcion'

describe('MiSuscripcion', () => {
  it('renders page heading', async () => {
    render(
      <MemoryRouter>
        <MiSuscripcion />
      </MemoryRouter>
    )
    expect(screen.getByText(/Mi Suscripción/i)).toBeInTheDocument()
  })

  it('shows upgrade link when user has no subscription', async () => {
    render(
      <MemoryRouter>
        <MiSuscripcion />
      </MemoryRouter>
    )
    // Wait for loading to finish (mock rejects with 400 = no subscription)
    const link = await screen.findByText(/Ver planes/i)
    expect(link).toBeInTheDocument()
  })
})
