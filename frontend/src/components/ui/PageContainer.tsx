type PageContainerProps = {
  children: React.ReactNode
  largura?: 'md' | 'lg' | 'xl'
}

const larguras = {
  md: 'max-w-3xl',
  lg: 'max-w-4xl',
  xl: 'max-w-6xl',
}

export function PageContainer({ children, largura = 'lg' }: PageContainerProps) {
  return (
    <div className={`mx-auto ${larguras[largura]} px-4 py-10 sm:px-6`}>{children}</div>
  )
}
