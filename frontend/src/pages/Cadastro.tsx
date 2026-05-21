import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { api } from "../services/api";

export function Cadastro() {
    const [nome, setNome] = useState("");
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [confirmarSenha, setConfirmarSenha] = useState("");
    const [erro, setErro] = useState<string | null>(null);
    const [enviando, setEnviando] = useState(false);
    const navigate = useNavigate();

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

        setEnviando(true);
        try {
            await api.post("/auth/cadastro", { nome, email, senha });
            navigate("/login");
        } catch (err) {
            if (axios.isAxiosError(err) && err.response?.status === 409) {
                const data = err.response.data as { mensagem?: string };
                setErro(data.mensagem ?? "Este e-mail já está cadastrado.");
            } else if (axios.isAxiosError(err) && err.response?.status === 400) {
                setErro("Verifique os dados informados.");
            } else {
                setErro("Não foi possível cadastrar. O backend está rodando na porta 8080?");
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
                            <input
                                id="cadastro-senha"
                                type="password"
                                required
                                autoComplete="new-password"
                                value={senha}
                                onChange={(e) => setSenha(e.target.value)}
                                placeholder="••••••••"
                                className="w-full rounded-lg border border-minerva-cinza-escuro/15 bg-minerva-marmore px-4 py-2.5 text-minerva-cinza-escuro placeholder:text-minerva-cinza-escuro/40 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label
                                htmlFor="cadastro-confirmar"
                                className="text-sm font-medium text-minerva-cinza-escuro"
                            >
                                Confirmar senha
                            </label>
                            <input
                                id="cadastro-confirmar"
                                type="password"
                                required
                                autoComplete="new-password"
                                value={confirmarSenha}
                                onChange={(e) => setConfirmarSenha(e.target.value)}
                                placeholder="••••••••"
                                className="w-full rounded-lg border border-minerva-cinza-escuro/15 bg-minerva-marmore px-4 py-2.5 text-minerva-cinza-escuro placeholder:text-minerva-cinza-escuro/40 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={enviando}
                            className="w-full rounded-lg bg-primary py-3 font-semibold uppercase tracking-[0.15em] text-minerva-marmore transition hover:bg-primary/90 active:bg-primary/80 disabled:opacity-60"
                        >
                            {enviando ? "Cadastrando..." : "Criar conta"}
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
