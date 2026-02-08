import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom'

// Use the correct relative path './'
import { AuthProvider } from './contexts/AuthContext'
import { CasesProvider } from './contexts/CasesContext'
import { ErrorBoundary } from './ErrorBoundary'

const root = document.getElementById('root')
if (!root) {
  throw new Error('Root element not found')
}

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        {/* Wrap your App in the AuthProvider and CasesProvider for real-time case sync */}
        <CasesProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </CasesProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>,
)