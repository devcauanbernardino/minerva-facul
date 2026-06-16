import { useEffect, useMemo, useState } from 'react'
import { Check, DollarSign } from 'lucide-react'
import { FileDownIcon, PlusIcon } from '../components/ui/AnimatedIcons'
import { AlertaErro, PageHeader } from '../components/PageHeader'
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
import { BadgeSituacao } from '../components/ui/BadgeSituacao'
import { EmptyState } from '../components/ui/EmptyState'
import { LoadingState } from '../components/ui/LoadingState'
import { PageContainer } from '../components/ui/PageContainer'
import { StatCard } from '../components/ui/StatCard'
import { api } from '../services/api'
import type { Boleto } from '../types/boleto'
import type { Aluno } from '../types/aluno'
import { getUsuario } from '../utils/auth'
import { mensagemErroApi } from '../utils/apiError'
import { useToast } from '../components/ui/Toast'

const formatarValor = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

const formatarData = (d: string) =>
  d ? new Date(d + 'T00:00:00').toLocaleDateString('pt-BR') : '—'

function linhaDigitavel(id: number, valor: number, vencimento: string): string {
  const v = String(id).padStart(5, '0')
  const ano = vencimento.slice(0, 4)
  const mes = vencimento.slice(5, 7)
  return `0379${v}.${ano}${mes}00 5${String(Math.floor(valor * 100)).padStart(8, '0')} 00000 1 ${ano}${mes}01 ${String(Math.floor(valor * 100)).padStart(13, '0')}`
}

