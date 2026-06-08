import { useCallback, useEffect, useMemo, useState } from 'react'
import { PencilSquareIcon } from '@heroicons/react/24/outline'
import { AlertaErro, AlertaSucesso, PageHeader } from '../components/PageHeader'
import { BadgeSituacao } from '../components/ui/BadgeSituacao'
import { EmptyState } from '../components/ui/EmptyState'
import { LoadingState } from '../components/ui/LoadingState'
import { PageContainer } from '../components/ui/PageContainer'
import { StatCard } from '../components/ui/StatCard'
import { api } from '../services/api'
import type { Matricula, NotasRequest } from '../types/matricula'
import { getUsuario } from '../utils/auth'
import { mensagemErroApi } from '../utils/apiError'
import { NotasFrequenciaChart } from '../components/charts/NotasFrequenciaChart'
import { ContagemBarChart } from '../components/charts/ContagemBarChart'
import { SituacaoPieChart } from '../components/charts/SituacaoPieChart'
import { DistribuicaoNotasChart } from '../components/charts/DistribuicaoNotasChart'
import { MediaBarChart } from '../components/charts/MediaBarChart'
import { FrequenciaBarChart } from '../components/charts/FrequenciaBarChart'
import {
  agruparContagem,
  agruparNotasPorFaixa,
  contagemPorCampo,
  encurtarNome,
  mediaNotasPorCampo,
} from '../utils/charts'

type EdicaoNotas = {
  matriculaId: number
  nota: string
  frequencia: string
}

