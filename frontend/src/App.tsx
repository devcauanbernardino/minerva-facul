import { BrowserRouter, Link, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { ProtectedRoute } from './components/ProtectedRoute'
import { MinervaLogo } from './components/MinervaLogo'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
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
import { getUsuario, labelPerfil, logout, navDoUsuario } from './utils/auth'

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
    <div className="flex min-h-screen flex-col bg-background">
      {showHeader && (
        <header className="sticky top-0 z-40 border-b border-b-minerva-dourado/25 bg-card/95 shadow-sm backdrop-blur-md supports-[backdrop-filter]:bg-card/80">
          <nav className="mx-auto flex max-w-6xl flex-wrap items-center gap-y-3 px-4 py-4 sm:gap-x-6 sm:px-6 lg:gap-x-8">
            <MinervaLogo variant="icon" linkToHome showWordmark className="mr-1 sm:mr-2" />

            <Separator orientation="vertical" className="hidden h-10 sm:mx-2 sm:block lg:mx-4" />

            <div className="flex flex-wrap items-center gap-1 sm:gap-2">
              {navItems.map((item) => {
                const ativo = location.pathname === item.to
                return (
                  <Button
                    key={item.to}
                    variant={ativo ? 'secondary' : 'ghost'}
                    size="sm"
                    className={cn(
                      'font-medium no-underline hover:no-underline',
                      ativo && 'bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary'
                    )}
                    asChild
                  >
                    <Link to={item.to}>{item.label}</Link>
                  </Button>
                )
              })}
            </div>

            {usuario ? (
              <div className="ml-auto flex items-center gap-4 pl-2 sm:gap-5 sm:border-l sm:pl-6">
                <div className="hidden text-right sm:block">
                  <p className="text-xs text-muted-foreground">{labelPerfil(usuario.tipo)}</p>
                  <p className="text-sm font-semibold">{usuario.nome}</p>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={handleSair}>
                  Sair
                </Button>
              </div>
            ) : (
              <Button className="ml-auto uppercase tracking-wider" size="lg" asChild>
                <Link to="/login" className="no-underline hover:no-underline">
                  Entrar
                </Link>
              </Button>
            )}
          </nav>
        </header>
      )}

      <main className="flex-1">
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

      {showHeader && (
        <footer className="border-t bg-card py-5">
          <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-4 sm:px-6">
            <MinervaLogo variant="sm" className="opacity-90" />
            <p className="text-center text-xs text-muted-foreground">
              Minerva · Gestão Acadêmica · {new Date().getFullYear()}
            </p>
          </div>
        </footer>
      )}
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
