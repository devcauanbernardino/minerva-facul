import { useState } from "react";
import { Link } from "react-router-dom";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    console.log({ email, password });
  }

  return (
    <div className="min-h-screen grid md:grid-cols-[45%_55%] bg-minerva-cinza-claro">
      <aside
        className="relative hidden md:flex flex-col justify-between overflow-hidden bg-primary p-12 text-minerva-marmore"
        style={{
          backgroundImage: 'url(/minerva-login-side.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
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
              Informe suas credenciais para continuar.
            </p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="text-sm font-medium text-minerva-cinza-escuro"
              >
                E-mail
              </label>
              <input
                id="email"
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
              <input
                id="senha"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg border border-minerva-cinza-escuro/15 bg-minerva-marmore px-4 py-2.5 text-minerva-cinza-escuro placeholder:text-minerva-cinza-escuro/40 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
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
              className="w-full rounded-lg bg-primary py-3 font-semibold uppercase tracking-[0.15em] text-minerva-marmore transition hover:bg-primary/90 active:bg-primary/80"
            >
              Entrar
            </button>
          </form>
          <div className="space-y-3">
            <hr className="border-minerva-cinza-escuro/10" />
            <p className="text-center text-xs text-minerva-cinza-escuro/60">
              Não tem conta?{" "}
              <Link to="/cadastro" className="font-semibold text-primary hover:underline">
                Criar conta
              </Link>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
