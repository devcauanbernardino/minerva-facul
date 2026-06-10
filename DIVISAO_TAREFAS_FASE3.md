# 👥 Divisão de Tarefas — Fase 3 (Regras de Negócio do Tema 2)

## 🎯 Objetivo

O slide "Tema 2 — Gestão acadêmica" lista 6 regras de negócio. Hoje o backend cobre
matrícula básica e lançamento de notas (Fase 2), mas faltam itens importantes —
alguns são bugs pequenos, outros são features novas. Esta fase distribui o que falta
entre o grupo.

| Regra do slide | Status atual |
|---|---|
| Realizar matrícula de alunos em disciplinas | 🟡 falta validar duplicidade |
| Controlar pré-requisitos | 🔴 não existe |
| Registrar notas e frequência | 🟢 pronto |
| Calcular aprovação ou reprovação | 🔴 não existe |
| Emitir boletim e histórico escolar | 🟡 bug — nota/frequência sempre `null` |
| Emissão de boletos e regularização de débitos | 🔴 não existe |

---

## 📋 Rodrigo: Corrigir boletim/histórico + bloquear matrícula duplicada

**Tempo estimado:** 20 minutos
**Dificuldade:** ⭐ Fácil
**Dependência:** Nenhuma — pode começar agora

### 1️⃣ Bug: boletim e histórico sempre mostram nota/frequência vazias

**Arquivo:** `backend/src/main/java/br/com/minerva/minerva/service/AlunoService.java`

No método `obterBoletimPorEmail` (por volta da linha 106), troque:

```java
return new DisciplinaAcademicaResponse(
    materia.getId(),
    materia.getNome(),
    normalizarSituacao(matricula.getSituacao()),
    null,
    null);
```

por:

```java
return new DisciplinaAcademicaResponse(
    materia.getId(),
    materia.getNome(),
    normalizarSituacao(matricula.getSituacao()),
    matricula.getNota(),
    matricula.getFrequencia());
```

No método `obterHistoricoPorEmail` (por volta da linha 125), troque os dois últimos
`null` do `new DisciplinaAcademicaResponse(...)` por
`matricula.getNota()` e `matricula.getFrequencia()` da mesma forma.

### 2️⃣ Impedir matricular o mesmo aluno duas vezes na mesma matéria

**Arquivo:** `backend/src/main/java/br/com/minerva/minerva/repository/MatriculaRepository.java`

Adicionar:

```java
boolean existsByAlunoIdAndMateriaId(Long alunoId, Long materiaId);
```

**Arquivo:** `backend/src/main/java/br/com/minerva/minerva/exception/MatriculaDuplicadaException.java` (novo)

```java
package br.com.minerva.minerva.exception;

public class MatriculaDuplicadaException extends RuntimeException {
    public MatriculaDuplicadaException(String mensagem) {
        super(mensagem);
    }
}
```

**Arquivo:** `backend/src/main/java/br/com/minerva/minerva/exception/GlobalExceptionHandler.java`

Adicionar um handler retornando `409 Conflict` (copie o padrão do
`emailJaCadastrado`, trocando o tipo da exceção para `MatriculaDuplicadaException`).

**Arquivo:** `backend/src/main/java/br/com/minerva/minerva/service/MatriculaService.java`

No início do método `criar(...)`, antes de salvar:

```java
if (matriculaRepository.existsByAlunoIdAndMateriaId(request.getAlunoId(), request.getMateriaId())) {
    throw new MatriculaDuplicadaException("Este aluno já está matriculado nesta matéria.");
}
```

### ✅ Checklist
- [ ] Boletim mostra nota/frequência reais
- [ ] Histórico mostra nota/frequência reais
- [ ] `existsByAlunoIdAndMateriaId` no repository
- [ ] `MatriculaDuplicadaException` + handler 409
- [ ] `MatriculaService.criar` valida duplicidade
- [ ] Compila e testa: matricular o mesmo aluno duas vezes deve dar erro 409

---

## 📋 JP: Cálculo automático de aprovação/reprovação (RF08)

**Tempo estimado:** 40 minutos
**Dificuldade:** ⭐⭐ Médio
**Dependência:** Nenhuma — pode começar agora (só não mexe nos mesmos métodos que o Rodrigo)

### Regra de negócio proposta

Ao **lançar/atualizar notas** (`PATCH /matriculas/{id}/notas`), se a matrícula está
`ATIVA` e tanto `nota` quanto `frequencia` foram informados, calcular automaticamente
a situação final:

- `nota >= 6.0` **e** `frequencia >= 75.0` → `CONCLUIDA` (aprovado)
- caso contrário → `REPROVADA`

> Combine com o grupo se esses cortes (6.0 / 75%) fazem sentido para o projeto de
> vocês — são valores comuns em regulamentos acadêmicos, mas pode ajustar.

### Onde mexer

**Arquivo:** `backend/src/main/java/br/com/minerva/minerva/service/MatriculaService.java`

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

