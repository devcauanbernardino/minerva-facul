# 📘 Como o backend funciona (guia para o grupo)

Este documento explica, em português simples, como o backend em Java/Spring Boot do
Minerva está organizado e como cada parte da Fase 3 foi implementada. A ideia é que
qualquer pessoa do grupo consiga ler e entender o que o código faz, mesmo sem ter
escrito aquela parte.

---

## 1. Visão geral da arquitetura

O backend segue o padrão em **camadas**, muito comum em projetos Spring Boot:

```
        HTTP (frontend faz a requisição)
              │
              ▼
        Controller   →  recebe a requisição, valida formato básico, chama o Service
              │
              ▼
        Service      →  contém a REGRA DE NEGÓCIO (validações, cálculos, decisões)
              │
              ▼
        Repository   →  fala com o banco de dados (sem precisar escrever SQL)
              │
              ▼
        Banco (SQLite, gerenciado pelo Hibernate)
```

Além dessas camadas, existem duas pastas que aparecem em todo lugar:

- **`model/`** — as *entidades*: classes que representam tabelas do banco
  (ex.: `Aluno`, `Materia`, `Matricula`, `Curso`). Cada atributo da classe é uma
  coluna da tabela.
- **`dto/`** — os *DTOs* (Data Transfer Objects): classes "simples" que viajam entre
  frontend e backend. Servem para não expor a entidade do banco direto pro frontend
  (evita vazar dados sensíveis e evita erros de loop infinito ao converter para JSON).

E uma pasta de tratamento de erros:

- **`exception/`** — classes de exceção customizadas + o `GlobalExceptionHandler`,
  que é um "filtro" que pega qualquer erro lançado pelos Services e transforma numa
  resposta HTTP padronizada (404, 409, 400 etc.), com uma mensagem amigável em JSON.

### Por que não tem SQL em lugar nenhum?

Porque o projeto usa **Hibernate/JPA** com a configuração:
```properties
spring.jpa.hibernate.ddl-auto=update
```
Isso significa: "olhe as classes da pasta `model/`, e crie/atualize as tabelas do
banco automaticamente para combinar com elas". Por isso, quando alguém adiciona um
novo campo ou uma nova relação numa entidade (`@ManyToOne`, `@ManyToMany` etc.), a
tabela é ajustada sozinha na próxima vez que o backend iniciar — ninguém precisa
escrever `ALTER TABLE`.

### Como o Repository "adivinha" as queries?

As interfaces em `repository/` estendem `JpaRepository<Entidade, Long>`. O Spring Data
gera a query automaticamente a partir do **nome do método**. Exemplos usados no
projeto:

| Método no Repository | Query equivalente |
|---|---|
| `findByAlunoId(Long alunoId)` | `SELECT * FROM matriculas WHERE aluno_id = ?` |
| `findByAlunoIdAndMateriaId(alunoId, materiaId)` | `SELECT * FROM matriculas WHERE aluno_id = ? AND materia_id = ?` |
| `findAllById(List<Long> ids)` | `SELECT * FROM materias WHERE id IN (...)` |

---

## 2. Como uma requisição percorre o sistema (exemplo prático)

Vamos seguir o exemplo de **matricular um aluno numa matéria** (`POST /matriculas`):

1. **Controller** (`MatriculaController`) recebe o JSON `{ alunoId, materiaId }` e
   chama `matriculaService.criar(request)`.
2. **Service** (`MatriculaService.criar`):
   - Busca o `Aluno` e a `Materia` no banco (via Repository). Se não existir, lança
     `RecursoNaoEncontradoException` → vira **404**.
   - Verifica se o aluno **já está matriculado** nessa matéria. Se sim, lança
     `IllegalStateException` → vira **409 Conflict**.
   - Verifica se o aluno **cumpriu os pré-requisitos** da matéria. Se não, lança
     `IllegalStateException` com a lista de matérias pendentes → **409 Conflict**.
   - Se tudo ok, cria a `Matricula` com situação `"ATIVA"` e salva.
