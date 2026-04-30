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
        <h1 className="text-2xl font-semibold text-slate-900">Cursos</h1>
        <Link
          to="/"
          className="text-sm font-medium text-indigo-600 hover:underline"
        >
          ← Início
        </Link>
      </div>

      {erro && (
        <div
          className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
          role="alert"
        >
          {erro}
        </div>
      )}

      {cursos === null && !erro && (
        <p className="text-slate-500">Carregando…</p>
      )}

      {cursos && cursos.length === 0 && (
        <p className="text-slate-600">
          Nenhum curso cadastrado. Crie um pelo Swagger ou Postman em{' '}
          <code className="rounded bg-slate-100 px-1">POST /cursos</code>.
        </p>
      )}

      {cursos && cursos.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-slate-200 shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 font-medium">Id</th>
                <th className="px-4 py-3 font-medium">Nome</th>
                <th className="px-4 py-3 font-medium">Carga horária</th>
                <th className="px-4 py-3 font-medium">Semestres</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {cursos.map((c) => (
                <tr key={c.id} className="text-slate-800">
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

function axiosErrorMessage(e: unknown): string | null {
  if (axios.isAxiosError(e) && e.response?.status === 502) {
    return 'A API não está acessível (502). O Spring Boot precisa estar rodando na porta 8080 — na pasta backend execute: .\\mvnw spring-boot:run'
  }
  if (axios.isAxiosError(e) && !e.response) {
    return null
  }
  if (typeof e === 'object' && e !== null && 'response' in e) {
    const r = (e as { response?: { data?: { mensagem?: string } } }).response
    const m = r?.data?.mensagem
    if (typeof m === 'string') return m
  }
  if (e instanceof Error) return e.message
  return null
}

function mensagemRede(e: unknown): string | null {
  if (axios.isAxiosError(e) && e.code === 'ERR_NETWORK') {
    return 'Não há conexão com a API. Inicie o backend (na pasta backend: .\\mvnw spring-boot:run) e deixe o npm run dev ativo.'
  }
  return null
}
