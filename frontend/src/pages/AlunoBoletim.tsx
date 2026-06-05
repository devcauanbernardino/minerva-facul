import { useEffect, useState } from 'react'
import { AlertaErro, PageHeader } from '../components/PageHeader'
import { api } from '../services/api'
import type { Boletim } from '../types/academico'
import { getUsuario } from '../utils/auth'
import { mensagemErroApi } from '../utils/apiError'

function labelSituacao(situacao: string): string {
  switch (situacao) {
    case 'ATIVA':
      return 'Cursando'
    case 'DISPONIVEL':
      return 'Não matriculado'
    case 'CONCLUIDA':
      return 'Concluída'
    case 'REPROVADA':
      return 'Reprovada'
    case 'TRANCADA':
      return 'Trancada'
    default:
      return situacao
  }
}

function formatarNota(valor: number | null): string {
  return valor == null ? '—' : valor.toFixed(1)
}

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
        setErro(
          mensagemErroApi(
            e,
            'Não foi possível carregar o boletim. Faça login novamente.',
          ),
        )
        setBoletim(null)
      })
      .finally(() => {
        if (ativo) setCarregando(false)
      })

    return () => {
      ativo = false
    }
  }, [usuario?.email])

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <PageHeader
        titulo="Boletim"
        subtitulo="Disciplinas e notas do semestre atual."
      />

      {erro ? <AlertaErro mensagem={erro} /> : null}

      {carregando ? (
        <p className="text-minerva-cinza-escuro/60">Carregando boletim…</p>
      ) : boletim ? (
        <div className="space-y-6">
          <div className="rounded-xl border border-minerva-cinza-escuro/10 bg-minerva-marmore p-6 shadow-sm">
            <p className="text-sm text-minerva-cinza-escuro/80">
              <strong>{boletim.nome}</strong> · {boletim.cursoNome}
              {boletim.bolsa ? ' · Bolsista' : ''}
            </p>
          </div>

          {boletim.disciplinas.length === 0 ? (
            <p className="text-minerva-cinza-escuro/85">
              Nenhuma disciplina cadastrada para o seu curso ainda.
            </p>
          ) : (
            <div className="overflow-hidden rounded-xl border border-minerva-cinza-escuro/10 bg-minerva-marmore shadow-md">
              <table className="w-full text-left text-sm">
                <thead className="bg-minerva-cinza-claro text-minerva-cinza-escuro/75">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Disciplina</th>
                    <th className="px-4 py-3 font-semibold">Situação</th>
                    <th className="px-4 py-3 font-semibold">Nota</th>
                    <th className="px-4 py-3 font-semibold">Frequência</th>
                  </tr>
                </thead>
                <tbody>
                  {boletim.disciplinas.map((d) => (
                    <tr
                      key={d.materiaId}
                      className="border-t border-minerva-cinza-escuro/10"
                    >
                      <td className="px-4 py-3">{d.materiaNome}</td>
                      <td className="px-4 py-3">{labelSituacao(d.situacao)}</td>
                      <td className="px-4 py-3">{formatarNota(d.nota)}</td>
                      <td className="px-4 py-3">
                        {d.frequencia == null
                          ? '—'
                          : `${d.frequencia.toFixed(0)}%`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : null}
    </div>
  )
}
