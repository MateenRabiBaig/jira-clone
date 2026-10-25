import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { Provider } from "react-redux"
import { store } from "./redux/store"
import { initializeAuth } from "./redux/slices/authSlice"

// Restore the session from the stored token (if any) before routes render.
void store.dispatch(initializeAuth())

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>,
)
