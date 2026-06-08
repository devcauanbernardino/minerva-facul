import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ClipboardDocumentListIcon } from '@heroicons/react/24/outline'
import { AlertaErro, AlertaSucesso, PageHeader } from '../components/PageHeader'
import { BadgeSituacao } from '../components/ui/BadgeSituacao'
import { EmptyState } from '../components/ui/EmptyState'
import { LoadingState } from '../components/ui/LoadingState'
import { PageContainer } from '../components/ui/PageContainer'
import { StatCard } from '../components/ui/StatCard'
import { api } from '../services/api'
import type { Aluno } from '../types/aluno'
import type { Materia } from '../types/materia'
import type { Matricula, MatriculaRequest, SituacaoMatricula } from '../types/matricula'
import { mensagemErroApi } from '../utils/apiError'
import { SituacaoPieChart } from '../components/charts/SituacaoPieChart'
import { ContagemBarChart } from '../components/charts/ContagemBarChart'
import { DistribuicaoNotasChart } from '../components/charts/DistribuicaoNotasChart'
import { MediaBarChart } from '../components/charts/MediaBarChart'
import {
  agruparContagem,
  agruparNotasPorFaixa,
  contagemPorCampo,
  mediaNotasPorCampo,
} from '../utils/charts'

export function Matriculas() {
  const [matriculas, setMatriculas] = useState<Matricula[] | null>(null)
  const [alunos, setAlunos] = useState<Aluno[]>([])
  const [materias, setMaterias] = useState<Materia[]>([])
  const [erro, setErro] = useState<string | null>(null)
  const [sucesso, setSucesso] = useState<string | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [enviando, setEnviando] = useState(false)
  const [filtro, setFiltro] = useState('')
  const [alunoId, setAlunoId] = useState('')
  const [materiaId, setMateriaId] = useState('')
  const [situacao, setSituacao] = useState<SituacaoMatricula>('ATIVA')

  const carregarMatriculas = useCallback(() => {
    return api
      .get<Matricula[]>('/matriculas')
      .then((res) => {
        setMatriculas(res.data)
        setErro(null)
      })
      .catch((e) => {
        setErro(mensagemErroApi(e, 'Não foi possível carregar as matrículas.'))
        setMatriculas([])
      })
  }, [])

  useEffect(() => {
    Promise.all([
      api.get<Aluno[]>('/alunos'),
      api.get<Materia[]>('/materias'),
      carregarMatriculas(),
    ])
      .then(([alunosRes, materiasRes]) => {
        setAlunos(alunosRes.data)
        setMaterias(materiasRes.data)
        if (alunosRes.data.length > 0) {
          const primeiro = alunosRes.data[0]
          setAlunoId(String(primeiro.id))
          const materiasDoCurso = materiasRes.data.filter((m) => m.cursoId === primeiro.curso.id)
          setMateriaId(materiasDoCurso[0] ? String(materiasDoCurso[0].id) : '')
        }
      })
      .catch((e) =>
        setErro(mensagemErroApi(e, 'Não foi possível carregar dados para matrícula.')),
      )
      .finally(() => setCarregando(false))
  }, [carregarMatriculas])

  const matriculasFiltradas = useMemo(() => {
    if (!matriculas) return []
    const termo = filtro.trim().toLowerCase()
    if (!termo) return matriculas
    return matriculas.filter(
      (m) =>
        m.alunoNome.toLowerCase().includes(termo) ||
        m.materiaNome.toLowerCase().includes(termo) ||
        m.cursoNome.toLowerCase().includes(termo),
    )
  }, [matriculas, filtro])

  const stats = useMemo(() => {
    const lista = matriculas ?? []
    return {
      total: lista.length,
      ativas: lista.filter((m) => m.situacao === 'ATIVA').length,
      concluidas: lista.filter((m) => m.situacao === 'CONCLUIDA').length,
    }
  }, [matriculas])

  const chartData = useMemo(() => {
    const lista = matriculas ?? []
    const situacoes = agruparContagem(lista.map((m) => m.situacao))
    const cursos = contagemPorCampo(lista, (m) => m.cursoNome)
    const materias = contagemPorCampo(lista, (m) => m.materiaNome)
    const faixasNota = agruparNotasPorFaixa(lista.map((m) => m.nota))
    const mediaPorCurso = mediaNotasPorCampo(lista, (m) => m.cursoNome, (m) => m.nota)
    return { situacoes, cursos, materias, faixasNota, mediaPorCurso }
  }, [matriculas])

  const alunoSelecionado = useMemo(
    () => alunos.find((a) => String(a.id) === alunoId),
    [alunos, alunoId],
  )

  const materiasDoCurso = useMemo(() => {
    if (!alunoSelecionado) return []
    return materias.filter((m) => m.cursoId === alunoSelecionado.curso.id)
  }, [materias, alunoSelecionado])

  function handleAlunoChange(novoAlunoId: string) {
    setAlunoId(novoAlunoId)
    const aluno = alunos.find((a) => String(a.id) === novoAlunoId)
    if (!aluno) {
      setMateriaId('')
      return
    }
    const doCurso = materias.filter((m) => m.cursoId === aluno.curso.id)
    setMateriaId(doCurso[0] ? String(doCurso[0].id) : '')
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!alunoId || !materiaId) {
      setErro('Selecione aluno e matéria.')
      return
    }

    setEnviando(true)
    setErro(null)
    setSucesso(null)

    const payload: MatriculaRequest = {
      alunoId: Number(alunoId),
      materiaId: Number(materiaId),
      situacao,
    }

    api
      .post<Matricula>('/matriculas', payload)
      .then(() => {
        setSucesso('Matrícula registrada com sucesso.')
        return carregarMatriculas()
      })
      .catch((e) => setErro(mensagemErroApi(e, 'Erro ao matricular aluno.')))
      .finally(() => setEnviando(false))
  }

  function handleAlterarSituacao(id: number, novaSituacao: SituacaoMatricula) {
    api
      .put<Matricula>(`/matriculas/${id}/situacao`, null, { params: { situacao: novaSituacao } })
      .then(() => {
        setSucesso(`Situação atualizada para ${novaSituacao}.`)
        return carregarMatriculas()
      })
      .catch((e) => setErro(mensagemErroApi(e, 'Erro ao atualizar situação.')))
  }

  function handleExcluir(id: number, alunoNome: string) {
    if (!confirm(`Excluir matrícula de ${alunoNome}?`)) return
    api
      .delete(`/matriculas/${id}`)
      .then(() => {
        setSucesso('Matrícula excluída.')
        return carregarMatriculas()
      })
      .catch((e) => setErro(mensagemErroApi(e, 'Erro ao excluir matrícula.')))
  }

  if (carregando) {
    return (
      <PageContainer>
        <PageHeader titulo="Matrículas" subtitulo="Vínculo entre aluno e matéria." />
        <LoadingState mensagem="Carregando matrículas…" />
      </PageContainer>
    )
  }

  return (
    <PageContainer largura="xl">
      <PageHeader
        titulo="Matrículas"
        subtitulo="Gerencie vínculos aluno ↔ matéria, situação acadêmica e acompanhe o total de registros."
      />

      {erro ? <AlertaErro mensagem={erro} /> : null}
      {sucesso ? <AlertaSucesso mensagem={sucesso} /> : null}

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <StatCard titulo="Total" valor={stats.total} descricao="Matrículas registradas" />
        <StatCard titulo="Ativas" valor={stats.ativas} descricao="Em andamento" destaque />
        <StatCard titulo="Concluídas" valor={stats.concluidas} descricao="Finalizadas" />
      </div>

      {(matriculas?.length ?? 0) > 0 ? (
        <div className="mb-10 grid gap-8 sm:grid-cols-2 xl:grid-cols-3">
          <SituacaoPieChart
            titulo="Matrículas por situação"
            descricao="Ativas, concluídas, canceladas e outras."
            dados={chartData.situacoes}
          />
          <ContagemBarChart
            titulo="Matrículas por curso"
            descricao="Distribuição entre os cursos."
            dados={chartData.cursos}
          />
          <ContagemBarChart
            titulo="Matrículas por matéria"
            descricao="Disciplinas com mais matrículas."
            dados={chartData.materias}
            cor="#0284c7"
          />
          <DistribuicaoNotasChart
            titulo="Distribuição de notas"
            descricao="Faixas de desempenho geral."
            dados={chartData.faixasNota}
            vazio="Nenhuma nota lançada ainda."
          />
          <MediaBarChart
            titulo="Média por curso"
            descricao="Nota média por curso (0–10)."
            dados={chartData.mediaPorCurso}
            cor="#059669"
            vazio="Lance notas para calcular médias."
          />
        </div>
      ) : null}

      <section className="mb-10 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="minerva-card p-6">
          <h2 className="mb-1 font-display text-lg font-semibold">Nova matrícula</h2>
          <p className="mb-5 text-sm text-minerva-cinza-escuro/65">
            Selecione o aluno e matricule-o em uma matéria do curso dele.
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-minerva-cinza-escuro">Aluno</label>
              <select
                value={alunoId}
                onChange={(e) => handleAlunoChange(e.target.value)}
                className="minerva-input"
                required
              >
                <option value="">Selecione</option>
                {alunos.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.nome} · {a.curso.nome}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-minerva-cinza-escuro">Matéria</label>
              {alunoSelecionado ? (
                <p className="mb-1 text-xs text-minerva-cinza-escuro/60">
                  Curso: <strong>{alunoSelecionado.curso.nome}</strong>
                </p>
              ) : null}
              <select
                value={materiaId}
                onChange={(e) => setMateriaId(e.target.value)}
                className="minerva-input"
                required
                disabled={!alunoSelecionado || materiasDoCurso.length === 0}
              >
                <option value="">
                  {!alunoSelecionado
                    ? 'Selecione um aluno primeiro'
                    : materiasDoCurso.length === 0
                      ? 'Nenhuma matéria neste curso'
                      : 'Selecione'}
                </option>
                {materiasDoCurso.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nome}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-minerva-cinza-escuro">Situação</label>
              <select
                value={situacao}
                onChange={(e) => setSituacao(e.target.value as SituacaoMatricula)}
                className="minerva-input"
              >
                <option value="ATIVA">Ativa</option>
                <option value="CONCLUIDA">Concluída</option>
                <option value="CANCELADA">Cancelada</option>
                <option value="REPROVADA">Reprovada</option>
                <option value="TRANCADA">Trancada</option>
              </select>
            </div>
            <button type="submit" disabled={enviando} className="minerva-btn-primary w-full">
              {enviando ? 'Salvando…' : 'Matricular aluno'}
            </button>
          </form>
        </div>

        <div className="minerva-card p-6">
          <h2 className="mb-4 font-display text-lg font-semibold">Antes de matricular</h2>
          <ul className="space-y-3 text-sm text-minerva-cinza-escuro/80">
            <li className="flex gap-2">
              <span className="font-bold text-primary">1.</span>
              <span>
                Cadastre{' '}
                <Link to="/alunos" className="font-semibold text-primary hover:underline">
                  alunos
                </Link>{' '}
                vinculados a um curso
              </span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-primary">2.</span>
              <span>
                Cadastre{' '}
                <Link to="/materias" className="font-semibold text-primary hover:underline">
                  matérias
                </Link>{' '}
                do mesmo curso
              </span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-primary">3.</span>
              <span>Um aluno não pode ser matriculado duas vezes na mesma matéria</span>
            </li>
          </ul>
          <div className="mt-6 rounded-lg bg-minerva-cinza-claro px-4 py-3 text-xs text-minerva-cinza-escuro/70">
            <strong>{alunos.length}</strong> alunos ·{' '}
            {alunoSelecionado ? (
              <>
                <strong>{materiasDoCurso.length}</strong> matérias em{' '}
                {alunoSelecionado.curso.nome}
              </>
            ) : (
              <>
                selecione um aluno para ver as matérias do curso
              </>
            )}
          </div>
        </div>
      </section>

      <section>
        <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-lg font-semibold">Matrículas registradas</h2>
            <p className="text-sm text-minerva-cinza-escuro/65">
              {matriculasFiltradas.length} registro(s) exibido(s)
            </p>
          </div>
          <input
            type="search"
            placeholder="Buscar aluno, matéria ou curso…"
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            className="minerva-input mt-0 w-full max-w-xs"
          />
        </div>

        {matriculasFiltradas.length === 0 ? (
          <EmptyState
            titulo="Nenhuma matrícula encontrada"
            descricao="Cadastre a primeira matrícula usando o formulário acima ou ajuste o filtro de busca."
            icone={<ClipboardDocumentListIcon className="h-7 w-7" />}
          />
        ) : (
          <div className="minerva-table-wrap overflow-x-auto">
            <table className="minerva-table">
              <thead>
                <tr>
                  <th>Aluno</th>
                  <th>Matéria</th>
                  <th>Curso</th>
                  <th>Data</th>
                  <th>Situação</th>
                  <th>Nota</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {matriculasFiltradas.map((m) => (
                  <tr key={m.id}>
                    <td>
                      <p className="font-medium text-minerva-cinza-escuro">{m.alunoNome}</p>
                      <p className="text-xs text-minerva-cinza-escuro/50">ID {m.alunoId}</p>
                    </td>
                    <td>{m.materiaNome}</td>
                    <td className="text-minerva-cinza-escuro/75">{m.cursoNome}</td>
                    <td>{m.dataCriacao}</td>
                    <td>
                      <BadgeSituacao situacao={m.situacao} />
                    </td>
                    <td>
                      {m.nota != null ? (
                        <span className="font-semibold text-minerva-cinza-escuro">
                          {m.nota.toFixed(1)}
                        </span>
                      ) : (
                        <span className="text-minerva-cinza-escuro/40">—</span>
                      )}
                    </td>
                    <td>
                      <div className="flex flex-wrap gap-2">
                        {m.situacao === 'ATIVA' ? (
                          <button
                            type="button"
                            onClick={() => handleAlterarSituacao(m.id, 'CONCLUIDA')}
                            className="text-xs font-semibold text-sky-700 hover:underline"
                          >
                            Concluir
                          </button>
                        ) : null}
                        <button
                          type="button"
                          onClick={() => handleExcluir(m.id, m.alunoNome)}
                          className="text-xs font-semibold text-primary hover:underline"
                        >
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </PageContainer>
  )
}
