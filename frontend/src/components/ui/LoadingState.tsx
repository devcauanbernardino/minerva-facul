type LoadingStateProps = {
  mensagem?: string
}

export function LoadingState({ mensagem = 'Carregando…' }: LoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16">
      <div
        className="h-10 w-10 animate-spin rounded-full border-[3px] border-minerva-cinza-escuro/10 border-t-primary"
        aria-hidden
      />
      <p className="text-sm text-minerva-cinza-escuro/60">{mensagem}</p>
    </div>
  )
}
