import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { api } from "../services/api";
import { gerarMatricula } from "../utils/matricula";
import type { Curso } from "../types/curso";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

export function Cadastro() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [showSenha, setShowSenha] = useState(false);
  const [showConfirmarSenha, setShowConfirmarSenha] = useState(false);
  const [isProfessor, setIsProfessor] = useState(false);
  const [curso, setCurso] = useState("");
  const [bolsista, setBolsista] = useState(false);
  const [especialidadeDoc, setEspecialidadeDoc] = useState<File | null>(null);
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [carregandoCursos, setCarregandoCursos] = useState(true);
  const [erroCursos, setErroCursos] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let ativo = true;
    api
      .get<Curso[]>("/cursos")
      .then((res) => {
        if (!ativo) return;
        setCursos(res.data);
        setErroCursos(null);
      })
      .catch(() => {
        if (!ativo) return;
        setErroCursos(
          "Não foi possível carregar os cursos. Verifique se o backend está na porta 8080.",
        );
      })
      .finally(() => {
        if (ativo) setCarregandoCursos(false);
      });
    return () => {
      ativo = false;
    };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);

    if (senha !== confirmarSenha) {
      setErro("As senhas não conferem");
      return;
    }
    if (senha.length < 6) {
      setErro("A senha deve ter pelo menos 6 caracteres");
      return;
    }
    if (!isProfessor && curso.trim().length === 0) {
      setErro("Selecione um curso.");
      return;
    }
    if (isProfessor && especialidadeDoc === null) {
      setErro("Informe a especialidade do professor.");
      return;
    }

    setEnviando(true);
    const matricula = gerarMatricula();

    try {
      if (isProfessor) {
        const formData = new FormData();
        formData.append("nome", nome);
        formData.append("email", email);
        formData.append("matricula", matricula);
        formData.append("senha", senha);
        formData.append("tipo", "PROFESSOR");
        formData.append("especialidadeDoc", especialidadeDoc!);

        await api.post("/auth/cadastro", formData);
      } else {
        await api.post("/auth/cadastro", {
          nome,
          email,
          matricula,
          senha,
          tipo: "ALUNO",
          curso,
          bolsista,
        });
      }

      navigate("/login", { state: { matricula } });
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 409) {
        const data = err.response.data as { mensagem?: string };
        setErro(data.mensagem ?? "Este e-mail já está cadastrado.");
      } else if (axios.isAxiosError(err) && err.response?.status === 400) {
        setErro("Verifique os dados informados.");
      } else {
        setErro(
          "Não foi possível cadastrar. O backend está rodando na porta 8080?",
        );
      }
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="min-h-screen grid md:grid-cols-[45%_55%] bg-minerva-cinza-claro">
      <aside
        className="relative hidden md:flex flex-col justify-between overflow-hidden bg-primary p-12 text-minerva-marmore"
        style={{
          backgroundImage: "url(/minerva-login-side.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-primary/85 via-primary/65 to-primary/90" />

        <div className="relative z-10">
          <p className="font-display text-5xl tracking-wide">Minerva</p>
          <p className="mt-2 text-xs uppercase tracking-[0.3em] text-accent">
            Gestão Academia
          </p>
        </div>

        <div className="relative z-10 space-y-4">
          <h2 className="font-display text-3xl leading-snug">
            <span className="text-accent">Comece por aqui.</span>
            <br />
            Crie sua conta em poucos passos.
          </h2>
          <div className="h-px w-16 bg-accent" />
          <p className="text-xs uppercase tracking-[0.3em] text-accent/90">
            Sabedoria · Estratégia · Resultados
          </p>
        </div>
      </aside>

      <section className="flex items-center justify-center p-6">
        <div className="w-full max-w-md space-y-6 rounded-2xl bg-minerva-marmore p-8 shadow-lg shadow-minerva-cinza-escuro/10 md:p-10">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-accent">
              Nova conta
            </p>
            <h1 className="font-display text-3xl text-minerva-cinza-escuro">
              Cadastro
            </h1>
            <p className="text-sm text-minerva-cinza-escuro/70">
              Preencha os dados abaixo para criar seu acesso.
            </p>
          </div>

          {erro ? (
            <p
              className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
              role="alert"
            >
              {erro}
            </p>
          ) : null}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-3">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={isProfessor}
                  onChange={(e) => {
                    setIsProfessor(e.target.checked);
                    setEspecialidadeDoc(null);
                  }}
                />
                Sou professor
              </label>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="cadastro-nome"
                className="text-sm font-medium text-minerva-cinza-escuro"
              >
                Nome completo
              </label>
              <input
                id="cadastro-nome"
                type="text"
                required
                autoComplete="name"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Seu nome"
                className="w-full rounded-lg border border-minerva-cinza-escuro/15 bg-minerva-marmore px-4 py-2.5 text-minerva-cinza-escuro placeholder:text-minerva-cinza-escuro/40 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="cadastro-email"
                className="text-sm font-medium text-minerva-cinza-escuro"
              >
                E-mail
              </label>
              <input
                id="cadastro-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="voce@minerva.com"
                className="w-full rounded-lg border border-minerva-cinza-escuro/15 bg-minerva-marmore px-4 py-2.5 text-minerva-cinza-escuro placeholder:text-minerva-cinza-escuro/40 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="cadastro-senha"
                className="text-sm font-medium text-minerva-cinza-escuro"
              >
                Senha
              </label>
              <div className="relative">
                <input
                  id="cadastro-senha"
                  type={showSenha ? "text" : "password"}
                  required
                  autoComplete="new-password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-minerva-cinza-escuro/15 bg-minerva-marmore px-4 py-2.5 pr-10 text-minerva-cinza-escuro placeholder:text-minerva-cinza-escuro/40 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
                <button
                  type="button"
                  onClick={() => setShowSenha((prev) => !prev)}
                  aria-label={showSenha ? "Ocultar senha" : "Mostrar senha"}
                  className="absolute right-0 top-0 bottom-0 flex items-center justify-center w-10 text-primary hover:bg-minerva-cinza-claro rounded-r-lg"
                >
                  {showSenha ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="cadastro-confirmar"
                className="text-sm font-medium text-minerva-cinza-escuro"
              >
                Confirmar senha
              </label>
              <div className="relative">
                <input
                  id="cadastro-confirmar"
                  type={showConfirmarSenha ? "text" : "password"}
                  required
                  autoComplete="new-password"
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-minerva-cinza-escuro/15 bg-minerva-marmore px-4 py-2.5 pr-10 text-minerva-cinza-escuro placeholder:text-minerva-cinza-escuro/40 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmarSenha((prev) => !prev)}
                  aria-label={
                    showConfirmarSenha
                      ? "Ocultar confirmação de senha"
                      : "Mostrar confirmação de senha"
                  }
                  className="absolute right-0 top-0 bottom-0 flex items-center justify-center w-10 text-primary hover:bg-minerva-cinza-claro rounded-r-lg"
                >
                  {showConfirmarSenha ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {!isProfessor ? (
              <div className="space-y-4 rounded-2xl border border-minerva-cinza-escuro/10 bg-white/80 p-4 shadow-sm shadow-minerva-cinza-escuro/5">
                <p className="text-sm font-semibold text-minerva-cinza-escuro">
                  Dados do aluno
                </p>
                <div className="space-y-1.5">
                  <label
                    htmlFor="cadastro-curso"
                    className="text-sm font-medium text-minerva-cinza-escuro"
                  >
                    Curso
                  </label>
                  <select
                    id="cadastro-curso"
                    required
                    value={curso}
                    onChange={(e) => setCurso(e.target.value)}
                    disabled={carregandoCursos || cursos.length === 0}
                    className="w-full rounded-lg border border-minerva-cinza-escuro/15 bg-minerva-marmore px-4 py-2.5 text-minerva-cinza-escuro outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <option value="">
                      {carregandoCursos
                        ? "Carregando cursos..."
                        : "Selecione um curso"}
                    </option>
                    {cursos.map((c) => (
                      <option key={c.id} value={c.nome}>
                        {c.nome}
                      </option>
                    ))}
                  </select>
                  {erroCursos ? (
                    <p className="text-xs text-red-700">{erroCursos}</p>
                  ) : null}
                  {!carregandoCursos &&
                  cursos.length === 0 &&
                  !erroCursos ? (
                    <p className="text-xs text-minerva-cinza-escuro/60">
                      Nenhum curso disponível. Reinicie o backend para criar
                      os cursos padrão.
                    </p>
                  ) : null}
                </div>
                <label className="flex items-center gap-3 text-sm text-minerva-cinza-escuro">
                  <input
                    type="checkbox"
                    checked={bolsista}
                    onChange={(e) => setBolsista(e.target.checked)}
                    className="h-4 w-4 rounded border-minerva-cinza-escuro/30 text-primary accent-primary"
                  />
                  Bolsista
                </label>
              </div>
            ) : (
              <div className="space-y-4 rounded-2xl border border-minerva-cinza-escuro/10 bg-white/80 p-4 shadow-sm shadow-minerva-cinza-escuro/5">
                <div className="space-y-1.5">
                  <label
                    htmlFor="cadastro-especialidade"
                    className="text-sm font-medium text-minerva-cinza-escuro"
                  >
                    Especialidade
                  </label>
                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor="cadastro-especialidade"
                      className="inline-flex cursor-pointer items-center justify-center rounded-lg border border-minerva-cinza-escuro/15 bg-minerva-marmore px-4 py-3 text-sm font-medium text-minerva-cinza-escuro transition hover:border-primary hover:text-primary focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20"
                    >
                      Selecionar arquivo
                    </label>
                    <input
                      id="cadastro-especialidade"
                      name="especialidadeDoc"
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) =>
                        setEspecialidadeDoc(e.target.files?.[0] ?? null)
                      }
                      className="sr-only"
                    />
                  </div>
                  {especialidadeDoc ? (
                    <p className="text-sm text-minerva-cinza-escuro/70">
                      Arquivo selecionado: {especialidadeDoc.name}
                    </p>
                  ) : null}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={enviando}
              className="w-full rounded-lg bg-primary py-3 font-semibold uppercase tracking-[0.15em] text-minerva-marmore transition hover:bg-primary/90 active:bg-primary/80 disabled:opacity-60"
            >
              {enviando
                ? "Cadastrando..."
                : isProfessor
                  ? "Criar conta de professor"
                  : "Criar conta de aluno"}
            </button>
          </form>

          <div className="space-y-3">
            <hr className="border-minerva-cinza-escuro/10" />
            <p className="text-center text-xs text-minerva-cinza-escuro/60">
              Já tem conta?{" "}
              <Link
                to="/login"
                className="font-semibold text-primary hover:underline"
              >
                Entrar
              </Link>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}