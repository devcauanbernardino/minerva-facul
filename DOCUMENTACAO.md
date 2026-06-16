# Minerva — Sistema de Gestão Acadêmica
## Documentação Técnica do Projeto

---

## 1. Visão Geral

O **Minerva** é um sistema web completo de gestão acadêmica desenvolvido com arquitetura cliente-servidor. Ele gerencia alunos, professores, cursos, disciplinas, matrículas e financeiro, com suporte a múltiplos perfis de usuário e um assistente de IA integrado.

| Camada | Tecnologia |
|---|---|
| Backend | Spring Boot 4.0.6 (Java 17) |
| Banco de dados | SQLite (arquivo local) |
| Frontend | React 19 + TypeScript + Vite |
| Estilização | Tailwind CSS + shadcn/ui |
| IA | Groq API — modelo `llama-3.3-70b-versatile` |

---

## 2. Arquitetura

```
minerva/
├── backend/          # API REST — Spring Boot
│   └── src/main/java/br/com/minerva/minerva/
│       ├── controller/     # Endpoints HTTP
│       ├── service/        # Regras de negócio
│       ├── model/          # Entidades JPA
│       ├── repository/     # Acesso ao banco
│       ├── dto/            # Objetos de transferência
│       ├── config/         # Configurações e seed de dados
│       └── exception/      # Tratamento de erros
│
└── frontend/         # Interface React
    └── src/
        ├── pages/          # Telas do sistema
        ├── components/     # Componentes reutilizáveis
        ├── services/       # Chamadas à API
        ├── types/          # Tipos TypeScript
        └── utils/          # Funções auxiliares
```

**Padrão de comunicação:** O frontend consome a API REST do backend via HTTP (Axios). Toda requisição vai para `localhost:8080`.

---

## 3. Backend — Detalhamento

### 3.1 Tecnologias e Dependências

- **Java 17** + **Spring Boot 4.0.6**
- **Spring Data JPA** com **Hibernate** (dialeto SQLite)
- **Spring Security Crypto** — hash de senhas com BCrypt
- **Spring Validation** — validação de dados de entrada
- **Lombok** — geração automática de getters, construtores, etc.
- **SpringDoc OpenAPI 3** — documentação automática (Swagger UI)
- **SQLite JDBC** — driver do banco de dados

### 3.2 Controllers (Camada de Entrada)

Os controllers recebem as requisições HTTP e delegam para os services. São 8 no total:

| Controller | Rota base | Responsabilidade |
|---|---|---|
| `AuthController` | `/auth` | Login e cadastro de usuários |
| `AlunoController` | `/alunos` | CRUD de alunos |
| `ProfessorController` | `/professores` | CRUD de professores e vínculo com matérias |
| `CursoController` | `/cursos` | CRUD de cursos |
| `MateriaController` | `/materias` | CRUD de disciplinas e pré-requisitos |
| `MatriculaController` | `/matriculas` | Matrículas, notas, frequência e situação |
| `BoletoController` | `/boletos` | Geração e controle de boletos |
| `ChatController` | `/chat` | Assistente de IA (Groq API) |

**Exemplo de endpoints — MatriculaController:**
```
GET    /matriculas           → listar todas
POST   /matriculas           → criar matrícula
PATCH  /matriculas/{id}/notas    → lançar nota e frequência
PUT    /matriculas/{id}/situacao → atualizar situação
DELETE /matriculas/{id}      → remover matrícula
```

### 3.3 Services (Regras de Negócio)

Os services contêm toda a lógica do sistema:

- **`MatriculaService`** — valida pré-requisitos antes de matricular, calcula situação final (nota ≥ 6,0 e frequência ≥ 75% para aprovação)
- **`AlunoService`** — gera boletim e histórico acadêmico, sincroniza dados entre as tabelas
- **`UsuarioService`** — autenticação multi-perfil, hash de senha, geração de matrícula
- **`ProfessorService`** — vincula professores a matérias, lista turmas
- **`CursoService`** — gerencia catálogo de cursos
- **`MateriaService`** — valida cadeias de pré-requisitos, evita circularidade
- **`BoletoService`** — controla estados dos boletos (PENDENTE, PAGO, ATRASADO)
- **`ChatService`** — integra com a Groq API, monta prompts contextualizados por perfil

