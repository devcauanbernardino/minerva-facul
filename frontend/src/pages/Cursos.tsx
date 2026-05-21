import axios from 'axios'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../services/api'
import type { Curso } from '../types/curso'

export function Cursos() {
  const [cursos, setCursos] = useState<Curso[] | null>(null)
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    let ativo = true
    api
      .get<Curso[]>('/cursos')
      .then((res) => {
        if (ativo) {
          setCursos(res.data)
          setErro(null)
        }
      })
      .catch((e: unknown) => {
        if (!ativo) return
        const msg =
          mensagemRede(e) ||
          axiosErrorMessage(e) ||
          'Não foi possível obter os cursos. Confirme se o Spring Boot está rodando (porta 8080) e reinicie o frontend (npm run dev) após alterações no Vite.'
        setErro(msg)
        setCursos(null)
      })
    return () => {
      ativo = false
    }
  }, [])

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-2xl font-bold text-minerva-cinza-escuro">
          Cursos
        </h1>
        <Link
          to="/"
          className="text-sm font-semibold text-primary underline-offset-4 hover:underline"
        >
          ← Início
        </Link>
      </div>

      {erro && (
        <div
          className="mb-6 rounded-lg border border-primary/25 bg-primary/[0.06] px-4 py-3 text-sm text-minerva-cinza-escuro"
          role="alert"
        >
          {erro}
        </div>
      )}

      {cursos === null && !erro && (
        <p className="text-minerva-cinza-escuro/60">Carregando…</p>
      )}

      {cursos && cursos.length === 0 && (
        <p className="text-minerva-cinza-escuro/85">
          Nenhum curso cadastrado. Crie um pelo Swagger ou Postman em{' '}
          <code className="rounded-md border border-minerva-cinza-escuro/10 bg-minerva-marmore px-1.5 py-0.5 text-sm">
            POST /cursos
          </code>
          .
        </p>
      )}

      {cursos && cursos.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-minerva-cinza-escuro/10 bg-minerva-marmore shadow-md shadow-minerva-cinza-escuro/5">
          <table className="w-full text-left text-sm">
            <thead className="bg-minerva-cinza-claro text-minerva-cinza-escuro/75">
              <tr>
                <th className="px-4 py-3 font-semibold">Id</th>
                <th className="px-4 py-3 font-semibold">Nome</th>
                <th className="px-4 py-3 font-semibold">Carga horária</th>
                <th className="px-4 py-3 font-semibold">Semestres</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-minerva-cinza-escuro/10">
              {cursos.map((c) => (
                <tr key={c.id} className="text-minerva-cinza-escuro">
                  <td className="px-4 py-3">{c.id}</td>
                  <td className="px-4 py-3 font-medium">{c.nome}</td>
                  <td className="px-4 py-3">{c.cargaHoraria}</td>
                  <td className="px-4 py-3">{c.duracaoSemestres}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

type ErroHttpLike = {
  response?: { status?: number; data?: { mensagem?: string } }
  code?: string
}

function comoErroHttp(e: unknown): ErroHttpLike | null {
  if (typeof e !== 'object' || e === null) return null
  return e as ErroHttpLike
}

function axiosErrorMessage(e: unknown): string | null {
  const ex = comoErroHttp(e)
  if (axios.isAxiosError(e)) {
    if (ex?.response?.status === 502) {
      return 'A API não está acessível (502). O Spring Boot precisa estar rodando na porta 8080 — na pasta backend execute: .\\mvnw spring-boot:run'
    }
    if (!ex?.response) {
      return null
    }
  }
  const m = ex?.response?.data?.mensagem
  if (typeof m === 'string') return m
  if (e instanceof Error) return e.message
  return null
}

function mensagemRede(e: unknown): string | null {
  const ex = comoErroHttp(e)
  if (axios.isAxiosError(e) && ex?.code === 'ERR_NETWORK') {
    return 'Não há conexão com a API. Inicie o backend (na pasta backend: .\\mvnw spring-boot:run) e deixe o npm run dev ativo.'
  }
  return null
}
