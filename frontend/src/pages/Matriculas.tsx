import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertaErro, PageHeader } from '../components/PageHeader'
import { api } from '../services/api'
import type { Aluno } from '../types/aluno'
import type { Materia } from '../types/materia'
import type { Matricula } from '../types/matricula'
import { mensagemErroApi } from '../utils/apiError'

export function Matriculas() {
  const [matriculas] = useState<Matricula[]>([])
  const [alunos, setAlunos] = useState<Aluno[]>([])
  const [materias, setMaterias] = useState<Materia[]>([])
  const [erro, setErro] = useState<string | null>(null)
  const [alunoId, setAlunoId] = useState('')
  const [materiaId, setMateriaId] = useState('')
  const [situacao, setSituacao] = useState<Matricula['situacao']>('ATIVA')

  useEffect(() => {
    Promise.all([
      api.get<Aluno[]>('/alunos'),
      api.get<Materia[]>('/materias'),
    ])
      .then(([alunosRes, materiasRes]) => {
        setAlunos(alunosRes.data)
        setMaterias(materiasRes.data)
        if (alunosRes.data.length > 0) setAlunoId(String(alunosRes.data[0].id))
        if (materiasRes.data.length > 0) setMateriaId(String(materiasRes.data[0].id))
      })
      .catch((e) =>
        setErro(mensagemErroApi(e, 'Não foi possível carregar dados para matrícula.')),
      )
  }, [])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErro(
      'Tela pronta. O endpoint POST /matriculas ainda será implementado no backend.',
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <PageHeader
        titulo="Matrículas"
        subtitulo="Vínculo entre aluno e matéria (interface pronta para integração)."
      />

      {erro ? <AlertaErro mensagem={erro} /> : null}

      <div className="mb-6 rounded-lg border border-accent/30 bg-accent/10 px-4 py-3 text-sm text-minerva-cinza-escuro">
        UI adiantada — quando o backend expor <code className="text-xs">/matriculas</code>,
        basta conectar o formulário abaixo.
      </div>

      <section className="mb-10 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="rounded-xl border border-minerva-cinza-escuro/10 bg-minerva-marmore p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">Nova matrícula</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Aluno</label>
              <select
                value={alunoId}
                onChange={(e) => setAlunoId(e.target.value)}
                className="mt-1 w-full rounded-lg border border-minerva-cinza-escuro/15 bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              >
                <option value="">Selecione</option>
                {alunos.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.nome}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium">Matéria</label>
              <select
                value={materiaId}
                onChange={(e) => setMateriaId(e.target.value)}
                className="mt-1 w-full rounded-lg border border-minerva-cinza-escuro/15 bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              >
                <option value="">Selecione</option>
                {materias.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nome} ({m.cursoNome})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium">Situação</label>
              <select
                value={situacao}
                onChange={(e) =>
                  setSituacao(e.target.value as Matricula['situacao'])
                }
                className="mt-1 w-full rounded-lg border border-minerva-cinza-escuro/15 bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              >
                <option value="ATIVA">Ativa</option>
                <option value="CONCLUIDA">Concluída</option>
                <option value="CANCELADA">Cancelada</option>
              </select>
            </div>
            <button
              type="submit"
              className="w-full rounded-lg bg-primary py-3 text-sm font-semibold uppercase tracking-[0.15em] text-minerva-marmore hover:bg-primary/90"
            >
              Matricular aluno
            </button>
          </form>
        </div>

        <div className="rounded-xl border border-minerva-cinza-escuro/10 bg-minerva-marmore p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">Pré-requisitos</h2>
          <ul className="space-y-2 text-sm text-minerva-cinza-escuro/80">
            <li>
              <Link to="/alunos" className="font-semibold hover:underline">
                Alunos
              </Link>{' '}
              cadastrados na API
            </li>
            <li>
              <Link to="/materias" className="font-semibold hover:underline">
                Matérias
              </Link>{' '}
              vinculadas a cursos
            </li>
          </ul>
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold">Matrículas registradas</h2>
        {matriculas.length === 0 ? (
          <p className="text-minerva-cinza-escuro/85">
            Nenhuma matrícula listada ainda — aguardando API.
          </p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-minerva-cinza-escuro/10 bg-minerva-marmore shadow-md">
            <table className="w-full text-left text-sm">
              <thead className="bg-minerva-cinza-claro">
                <tr>
                  <th className="px-4 py-3 font-semibold">Aluno</th>
                  <th className="px-4 py-3 font-semibold">Matéria</th>
                  <th className="px-4 py-3 font-semibold">Data</th>
                  <th className="px-4 py-3 font-semibold">Situação</th>
                </tr>
              </thead>
              <tbody>
                {matriculas.map((m) => (
                  <tr key={m.id} className="border-t border-minerva-cinza-escuro/10">
                    <td className="px-4 py-3">{m.alunoNome}</td>
                    <td className="px-4 py-3">{m.materiaNome}</td>
                    <td className="px-4 py-3">{m.dataCriacao}</td>
                    <td className="px-4 py-3">{m.situacao}</td>
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