### 3.4 Models / Entidades JPA

São 7 entidades mapeadas no banco de dados:

#### `Usuario`
Conta de acesso genérica. Campos: `id`, `nome`, `email`, `matricula`, `senha`, `tipo` (ALUNO / PROFESSOR / SECRETARIA), `curso`, `bolsista`, `especialidade`.

#### `Aluno`
Representa um estudante. Relacionado com `Matricula` (OneToMany, cascade delete).
Campos: `id`, `nome`, `email`, `senha`, `matricula`, `curso`, `bolsa`.

#### `Professor`
Docente do sistema. Relacionamento ManyToMany com `Materia` (tabela `professor_materia`).
Campos: `id`, `nome`, `email`, `senha`, `especialidade`.

#### `Curso`
Programa acadêmico. Campos: `id`, `nome`, `cargaHoraria`, `duracaoSemestres`.
Relacionado com `Aluno` e `Materia` (OneToMany).

#### `Materia`
Disciplina. Suporta pré-requisitos via relacionamento ManyToMany consigo mesma.
Campos: `id`, `nome`, `curso`. Relacionada com `Professor` e `Matricula`.

#### `Matricula`
Vínculo entre aluno e disciplina. É o registro acadêmico central do sistema.
Campos: `id`, `aluno`, `materia`, `dataCriacao`, `nota`, `frequencia`, `situacao`.
Situações possíveis: `ATIVA`, `APROVADO`, `REPROVADO`, `CONCLUIDA`, `TRANCADA`.

#### `Boleto`
Registro financeiro do aluno.
Campos: `id`, `aluno`, `valor`, `vencimento`, `status`, `referencia`, `dataPagamento`.
Status: `PENDENTE`, `PAGO`, `ATRASADO`.

### 3.5 Repositórios

Todos estendem `JpaRepository<T, Long>` e herdam operações CRUD automáticas. Métodos customizados relevantes:

```java
// MatriculaRepository
findByAlunoId(Long alunoId)
findByMateriaId(Long materiaId)
findByAlunoIdAndMateriaId(Long alunoId, Long materiaId)

// UsuarioRepository
findByMatricula(String matricula)
existsByEmail(String email)

// ProfessorRepository
findByEmail(String email)
```

### 3.6 DTOs (Data Transfer Objects)

Separam as entidades do banco dos dados trafegados pela API.

**Requests (entrada):** `AlunoRequest`, `BoletoRequest`, `CadastroRequest`, `CursoRequest`, `MateriaRequest`, `MatriculaRequest`, `NotasRequest`, `ProfessorRequest`, `LoginRequest`

**Responses (saída):** `AlunoResponse`, `BoletimResponse`, `BoletoResponse`, `CursoResponse`, `MatriculaResponse`, `ProfessorResponse`, `HistoricoResponse`, `DisciplinaAcademicaResponse`, `LoginResponse`, `ChatResponse`

### 3.7 Configurações

| Classe | Função |
|---|---|
| `CorsConfig` | Permite requisições do frontend (`localhost:*`) |
| `PasswordEncoderConfig` | Configura BCrypt para hash de senhas |
| `CursoDataInitializer` | Popula cursos padrão na primeira execução |
| `MateriaDataInitializer` | Popula disciplinas padrão na primeira execução |
| `UsuarioDataInitializer` | Cria usuário secretaria padrão |
| `MockDataInitializer` | Dados de demonstração (alunos, professores, matrículas) |

### 3.8 Tratamento de Erros

Erros são centralizados no `GlobalExceptionHandler`, que retorna respostas padronizadas:

| Exceção | HTTP | Situação |
|---|---|---|
| `RecursoNaoEncontradoException` | 404 | Entidade não encontrada |
| `EmailJaCadastradoException` | 409 | E-mail duplicado |
| `CredenciaisInvalidasException` | 401 | Login inválido |
| `IllegalStateException` | 400 | Violação de regra (ex: pré-requisito) |

### 3.9 Regras de Negócio Principais