3. **GlobalExceptionHandler** — se qualquer exceção foi lançada no passo 2, ele
   intercepta e devolve um JSON de erro padronizado com o status HTTP certo. O
   frontend lê essa mensagem e mostra pro usuário.
4. Se deu tudo certo, o Service converte a entidade salva num DTO (`MatriculaResponse`)
   e devolve pro Controller, que devolve pro frontend como JSON.

Esse fluxo (Controller → Service → Repository → Exception Handler) se repete para
**todas** as funcionalidades do sistema (alunos, professores, matérias, cursos etc.).

---

## 3. O que cada parte da Fase 3 fez (regra de negócio por regra de negócio)

A Fase 3 implementou as 6 regras de negócio do "Tema 2 — Gestão Acadêmica". Veja como
cada uma foi resolvida no código:

### 3.1 — Matrícula sem duplicidade (Rodrigo)

**Onde:** `MatriculaService.criar(...)`

```java
if (matriculaRepository.findByAlunoIdAndMateriaId(aluno.getId(), materia.getId()).isPresent()) {
    throw new IllegalStateException("Aluno já está matriculado nessa disciplina.");
}
```

**O que faz:** antes de criar a matrícula, pergunta ao banco "esse aluno já tem
matrícula nessa matéria?". Se a resposta for sim, **não cria de novo** — lança um erro
que o `GlobalExceptionHandler` transforma em **409 Conflict**, e o frontend mostra a
mensagem "Aluno já está matriculado nessa disciplina."

---

### 3.2 — Pré-requisitos entre matérias (Cauan)

Essa regra precisou de mudanças em 3 lugares:

**a) Nova relação no modelo** — `Materia.java`

```java
@ManyToMany
@JoinTable(
    name = "materia_prerequisito",
    joinColumns = @JoinColumn(name = "materia_id"),
    inverseJoinColumns = @JoinColumn(name = "prerequisito_id")
)
private List<Materia> prerequisitos = new ArrayList<>();
```

**O que faz:** diz ao Hibernate "uma Matéria pode ter várias outras Matérias como
pré-requisito, e vice-versa". O Hibernate cria automaticamente uma tabela auxiliar
`materia_prerequisito` com duas colunas (`materia_id` e `prerequisito_id`) para
guardar essas relações — sem isso, não daria pra representar "Cálculo II precisa de
Cálculo I" no banco.

**b) Salvar os pré-requisitos** — `MateriaService.java`

```java
private List<Materia> buscarPrerequisitos(List<Long> prerequisitoIds, Long materiaId) {
    if (prerequisitoIds == null || prerequisitoIds.isEmpty()) return new ArrayList<>();
    if (materiaId != null && prerequisitoIds.contains(materiaId)) {
        throw new IllegalArgumentException("Uma matéria não pode ser pré-requisito dela mesma.");
    }
    List<Materia> prerequisitos = materiaRepository.findAllById(prerequisitoIds);
    if (prerequisitos.size() != prerequisitoIds.size()) {
        throw new RecursoNaoEncontradoException("Uma ou mais matérias de pré-requisito não foram encontradas.");
    }
    return prerequisitos;
}
```

**O que faz:** quando alguém cria/edita uma matéria e manda uma lista de IDs de
pré-requisitos, esse método:
1. Se a lista vier vazia, não faz nada (matéria sem pré-requisito).
2. Confere que a matéria não está marcando **ela mesma** como pré-requisito (loop
   sem sentido) → erro 400 se isso acontecer.
3. Busca todas as matérias desses IDs no banco. Se algum ID não existir, erro 404.
4. Devolve a lista pronta para ser salva em `materia.setPrerequisitos(...)`.

**c) Validar na hora da matrícula** — `MatriculaService.criar(...)`

