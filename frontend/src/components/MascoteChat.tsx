import { useEffect, useRef, useState } from 'react'
import { Send, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { api } from '../services/api'
import { getUsuario } from '../utils/auth'

type Mensagem = {
  role: 'user' | 'assistant'
  content: string
}

export function MascoteChat() {
  const usuario = getUsuario()
  const [aberto, setAberto] = useState(false)
  const [mensagens, setMensagens] = useState<Mensagem[]>([
    {
      role: 'assistant',
      content: `Olá${usuario ? ', ' + usuario.nome.split(' ')[0] : ''}! 👋 Sou a Minerva, sua assistente. Como posso te ajudar?`,
    },
  ])
  const [input, setInput] = useState('')
  const [carregando, setCarregando] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (aberto) endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensagens, aberto])

  async function enviar() {
    const texto = input.trim()
    if (!texto || carregando) return

    const novasMensagens: Mensagem[] = [...mensagens, { role: 'user', content: texto }]
    setMensagens(novasMensagens)
    setInput('')
    setCarregando(true)

    try {
      const { data } = await api.post<{ resposta: string }>('/chat', {
        messages: novasMensagens,
        tipoPerfil: usuario?.tipo ?? '',
        nomeUsuario: usuario?.nome ?? '',
      })
      setMensagens((prev) => [...prev, { role: 'assistant', content: data.resposta }])
    } catch {
      setMensagens((prev) => [
        ...prev,
        { role: 'assistant', content: 'Não consegui me conectar agora. Tente novamente em instantes.' },
      ])
    } finally {
      setCarregando(false)
    }
  }

  return (
    <>
      {/* Painel do chat */}
      {aberto && (
        <div className="fixed bottom-28 right-5 z-50 flex w-80 flex-col rounded-2xl border bg-card shadow-2xl sm:w-96">
          {/* Header */}
          <div className="flex items-center gap-3 rounded-t-2xl bg-primary px-4 py-3 text-primary-foreground">
            <img src="/mascote.png" alt="Minerva" className="h-9 w-9 drop-shadow" />
            <div className="flex-1">
              <p className="text-sm font-semibold leading-none">Minerva</p>
              <p className="mt-0.5 text-xs text-primary-foreground/70">Assistente Minerva</p>
            </div>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setAberto(false)}
              className="text-primary-foreground hover:bg-primary-foreground/15"
              aria-label="Fechar chat"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Mensagens */}
          <div className="flex max-h-80 flex-col gap-3 overflow-y-auto p-4">
            {mensagens.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <img src="/mascote.png" alt="" className="mr-2 mt-1 h-6 w-6 flex-shrink-0 self-start" aria-hidden />
                )}
                <div
                  className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'rounded-br-sm bg-primary text-primary-foreground'
                      : 'rounded-bl-sm bg-muted text-foreground'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {carregando && (
              <div className="flex justify-start">
                <img src="/mascote.png" alt="" className="mr-2 mt-1 h-6 w-6 flex-shrink-0" aria-hidden />
                <div className="rounded-2xl rounded-bl-sm bg-muted px-4 py-3">
                  <span className="flex gap-1">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:0ms]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:150ms]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:300ms]" />
                  </span>
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* Input */}
          <div className="flex gap-2 border-t p-3">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && enviar()}
              placeholder="Digite sua mensagem..."
              className="h-9 text-sm"
              disabled={carregando}
            />
            <Button
              size="icon-sm"
              onClick={enviar}
              disabled={!input.trim() || carregando}
              className="h-9 w-9 flex-shrink-0"
              aria-label="Enviar"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Botão flutuante */}
      <button
        onClick={() => setAberto((v) => !v)}
        className="fixed bottom-5 right-5 z-50 focus:outline-none"
        aria-label={aberto ? 'Fechar assistente' : 'Abrir assistente Minerva'}
      >
        <img
          src="/mascote-olhando.gif"
          alt="Minerva"
          className="h-24 w-24 drop-shadow-xl transition-transform duration-200 hover:scale-110"
        />
      </button>
    </>
  )
}
