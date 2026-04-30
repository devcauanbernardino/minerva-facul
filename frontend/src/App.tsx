import { BrowserRouter, Link, Navigate, Route, Routes } from 'react-router-dom'
import { Cursos } from './pages/Cursos'
import { Inicio } from './pages/Inicio'

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-50">
        <header className="border-b border-slate-200 bg-white">
          <nav className="mx-auto flex max-w-3xl items-center gap-6 px-4 py-3 text-sm">
            <Link to="/" className="font-semibold text-slate-900">
              Minerva
            </Link>
            <Link
              className="text-slate-600 hover:text-slate-900"
              to="/cursos"
            >
              Cursos
            </Link>
          </nav>
        </header>
        <main>
          <Routes>
            <Route path="/" element={<Inicio />} />
            <Route path="/cursos" element={<Cursos />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
