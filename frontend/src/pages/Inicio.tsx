import { Link } from 'react-router-dom'

export function Inicio() {
  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-12">
      <p className="text-sm font-medium uppercase tracking-wide text-indigo-600">
        Minerva
      </p>
      <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
        Gestão acadêmica
      </h1>
      <p className="text-slate-600">
        Frontend em React + Vite + Tailwind. A API Spring Boot deve estar em{' '}
        <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm text-slate-800">
          http://localhost:8080
        </code>
        .
      </p>
      <ul className="flex flex-wrap gap-3 text-sm">
        <li>
          <Link
            className="font-medium text-indigo-600 underline-offset-4 hover:underline"
            to="/cursos"
          >
            Ver cursos (API)
          </Link>
        </li>
        <li>
          <a
            className="font-medium text-indigo-600 underline-offset-4 hover:underline"
            href="http://localhost:8080/swagger-ui.html"
            target="_blank"
            rel="noreferrer"
          >
            Swagger
          </a>
        </li>
      </ul>
    </div>
  )
}
