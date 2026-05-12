import { BrowserRouter, Link, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { Cursos } from './pages/Cursos'
import { Inicio } from './pages/Inicio'
import { Login } from './pages/Login'

function AppShell() {
  const location = useLocation()
  const isLoginPage = location.pathname === '/login'

  return (
    <div className="min-h-screen bg-minerva-cinza-claro">
      {!isLoginPage && (
        <header className="border-b border-minerva-cinza-escuro/10 bg-minerva-marmore shadow-sm shadow-minerva-cinza-escuro/5">
          <nav className="mx-auto flex max-w-3xl items-center gap-6 px-4 py-3 text-sm text-minerva-cinza-escuro">
            <Link
              to="/"
              className="font-display font-semibold tracking-wide text-primary"
            >
              Minerva
            </Link>
            <Link
              className="font-medium text-minerva-cinza-escuro/75 transition-colors hover:text-primary"
              to="/cursos"
            >
              Cursos
            </Link>
          </nav>
        </header>
      )}

      <main>
        <Routes>
          <Route path="/" element={<Inicio />} />
          <Route path="/cursos" element={<Cursos />} />
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  )
}

export default App