1. **Aprovação:** nota ≥ 6,0 **e** frequência ≥ 75% → `APROVADO`. Abaixo → `REPROVADO`.
2. **Pré-requisitos:** ao matricular um aluno, o sistema verifica se todas as disciplinas pré-requisito têm situação `APROVADO` ou `CONCLUIDA`.
3. **Matrícula única:** um aluno não pode se matricular duas vezes na mesma disciplina.
4. **Geração de matrícula:** o identificador do usuário é gerado automaticamente no formato `AAAA.MM.DD.HHmmss`.

---

## 4. Banco de Dados

- **Tipo:** SQLite (arquivo em `backend/data/minerva.db`)
- **Gerenciamento de schema:** automático via `spring.jpa.hibernate.ddl-auto=update`
- **Foreign keys:** ativadas via `PRAGMA foreign_keys=ON`
- **Visualização:** DB Browser for SQLite (https://sqlitebrowser.org)

### Diagrama de relacionamentos simplificado

```
Curso ──────< Materia >────── Professor
  │               │
  │           (pré-requisito: self ManyToMany)
  │               │
 Aluno ──────< Matricula
  │
 Boleto
```

---

## 5. Integração com IA (Assistente Minerva)

O sistema possui um assistente de IA embutido chamado **Minerva**, acessível pelo mascote no canto da tela.

**Funcionamento:**
1. O frontend envia o histórico de mensagens + perfil do usuário para `POST /chat`
2. O `ChatService` monta um system prompt contextualizado (diferente para ALUNO, PROFESSOR e SECRETARIA)
3. A requisição é repassada para a **Groq API** (`api.groq.com/openai/v1/chat/completions`)
4. O modelo `llama-3.3-70b-versatile` processa e retorna a resposta
5. O backend repassa ao frontend

**Configuração:** adicionar chave em `application.properties`:
```properties
groq.api.key=gsk_xxxxxxxxxxxxxxxx
```

---

## 6. Frontend — Visão Geral

### Perfis de usuário e acesso

| Perfil | Acesso |
|---|---|
| **SECRETARIA** | Cursos, Alunos, Professores, Matérias, Matrículas, Financeiro |
| **PROFESSOR** | Lançamento de notas e frequência das suas turmas |
| **ALUNO** | Boletim do semestre atual e histórico acadêmico |

### Páginas

`Login`, `Cadastro`, `Início (Dashboard)`, `Alunos`, `Professores`, `Cursos`, `Matérias`, `Matrículas`, `Lançar Notas (Professor)`, `Boletim (Aluno)`, `Histórico (Aluno)`, `Financeiro (Boletos)`

### Componentes de destaque

- **`DashboardCharts`** — gráficos de visão geral por perfil (pizza, barras, dispersão)
- **`MascoteChat`** — interface do chat com a IA, acessível pelo mascote animado
- **`BadgeSituacao`** — badge colorido automático baseado na situação acadêmica
- **`AnimatedIcons`** — ícones SVG com animações temáticas (lixeira abre a tampa, lápis risca, etc.)

---

## 7. Como Executar

### Backend
```bash
cd backend
.\mvnw spring-boot:run
# API disponível em http://localhost:8080
# Swagger UI em http://localhost:8080/swagger-ui.html
```

### Frontend
```bash
cd frontend
npm install
npm run dev
# Interface disponível em http://localhost:5173
```

### Contas de demonstração

| Perfil | Matrícula | Senha |
|---|---|---|
| Aluno | `2026.06.08.100201` | `demo123` |
| Professor | `2026.06.08.100101` | `demo123` |
| Secretaria | `SECRETARIA.0001` | `secretaria123` |

---

## 8. API — Endpoints Principais

| Método | Rota | Descrição |
|---|---|---|
| POST | `/auth/login` | Autenticação |
| POST | `/auth/cadastro` | Novo usuário |
| GET | `/alunos` | Listar alunos |
| GET | `/alunos/{id}/boletim` | Boletim do aluno |
| GET | `/alunos/{id}/historico` | Histórico acadêmico |
| GET | `/professores/{id}/turmas` | Turmas do professor |
| GET | `/matriculas` | Listar matrículas |
| POST | `/matriculas` | Criar matrícula |
| PATCH | `/matriculas/{id}/notas` | Lançar notas |
| GET | `/boletos` | Listar boletos |
| POST | `/chat` | Enviar mensagem para IA |

---

*Minerva · Sistema de Gestão Acadêmica · 2026*
