import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { SnackbarProvider } from 'notistack'
import { vi } from 'vitest'

// Minimal auth context mock
vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ isAuthenticated: false, user: null }),
}))

import UpgradePro from '../pages/UpgradePro'

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <SnackbarProvider>
    <MemoryRouter>{children}</MemoryRouter>
  </SnackbarProvider>
)

describe('UpgradePro', () => {
  it('renders plan name and price', () => {
    render(<UpgradePro />, { wrapper: Wrapper })
    expect(screen.getByText(/Ingeniero Pro/i)).toBeInTheDocument()
    expect(screen.getByText(/\$15/)).toBeInTheDocument()
  })

  it('renders all four Pro benefits', () => {
    render(<UpgradePro />, { wrapper: Wrapper })
    expect(screen.getByText(/ZucarIA ilimitada/i)).toBeInTheDocument()
    expect(screen.getByText(/Perfil verificado/i)).toBeInTheDocument()
    expect(screen.getByText(/contenido premium/i)).toBeInTheDocument()
    expect(screen.getByText(/consultor/i)).toBeInTheDocument()
  })
})
