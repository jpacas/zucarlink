import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'

vi.mock('../utils/axiosConfig', () => ({
  default: {
    get: vi.fn().mockResolvedValue({ data: [] }),
    post: vi.fn(),
  },
}))

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ isAuthenticated: false, user: null }),
}))

import Wiki from '../pages/Wiki'

describe('Wiki', () => {
  it('renders wiki heading', async () => {
    render(
      <MemoryRouter>
        <Wiki />
      </MemoryRouter>
    )
    expect(screen.getByText(/Wiki Técnica/i)).toBeInTheDocument()
  })

  it('renders category filter chips', async () => {
    render(
      <MemoryRouter>
        <Wiki />
      </MemoryRouter>
    )
    expect(screen.getByText('Fabricación')).toBeInTheDocument()
    expect(screen.getByText('Maquinaria')).toBeInTheDocument()
    expect(screen.getByText('Agronomía')).toBeInTheDocument()
  })

  it('shows empty state when no articles returned', async () => {
    render(
      <MemoryRouter>
        <Wiki />
      </MemoryRouter>
    )
    const emptyMessage = await screen.findByText(/No hay artículos/i)
    expect(emptyMessage).toBeInTheDocument()
  })
})
