type LoadingStateProps = {
  mensagem?: string
}

export function LoadingState({ mensagem = 'Carregando…' }: LoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20 minerva-animate-in">
      <div className="relative h-12 w-12">
        <div
          className="absolute inset-0 animate-spin rounded-full border-[3px] border-minerva-dourado/15 border-t-minerva-dourado"
          aria-hidden
        />
        <div
          className="absolute inset-2 animate-spin rounded-full border-[3px] border-primary/10 border-b-primary [animation-direction:reverse] [animation-duration:1.2s]"
          aria-hidden
        />
      </div>
      <p className="text-sm font-medium tracking-wide text-muted-foreground">{mensagem}</p>
    </div>
  )
}
