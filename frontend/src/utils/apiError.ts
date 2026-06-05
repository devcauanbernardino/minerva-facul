import axios from 'axios'

type ErroHttpLike = {
  response?: { status?: number; data?: { mensagem?: string } }
  code?: string
}

function comoErroHttp(e: unknown): ErroHttpLike | null {
  if (typeof e !== 'object' || e === null) return null
  return e as ErroHttpLike
}

export function mensagemErroApi(
  e: unknown,
  fallback = 'Não foi possível concluir a operação.',
): string {
  const ex = comoErroHttp(e)
  if (axios.isAxiosError(e) && ex?.code === 'ERR_NETWORK') {
    return 'Não há conexão com a API. Inicie o backend na porta 8080.'
  }
  if (axios.isAxiosError(e) && ex?.response?.status === 502) {
    return 'A API não está acessível. Execute .\\mvnw spring-boot:run na pasta backend.'
  }
  const m = ex?.response?.data?.mensagem
  if (typeof m === 'string') return m
  if (e instanceof Error) return e.message
  return fallback
}