```java
List<String> prerequisitosPendentes = materia.getPrerequisitos().stream()
        .filter(pre -> !concluiuMateria(aluno.getId(), pre.getId()))
        .map(Materia::getNome)
        .toList();
if (!prerequisitosPendentes.isEmpty()) {
    throw new IllegalStateException(
            "Aluno não cumpriu os pré-requisitos: " + String.join(", ", prerequisitosPendentes));
}

private boolean concluiuMateria(Long alunoId, Long materiaId) {
    return matriculaRepository.findByAlunoIdAndMateriaId(alunoId, materiaId)
            .map(m -> {
                String situacao = normalizarSituacao(m.getSituacao());
                return situacao.equals("CONCLUIDA") || situacao.equals("APROVADO");
            })
            .orElse(false);
}
```

**O que faz, em português:**
- Olha todas as matérias que são pré-requisito da matéria que o aluno quer cursar.
- Para cada uma, pergunta `concluiuMateria`: "o aluno tem uma matrícula nessa matéria
  com situação `CONCLUIDA` ou `APROVADO`?"
- Junta os nomes das que **não** foram cumpridas numa lista (`prerequisitosPendentes`).
- Se essa lista não estiver vazia, **bloqueia a matrícula** com 409 Conflict e mostra
  quais matérias faltam.

---

### 3.3 — Registrar notas e frequência

Já existia desde a Fase 2 (campo `nota` e `frequencia` na entidade `Matricula`,
endpoint `PATCH /matriculas/{id}/notas`). Não precisou de mudanças nessa fase.

---

### 3.4 — Calcular aprovação/reprovação (JP)

**Onde:** `MatriculaService.java`

```java
private static final double NOTA_MINIMA_APROVACAO = 6.0;
private static final double FREQUENCIA_MINIMA_APROVACAO = 75.0;

@Transactional
public MatriculaResponse lancarNotas(Long id, NotasRequest request) {
    Matricula matricula = buscarEntidade(id);
    matricula.setNota(request.getNota());
    matricula.setFrequencia(request.getFrequencia());
    matricula.setSituacao(calcularSituacaoFinal(matricula));
    return paraResponse(matriculaRepository.save(matricula));
}

private String calcularSituacaoFinal(Matricula matricula){
    if (matricula.getNota() == null || matricula.getFrequencia() == null){
        return matricula.getSituacao();
    }
    boolean aprovado = matricula.getNota() >= NOTA_MINIMA_APROVACAO
            && matricula.getFrequencia() >= FREQUENCIA_MINIMA_APROVACAO;
    return aprovado ? "APROVADO" : "REPROVADO";
}
```

**O que faz, passo a passo:**
1. O professor envia nota e frequência pelo endpoint `PATCH /matriculas/{id}/notas`.
2. `lancarNotas` salva esses dois valores na matrícula.
3. Chama `calcularSituacaoFinal`:
   - Se **algum** dos dois (nota ou frequência) ainda não foi informado, não muda
     nada — mantém a situação atual (`ATIVA`).
   - Se os dois foram informados, verifica: nota ≥ 6.0 **e** frequência ≥ 75%?
     - Sim → situação vira `"APROVADO"`
     - Não → situação vira `"REPROVADO"`
4. Salva a matrícula já com a situação final atualizada.

**Resultado prático:** a matrícula deixa de aparecer como "ativa" pro professor
automaticamente quando a nota final é lançada — ela "se encerra" sozinha.

---

### 3.5 — Boletim e histórico escolar (Rodrigo + correção)

**Onde:** `AlunoService.java`

```java
private static final Set<String> SITUACOES_HISTORICO =
        Set.of("CONCLUIDA", "REPROVADA", "TRANCADA", "APROVADO", "REPROVADO");
```

**O que é esse `Set`:** é a lista de situações que indicam que a disciplina **já
terminou** para o aluno. Se a situação da matrícula estiver nesse conjunto, ela entra
no **histórico**; se não estiver (ex.: `ATIVA` ou `DISPONIVEL`), ela entra no
**boletim** (disciplinas em andamento ou disponíveis para cursar).

