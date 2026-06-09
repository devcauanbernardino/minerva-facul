# Diagramas de Implementação — Minerva

Documentação visual do que falta implementar no projeto.

---

## 1. Diagrama de Sequência — Fluxo Completo

```mermaid
sequenceDiagram
    participant Aluno as Aluno
    participant UI as Frontend
    participant API as API Backend
    participant DB as Database
    
    Note over Aluno,DB: 1. MATRICULAR EM DISCIPLINA
    Aluno->>UI: Seleciona matéria e matricula
    UI->>API: POST /matriculas { alunoId, materiaId }
    API->>API: Valida pré-requisitos
    API->>API: Verifica débitos
    API->>DB: Insere registro Matricula
    DB-->>API: OK (status=ATIVA)
    API-->>UI: MatriculaResponse
    UI-->>Aluno: "Matrícula confirmada"
    
    Note over Aluno,DB: 2. REGISTRAR NOTAS E FREQUÊNCIA
    Aluno->>UI: Professor registra nota/frequência
    UI->>API: PUT /matriculas/{id}/nota { nota: 8.5 }
    API->>DB: Atualiza notaFinal
    API->>API: Calcula situacao (nota >= 6.0 AND freq >= 75%)
    DB-->>API: OK (situacao=APROVADO)
    API-->>UI: MatriculaResponse atualizado
    
    UI->>API: PUT /matriculas/{id}/frequencia { frequencia: 85 }
    API->>DB: Atualiza frequencia
    API->>API: Recalcula situacao
    DB-->>API: OK
    API-->>UI: MatriculaResponse
    
    Note over Aluno,DB: 3. EMITIR BOLETIM
    Aluno->>UI: Solicita boletim
    UI->>API: GET /alunos/{id}/boletim
    API->>DB: Busca todas as matriculas do aluno
    API->>API: Agrupa por período/semestre
    API->>API: Calcula média, situação geral
    API-->>UI: BoletimResponse (lista de disciplinas com notas)
    UI-->>Aluno: Exibe boletim com notas e frequência
    
    Note over Aluno,DB: 4. HISTÓRICO ESCOLAR
    Aluno->>UI: Solicita histórico
    UI->>API: GET /alunos/{id}/historico
    API->>DB: Busca todas as matriculas (incluindo canceladas)
    API->>API: Formata com carga horária, situação
    API-->>UI: HistoricoResponse
    UI-->>Aluno: Exibe histórico completo
    
    Note over Aluno,DB: 5. EMITIR E PAGAR BOLETO
    Aluno->>UI: Financeiro emite boleto
    UI->>API: POST /boletos/aluno/{id} { valor: 500, vencimento }
    API->>DB: Insere Boleto (status=ABERTO)
    API-->>UI: BoletoResponse
    UI-->>Aluno: "Boleto gerado"
    
    Aluno->>UI: Aluno efetua pagamento
    UI->>API: PUT /boletos/{id}/pagar
    API->>DB: Atualiza status=PAGO, dataPagamento=now()
    API-->>UI: BoletoResponse (status=PAGO)
    UI-->>Aluno: "Pagamento confirmado"
```

---

## 2. Diagrama de Classes — Arquitetura

```mermaid
classDiagram
    class Aluno {
        +Long id
        +LocalDateTime dataMatricula
        +String nome
        +String email
        +String senha
        +Boolean bolsa
        +Curso curso
        +List~Matricula~ matriculas
        +List~Boleto~ boletos
    }
    
    class Curso {
        +Long id
        +String nome
        +Integer cargaHoraria
        +Integer duracaoSemestres
    }
    
    class Materia {
        +Long id
        +String nome
        +Curso curso
        +List~Matricula~ matriculas
        +List~Materia~ preRequisitos
        +List~Professor~ professores
    }
    
    class Matricula {
        +Long id
        +Aluno aluno
        +Materia materia
        +LocalDate dataCriacao
        +Double notaFinal
        +Double frequencia
        +MatriculaSituacao situacao
    }
    
    class MatriculaSituacao {
        <<enum>>
        ATIVA
        APROVADO
        REPROVADO
        CANCELADA
    }
    
    class Boleto {
        +Long id
        +Aluno aluno
        +Double valor
        +LocalDate vencimento
        +BoletoStatus status
        +LocalDate dataPagamento
    }
    
    class BoletoStatus {
        <<enum>>
        ABERTO
        PAGO
        VENCIDO
    }
    
    class Professor {
        +Long id
        +String nome
        +String email
        +List~Materia~ materias
    }
    
    Aluno --> Curso
    Aluno "1" -- "*" Matricula
    Aluno "1" -- "*" Boleto
    Materia "1" -- "*" Matricula
    Materia "0..*" --> "0..*" Materia : preRequisitos
    Materia "*" -- "*" Professor
    Matricula --> MatriculaSituacao
    Boleto --> BoletoStatus
```

