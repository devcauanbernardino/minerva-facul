import { useEffect, useState } from 'react'
import { AlertaErro, AlertaSucesso, PageHeader } from '../components/PageHeader'
import { api } from '../services/api'
import type { Curso } from '../types/curso'
import { mensagemErroApi } from '../utils/apiError'

export function Cursos() {
  const [cursos, setCursos] = useState<Curso[] | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const [sucesso, setSucesso] = useState<string | null>(null)
  const [nome, setNome] = useState('')
  const [cargaHoraria, setCargaHoraria] = useState('')
  const [duracaoSemestres, setDuracaoSemestres] = useState('')
  const [enviando, setEnviando] = useState(false)

  function carregar() {
    api
      .get<Curso[]>('/cursos')
      .then((res) => {
        setCursos(res.data)
        setErro(null)
      })
      .catch((e) => {
        setErro(mensagemErroApi(e, 'Não foi possível obter os cursos.'))
        setCursos(null)
      })
  }

  useEffect(() => {
    carregar()
  }, [])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setEnviando(true)
    setErro(null)
    setSucesso(null)
    api
      .post<Curso>('/cursos', {
        nome,
        cargaHoraria: Number(cargaHoraria),
        duracaoSemestres: Number(duracaoSemestres),
      })
      .then((res) => {
        setCursos((prev) => (prev ? [...prev, res.data] : [res.data]))
        setNome('')
        setCargaHoraria('')
        setDuracaoSemestres('')
        setSucesso('Curso cadastrado com sucesso.')
      })
      .catch((err) => setErro(mensagemErroApi(err, 'Erro ao cadastrar curso.')))
      .finally(() => setEnviando(false))
  }

  function handleExcluir(id: number) {
    if (!confirm('Excluir este curso?')) return
    api
      .delete(`/cursos/${id}`)
      .then(() => {
        setCursos((prev) => prev?.filter((c) => c.id !== id) ?? [])
        setSucesso('Curso excluído.')
      })
      .catch((err) => setErro(mensagemErroApi(err, 'Erro ao excluir curso.')))
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <PageHeader
        titulo="Cursos"
        subtitulo="Cadastro e listagem de cursos da instituição."
      />

      {erro ? <AlertaErro mensagem={erro} /> : null}
      {sucesso ? <AlertaSucesso mensagem={sucesso} /> : null}

      <section className="mb-10 rounded-xl border border-minerva-cinza-escuro/10 bg-minerva-marmore p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">Novo curso</h2>
        <form
          onSubmit={handleSubmit}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium">Nome</label>
            <input
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
              placeholder="Ex.: Engenharia de Software"
              className="mt-1 w-full rounded-lg border border-minerva-cinza-escuro/15 bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Carga horária</label>
            <input
              type="number"
              min={1}
              value={cargaHoraria}
              onChange={(e) => setCargaHoraria(e.target.value)}
              required
              className="mt-1 w-full rounded-lg border border-minerva-cinza-escuro/15 bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Semestres</label>
            <input
              type="number"
              min={1}
              value={duracaoSemestres}
              onChange={(e) => setDuracaoSemestres(e.target.value)}
              required
              className="mt-1 w-full rounded-lg border border-minerva-cinza-escuro/15 bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="sm:col-span-2 lg:col-span-4">
            <button
              type="submit"
              disabled={enviando}
              className="rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold uppercase tracking-[0.12em] text-minerva-marmore hover:bg-primary/90 disabled:opacity-60"
            >
              {enviando ? 'Salvando...' : 'Cadastrar curso'}
            </button>
          </div>
        </form>
      </section>

      {cursos === null && !erro ? (
        <p className="text-minerva-cinza-escuro/60">Carregando…</p>
      ) : null}

      {cursos && cursos.length === 0 ? (
        <p className="text-minerva-cinza-escuro/85">Nenhum curso cadastrado ainda.</p>
      ) : null}

      {cursos && cursos.length > 0 ? (
        <div className="overflow-hidden rounded-xl border border-minerva-cinza-escuro/10 bg-minerva-marmore shadow-md">
          <table className="w-full text-left text-sm">
            <thead className="bg-minerva-cinza-claro text-minerva-cinza-escuro/75">
              <tr>
                <th className="px-4 py-3 font-semibold">Id</th>
                <th className="px-4 py-3 font-semibold">Nome</th>
                <th className="px-4 py-3 font-semibold">Carga horária</th>
                <th className="px-4 py-3 font-semibold">Semestres</th>
                <th className="px-4 py-3 font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-minerva-cinza-escuro/10">
              {cursos.map((c) => (
                <tr key={c.id}>
                  <td className="px-4 py-3">{c.id}</td>
                  <td className="px-4 py-3 font-medium">{c.nome}</td>
                  <td className="px-4 py-3">{c.cargaHoraria}</td>
                  <td className="px-4 py-3">{c.duracaoSemestres}</td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => handleExcluir(c.id)}
                      className="text-sm font-semibold text-primary hover:underline"
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  )
}
