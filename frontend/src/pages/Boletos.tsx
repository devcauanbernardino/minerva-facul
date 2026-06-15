import { useEffect, useMemo, useState } from 'react'
import { AlertCircle, Check, Calendar, DollarSign, Plus, Trash2 } from 'lucide-react'
import { AlertaErro, AlertaSucesso, PageHeader } from '../components/PageHeader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { EmptyState } from '../components/ui/EmptyState'
import { LoadingState } from '../components/ui/LoadingState'
import { PageContainer } from '../components/ui/PageContainer'
import { StatCard } from '../components/ui/StatCard'
import { api } from '../services/api'
import type { Boleto } from '../types/boleto'
import type { Aluno } from '../types/aluno'
import { getUsuario } from '../utils/auth'
import { mensagemErroApi } from '../utils/apiError'

export function Boletos() {
  const usuario = getUsuario()
  const [boletos, setBoletos] = useState<Boleto[] | null>(null)
  const [alunos, setAlunos] = useState<Aluno[]>([])
  const [erro, setErro] = useState<string | null>(null)
  const [sucesso, setSucesso] = useState<string | null>(null)
  const [alunoId, setAlunoId] = useState('')
  const [valor, setValor] = useState('')
  const [vencimento, setVencimento] = useState('')
  const [referencia, setReferencia] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [carregando, setCarregando] = useState(true)
  const isSecretaria = usuario?.tipo === 'SECRETARIA'

  function carregar() {
    setErro(null)
    setCarregando(true)

    if (isSecretaria) {
      api
        .get<Boleto[]>('/boletos')
        .then((res) => {
          setBoletos(res.data || [])
        })
        .catch((e) => {
          setErro(mensagemErroApi(e, 'Erro ao carregar boletos'))
          setBoletos([])
        })
        .finally(() => setCarregando(false))

      // Carregar alunos para o form
      api
        .get<Aluno[]>('/alunos')
        .then((res) => setAlunos(res.data || []))
        .catch(() => setAlunos([]))
    } else {
      // Aluno vê apenas seus boletos
      if (usuario?.id) {
        api
          .get<Boleto[]>('/boletos', { params: { alunoId: usuario.id } })
          .then((res) => {
            setBoletos(res.data || [])
          })
          .catch((e) => {
            setErro(mensagemErroApi(e, 'Erro ao carregar seus boletos'))
            setBoletos([])
          })
          .finally(() => setCarregando(false))
      }
    }
  }

  useEffect(() => {
    carregar()
  }, [isSecretaria, usuario?.id])

  function handleGerar() {
    if (!alunoId || !valor || !vencimento || !referencia.trim()) {
      setErro('Todos os campos são obrigatórios')
      return
    }

    setEnviando(true)
    setErro(null)
    setSucesso(null)

    api
      .post<Boleto>('/boletos', {
        alunoId: parseInt(alunoId),
        valor: parseFloat(valor),
        vencimento,
        referencia: referencia.trim(),
      })
      .then(() => {
        setSucesso('Boleto gerado com sucesso!')
        setAlunoId('')
        setValor('')
        setVencimento('')
        setReferencia('')
        carregar()
      })
      .catch((e) => {
        setErro(mensagemErroApi(e, 'Erro ao gerar boleto'))
      })
      .finally(() => setEnviando(false))
  }

  function handleMarcarComoPago(id: number) {
    setEnviando(true)
    setErro(null)
    setSucesso(null)

    api
      .put(`/boletos/${id}/pagar`)
      .then(() => {
        setSucesso('Boleto marcado como pago!')
        carregar()
      })
      .catch((e) => {
        setErro(mensagemErroApi(e, 'Erro ao registrar pagamento'))
      })
      .finally(() => setEnviando(false))
  }

  const stats = useMemo(() => {
    if (!boletos) return null
    const pendentes = boletos.filter((b) => b.status === 'PENDENTE')
    const pagos = boletos.filter((b) => b.status === 'PAGO')
    const totalPendente = pendentes.reduce((acc, b) => acc + b.valor, 0)

    return {
      total: boletos.length,
      pendentes: pendentes.length,
      pagos: pagos.length,
      valorPendente: totalPendente,
    }
  }, [boletos])

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR')
  }

  const formatarValor = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valor)
  }

  const getBadgeStatusColor = (status: string) => {
    switch (status) {
      case 'PAGO':
        return 'bg-green-100 text-green-800'
      case 'PENDENTE':
        return 'bg-yellow-100 text-yellow-800'
      case 'ATRASADO':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (carregando) {
    return (
      <PageContainer>
        <PageHeader
          titulo="Financeiro"
          subtitulo="Gestão de boletos e regularização de débitos"
        />
        <LoadingState mensagem="Carregando boletos…" />
      </PageContainer>
    )
  }

  return (
    <PageContainer largura="xl">
      <PageHeader
        titulo="Financeiro"
        subtitulo={isSecretaria ? 'Gestão de boletos da instituição' : 'Acompanhe seus boletos'}
      />

      {erro ? <AlertaErro mensagem={erro} /> : null}
      {sucesso ? <AlertaSucesso mensagem={sucesso} /> : null}

      {stats ? (
        <div className="grid gap-4 sm:grid-cols-4">
          <StatCard titulo="Total de Boletos" valor={stats.total.toString()} />
          <StatCard
            titulo="Pendentes"
            valor={stats.pendentes.toString()}
            subtitulo={formatarValor(stats.valorPendente)}
            icon={AlertCircle}
          />
          <StatCard titulo="Pagos" valor={stats.pagos.toString()} icon={Check} />
          <StatCard
            titulo="Valor Total Pendente"
            valor={formatarValor(stats.valorPendente)}
            icon={DollarSign}
          />
        </div>
      ) : null}

      {isSecretaria ? (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Gerar Novo Boleto
            </CardTitle>
            <CardDescription>Criar boleto para um aluno</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="aluno">Aluno *</Label>
                <Select value={alunoId} onValueChange={setAlunoId} disabled={enviando}>
                  <SelectTrigger id="aluno">
                    <SelectValue placeholder="Selecione um aluno" />
                  </SelectTrigger>
                  <SelectContent>
                    {alunos.map((aluno) => (
                      <SelectItem key={aluno.id} value={aluno.id.toString()}>
                        {aluno.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="valor">Valor (R$) *</Label>
                <Input
                  id="valor"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={valor}
                  onChange={(e) => setValor(e.target.value)}
                  disabled={enviando}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="vencimento">Vencimento *</Label>
                <Input
                  id="vencimento"
                  type="date"
                  value={vencimento}
                  onChange={(e) => setVencimento(e.target.value)}
                  disabled={enviando}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="referencia">Referência *</Label>
                <Input
                  id="referencia"
                  placeholder="Ex: Mensalidade 06/2026"
                  value={referencia}
                  onChange={(e) => setReferencia(e.target.value)}
                  disabled={enviando}
                />
              </div>
            </div>

            <Button onClick={handleGerar} disabled={enviando} className="w-full">
              {enviando ? 'Gerando…' : 'Gerar Boleto'}
            </Button>
          </CardContent>
        </Card>
      ) : null}

      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            {isSecretaria ? 'Todos os Boletos' : 'Meus Boletos'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!boletos || boletos.length === 0 ? (
            <EmptyState mensagem="Nenhum boleto encontrado" />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {isSecretaria ? <TableHead>Aluno</TableHead> : null}
                    <TableHead>Referência</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Vencimento</TableHead>
                    <TableHead>Status</TableHead>
                    {isSecretaria ? <TableHead>Ações</TableHead> : null}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {boletos.map((boleto) => (
                    <TableRow key={boleto.id}>
                      {isSecretaria ? (
                        <TableCell className="font-medium">{boleto.alunoNome}</TableCell>
                      ) : null}
                      <TableCell>{boleto.referencia}</TableCell>
                      <TableCell>{formatarValor(boleto.valor)}</TableCell>
                      <TableCell>{formatarData(boleto.vencimento)}</TableCell>
                      <TableCell>
                        <Badge className={getBadgeStatusColor(boleto.status)}>
                          {boleto.status}
                        </Badge>
                      </TableCell>
                      {isSecretaria ? (
                        <TableCell>
                          {boleto.status === 'PENDENTE' ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleMarcarComoPago(boleto.id)}
                              disabled={enviando}
                              className="gap-1"
                            >
                              <Check className="h-4 w-4" />
                              Marcar Pago
                            </Button>
                          ) : (
                            <span className="text-sm text-muted-foreground">
                              Pago em {formatarData(boleto.dataPagamento || '')}
                            </span>
                          )}
                        </TableCell>
                      ) : null}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </PageContainer>
  )
}
