import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { api } from "../services/api";
import type { TipoUsuario, UsuarioSessao } from "../types/auth";
import { getUsuario, setUsuario } from "../utils/auth";
import { normalizarMatricula } from "../utils/matricula";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { MinervaLogo } from "../components/MinervaLogo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

type LoginLocationState = {
  matricula?: string;
};

const CONTAS_DEMO = [
  {
    label: "Aluno Ana",
    matricula: "2026.06.08.100201",
    senha: "demo123",
  },
  {
    label: "Prof. Marina",
    matricula: "2026.06.08.100101",
    senha: "demo123",
  },
  {
    label: "Secretaria",
    matricula: "SECRETARIA.0001",
    senha: "secretaria123",
  },
] as const;

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
        className="relative hidden md:flex flex-col justify-end overflow-hidden bg-primary p-12 text-minerva-marmore"
        style={{
          backgroundImage: "url(/minerva-login-side.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-primary/85 via-primary/65 to-primary/90" />

        <div className="relative z-10 space-y-4">
          <h2 className="font-display text-3xl leading-snug">
            <span className="text-minerva-dourado">Gestão com sabedoria.</span>
            <br />
            Resultados que conquistam.
          </h2>
          <div className="h-px w-16 bg-minerva-dourado" />
          <p className="text-xs uppercase tracking-[0.3em] text-minerva-dourado/90">
            Sabedoria · Estratégia · Resultados
          </p>
        </div>
      </aside>

      <section className="flex flex-col items-center justify-center p-6">
        <div className="mb-6 md:hidden">
          <MinervaLogo variant="md" linkToHome showWordmark />
        </div>
        <div className="w-full max-w-md">
          <Card className="shadow-lg">
            <CardContent className="space-y-6 p-8 md:p-10">
          <div className="hidden justify-center md:flex">
            <MinervaLogo variant="sm" showWordmark />
          </div>
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-minerva-dourado">
              Acesso ao sistema
            </p>
            <h1 className="font-display text-3xl">
              Entrar
            </h1>
            <p className="text-sm text-muted-foreground">
              Use a <strong>matrícula</strong> (não o e-mail). Contas que você
              cadastrou usam a senha definida no cadastro — não{" "}
              <span className="font-mono">demo123</span>.
            </p>
          </div>

          <div className="rounded-lg border border-dashed border-primary/25 bg-primary/5 p-4 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-minerva-dourado">
              Contas de demonstração
            </p>
            <p className="text-xs text-muted-foreground">
              Clique para preencher matrícula e senha automaticamente.
            </p>
            <div className="flex flex-wrap gap-2">
              {CONTAS_DEMO.map((conta) => (
                <Button
                  key={conta.matricula}
                  type="button"
                  variant="outline"
                  size="sm"
                  className="font-normal"
                  onClick={() => {
                    setMatricula(conta.matricula);
                    setPassword(conta.senha);
                    setErro(null);
                  }}
                >
                  {conta.label}
                </Button>
              ))}
            </div>
          </div>

          {matriculaNova ? (
            <Alert className="border-primary/20 bg-primary/5" role="status">
              <AlertDescription>
                Cadastro concluído. Sua matrícula:{" "}
                <strong className="font-mono text-primary">{matriculaNova}</strong>
              </AlertDescription>
            </Alert>
          ) : null}

          {erro ? (
            <Alert variant="destructive" className="border-destructive/30 bg-destructive/5" role="alert">
              <AlertDescription className="text-destructive">{erro}</AlertDescription>
            </Alert>
          ) : null}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="matricula">Matrícula</Label>
              <Input
                id="matricula"
                type="text"
                required
                autoComplete="username"
                value={matricula}
                onChange={(e) => setMatricula(e.target.value)}
                placeholder="2026.05.25.143052"
                className="h-10 font-mono"
              />
              <p className="text-xs text-muted-foreground">
                Formato: AAAA.MM.DD.HHmmss (gerada automaticamente no cadastro)
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="senha">Senha</Label>
                <a
                  href="#"
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  Esqueci minha senha
                </a>
              </div>
              <div className="relative">
                <Input
                  id="senha"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-10 pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  className="absolute right-0 top-0 h-10 w-10 text-primary hover:bg-muted"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </Button>
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <input
                type="checkbox"
                className="h-4 w-4 accent-primary"
              />
              Manter conectado
            </label>

            <Button
              type="submit"
              disabled={enviando}
              className="h-11 w-full uppercase tracking-[0.15em]"
            >
              {enviando ? "Entrando..." : "Entrar"}
            </Button>
          </form>
          <div className="space-y-3">
            <Separator />
            <p className="text-center text-xs text-muted-foreground">
              Não tem conta?{" "}
              <Link
                to="/cadastro"
                className="font-semibold text-primary hover:underline"
              >
                Criar conta
              </Link>
            </p>
          </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
