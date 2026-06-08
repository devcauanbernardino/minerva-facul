import { useEffect, useMemo, useState } from 'react'
import { AcademicCapIcon } from '@heroicons/react/24/outline'
import { AlertaErro, PageHeader } from '../components/PageHeader'
import { BadgeSituacao } from '../components/ui/BadgeSituacao'
import { EmptyState } from '../components/ui/EmptyState'
import { LoadingState } from '../components/ui/LoadingState'
import { PageContainer } from '../components/ui/PageContainer'
import { StatCard } from '../components/ui/StatCard'
import { api } from '../services/api'
import type { Boletim } from '../types/academico'
import { getUsuario } from '../utils/auth'
import {
  calcularMediaNotas,
  contarPorSituacao,
  formatarFrequencia,
  formatarNota,
  labelSituacaoBoletim,
} from '../utils/academico'
import { mensagemErroApi } from '../utils/apiError'
import { SituacaoPieChart } from '../components/charts/SituacaoPieChart'
import { NotasFrequenciaChart } from '../components/charts/NotasFrequenciaChart'
import { DistribuicaoNotasChart } from '../components/charts/DistribuicaoNotasChart'
import { FrequenciaBarChart } from '../components/charts/FrequenciaBarChart'
import { MediaBarChart } from '../components/charts/MediaBarChart'
import { ContagemBarChart } from '../components/charts/ContagemBarChart'
import { agruparContagem, agruparNotasPorFaixa, encurtarNome } from '../utils/charts'