export function ProfessorNotas() {
  const usuario = getUsuario()
  const [turmas, setTurmas] = useState<Matricula[] | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const [sucesso, setSucesso] = useState<string | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [salvandoId, setSalvandoId] = useState<number | null>(null)
  const [edicao, setEdicao] = useState<EdicaoNotas | null>(null)
  const [filtro, setFiltro] = useState('')

  const carregarTurmas = useCallback(() => {
    if (!usuario?.email) {
      setTurmas([])
      setCarregando(false)
      return Promise.resolve()
    }

    return api
      .get<Matricula[]>('/professores/turmas', { params: { email: usuario.email } })
      .then((res) => {
        setTurmas(res.data)
        setErro(null)
      })
      .catch((e) => {
        setErro(mensagemErroApi(e, 'Não foi possível carregar suas turmas.'))
        setTurmas([])
      })
  }, [usuario?.email])

  useEffect(() => {
    carregarTurmas().finally(() => setCarregando(false))
  }, [carregarTurmas])

  const turmasFiltradas = useMemo(() => {
    if (!turmas) return []
    const termo = filtro.trim().toLowerCase()
    if (!termo) return turmas
    return turmas.filter(
      (t) =>
        t.alunoNome.toLowerCase().includes(termo) ||
        t.materiaNome.toLowerCase().includes(termo) ||
        t.cursoNome.toLowerCase().includes(termo),
    )
  }, [turmas, filtro])

  const stats = useMemo(() => {
    const lista = turmas ?? []
    const comNota = lista.filter((t) => t.nota != null).length
    const materias = new Set(lista.map((t) => t.materiaNome)).size
    return { alunos: lista.length, comNota, materias }
  }, [turmas])

  const chartData = useMemo(() => {
    const lista = turmas ?? []
    const comNota = lista.filter((t) => t.nota != null)
    const notas = comNota.map((t) => ({
      nome: encurtarNome(t.alunoNome, 14),
      nota: t.nota,
      frequencia: t.frequencia,
    }))
    const materias = contagemPorCampo(lista, (t) => t.materiaNome)
    const situacoes = agruparContagem(lista.map((t) => t.situacao))
    const faixasNota = agruparNotasPorFaixa(lista.map((t) => t.nota))
    const mediaPorMateria = mediaNotasPorCampo(lista, (t) => t.materiaNome, (t) => t.nota)
    const frequencias = lista
      .filter((t) => t.frequencia != null)
      .map((t) => ({ name: encurtarNome(t.alunoNome, 14), value: t.frequencia! }))
    return { notas, materias, situacoes, faixasNota, mediaPorMateria, frequencias }
  }, [turmas])

  function iniciarEdicao(m: Matricula) {
    setEdicao({
      matriculaId: m.id,
      nota: m.nota != null ? String(m.nota) : '',
      frequencia: m.frequencia != null ? String(m.frequencia) : '',
    })
    setSucesso(null)
    setErro(null)
  }

  function cancelarEdicao() {
    setEdicao(null)
  }

  function handleSalvarNotas(e: React.FormEvent) {
    e.preventDefault()
    if (!edicao) return

    const nota = Number(edicao.nota)
    const frequencia = Number(edicao.frequencia)

    if (Number.isNaN(nota) || nota < 0 || nota > 10) {
      setErro('A nota deve estar entre 0 e 10.')
      return
    }
    if (Number.isNaN(frequencia) || frequencia < 0 || frequencia > 100) {
      setErro('A frequência deve estar entre 0% e 100%.')
      return
    }

    setSalvandoId(edicao.matriculaId)
    setErro(null)
    setSucesso(null)

    const payload: NotasRequest = { nota, frequencia }

    api
      .patch<Matricula>(`/matriculas/${edicao.matriculaId}/notas`, payload)
      .then(() => {
        setSucesso('Notas lançadas com sucesso.')
        setEdicao(null)
        return carregarTurmas()
      })
      .catch((e) => setErro(mensagemErroApi(e, 'Erro ao lançar notas.')))
      .finally(() => setSalvandoId(null))
  }

  if (carregando) {
    return (
      <PageContainer>
        <PageHeader titulo="Lançamento de notas" subtitulo="Notas e frequência das turmas." />
        <LoadingState mensagem="Carregando turmas…" />
      </PageContainer>
    )
  }

  return (
    <PageContainer largura="xl">
      <PageHeader
        titulo="Lançamento de notas"
        subtitulo={`Professor ${usuario?.nome ?? ''} · registre nota (0–10) e frequência (%) dos alunos matriculados nas suas matérias.`}
      />

      {erro ? <AlertaErro mensagem={erro} /> : null}
      {sucesso ? <AlertaSucesso mensagem={sucesso} /> : null}

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <StatCard titulo="Alunos" valor={stats.alunos} descricao="Nas suas turmas" destaque />
        <StatCard titulo="Matérias" valor={stats.materias} descricao="Sob sua responsabilidade" />
        <StatCard titulo="Com nota" valor={stats.comNota} descricao="Lançamentos realizados" />
      </div>

      <div className="mb-6 minerva-card p-5">
        <p className="text-sm text-minerva-cinza-escuro/75">
          <strong className="text-minerva-cinza-escuro">Como funciona:</strong> clique em{' '}
          <em>Lançar notas</em> na linha do aluno, informe nota e frequência e salve. Apenas matrículas{' '}
          <BadgeSituacao situacao="ATIVA" className="mx-1 align-middle" /> permitem lançamento.
        </p>
      </div>

      {(turmas?.length ?? 0) > 0 ? (
        <div className="mb-8 grid gap-8 sm:grid-cols-2 xl:grid-cols-3">
          <ContagemBarChart
            titulo="Alunos por matéria"
            descricao="Quantidade de alunos em cada turma."
            dados={chartData.materias}
            cor="#d4af37"
          />
          <NotasFrequenciaChart
            titulo="Notas lançadas"
            descricao="Desempenho dos alunos com nota registrada."
            dados={chartData.notas}
            vazio="Nenhuma nota lançada ainda."
          />
          <SituacaoPieChart
            titulo="Situação das matrículas"
            descricao="Ativas, concluídas e outras."
            dados={chartData.situacoes}
          />
          <DistribuicaoNotasChart
            titulo="Distribuição de notas"
            descricao="Faixas de desempenho nas turmas."
            dados={chartData.faixasNota}
            vazio="Nenhuma nota lançada ainda."
          />
          <MediaBarChart
            titulo="Média por matéria"
            descricao="Nota média de cada turma (0–10)."
            dados={chartData.mediaPorMateria}
            vazio="Lance notas para calcular médias."
          />
          <FrequenciaBarChart
            titulo="Frequência dos alunos"
            descricao="Presença registrada por aluno (%)."
            dados={chartData.frequencias}
            vazio="Frequência ainda não registrada."
          />
        </div>
      ) : null}

      <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-lg font-semibold">Suas turmas</h2>
          <p className="text-sm text-minerva-cinza-escuro/65">
            {turmasFiltradas.length} aluno(s) listado(s)
          </p>
        </div>
        <input
          type="search"
          placeholder="Buscar aluno ou matéria…"
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          className="minerva-input mt-0 w-full max-w-xs"
        />
      </div>

      {turmasFiltradas.length === 0 ? (
        <EmptyState
          titulo="Nenhum aluno nas suas turmas"
          descricao="Peça à secretaria para vincular matérias ao seu cadastro de professor e matricular alunos."
          icone={<PencilSquareIcon className="h-7 w-7" />}
        />
      ) : (
        <div className="minerva-table-wrap overflow-x-auto">
          <table className="minerva-table">
            <thead>
              <tr>
                <th>Aluno</th>
                <th>Matéria</th>
                <th>Curso</th>
                <th>Situação</th>
                <th>Nota</th>
                <th>Frequência</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {turmasFiltradas.map((t) => (
                <tr key={t.id}>
                  <td>
                    <p className="font-medium">{t.alunoNome}</p>
                    <p className="text-xs text-minerva-cinza-escuro/50">Matrícula #{t.id}</p>
                  </td>
                  <td>{t.materiaNome}</td>
                  <td className="text-minerva-cinza-escuro/75">{t.cursoNome}</td>
                  <td>
                    <BadgeSituacao situacao={t.situacao} />
                  </td>
                  <td>
                    {t.nota != null ? (
                      <span className="font-semibold">{t.nota.toFixed(1)}</span>
                    ) : (
                      <span className="text-minerva-cinza-escuro/40">—</span>
                    )}
                  </td>
                  <td>
                    {t.frequencia != null ? (
                      <span>{t.frequencia.toFixed(0)}%</span>
                    ) : (
                      <span className="text-minerva-cinza-escuro/40">—</span>
                    )}
                  </td>
                  <td>
                    {t.situacao === 'ATIVA' ? (
                      <button
                        type="button"
                        onClick={() => iniciarEdicao(t)}
                        className="text-sm font-semibold text-primary hover:underline"
                      >
                        Lançar notas
                      </button>
                    ) : (
                      <span className="text-xs text-minerva-cinza-escuro/45">Encerrada</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {edicao ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-minerva-cinza-escuro/40 p-4 backdrop-blur-sm">
          <form
            onSubmit={handleSalvarNotas}
            className="w-full max-w-md minerva-card p-6 shadow-xl"
          >
            <h3 className="font-display text-lg font-semibold">Lançar notas</h3>
            <p className="mt-1 text-sm text-minerva-cinza-escuro/65">
              Matrícula #{edicao.matriculaId}
            </p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium">Nota (0–10)</label>
                <input
                  type="number"
                  min={0}
                  max={10}
                  step={0.1}
                  required
                  value={edicao.nota}
                  onChange={(e) => setEdicao({ ...edicao, nota: e.target.value })}
                  className="minerva-input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Frequência (%)</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  step={1}
                  required
                  value={edicao.frequencia}
                  onChange={(e) => setEdicao({ ...edicao, frequencia: e.target.value })}
                  className="minerva-input"
                />
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                type="submit"
                disabled={salvandoId === edicao.matriculaId}
                className="minerva-btn-primary flex-1"
              >
                {salvandoId === edicao.matriculaId ? 'Salvando…' : 'Salvar'}
              </button>
              <button type="button" onClick={cancelarEdicao} className="minerva-btn-secondary">
                Cancelar
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </PageContainer>
  )
}