---

## 3. Tabela de Endpoints

| Recurso | Método | Endpoint | Descrição |
|---------|--------|----------|-----------|
| **Matrícula** | POST | `/matriculas` | Matricular aluno em disciplina |
| | GET | `/matriculas/aluno/{alunoId}` | Listar matrículas ativas de um aluno |
| | GET | `/matriculas/materia/{materiaId}` | Listar alunos matriculados em uma matéria |
| | PUT | `/matriculas/{id}/nota` | Registrar nota final |
| | PUT | `/matriculas/{id}/frequencia` | Registrar frequência |
| **Boletim** | GET | `/alunos/{id}/boletim` | Gerar boletim (notas atuais) |
| **Histórico** | GET | `/alunos/{id}/historico` | Histórico escolar completo |
| **Boleto** | POST | `/boletos/aluno/{alunoId}` | Emitir boleto para aluno |
| | GET | `/boletos/aluno/{alunoId}` | Listar boletos de um aluno |
| | PUT | `/boletos/{id}/pagar` | Registrar pagamento de boleto |
| **Matéria** | POST | `/materias/{id}/prerequisitos` | Adicionar pré-requisito a matéria |

---

## 4. Regras de Negócio

### Matrícula
- ✅ Aluno deve existir
- ✅ Matéria deve existir
- ✅ Aluno não pode estar matriculado já na mesma matéria
- ✅ Aluno não pode ter débitos em aberto (ABERTO ou VENCIDO)
- ✅ Aluno deve ter cumprido todos os pré-requisitos da matéria

### Aprovação
- Nota final >= 6.0 **E** Frequência >= 75% → **APROVADO**
- Nota final < 6.0 **OU** Frequência < 75% → **REPROVADO**
- Enquanto nota e frequência não forem preenchidas → **ATIVA**

### Boletim
- Agregação de todas as matriculas ativas e aprovadas/reprovadas
- Cálculo de média geral
- Carga horária total cumprida

### Histórico
- Todas as matriculas (inclusive canceladas)
- Informações de aprovação/reprovação
- Carga horária total e distribuição por período

### Boleto
- Emissão manual ou automática por período letivo
- Status: ABERTO → PAGO ou VENCIDO
- Bloqueio de matrícula se houver débito aberto/vencido

---

## 5. Divisão de Tarefas Recomendada

### Task 1: Matrícula e Pré-requisitos
- Criar `MatriculaService` com lógica de validação
- Criar `MatriculaController` com endpoints de matrícula
- Implementar `MatriculaRepository` com queries customizadas
- Criar DTOs: `MatriculaRequest`, `MatriculaResponse`
- Atualizar modelo `Materia` com relação de pré-requisitos

### Task 2: Notas e Frequência
- Adicionar campos `notaFinal` e `frequencia` em `Matricula`
- Implementar endpoints PUT `/matriculas/{id}/nota` e `/frequencia`
- Criar lógica de cálculo de aprovação em `MatriculaService`
- Criar enums: `MatriculaSituacao`

### Task 3: Boletim e Histórico
- Criar endpoints GET `/alunos/{id}/boletim` e `/historico`
- Criar DTOs: `BoletimResponse`, `HistoricoResponse`
- Implementar agregação de dados em `MatriculaService`
- Cálculo de média e carga horária total

### Task 4: Boletos e Pagamentos
- Criar modelo `Boleto` com `BoletoStatus`
- Criar `BoletoService` e `BoletoController`
- Criar `BoletoRepository`
- Criar DTOs: `BoletoRequest`, `BoletoResponse`
- Integrar validação de débito em matrícula

### Task 5: Frontend
- Página de **Matrícula em Disciplinas**
- Página de **Visualizar Boletim**
- Página de **Histórico Escolar**
- Página de **Gerenciar Boletos** (listar, emitir, pagar)
- Atualizar página de **Alunos** com links para novas seções

---

## 6. Como Visualizar os Diagramas

### Opção 1: VS Code com extensão Mermaid
Instale a extensão `Markdown Preview Mermaid Support` no VS Code para visualizar os diagramas neste arquivo.

### Opção 2: Mermaid Live Editor
Copie o código Mermaid e cole em: https://mermaid.live/

### Opção 3: Exportar como imagem
Use a ferramenta Mermaid CLI:
```bash
npm install -g @mermaid-js/mermaid-cli
mmdc -i DIAGRAMAS_IMPLEMENTACAO.md -o diagramas.png
```

---

**Data de criação:** 05/06/2026  
**Status:** Pronto para divisão entre colaboradores
