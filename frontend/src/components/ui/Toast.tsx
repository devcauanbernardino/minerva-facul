import { createContext, useCallback, useContext, useState } from 'react'
import { CheckCircle2, XCircle, X } from 'lucide-react'
import { cn } from '@/lib/utils'

type ToastTipo = 'sucesso' | 'erro'

type Toast = {
  id: number
  tipo: ToastTipo
  mensagem: string
}

type ToastContextValue = {
  mostrarSucesso: (mensagem: string) => void
  mostrarErro: (mensagem: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const remover = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const adicionar = useCallback(
    (tipo: ToastTipo, mensagem: string) => {
      const id = Date.now() + Math.random()
      setToasts((prev) => [...prev, { id, tipo, mensagem }])
      setTimeout(() => remover(id), 4000)
    },
    [remover],
  )

  const mostrarSucesso = useCallback((mensagem: string) => adicionar('sucesso', mensagem), [adicionar])
  const mostrarErro = useCallback((mensagem: string) => adicionar('erro', mensagem), [adicionar])

  return (
    <ToastContext.Provider value={{ mostrarSucesso, mostrarErro }}>
      {children}
      <div className="fixed top-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            className={cn(
              'animate-in slide-in-from-top-2 fade-in flex items-start gap-3 rounded-lg border px-4 py-3 shadow-lg backdrop-blur-sm',
              toast.tipo === 'sucesso'
                ? 'border-emerald-200 bg-emerald-50/95 text-emerald-900'
                : 'border-red-200 bg-red-50/95 text-red-900',
            )}
          >
            {toast.tipo === 'sucesso' ? (
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
            ) : (
              <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
            )}
            <p className="flex-1 text-sm font-medium">{toast.mensagem}</p>
            <button
              type="button"
              onClick={() => remover(toast.id)}
              aria-label="Fechar"
              className="shrink-0 rounded-md p-0.5 opacity-60 transition hover:opacity-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) {
    throw new Error('useToast deve ser usado dentro de um ToastProvider')
  }
  return ctx
}
