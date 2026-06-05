import { BrowserRouter, Link, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AlunoBoletim } from './pages/AlunoBoletim'
import { AlunoHistorico } from './pages/AlunoHistorico'
import { Alunos } from './pages/Alunos'
import { Cadastro } from './pages/Cadastro'
import { Cursos } from './pages/Cursos'
import { Inicio } from './pages/Inicio'
import { Login } from './pages/Login'
import { Materias } from './pages/Materias'
import { Matriculas } from './pages/Matriculas'
import { ProfessorNotas } from './pages/ProfessorNotas'
import { Professores } from './pages/Professores'
import { getUsuario, logout, navDoUsuario } from './utils/auth'

function AppShell() {
  const location = useLocation()
  const navigate = useNavigate()
  const usuario = getUsuario()
  const withoutHeader = ['/login', '/cadastro']
  const showHeader = !withoutHeader.includes(location.pathname)
  const navItems = navDoUsuario(usuario)

  function handleSair() {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-minerva-cinza-claro">
      {showHeader && (
        <header className="border-b border-minerva-cinza-escuro/10 bg-minerva-marmore shadow-sm shadow-minerva-cinza-escuro/5">
          <nav className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3 text-sm text-minerva-cinza-escuro">
            <Link
              to="/"
              className="font-display font-semibold tracking-wide text-primary"
            >
              Minerva
            </Link>
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={
                  location.pathname === item.to
                    ? 'font-semibold text-primary'
                    : 'font-medium text-minerva-cinza-escuro/75 transition-colors hover:text-primary'
                }
              >
                {item.label}
              </Link>
            ))}
            {usuario ? (
              <button
                type="button"
                onClick={handleSair}
                className="ml-auto font-medium text-minerva-cinza-escuro/75 transition-colors hover:text-primary"
              >
                Sair
              </button>
            ) : (
              <Link
                to="/login"
                className="ml-auto font-medium text-minerva-cinza-escuro/75 transition-colors hover:text-primary"
              >
                Entrar
              </Link>
            )}
          </nav>
        </header>
      )}

      <main>
        <ProtectedRoute>
          <Routes>
            <Route path="/" element={<Inicio />} />
            <Route path="/cursos" element={<Cursos />} />
            <Route path="/alunos" element={<Alunos />} />
            <Route path="/professores" element={<Professores />} />
            <Route path="/materias" element={<Materias />} />
            <Route path="/matriculas" element={<Matriculas />} />
            <Route path="/professor/notas" element={<ProfessorNotas />} />
            <Route path="/aluno/boletim" element={<AlunoBoletim />} />
            <Route path="/aluno/historico" element={<AlunoHistorico />} />
            <Route path="/login" element={<Login />} />
            <Route path="/cadastro" element={<Cadastro />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ProtectedRoute>
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
