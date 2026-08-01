import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

import { AuthProvider } from './contexts/AuthContext'
import { WaStatusProvider } from './contexts/WaStatusContext'
import { CompanyProvider } from './contexts/CompanyContext'
import ErrorBoundary from './components/common/ErrorBoundary'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <WaStatusProvider>
          <CompanyProvider>
            <App />
          </CompanyProvider>
        </WaStatusProvider>
      </AuthProvider>
    </ErrorBoundary>
  </StrictMode>,
)

