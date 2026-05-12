import { Link } from 'react-router-dom'

export function Inicio() {
  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-12">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">
        Minerva
      </p>
      <h1 className="font-display text-3xl font-bold tracking-tight text-minerva-cinza-escuro">
        Gestão acadêmica
      </h1>
      <p className="text-base leading-relaxed text-minerva-cinza-escuro/85">
        Frontend em React + Vite + Tailwind. A API Spring Boot deve estar em{' '}
        <code className="rounded-md border border-minerva-cinza-escuro/10 bg-minerva-marmore px-1.5 py-0.5 text-sm text-minerva-cinza-escuro">
          http://localhost:8080
        </code>
        .
      </p>
      <ul className="flex flex-wrap gap-3 text-sm">
        <li>
          <Link
            className="font-semibold text-primary underline-offset-4 hover:underline"
            to="/cursos"
          >
            Ver cursos (API)
          </Link>
        </li>
        <li>
          <a
            className="font-semibold text-primary underline-offset-4 hover:underline"
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