**Boletim** (`obterBoletimPorEmail`): para cada matéria do curso do aluno, monta um
`DisciplinaAcademicaResponse` com:
```java
return new DisciplinaAcademicaResponse(
    materia.getId(), materia.getNome(),
    normalizarSituacao(matricula.getSituacao()),
    matricula.getNota(), matricula.getFrequencia());
```
Ou seja: nome da matéria, situação atual, e **a nota/frequência reais** (antes desse
ajuste, esses dois últimos campos vinham sempre `null`, mesmo que o aluno já tivesse
nota lançada — esse era o bug que foi corrigido).

**Histórico** (`obterHistoricoPorEmail`): filtra apenas as matrículas cuja situação
está em `SITUACOES_HISTORICO` e monta a mesma estrutura, também agora com nota e
frequência reais.

> **Por que `APROVADO`/`REPROVADO` foram adicionados no `SITUACOES_HISTORICO`?**
> Porque é isso que o cálculo do JP (item 3.4) gera. Sem esse ajuste, uma matéria que
> o aluno acabou de ser aprovado **desapareceria** do boletim (porque a situação não é
> mais `ATIVA`/`DISPONIVEL`) mas também não apareceria no histórico (porque
> `APROVADO` não estava na lista). Agora ela aparece corretamente no histórico.

No frontend, o componente `BadgeSituacao.tsx` também foi atualizado para ter cor e
texto certos para `APROVADO`/`REPROVADO` (antes só existia `APROVADA`/`REPROVADA`,
no feminino, então os badges apareciam cinzas/sem tradução).

---

### 3.6 — Emissão de boletos e regularização de débitos (Augusto)

**Status:** ainda não implementado — nenhum arquivo `Boleto*` existe no projeto.

Para implementar, seguindo o **mesmo padrão em camadas** explicado na seção 1, seria
necessário criar:

| Arquivo | Função |
|---|---|
| `model/Boleto.java` | Entidade com `aluno` (relação `@ManyToOne`), `valor`, `vencimento`, `status` (`PENDENTE`/`PAGO`/`ATRASADO`), `referencia`, `dataPagamento` |
| `repository/BoletoRepository.java` | `JpaRepository<Boleto, Long>` + `findByAlunoId` |
| `dto/BoletoRequest.java` / `BoletoResponse.java` | Dados que entram/saem da API |
| `service/BoletoService.java` | `gerar()`, `marcarComoPago()`, `listarPorAluno()`, `listarTodos()` |
| `controller/BoletoController.java` | `GET /boletos`, `POST /boletos`, `PUT /boletos/{id}/pagar` |

É exatamente a mesma receita usada nas outras 5 regras: **Model (tabela) → Repository
(acesso ao banco) → DTO (formato da API) → Service (regra de negócio) → Controller
(endpoints HTTP)**.

---

## 4. Tratamento de erros — `GlobalExceptionHandler`

Toda vez que um `Service` lança uma exceção, ela "sobe" até o
`GlobalExceptionHandler`, que decide qual status HTTP devolver:

| Exceção lançada no Service | Status HTTP | Quando acontece |
|---|---|---|
| `RecursoNaoEncontradoException` | 404 Not Found | Aluno/matéria/curso não existe |
| `EmailJaCadastradoException` | 409 Conflict | E-mail duplicado no cadastro |
| `CredenciaisInvalidasException` | 401 Unauthorized | Login errado |
| `IllegalStateException` | 409 Conflict | Matrícula duplicada **ou** pré-requisito não cumprido |
| `IllegalArgumentException` | 400 Bad Request | Matéria marcada como pré-requisito dela mesma |
| `MethodArgumentNotValidException` | 400 Bad Request | Campos inválidos (ex.: `@NotBlank` vazio) |

