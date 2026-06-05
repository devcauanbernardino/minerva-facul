import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { api } from "../services/api";
import type { TipoUsuario, UsuarioSessao } from "../types/auth";
import { getUsuario, setUsuario } from "../utils/auth";
import { normalizarMatricula } from "../utils/matricula";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

type LoginLocationState = {
  matricula?: string;
};

export function Login() {
  const location = useLocation();
  const navigate = useNavigate();
  const matriculaNova = (location.state as LoginLocationState | null)?.matricula;

  const [matricula, setMatricula] = useState(matriculaNova ?? "");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (getUsuario()) navigate("/", { replace: true });
  }, [navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setEnviando(true);

    try {
      const { data } = await api.post("/auth/login", {
        matricula: normalizarMatricula(matricula),
        senha: password,
      });

      const tipo = (data.tipo?.toUpperCase() ?? "ALUNO") as TipoUsuario;
      const usuario: UsuarioSessao = {
        id: data.id,
        nome: data.nome,
        email: data.email,
        matricula: data.matricula,
        tipo,
      };
      setUsuario(usuario);
      navigate("/");
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        const body = err.response.data as { mensagem?: string };
        setErro(body.mensagem ?? "Matrícula ou senha incorretos.");
      } else if (axios.isAxiosError(err) && err.response?.status === 400) {
        setErro("Informe a matrícula e a senha.");
      } else {
        setErro(
          "Não foi possível entrar. O backend está rodando na porta 8080?",
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
            <span className="text-accent">Gestão com sabedoria.</span>
            <br />
            Resultados que conquistam.
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
              Acesso ao sistema
            </p>
            <h1 className="font-display text-3xl text-minerva-cinza-escuro">
              Entrar
            </h1>
            <p className="text-sm text-minerva-cinza-escuro/70">
              Alunos e professores usam a matrícula do cadastro. Secretaria usa{" "}
              <span className="font-mono text-primary">SECRETARIA.0001</span>.
            </p>
          </div>

          {matriculaNova ? (
            <p
              className="rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-sm text-minerva-cinza-escuro"
              role="status"
            >
              Cadastro concluído. Sua matrícula:{" "}
              <strong className="font-mono text-primary">{matriculaNova}</strong>
            </p>
          ) : null}

          {erro ? (
            <p
              className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
              role="alert"
            >
              {erro}
            </p>
          ) : null}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="matricula"
                className="text-sm font-medium text-minerva-cinza-escuro"
              >
                Matrícula
              </label>
              <input
                id="matricula"
                type="text"
                required
                autoComplete="username"
                value={matricula}
                onChange={(e) => setMatricula(e.target.value)}
                placeholder="2026.05.25.143052"
                className="w-full rounded-lg border border-minerva-cinza-escuro/15 bg-minerva-marmore px-4 py-2.5 font-mono text-minerva-cinza-escuro placeholder:text-minerva-cinza-escuro/40 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
              <p className="text-xs text-minerva-cinza-escuro/60">
                Formato: AAAA.MM.DD.HHmmss (gerada automaticamente no cadastro)
              </p>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="senha"
                  className="text-sm font-medium text-minerva-cinza-escuro"
                >
                  Senha
                </label>
                <a
                  href="#"
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  Esqueci minha senha
                </a>
              </div>
              <div className="relative">
                <input
                  id="senha"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-minerva-cinza-escuro/15 bg-minerva-marmore px-4 py-2.5 pr-10 text-minerva-cinza-escuro placeholder:text-minerva-cinza-escuro/40 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  className="absolute right-0 top-0 bottom-0 flex items-center justify-center w-10 rounded-r-lg text-primary hover:bg-minerva-cinza-claro"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm text-minerva-cinza-escuro/80">
              <input
                type="checkbox"
                className="h-4 w-4 accent-[var(--color-primary)]"
              />
              Manter conectado
            </label>

            <button
              type="submit"
              disabled={enviando}
              className="w-full rounded-lg bg-primary py-3 font-semibold uppercase tracking-[0.15em] text-minerva-marmore transition hover:bg-primary/90 active:bg-primary/80 disabled:opacity-60"
            >
              {enviando ? "Entrando..." : "Entrar"}
            </button>
          </form>
          <div className="space-y-3">
            <hr className="border-minerva-cinza-escuro/10" />
            <p className="text-center text-xs text-minerva-cinza-escuro/60">
              Não tem conta?{" "}
              <Link
                to="/cadastro"
                className="font-semibold text-primary hover:underline"
              >
                Criar conta
              </Link>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