private String calcularSituacaoFinal(Matricula matricula) {
    if (matricula.getNota() == null || matricula.getFrequencia() == null) {
        return matricula.getSituacao();
    }
    boolean aprovado = matricula.getNota() >= NOTA_MINIMA_APROVACAO
        && matricula.getFrequencia() >= FREQUENCIA_MINIMA_APROVACAO;
    return aprovado ? "CONCLUIDA" : "REPROVADA";
}
```

### Frontend (opcional, mas recomendado)

**Arquivo:** `frontend/src/pages/ProfessorNotas.tsx`

Depois de salvar as notas, a matrícula passa a ter situação `CONCLUIDA`/`REPROVADA`
em vez de `ATIVA` — ou seja, ela some da lista "Suas turmas" (que mostra ações só
para `ATIVA`). Avise o professor disso na mensagem de sucesso, por exemplo:

```ts
.then(() => {
  setSucesso('Notas lançadas com sucesso. A disciplina foi encerrada automaticamente conforme o resultado.')
  ...
})
```

### ✅ Checklist
- [ ] Constantes de corte de aprovação/reprovação
- [ ] `lancarNotas` calcula e grava a situação final automaticamente
- [ ] Testar: lançar nota 8/freq 90 → vira `CONCLUIDA`; nota 4/freq 90 → vira `REPROVADA`
- [ ] (opcional) Mensagem no frontend avisando que a turma foi encerrada

---

## 📋 Cauan: Pré-requisitos entre matérias

**Tempo estimado:** 1h
**Dificuldade:** ⭐⭐⭐ Médio/Alto
**Dependência:** Nenhuma para o modelo; testar matrícula depende do Rodrigo (duplicidade) terminar — mas dá pra desenvolver em paralelo

### 1️⃣ Modelagem — `Materia` ganha lista de pré-requisitos

**Arquivo:** `backend/src/main/java/br/com/minerva/minerva/model/Materia.java`

```java
@ManyToMany
@JoinTable(
    name = "materia_prerequisito",
    joinColumns = @JoinColumn(name = "materia_id"),
    inverseJoinColumns = @JoinColumn(name = "prerequisito_id")
)
private List<Materia> prerequisitos = new ArrayList<>();
```

(`ddl-auto=update` cria a tabela `materia_prerequisito` automaticamente.)

### 2️⃣ DTOs

**Arquivo:** `backend/src/main/java/br/com/minerva/minerva/dto/MateriaResponse.java`

Adicionar campo `List<Long> prerequisitoIds` (e popular no `MateriaService`).

**Arquivo:** `backend/src/main/java/br/com/minerva/minerva/dto/MateriaRequest.java`

Adicionar campo opcional `List<Long> prerequisitoIds` (pode vir vazio/nulo).

### 3️⃣ `MateriaService` — salvar/atualizar pré-requisitos

Ao criar/atualizar uma matéria, se `prerequisitoIds` vier preenchido, buscar as
matérias correspondentes (`materiaRepository.findAllById(...)`) e setar em
`materia.setPrerequisitos(...)`.

### 4️⃣ Validar na matrícula

**Arquivo:** `backend/src/main/java/br/com/minerva/minerva/service/MatriculaService.java`

No método `criar(...)`, depois de buscar `materia`, validar que o aluno já concluiu
(`situacao = "CONCLUIDA"`) todos os pré-requisitos:

```java
List<Long> pendentes = materia.getPrerequisitos().stream()
    .filter(pre -> matriculaRepository
        .findByAlunoIdAndMateriaId(aluno.getId(), pre.getId())
        .map(m -> !"CONCLUIDA".equalsIgnoreCase(m.getSituacao()))
        .orElse(true))
    .map(Materia::getId)
    .toList();

