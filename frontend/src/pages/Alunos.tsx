import { useEffect, useState } from 'react'
import { AlertaErro, PageHeader } from '../components/PageHeader'
import { api } from '../services/api'
import type { Aluno } from '../types/aluno'
import type { Curso } from '../types/curso'

export function Alunos() {
  const [alunos, setAlunos] = useState<Aluno[] | null>(null)
  const [cursos, setCursos] = useState<Curso[]>([])
  const [erro, setErro] = useState<string | null>(null)
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [cursoId, setCursoId] = useState<string>('')
  const [bolsa, setBolsa] = useState(false)

  useEffect(() => {
    api
      .get<Curso[]>('/cursos')
      .then((res) => {
        setCursos(res.data)
        if (res.data.length > 0) {
          setCursoId(String(res.data[0].id))
        }
      })
      .catch(() => {
        setErro('Não foi possível carregar os cursos. Verifique se o backend está ativo.')
      })

    api
      .get<Aluno[]>('/alunos')
      .then((res) => {
        setAlunos(res.data)
        setErro(null)
      })
      .catch(() => {
        setErro('Não foi possível carregar os alunos. Verifique se o backend está ativo.')
        setAlunos([])
      })
  }, [])

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!cursoId) {
      setErro('Selecione um curso antes de cadastrar o aluno.')
      return
    }

    api
      .post<Aluno>('/alunos', {
        nome,
        email,
        senha,
        cursoId: Number(cursoId),
        bolsa,
      })
      .then((res) => {
        setAlunos((prev) => (prev ? [...prev, res.data] : [res.data]))
        setNome('')
        setEmail('')
        setSenha('')
        setBolsa(false)
        setErro(null)
      })
      .catch(() => {
        setErro('Erro ao cadastrar aluno. Confira os dados e tente novamente.')
      })
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <PageHeader
        titulo="Alunos"
        subtitulo="Cadastro e listagem via API acadêmica."
      />

      {erro ? <AlertaErro mensagem={erro} /> : null}

      <section className="mb-10 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="rounded-xl border border-minerva-cinza-escuro/10 bg-minerva-marmore p-6 shadow-sm shadow-minerva-cinza-escuro/5">
          <h2 className="mb-4 text-lg font-semibold text-minerva-cinza-escuro">Cadastrar novo aluno</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-minerva-cinza-escuro">Nome</label>
              <input
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
                className="mt-1 w-full rounded-lg border border-minerva-cinza-escuro/15 bg-white px-3 py-2 text-sm text-minerva-cinza-escuro outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-minerva-cinza-escuro">E-mail</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1 w-full rounded-lg border border-minerva-cinza-escuro/15 bg-white px-3 py-2 text-sm text-minerva-cinza-escuro outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-minerva-cinza-escuro">Senha</label>
              <input
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
                className="mt-1 w-full rounded-lg border border-minerva-cinza-escuro/15 bg-white px-3 py-2 text-sm text-minerva-cinza-escuro outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-minerva-cinza-escuro">Curso</label>
              <select
                value={cursoId}
                onChange={(e) => setCursoId(e.target.value)}
                className="mt-1 w-full rounded-lg border border-minerva-cinza-escuro/15 bg-white px-3 py-2 text-sm text-minerva-cinza-escuro outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              >
                <option value="">Selecione um curso</option>
                {cursos.map((curso) => (
                  <option key={curso.id} value={curso.id}>
                    {curso.nome}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-3">
              <label className="inline-flex items-center gap-2 text-sm text-minerva-cinza-escuro">
                <input
                  type="checkbox"
                  checked={bolsa}
                  onChange={(e) => setBolsa(e.target.checked)}
                  className="h-4 w-4 accent-[var(--color-primary)]"
                />
                Bolsista
              </label>
            </div>

            <button
              type="submit"
              className="w-full rounded-lg bg-primary py-3 font-semibold uppercase tracking-[0.15em] text-minerva-marmore transition hover:bg-primary/90 active:bg-primary/80"
            >
              Cadastrar aluno
            </button>
          </form>
        </div>

        <div className="rounded-xl border border-minerva-cinza-escuro/10 bg-minerva-marmore p-6 shadow-sm shadow-minerva-cinza-escuro/5">
          <h2 className="mb-4 text-lg font-semibold text-minerva-cinza-escuro">Dicas</h2>
          <p className="text-sm text-minerva-cinza-escuro/80">
            O curso deve existir no backend antes de cadastrar o aluno.
          </p>
          <p className="mt-3 text-sm text-minerva-cinza-escuro/80">
            Se não houver curso, cadastre um primeiro em{' '}
            <code className="rounded-md border border-minerva-cinza-escuro/10 bg-minerva-marmore px-1.5 py-0.5 text-sm">
              /cursos
            </code>
            .
          </p>
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-minerva-cinza-escuro">Alunos cadastrados</h2>
        {alunos === null ? (
          <p className="text-minerva-cinza-escuro/60">Carregando…</p>
        ) : alunos.length === 0 ? (
          <p className="text-minerva-cinza-escuro/85">Nenhum aluno cadastrado ainda.</p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-minerva-cinza-escuro/10 bg-minerva-marmore shadow-md shadow-minerva-cinza-escuro/5">
            <table className="w-full text-left text-sm">
              <thead className="bg-minerva-cinza-claro text-minerva-cinza-escuro/75">
                <tr>
                  <th className="px-4 py-3 font-semibold">Id</th>
                  <th className="px-4 py-3 font-semibold">Nome</th>
                  <th className="px-4 py-3 font-semibold">E-mail</th>
                  <th className="px-4 py-3 font-semibold">Curso</th>
                  <th className="px-4 py-3 font-semibold">Bolsa</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-minerva-cinza-escuro/10">
                {alunos.map((aluno) => (
                  <tr key={aluno.id} className="text-minerva-cinza-escuro">
                    <td className="px-4 py-3">{aluno.id}</td>
                    <td className="px-4 py-3 font-medium">{aluno.nome}</td>
                    <td className="px-4 py-3">{aluno.email}</td>
                    <td className="px-4 py-3">{aluno.curso.nome}</td>
                    <td className="px-4 py-3">{aluno.bolsa ? 'Sim' : 'Não'}</td>
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