export function AlunoBoletim() {
  const usuario = getUsuario()
  const [boletim, setBoletim] = useState<Boletim | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    if (!usuario?.email) {
      setCarregando(false)
      return
    }

    let ativo = true
    api
      .get<Boletim>('/alunos/boletim', { params: { email: usuario.email } })
      .then((res) => {
        if (!ativo) return
        setBoletim(res.data)
        setErro(null)
      })
      .catch((e) => {
        if (!ativo) return
        setErro(mensagemErroApi(e, 'Não foi possível carregar o boletim. Faça login novamente.'))
        setBoletim(null)
      })
      .finally(() => {
        if (ativo) setCarregando(false)
      })

    return () => {
      ativo = false
    }
  }, [usuario?.email])

  const stats = useMemo(() => {
    if (!boletim) return null
    const media = calcularMediaNotas(boletim.disciplinas)
    return {
      total: boletim.disciplinas.length,
      cursando: contarPorSituacao(boletim.disciplinas, ['ATIVA']),
      media: media != null ? media.toFixed(1) : '—',
    }
  }, [boletim])

  const chartData = useMemo(() => {
    if (!boletim) return null
    const comNota = boletim.disciplinas.filter((d) => d.situacao !== 'DISPONIVEL')
    return {
      situacoes: agruparContagem(boletim.disciplinas.map((d) => d.situacao)),
      notas: comNota.map((d) => ({
        nome: encurtarNome(d.materiaNome),
        nota: d.nota,
        frequencia: d.frequencia,
      })),
      faixasNota: agruparNotasPorFaixa(comNota.map((d) => d.nota)),
      frequencias: comNota
        .filter((d) => d.frequencia != null)
        .map((d) => ({ name: encurtarNome(d.materiaNome), value: d.frequencia! })),
      mediaPorDisciplina: comNota
        .filter((d) => d.nota != null)
        .map((d) => ({ name: encurtarNome(d.materiaNome), value: d.nota! })),
    }
  }, [boletim])

  if (carregando) {
    return (
      <PageContainer>
        <PageHeader titulo="Boletim" subtitulo="Disciplinas e notas do semestre atual." />
        <LoadingState mensagem="Carregando boletim…" />
      </PageContainer>
    )
  }

  return (
    <PageContainer largura="xl">
      <PageHeader
        titulo="Boletim"
        subtitulo="Acompanhe suas disciplinas em andamento, notas e frequência do semestre."
      />

      {erro ? <AlertaErro mensagem={erro} /> : null}

      {boletim ? (
        <div className="space-y-8">
          <div className="minerva-hero">
            <div className="relative z-10 flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm text-minerva-marmore/75">Aluno</p>
                <h2 className="font-display text-2xl font-bold">{boletim.nome}</h2>
                <p className="mt-2 text-sm text-minerva-marmore/85">
                  {boletim.cursoNome}
                  {boletim.bolsa ? ' · Bolsista' : ''}
                </p>
                <p className="mt-1 font-mono text-xs text-minerva-marmore/70">{boletim.email}</p>
              </div>
              <div className="rounded-xl bg-minerva-marmore/15 px-4 py-3 text-center backdrop-blur-sm">
                <p className="text-xs uppercase tracking-wider text-minerva-marmore/70">Semestre</p>
                <p className="font-display text-lg font-bold">{new Date().getFullYear()}.1</p>
              </div>
            </div>
          </div>

          {stats ? (
            <div className="grid gap-4 sm:grid-cols-3">
              <StatCard titulo="Disciplinas" valor={stats.total} descricao="No seu curso" />
              <StatCard titulo="Cursando" valor={stats.cursando} descricao="Matrículas ativas" destaque />
              <StatCard titulo="Média geral" valor={stats.media} descricao="Com nota lançada" />
            </div>
          ) : null}

          {chartData ? (
            <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-3">
              <SituacaoPieChart
                titulo="Situação das disciplinas"
                descricao="Proporção entre cursando, disponível e outras situações."
                dados={chartData.situacoes}
              />
              <NotasFrequenciaChart
                titulo="Notas e frequência"
                descricao="Comparativo por disciplina matriculada."
                dados={chartData.notas}
              />
              <DistribuicaoNotasChart
                titulo="Distribuição das notas"
                descricao="Faixas de desempenho no semestre."
                dados={chartData.faixasNota}
                vazio="Notas ainda não lançadas."
              />
              <FrequenciaBarChart
                titulo="Frequência por disciplina"
                descricao="Presença em cada matéria (%)."
                dados={chartData.frequencias}
                vazio="Frequência ainda não registrada."
              />
              <MediaBarChart
                titulo="Notas por disciplina"
                descricao="Comparativo individual (0–10)."
                dados={chartData.mediaPorDisciplina}
                vazio="Notas ainda não lançadas."
              />
              <ContagemBarChart
                titulo="Disciplinas por status"
                descricao="Quantidade em cada situação."
                dados={chartData.situacoes.map((s) => ({ name: s.name, value: s.value }))}
                cor="#d4af37"
              />
            </div>
          ) : null}

          {boletim.disciplinas.length === 0 ? (
            <EmptyState
              titulo="Nenhuma disciplina no boletim"
              descricao="Aguarde a secretaria cadastrar matérias no seu curso ou realizar sua matrícula."
              icone={<AcademicCapIcon className="h-7 w-7" />}
            />
          ) : (
            <div className="minerva-table-wrap overflow-x-auto">
              <table className="minerva-table">
                <thead>
                  <tr>
                    <th>Disciplina</th>
                    <th>Situação</th>
                    <th>Nota</th>
                    <th>Frequência</th>
                  </tr>
                </thead>
                <tbody>
                  {boletim.disciplinas.map((d) => (
                    <tr key={d.materiaId}>
                      <td>
                        <p className="font-medium">{d.materiaNome}</p>
                        <p className="text-xs text-minerva-cinza-escuro/45">ID {d.materiaId}</p>
                      </td>
                      <td>
                        <BadgeSituacao situacao={d.situacao === 'ATIVA' ? 'CURSANDO' : d.situacao} />
                        <span className="sr-only">{labelSituacaoBoletim(d.situacao)}</span>
                      </td>
                      <td>
                        <span
                          className={
                            d.nota != null && d.nota >= 7
                              ? 'font-semibold text-emerald-700'
                              : d.nota != null && d.nota < 5
                                ? 'font-semibold text-red-700'
                                : 'font-semibold text-minerva-cinza-escuro'
                          }
                        >
                          {formatarNota(d.nota)}
                        </span>
                      </td>
                      <td>{formatarFrequencia(d.frequencia)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : null}
    </PageContainer>
  )
}