if (!pendentes.isEmpty()) {
    throw new RecursoNaoEncontradoException(
        "Aluno não atende aos pré-requisitos da matéria (faltam: " + pendentes + ")");
}
```

> Precisa do `findByAlunoIdAndMateriaId` no `MatriculaRepository` (mesmo método que
> o Rodrigo usa para a checagem de duplicidade — combinem para não duplicar trabalho,
> só um de vocês precisa adicionar).

> Use uma exceção mais específica se preferir (`PrerequisitoNaoAtendidoException` →
> 409, seguindo o padrão do `GlobalExceptionHandler`).

### 5️⃣ Frontend — exibir pré-requisitos

**Arquivo:** `frontend/src/pages/Materias.tsx`

No formulário de matéria, adicionar um `Select`/checklist de pré-requisitos
(matérias do mesmo curso). Na tabela, mostrar os pré-requisitos como badges.

### ✅ Checklist
- [ ] Relação `materia_prerequisito` (ManyToMany)
- [ ] DTOs atualizados (`prerequisitoIds`)
- [ ] `MateriaService` salva pré-requisitos
- [ ] `MatriculaService.criar` valida pré-requisitos não cumpridos
- [ ] Frontend permite selecionar pré-requisitos ao criar matéria
- [ ] Testar: tentar matricular aluno sem o pré-requisito concluído → erro

---

## 📋 Augusto: Módulo financeiro — boletos e regularização de débitos

**Tempo estimado:** 1h30
**Dificuldade:** ⭐⭐⭐⭐ Alto (módulo novo do zero)
**Dependência:** Nenhuma — pode começar agora, é isolado dos outros módulos

### Escopo sugerido (MVP)

Cada aluno tem **boletos mensais** com valor, vencimento e status (`PENDENTE` /
`PAGO` / `ATRASADO`). A secretaria pode gerar boletos e marcar como pagos
("regularizar débito"). O aluno consegue ver seus boletos no portal.

### 1️⃣ Model

**Arquivo:** `backend/src/main/java/br/com/minerva/minerva/model/Boleto.java` (novo)

```java
package br.com.minerva.minerva.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "boletos")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Boleto {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "aluno_id", nullable = false)
    private Aluno aluno;

    @Column(nullable = false)
    private BigDecimal valor;

    @Column(nullable = false)
    private LocalDate vencimento;

    @Column(nullable = false)
    private String status = "PENDENTE"; // PENDENTE, PAGO, ATRASADO

    private String referencia; // ex: "Mensalidade 03/2026"

    private LocalDate dataPagamento;
}
```

### 2️⃣ Repository

```java
package br.com.minerva.minerva.repository;

import br.com.minerva.minerva.model.Boleto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface BoletoRepository extends JpaRepository<Boleto, Long> {
    List<Boleto> findByAlunoId(Long alunoId);
}
```

### 3️⃣ DTOs

- `BoletoResponse` — `id, alunoId, alunoNome, valor, vencimento, status, referencia, dataPagamento`
- `BoletoRequest` — `alunoId, valor, vencimento, referencia` (para a secretaria gerar)

### 4️⃣ Service

`BoletoService` com:

- `listarPorAluno(Long alunoId)`
- `listarTodos()` (visão da secretaria)
- `gerar(BoletoRequest)` — cria boleto `PENDENTE`
- `marcarComoPago(Long id)` — seta `status = "PAGO"` e `dataPagamento = LocalDate.now()`
  → isso é a "regularização de débito"
- (opcional) job/método que marca como `ATRASADO` boletos `PENDENTE` com
  `vencimento < hoje`

### 5️⃣ Controller

```java
@RestController
@RequestMapping("/boletos")
@RequiredArgsConstructor
public class BoletoController {
    private final BoletoService boletoService;

    @GetMapping
    public List<BoletoResponse> listar(@RequestParam(required = false) Long alunoId) {
        return alunoId != null ? boletoService.listarPorAluno(alunoId) : boletoService.listarTodos();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public BoletoResponse gerar(@Valid @RequestBody BoletoRequest request) {
        return boletoService.gerar(request);
    }

    @PutMapping("/{id}/pagar")
    public BoletoResponse marcarComoPago(@PathVariable Long id) {
        return boletoService.marcarComoPago(id);
    }
}
```

### 6️⃣ Frontend (novo, criar tela `/financeiro`)

- Secretaria: lista de boletos de todos os alunos, botão "Gerar boleto" e "Marcar como pago".
- Aluno: tela "Meus boletos" mostrando pendências e histórico de pagamentos
  (pode reaproveitar `StatCard`, `Table`, `Badge` já usados nas outras telas
  refatoradas, seguindo o mesmo padrão visual).
- Adicionar rota e item de menu em `frontend/src/App.tsx` e `utils/auth.ts`
  (`navDoUsuario`).

### ✅ Checklist
- [ ] Model `Boleto` + tabela criada via `ddl-auto=update`
- [ ] `BoletoRepository`, DTOs, `BoletoService`, `BoletoController`
- [ ] `GET /boletos?alunoId=`, `POST /boletos`, `PUT /boletos/{id}/pagar`
- [ ] Tela nova no frontend (secretaria + aluno)
- [ ] Rota/menu adicionados
- [ ] Testar fluxo: gerar boleto → aluno vê pendência → secretaria marca como pago → some da lista de pendências

---

## 🔄 Ordem sugerida / dependências

```
Rodrigo  ──► sem dependências, começa já (bug + duplicidade)
JP       ──► sem dependências, começa já (aprovação/reprovação)
Cauan    ──► sem dependências para o modelo; combinar com Rodrigo
             quem cria o findByAlunoIdAndMateriaId no repository
Augusto  ──► sem dependências, módulo isolado
```

Ao final, todos testam o fluxo: matricular → checar pré-requisito → lançar notas
→ ver situação calculada automaticamente → ver boletim/histórico corretos →
gerar e pagar boleto.

## ⚠️ Fora do escopo desta fase

- Notificação por e-mail de boletos vencidos
- Integração com gateway de pagamento real
- Spring Security / JWT (já listado como pendência da Fase 2)
