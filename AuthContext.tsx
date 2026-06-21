import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { DataProvider } from './contexts/DataContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Jornada from './pages/Jornada'
import Ganhos from './pages/Ganhos'
import Gastos from './pages/Gastos'
import Relatorios from './pages/Relatorios'
import Inteligencia from './pages/Inteligencia'

function Protected({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth()
  if (loading) {
    return (
      <div className="min-h-full flex items-center justify-center text-muted">Carregando…</div>
    )
  }
  if (!session) return <Navigate to="/login" replace />
  return <>{children}</>
}

function PublicOnly({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth()
  if (loading) return null
  if (session) return <Navigate to="/" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <Routes>
          <Route
            path="/login"
            element={
              <PublicOnly>
                <Login />
              </PublicOnly>
            }
          />
          <Route
            element={
              <Protected>
                <DataProvider>
                  <Layout />
                </DataProvider>
              </Protected>
            }
          >
            <Route path="/" element={<Dashboard />} />
            <Route path="/jornada" element={<Jornada />} />
            <Route path="/ganhos" element={<Ganhos />} />
            <Route path="/gastos" element={<Gastos />} />
            <Route path="/relatorios" element={<Relatorios />} />
            <Route path="/inteligencia" element={<Inteligencia />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </HashRouter>
  )
}
