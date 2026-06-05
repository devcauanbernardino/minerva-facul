import { useEffect, useState } from 'react'
import { AlertaErro, AlertaSucesso, PageHeader } from '../components/PageHeader'
import { api } from '../services/api'
import type { Curso } from '../types/curso'
import type { Materia } from '../types/materia'
import { mensagemErroApi } from '../utils/apiError'

export function Materias() {
  const [materias, setMaterias] = useState<Materia[] | null>(null)
  const [cursos, setCursos] = useState<Curso[]>([])
  const [erro, setErro] = useState<string | null>(null)
  const [sucesso, setSucesso] = useState<string | null>(null)
  const [nome, setNome] = useState('')
  const [cursoId, setCursoId] = useState('')
  const [enviando, setEnviando] = useState(false)

  function carregar() {
    setErro(null)
    Promise.all([
      api.get<Materia[]>('/materias'),
      api.get<Curso[]>('/cursos'),
    ])
      .then(([materiasRes, cursosRes]) => {
        setMaterias(materiasRes.data)
        setCursos(cursosRes.data)
        if (cursosRes.data.length > 0 && !cursoId) {
          setCursoId(String(cursosRes.data[0].id))
        }
      })
      .catch((e) => {
        setErro(mensagemErroApi(e, 'Não foi possível carregar matérias.'))
        setMaterias([])
      })
  }

  useEffect(() => {
    carregar()
  }, [])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!cursoId) {
      setErro('Selecione um curso.')
      return
    }
    setEnviando(true)
    setErro(null)
    setSucesso(null)
    api
      .post<Materia>('/materias', { nome, cursoId: Number(cursoId) })
      .then((res) => {
        setMaterias((prev) => (prev ? [...prev, res.data] : [res.data]))
        setNome('')
        setSucesso('Matéria cadastrada com sucesso.')
      })
      .catch((err) => setErro(mensagemErroApi(err, 'Erro ao cadastrar matéria.')))
      .finally(() => setEnviando(false))
  }

  function handleExcluir(id: number) {
    if (!confirm('Excluir esta matéria?')) return
    api
      .delete(`/materias/${id}`)
      .then(() => {
        setMaterias((prev) => prev?.filter((m) => m.id !== id) ?? [])
        setSucesso('Matéria excluída.')
      })
      .catch((err) => setErro(mensagemErroApi(err, 'Erro ao excluir matéria.')))
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <PageHeader
        titulo="Matérias"
        subtitulo="Disciplinas vinculadas aos cursos."
      />

      {erro ? <AlertaErro mensagem={erro} /> : null}
      {sucesso ? <AlertaSucesso mensagem={sucesso} /> : null}

      <section className="mb-10 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="rounded-xl border border-minerva-cinza-escuro/10 bg-minerva-marmore p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">Nova matéria</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Nome</label>
              <input
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
                placeholder="Ex.: Cálculo I"
                className="mt-1 w-full rounded-lg border border-minerva-cinza-escuro/15 bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Curso</label>
              <select
                value={cursoId}
                onChange={(e) => setCursoId(e.target.value)}
                className="mt-1 w-full rounded-lg border border-minerva-cinza-escuro/15 bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              >
                <option value="">Selecione</option>
                {cursos.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              disabled={enviando}
              className="w-full rounded-lg bg-primary py-3 text-sm font-semibold uppercase tracking-[0.15em] text-minerva-marmore transition hover:bg-primary/90 disabled:opacity-60"
            >
              {enviando ? 'Salvando...' : 'Cadastrar matéria'}
            </button>
          </form>
        </div>

        <div className="rounded-xl border border-minerva-cinza-escuro/10 bg-minerva-marmore p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">Sobre</h2>
          <p className="text-sm text-minerva-cinza-escuro/80">
            Cada matéria pertence a um curso. Professores podem ser vinculados
            depois pelo backend.
          </p>
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold">Matérias cadastradas</h2>
        {materias === null ? (
          <p className="text-minerva-cinza-escuro/60">Carregando…</p>
        ) : materias.length === 0 ? (
          <p className="text-minerva-cinza-escuro/85">Nenhuma matéria ainda.</p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-minerva-cinza-escuro/10 bg-minerva-marmore shadow-md">
            <table className="w-full text-left text-sm">
              <thead className="bg-minerva-cinza-claro text-minerva-cinza-escuro/75">
                <tr>
                  <th className="px-4 py-3 font-semibold">Id</th>
                  <th className="px-4 py-3 font-semibold">Nome</th>
                  <th className="px-4 py-3 font-semibold">Curso</th>
                  <th className="px-4 py-3 font-semibold">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-minerva-cinza-escuro/10">
                {materias.map((m) => (
                  <tr key={m.id}>
                    <td className="px-4 py-3">{m.id}</td>
                    <td className="px-4 py-3 font-medium">{m.nome}</td>
                    <td className="px-4 py-3">{m.cursoNome}</td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => handleExcluir(m.id)}
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
        )}
      </section>
    </div>
  )
}