A vantagem disso: **nenhum Controller precisa de `try/catch`**. Os Services só
lançam a exceção certa, e o handler cuida de transformar isso numa resposta JSON
consistente, sempre no mesmo formato (`ErroResponse`: timestamp, status, erro,
mensagem).

---

## 5. Resumo rápido (cola para revisão)

- **Controller** = "porta de entrada" HTTP, repassa pro Service.
- **Service** = onde fica a lógica/regra de negócio (validações, cálculos).
- **Repository** = busca/salva no banco, sem SQL manual.
- **Model** = formato das tabelas do banco.
- **DTO** = formato dos dados que trafegam com o frontend.
- **GlobalExceptionHandler** = traduz erros de negócio em respostas HTTP certas.
- `ddl-auto=update` = o banco se ajusta sozinho conforme as entidades mudam.

Com isso, as 6 regras de negócio do Tema 2 ficam assim:

1. ✅ Matrícula sem duplicidade — Rodrigo
2. ✅ Pré-requisitos — Cauan
3. ✅ Notas/frequência — já existia
4. ✅ Aprovação/reprovação automática — JP
5. ✅ Boletim/histórico com nota e frequência reais — Rodrigo + correção
6. ❌ Boletos/financeiro — Augusto (pendente)

---

## 6. Divisão da apresentação

### 🎤 Abertura (quem quiser puxar)
- Contexto rápido: "Tema 2 — Gestão Acadêmica" tinha 6 regras de negócio, distribuímos entre o grupo.

### 1️⃣ Rodrigo — Matrícula sem duplicidade + Boletim/Histórico
- Mostrar: tentar matricular o mesmo aluno duas vezes na mesma matéria → erro 409 "Aluno já está matriculado nessa disciplina."
- Explicar rapidamente o código (`findByAlunoIdAndMateriaId` + `IllegalStateException`)
- Mostrar a tela de **Boletim** e **Histórico** do aluno, destacando que agora aparecem **nota e frequência reais** (e não mais em branco)

### 2️⃣ JP — Cálculo automático de aprovação/reprovação
- Mostrar a tela do professor lançando nota + frequência (`ProfessorNotas`)
- Explicar a regra: nota ≥ 6.0 **e** frequência ≥ 75% → `APROVADO`, senão `REPROVADO`
- Mostrar que, depois de lançar a nota, a matrícula sai da lista "ativas" do professor e a situação muda automaticamente (sem precisar de ação manual)

### 3️⃣ Cauan — Pré-requisitos entre matérias
- Mostrar a tela **Matérias**: cadastro de uma matéria selecionando pré-requisitos (checklist) e os badges na tabela
- Mostrar o fluxo de erro: tentar matricular um aluno numa matéria cujo pré-requisito ele não cumpriu → erro 409 listando as matérias pendentes
- Explicar rapidamente o relacionamento `materia_prerequisito` (tabela criada automaticamente)

### 4️⃣ Augusto — Módulo financeiro (boletos)
- Se já tiver algo pronto até a apresentação: mostrar gerar boleto, aluno ver pendência, secretaria marcar como pago
- Se não tiver pronto: explicar o que **está planejado** (model `Boleto`, endpoints `GET/POST /boletos`, `PUT /boletos/{id}/pagar`, tela `/financeiro`) e que é a única regra ainda pendente

### 🎬 Fluxo de demo sugerido (sequência única, ao vivo)
1. Cadastrar/selecionar uma matéria com pré-requisito (Cauan)
2. Tentar matricular aluno sem cumprir o pré-requisito → erro (Cauan)
3. Tentar matricular o mesmo aluno duas vezes na mesma matéria → erro (Rodrigo)
4. Professor lança notas → situação muda automaticamente (JP)
5. Ver boletim/histórico do aluno com nota e situação corretas (Rodrigo)
6. (Se pronto) Gerar e pagar um boleto (Augusto)

Essa ordem segue a lógica do sistema (matricular → cursar → ser avaliado → ver
resultado → financeiro), o que fica natural pra contar pro professor durante a
apresentação.
