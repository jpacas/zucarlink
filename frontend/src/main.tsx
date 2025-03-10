import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './context/AuthContext.tsx'
import { ThemeProvider } from '@mui/material/styles'
import { ChatProvider } from './context/ChatContext'
import CssBaseline from '@mui/material/CssBaseline'
import theme from '../src/theme/theme.ts'

createRoot(document.getElementById('root')!).render(
  <AuthProvider>
    <StrictMode>
      <ChatProvider>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <App />
        </ThemeProvider>
      </ChatProvider>
    </StrictMode>
  </AuthProvider>
)