function gerarBoletoPDF(boleto: Boleto, nomeAluno: string) {
  const linha = linhaDigitavel(boleto.id, boleto.valor, boleto.vencimento)
  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <title>Boleto — ${boleto.referencia}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, sans-serif; font-size: 11px; color: #111; background: #fff; padding: 24px; }
    .logo { font-size: 18px; font-weight: 900; letter-spacing: -0.5px; color: #6b1c1c; }
    .bank-bar { display: flex; align-items: center; border-bottom: 3px solid #111; padding-bottom: 8px; margin-bottom: 12px; gap: 16px; }
    .bank-code { font-size: 20px; font-weight: 900; border-left: 3px solid #111; border-right: 3px solid #111; padding: 0 12px; }
    .linha { flex: 1; font-size: 13px; font-weight: bold; text-align: right; letter-spacing: 1px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1px; background: #111; border: 1px solid #111; margin-bottom: 12px; }
    .grid-4 { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 1px; background: #111; border: 1px solid #111; margin-bottom: 12px; }
    .field { background: #fff; padding: 6px 8px; }
    .field label { display: block; font-size: 9px; color: #555; text-transform: uppercase; margin-bottom: 2px; }
    .field span { font-size: 12px; font-weight: bold; }
    .field.full { grid-column: 1 / -1; }
    .section-title { font-size: 9px; font-weight: bold; text-transform: uppercase; color: #6b1c1c; margin: 16px 0 6px; border-bottom: 1px solid #ccc; padding-bottom: 3px; }
    .barcode { display: flex; gap: 1px; height: 60px; margin: 16px 0 6px; }
    .bar { background: #111; }
    .barcode-num { font-size: 10px; letter-spacing: 2px; text-align: center; margin-bottom: 12px; }
    .cutline { border-top: 1px dashed #999; margin: 20px 0; text-align: center; font-size: 9px; color: #999; padding-top: 4px; }
    .watermark { text-align: center; margin-top: 16px; font-size: 9px; color: #bbb; }
    @media print { body { padding: 12px; } }
  </style>
</head>
<body>
  <div class="bank-bar">
    <div class="logo">MINERVA</div>
    <div class="bank-code">037-9</div>
    <div class="linha">${linha}</div>
  </div>

  <div class="grid">
    <div class="field full">
      <label>Beneficiário</label>
      <span>INSTITUIÇÃO DE ENSINO MINERVA LTDA — CNPJ 00.000.000/0001-00</span>
    </div>
  </div>

  <div class="grid-4">
    <div class="field">
      <label>Agência / Código beneficiário</label>
      <span>0379 / 00001-0</span>
    </div>
    <div class="field">
      <label>Espécie</label>
      <span>R$</span>
    </div>
    <div class="field">
      <label>Quantidade</label>
      <span>—</span>
    </div>
    <div class="field">
      <label>Nosso número</label>
      <span>${String(boleto.id).padStart(10, '0')}-${boleto.id % 9}</span>
    </div>
  </div>

  <div class="grid-4">
    <div class="field">
      <label>Número do documento</label>
      <span>MRV${String(boleto.id).padStart(7, '0')}</span>
    </div>
    <div class="field">
      <label>Vencimento</label>
      <span>${formatarData(boleto.vencimento)}</span>
    </div>
    <div class="field">
      <label>Data do documento</label>
      <span>${new Date().toLocaleDateString('pt-BR')}</span>
    </div>
    <div class="field">
      <label>Valor do documento</label>
      <span>${formatarValor(boleto.valor)}</span>
    </div>
  </div>

  <p class="section-title">Instruções</p>
  <div class="grid">
    <div class="field" style="grid-column:1/3">
      <label>Instruções ao caixa</label>
      <span>Não receber após o vencimento. Juros de 2% ao mês após vencimento.</span>
    </div>
    <div class="field">
      <label>Valor cobrado</label>
      <span>&nbsp;</span>
    </div>
  </div>

  <div class="grid">
    <div class="field full">
      <label>Pagador</label>
      <span>${nomeAluno}</span>
    </div>
  </div>

  <div class="grid">
    <div class="field full">
      <label>Referência</label>
      <span>${boleto.referencia}</span>
    </div>
  </div>

  <div class="barcode">
    ${Array.from({ length: 120 }, (_, i) => {
      const w = (i % 3 === 0 ? 4 : i % 5 === 0 ? 2 : 1)
      return i % 2 === 0 ? `<div class="bar" style="width:${w}px"></div><div style="width:${Math.max(1, w - 1)}px"></div>` : ''
    }).join('')}
  </div>
  <div class="barcode-num">${linha.replace(/\s/g, '  ')}</div>

  <div class="cutline">✂ Recibo do pagador</div>

  <div class="grid-4">
    <div class="field">
      <label>Beneficiário</label>
      <span>Minerva Ensino</span>
    </div>
    <div class="field">
      <label>Vencimento</label>
      <span>${formatarData(boleto.vencimento)}</span>
    </div>
    <div class="field">
      <label>Valor</label>
      <span>${formatarValor(boleto.valor)}</span>
    </div>
    <div class="field">
      <label>Autenticação mecânica</label>
      <span>&nbsp;</span>
    </div>
  </div>

  <div class="watermark">Boleto fictício gerado pelo sistema Minerva — não tem valor legal</div>

  <script>window.onload = () => { window.print() }<\/script>
</body>
</html>`

  const win = window.open('', '_blank', 'width=900,height=700')
  if (win) {
    win.document.write(html)
    win.document.close()
  }
}

export function Boletos() {
  const usuario = getUsuario()
  const { mostrarSucesso, mostrarErro } = useToast()
  const [boletos, setBoletos] = useState<Boleto[] | null>(null)
  const [alunos, setAlunos] = useState<Aluno[]>([])
  const [erro, setErro] = useState<string | null>(null)
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
    const endpoint = isSecretaria
      ? api.get<Boleto[]>('/boletos')
      : api.get<Boleto[]>('/boletos', { params: { alunoId: usuario?.id } })

    endpoint
      .then((res) => setBoletos(res.data ?? []))
      .catch((e) => {
        setErro(mensagemErroApi(e, 'Erro ao carregar boletos'))
        setBoletos([])
      })
      .finally(() => setCarregando(false))

    if (isSecretaria) {
      api.get<Aluno[]>('/alunos').then((res) => setAlunos(res.data ?? [])).catch(() => {})
    }
  }

  useEffect(() => { carregar() }, [isSecretaria, usuario?.id])

  function handleGerar() {
    if (!alunoId || !valor || !vencimento || !referencia.trim()) {
      setErro('Todos os campos são obrigatórios.')
      return
    }
    setEnviando(true)
    setErro(null)
    api
      .post<Boleto>('/boletos', {
        alunoId: Number(alunoId),
        valor: parseFloat(valor),
        vencimento,
        referencia: referencia.trim(),
      })
      .then(() => {
        mostrarSucesso('Boleto gerado com sucesso.')
        setAlunoId('')
        setValor('')
        setVencimento('')
        setReferencia('')
        carregar()
      })
      .catch((e) => mostrarErro(mensagemErroApi(e, 'Erro ao gerar boleto')))
      .finally(() => setEnviando(false))
  }

  function handleMarcarComoPago(id: number) {
    api
      .put(`/boletos/${id}/pagar`)
      .then(() => { mostrarSucesso('Boleto marcado como pago.'); carregar() })
      .catch((e) => mostrarErro(mensagemErroApi(e, 'Erro ao registrar pagamento')))
  }

  const stats = useMemo(() => {
    const lista = boletos ?? []
    const pendentes = lista.filter((b) => b.status === 'PENDENTE')
    return {
      total: lista.length,
      pendentes: pendentes.length,
      pagos: lista.filter((b) => b.status === 'PAGO').length,
      valorPendente: pendentes.reduce((acc, b) => acc + b.valor, 0),
    }
  }, [boletos])

  if (carregando) {
    return (
      <PageContainer>
        <PageHeader titulo="Financeiro" subtitulo="Boletos e regularização de débitos." />
        <LoadingState mensagem="Carregando boletos…" />
      </PageContainer>
    )
  }

  return (
    <PageContainer largura="xl">
      <PageHeader
        titulo="Financeiro"
        subtitulo={isSecretaria ? 'Gestão de boletos da instituição.' : 'Acompanhe seus boletos e pagamentos.'}
      />

      {erro ? <AlertaErro mensagem={erro} /> : null}

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard titulo="Total" valor={stats.total} descricao="Boletos gerados" />
        <StatCard titulo="Pendentes" valor={stats.pendentes} descricao="Aguardando pagamento" destaque />
        <StatCard titulo="Pagos" valor={stats.pagos} descricao="Liquidados" />
        <StatCard titulo="Valor pendente" valor={formatarValor(stats.valorPendente)} descricao="A receber" />
      </div>

      {isSecretaria ? (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PlusIcon className="h-4 w-4 text-primary" />
              Gerar novo boleto
            </CardTitle>
            <CardDescription>Emita um boleto para um aluno.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-1.5">
                <Label>Aluno</Label>
                <Select value={alunoId} onValueChange={setAlunoId}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {alunos.map((a) => (
                      <SelectItem key={a.id} value={String(a.id)}>{a.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Valor (R$)</Label>
                <Input type="number" step="0.01" min="0" placeholder="0,00" value={valor} onChange={(e) => setValor(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Vencimento</Label>
                <Input type="date" value={vencimento} onChange={(e) => setVencimento(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Referência</Label>
                <Input placeholder="Ex: Mensalidade 06/2026" value={referencia} onChange={(e) => setReferencia(e.target.value)} />
              </div>
            </div>
            <Button className="mt-4" onClick={handleGerar} disabled={enviando}>
              {enviando ? 'Gerando…' : 'Gerar boleto'}
            </Button>
          </CardContent>
        </Card>
      ) : null}

      <section>
        <h2 className="mb-4 font-display text-lg font-semibold">
          {isSecretaria ? 'Todos os boletos' : 'Meus boletos'}
        </h2>

        {!boletos || boletos.length === 0 ? (
          <EmptyState
            titulo="Nenhum boleto encontrado"
            descricao="Nenhum boleto foi gerado ainda."
            icone={<DollarSign className="h-7 w-7" />}
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {boletos.map((b) => {
              const nomeAluno = alunos.find((a) => a.id === b.alunoId)?.nome ?? b.alunoNome
              return (
                <Card key={b.id} className="gap-0 overflow-hidden p-0">
                  <CardContent className="flex-1 space-y-3 p-5">
                    {isSecretaria ? (
                      <p className="truncate font-display text-base font-semibold leading-tight">
                        {b.alunoNome}
                      </p>
                    ) : null}
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium">{b.referencia}</p>
                      <BadgeSituacao situacao={b.status as 'ATIVA'} />
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Vence: <span className="font-semibold text-foreground">{formatarData(b.vencimento)}</span></span>
                      <span className="font-semibold text-foreground text-sm">{formatarValor(b.valor)}</span>
                    </div>
                    {b.dataPagamento ? (
                      <p className="text-xs text-muted-foreground">
                        Pago em: <span className="font-semibold">{formatarData(b.dataPagamento)}</span>
                      </p>
                    ) : null}
                  </CardContent>

                  <div className="flex border-t divide-x divide-border">
                    <Button
                      type="button"
                      variant="ghost"
                      className="flex-1 rounded-none gap-1.5 text-xs font-medium"
                      onClick={() => gerarBoletoPDF(b, nomeAluno)}
                    >
                      <FileDownIcon className="h-3.5 w-3.5" />
                      PDF
                    </Button>
                    {isSecretaria && b.status === 'PENDENTE' ? (
                      <Button
                        type="button"
                        variant="ghost"
                        className="flex-1 rounded-none gap-1.5 text-xs font-medium"
                        onClick={() => handleMarcarComoPago(b.id)}
                      >
                        <Check className="h-3.5 w-3.5" />
                        Marcar pago
                      </Button>
                    ) : null}
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </section>
    </PageContainer>
  )
}
