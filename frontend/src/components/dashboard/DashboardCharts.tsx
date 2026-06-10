import { useEffect, useMemo, useState } from 'react'
import { LoadingState } from '../ui/LoadingState'
import { ContagemBarChart } from '../charts/ContagemBarChart'
import { DistribuicaoNotasChart } from '../charts/DistribuicaoNotasChart'
import { FrequenciaBarChart } from '../charts/FrequenciaBarChart'
import { MediaBarChart } from '../charts/MediaBarChart'
import { NotasFrequenciaChart } from '../charts/NotasFrequenciaChart'
import { SituacaoPieChart } from '../charts/SituacaoPieChart'
import { api } from '../../services/api'
import type { Aluno } from '../../types/aluno'
import type { Boletim } from '../../types/academico'
import type { UsuarioSessao } from '../../types/auth'
import type { Matricula } from '../../types/matricula'
import {
  agruparBolsa,
  agruparContagem,
  agruparNotasPorFaixa,
  contagemPorCampo,
  encurtarNome,
  mediaNotasPorCampo,
} from '../../utils/charts'

type DashboardChartsProps = {
  usuario: UsuarioSessao
}

const gridClass = 'mb-10 grid gap-6 lg:grid-cols-2'

export function DashboardCharts({ usuario }: DashboardChartsProps) {
  const [carregando, setCarregando] = useState(true)
  const [matriculas, setMatriculas] = useState<Matricula[]>([])
  const [alunos, setAlunos] = useState<Aluno[]>([])
  const [boletim, setBoletim] = useState<Boletim | null>(null)
  const [turmas, setTurmas] = useState<Matricula[]>([])

  useEffect(() => {
    let ativo = true

    async function carregar() {
      setCarregando(true)
      try {
        if (usuario.tipo === 'SECRETARIA') {
          const [matRes, alunosRes] = await Promise.all([
            api.get<Matricula[]>('/matriculas'),
            api.get<Aluno[]>('/alunos'),
          ])
          if (!ativo) return
          setMatriculas(matRes.data)
          setAlunos(alunosRes.data)
        } else if (usuario.tipo === 'ALUNO') {
          const res = await api.get<Boletim>('/alunos/boletim', { params: { email: usuario.email } })
          if (ativo) setBoletim(res.data)
        } else if (usuario.tipo === 'PROFESSOR') {
          const res = await api.get<Matricula[]>('/professores/turmas', {
            params: { email: usuario.email },
          })
          if (ativo) setTurmas(res.data)
        }
      } catch {
        if (!ativo) return
        setMatriculas([])
        setAlunos([])
        setBoletim(null)
        setTurmas([])
      } finally {
        if (ativo) setCarregando(false)
      }
    }

    carregar()
    return () => {
      ativo = false
    }
  }, [usuario])

  const chartsSecretaria = useMemo(() => {
    const situacoes = agruparContagem(matriculas.map((m) => m.situacao))
    const cursos = contagemPorCampo(matriculas, (m) => m.cursoNome)
    const materias = contagemPorCampo(matriculas, (m) => m.materiaNome)
    const faixasNota = agruparNotasPorFaixa(matriculas.map((m) => m.nota))
    const mediaPorCurso = mediaNotasPorCampo(
      matriculas,
      (m) => m.cursoNome,
      (m) => m.nota,
    )
    const bolsa = agruparBolsa(alunos)
    return { situacoes, cursos, materias, faixasNota, mediaPorCurso, bolsa }
  }, [matriculas, alunos])

  const chartsAluno = useMemo(() => {
    if (!boletim) return null
    const situacoes = agruparContagem(boletim.disciplinas.map((d) => d.situacao))
    const comNota = boletim.disciplinas.filter((d) => d.situacao !== 'DISPONIVEL')
    const notas = comNota.map((d) => ({
      nome: encurtarNome(d.materiaNome),
      nota: d.nota,
      frequencia: d.frequencia,
    }))
    const faixasNota = agruparNotasPorFaixa(comNota.map((d) => d.nota))
    const frequencias = comNota
      .filter((d) => d.frequencia != null)
      .map((d) => ({
        name: encurtarNome(d.materiaNome),
        value: d.frequencia!,
      }))
    const mediaPorDisciplina = comNota
      .filter((d) => d.nota != null)
      .map((d) => ({
        name: encurtarNome(d.materiaNome),
        value: d.nota!,
      }))
    return { situacoes, notas, faixasNota, frequencias, mediaPorDisciplina }
  }, [boletim])

  const chartsProfessor = useMemo(() => {
    const comNota = turmas.filter((t) => t.nota != null)
    const notas = comNota.map((t) => ({
      nome: encurtarNome(t.alunoNome, 14),
      nota: t.nota,
      frequencia: t.frequencia,
    }))
    const materias = contagemPorCampo(turmas, (t) => t.materiaNome)
    const situacoes = agruparContagem(turmas.map((t) => t.situacao))
    const faixasNota = agruparNotasPorFaixa(turmas.map((t) => t.nota))
    const mediaPorMateria = mediaNotasPorCampo(
      turmas,
      (t) => t.materiaNome,
      (t) => t.nota,
    )
    const frequencias = turmas
      .filter((t) => t.frequencia != null)
      .map((t) => ({
        name: encurtarNome(t.alunoNome, 14),
        value: t.frequencia!,
      }))
    return { notas, materias, situacoes, faixasNota, mediaPorMateria, frequencias }
  }, [turmas])

  if (carregando) {
    return (
      <div className="mb-10">
        <LoadingState mensagem="Carregando gráficos…" />
      </div>
    )
  }

  if (usuario.tipo === 'SECRETARIA') {
    return (
      <div className={gridClass}>
        <SituacaoPieChart
          titulo="Matrículas por situação"
          descricao="Distribuição geral das matrículas no sistema."
          dados={chartsSecretaria.situacoes}
          vazio="Nenhuma matrícula cadastrada ainda."
        />
        <ContagemBarChart
          titulo="Matrículas por curso"
          descricao="Cursos com mais alunos matriculados."
          dados={chartsSecretaria.cursos}
          vazio="Cadastre matrículas para ver o gráfico."
        />
        <ContagemBarChart
          titulo="Matrículas por matéria"
          descricao="Disciplinas com maior volume de matrículas."
          dados={chartsSecretaria.materias}
          cor="#0284c7"
          vazio="Cadastre matrículas para ver o gráfico."
        />
        <DistribuicaoNotasChart
          titulo="Distribuição de notas"
          descricao="Faixas de desempenho em todo o sistema."
          dados={chartsSecretaria.faixasNota}
          vazio="Nenhuma nota lançada ainda."
        />
        <MediaBarChart
          titulo="Média de notas por curso"
          descricao="Desempenho médio por curso (0–10)."
          dados={chartsSecretaria.mediaPorCurso}
          cor="#059669"
          vazio="Lance notas para calcular médias."
        />
        <SituacaoPieChart
          titulo="Alunos bolsistas"
          descricao="Proporção de bolsistas entre os alunos."
          dados={chartsSecretaria.bolsa}
          vazio="Nenhum aluno cadastrado."
        />
      </div>
    )
  }

  if (usuario.tipo === 'ALUNO' && chartsAluno) {
    return (
      <div className={gridClass}>
        <SituacaoPieChart
          titulo="Situação das disciplinas"
          descricao="Visão geral do seu curso neste semestre."
          dados={chartsAluno.situacoes}
        />
        <NotasFrequenciaChart
          titulo="Notas e frequência"
          descricao="Desempenho por disciplina matriculada."
          dados={chartsAluno.notas}
        />
        <DistribuicaoNotasChart
          titulo="Distribuição das suas notas"
          descricao="Em quantas disciplinas você está em cada faixa."
          dados={chartsAluno.faixasNota}
          vazio="Notas ainda não lançadas."
        />
        <FrequenciaBarChart
          titulo="Frequência por disciplina"
          descricao="Presença registrada em cada matéria (%)."
          dados={chartsAluno.frequencias}
          vazio="Frequência ainda não registrada."
        />
        <MediaBarChart
          titulo="Notas por disciplina"
          descricao="Comparativo de notas individuais (0–10)."
          dados={chartsAluno.mediaPorDisciplina}
          vazio="Notas ainda não lançadas."
        />
        <ContagemBarChart
          titulo="Disciplinas por status"
          descricao="Quantidade em cada situação acadêmica."
          dados={chartsAluno.situacoes.map((s) => ({ name: s.name, value: s.value }))}
          cor="#d4af37"
        />
      </div>
    )
  }

  if (usuario.tipo === 'PROFESSOR') {
    return (
      <div className={gridClass}>
        <ContagemBarChart
          titulo="Alunos por matéria"
          descricao="Tamanho das suas turmas."
          dados={chartsProfessor.materias}
          cor="#d4af37"
          vazio="Nenhum aluno vinculado às suas matérias."
        />
        <NotasFrequenciaChart
          titulo="Notas lançadas"
          descricao="Alunos com nota registrada nas suas turmas."
          dados={chartsProfessor.notas}
          vazio="Lance notas para visualizar o gráfico."
        />
        <SituacaoPieChart
          titulo="Situação das matrículas"
          descricao="Ativas, concluídas e outras situações."
          dados={chartsProfessor.situacoes}
          vazio="Nenhuma matrícula nas suas matérias."
        />
        <DistribuicaoNotasChart
          titulo="Distribuição de notas"
          descricao="Desempenho geral dos alunos nas suas turmas."
          dados={chartsProfessor.faixasNota}
          vazio="Nenhuma nota lançada ainda."
        />
        <MediaBarChart
          titulo="Média por matéria"
          descricao="Nota média de cada turma (0–10)."
          dados={chartsProfessor.mediaPorMateria}
          cor="#8b1e1e"
          vazio="Lance notas para calcular médias."
        />
        <FrequenciaBarChart
          titulo="Frequência dos alunos"
          descricao="Presença registrada por aluno (%)."
          dados={chartsProfessor.frequencias}
          vazio="Frequência ainda não registrada."
        />
      </div>
    )
  }

  return null
}
