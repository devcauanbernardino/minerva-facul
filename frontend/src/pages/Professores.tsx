import { useEffect, useState } from 'react'
import { AlertaErro, AlertaSucesso, PageHeader } from '../components/PageHeader'
import { api } from '../services/api'
import type { Professor } from '../types/professor'
import { mensagemErroApi } from '../utils/apiError'

export function Professores() {
  const [professores, setProfessores] = useState<Professor[] | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const [sucesso, setSucesso] = useState<string | null>(null)
  const [editandoId, setEditandoId] = useState<number | null>(null)
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [especialidade, setEspecialidade] = useState('')
  const [enviando, setEnviando] = useState(false)

  function carregar() {
    api
      .get<Professor[]>('/professores')
      .then((res) => {
        setProfessores(res.data)
        setErro(null)
      })
      .catch((e) => {
        setErro(mensagemErroApi(e, 'Não foi possível carregar professores.'))
        setProfessores([])
      })
  }

  useEffect(() => {
    carregar()
  }, [])

  function iniciarEdicao(professor: Professor) {
    setEditandoId(professor.id)
    setNome(professor.nome)
    setEmail(professor.email)
    setSenha('')
    setEspecialidade(professor.especialidade ?? '')
    setSucesso(null)
    setErro(null)
  }

  function cancelarEdicao() {
    setEditandoId(null)
    setNome('')
    setEmail('')
    setSenha('')
    setEspecialidade('')
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (editandoId === null) return
    setEnviando(true)
    setErro(null)
    setSucesso(null)
    if (!senha) {
      setErro('Informe a senha para salvar (backend exige o campo na edição).')
      setEnviando(false)
      return
    }
    api
      .put<Professor>(`/professores/${editandoId}`, {
        nome,
        email,
        senha,
        especialidade,
      })
      .then((res) => {
        setProfessores(
          (prev) =>
            prev?.map((p) => (p.id === editandoId ? res.data : p)) ?? [],
        )
        cancelarEdicao()
        setSucesso('Professor atualizado.')
      })
      .catch((err) =>
        setErro(mensagemErroApi(err, 'Erro ao atualizar professor.')),
      )
      .finally(() => setEnviando(false))
  }

  function handleExcluir(id: number) {
    if (!confirm('Excluir este professor?')) return
    api
      .delete(`/professores/${id}`)
      .then(() => {
        setProfessores((prev) => prev?.filter((p) => p.id !== id) ?? [])
        if (editandoId === id) cancelarEdicao()
        setSucesso('Professor excluído.')
      })
      .catch((err) =>
        setErro(mensagemErroApi(err, 'Erro ao excluir professor.')),
      )
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <PageHeader
        titulo="Professores"
        subtitulo="Listagem e edição. Novos professores entram pelo cadastro público."
      />

      {erro ? <AlertaErro mensagem={erro} /> : null}
      {sucesso ? <AlertaSucesso mensagem={sucesso} /> : null}

      {editandoId !== null ? (
        <section className="mb-10 rounded-xl border border-minerva-cinza-escuro/10 bg-minerva-marmore p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">Editar professor #{editandoId}</h2>
          <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium">Nome</label>
              <input
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
                className="mt-1 w-full rounded-lg border border-minerva-cinza-escuro/15 bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">E-mail</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1 w-full rounded-lg border border-minerva-cinza-escuro/15 bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Senha</label>
              <input
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
                placeholder="Informe a senha"
                className="mt-1 w-full rounded-lg border border-minerva-cinza-escuro/15 bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Especialidade</label>
              <input
                value={especialidade}
                onChange={(e) => setEspecialidade(e.target.value)}
                className="mt-1 w-full rounded-lg border border-minerva-cinza-escuro/15 bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="flex gap-3 sm:col-span-2">
              <button
                type="submit"
                disabled={enviando}
                className="rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-minerva-marmore hover:bg-primary/90 disabled:opacity-60"
              >
                {enviando ? 'Salvando...' : 'Salvar'}
              </button>
              <button
                type="button"
                onClick={cancelarEdicao}
                className="rounded-lg border border-minerva-cinza-escuro/15 px-6 py-2.5 text-sm font-medium hover:bg-minerva-cinza-claro"
              >
                Cancelar
              </button>
            </div>
          </form>
        </section>
      ) : null}

      <section>
        <h2 className="mb-4 text-lg font-semibold">Professores cadastrados</h2>
        {professores === null ? (
          <p className="text-minerva-cinza-escuro/60">Carregando…</p>
        ) : professores.length === 0 ? (
          <p className="text-minerva-cinza-escuro/85">
            Nenhum professor na API. Use a tela de{' '}
            <a href="/cadastro" className="font-semibold text-primary hover:underline">
              cadastro
            </a>{' '}
            marcando &quot;Sou professor&quot;.
          </p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-minerva-cinza-escuro/10 bg-minerva-marmore shadow-md">
            <table className="w-full text-left text-sm">
              <thead className="bg-minerva-cinza-claro text-minerva-cinza-escuro/75">
                <tr>
                  <th className="px-4 py-3 font-semibold">Id</th>
                  <th className="px-4 py-3 font-semibold">Nome</th>
                  <th className="px-4 py-3 font-semibold">E-mail</th>
                  <th className="px-4 py-3 font-semibold">Especialidade</th>
                  <th className="px-4 py-3 font-semibold">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-minerva-cinza-escuro/10">
                {professores.map((p) => (
                  <tr key={p.id}>
                    <td className="px-4 py-3">{p.id}</td>
                    <td className="px-4 py-3 font-medium">{p.nome}</td>
                    <td className="px-4 py-3">{p.email}</td>
                    <td className="px-4 py-3">{p.especialidade ?? '—'}</td>
                    <td className="px-4 py-3 space-x-3">
                      <button
                        type="button"
                        onClick={() => iniciarEdicao(p)}
                        className="text-sm font-semibold text-primary hover:underline"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleExcluir(p.id)}
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
