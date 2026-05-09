import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { StoreProvider } from './context/StoreContext'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <StoreProvider>
          <CartProvider>
            <App />
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 3000,
                style: {
                  background: '#0a0a0a',
                  color: '#fff',
                  fontSize: '14px',
                  fontFamily: 'DM Sans, sans-serif',
                  borderRadius: '0px',
                  border: '1px solid #D4AF37',
                },
                success: { iconTheme: { primary: '#D4AF37', secondary: '#0a0a0a' } },
                error:   { iconTheme: { primary: '#ef4444', secondary: '#fff' } }
              }}
            />
          </CartProvider>
        </StoreProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)
