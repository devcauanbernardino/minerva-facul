# 👥 Divisão de Tarefas — Fase 2 (Finalizar Backend)

## 🎯 Objetivo Final

Completar o backend do Minerva para suportar **matrículas**, **lançamento de notas** (RF07) e **boletim/histórico com dados reais** (RF09/RF10). Cada pessoa trabalha em paralelo e integra no final.

---

## ✅ O que já está pronto (Fase 1 + extras)

| Área | Status | Endpoints |
|------|--------|-----------|
| Autenticação | ✅ | `POST /auth/cadastro`, `POST /auth/login` |
| Cursos | ✅ | CRUD `/cursos` |
| Alunos | ✅ | CRUD `/alunos` |
| Boletim / Histórico (parcial) | ⚠️ | `GET /alunos/boletim`, `GET /alunos/historico` — lista disciplinas, mas **nota/frequência sempre null** |
| Professores | ⚠️ | `GET`, `PUT`, `DELETE` `/professores` — **sem POST** |
| Matérias | ✅ | CRUD `/materias` |
| Relacionamentos JPA | ✅ | `Professor ↔ Materia` (N:N), `Aluno ↔ Matricula ↔ Materia` |
| Sincronização aluno | ✅ | Cadastro/login `tipo=ALUNO` cria registro em `alunos` |
| Sincronização professor | ❌ | Cadastro `tipo=PROFESSOR` só grava em `usuarios` |
| Matrículas (API) | ❌ | Entidade existe, **sem Controller/Service** |
| Notas e frequência | ❌ | Campos não existem em `Matricula` |
| Segurança por perfil | ❌ | Só `PasswordEncoder` — controle de acesso só no frontend |

---

## 🚧 O que falta (visão geral)

```
Secretaria ──POST /matriculas──► Matricula (aluno + matéria)
Professor  ──PATCH /matriculas/{id}/notas──► nota + frequência
Professor  ──GET /professores/turmas──► matrículas das suas matérias
Aluno      ──GET /alunos/boletim──► notas reais (já existe, falta popular)
```

| RF | Descrição | Depende de |
|----|-----------|------------|
| RF06 | Matricular aluno em matéria | `MatriculaController` |
| RF07 | Professor lança nota e frequência | Campos em `Matricula` + `PATCH /notas` |
| RF09 | Boletim do semestre | Matrículas ATIVAS com notas |
| RF10 | Histórico escolar | Matrículas CONCLUIDA/REPROVADA/TRANCADA |

---

## 📋 Rodrigo: DTOs + Campos de Nota na Entidade

**Tempo estimado:** 25 minutos  
**Dificuldade:** ⭐ Fácil  
**Dependência:** Nenhuma — pode começar AGORA

### O que fazer

Criar os DTOs da API de matrículas e adicionar `nota` e `frequencia` na entidade.

#### 1️⃣ Editar `Matricula.java` — adicionar nota e frequência

**Localização:** `backend/src/main/java/br/com/minerva/minerva/model/Matricula.java`

Adicionar antes do fechamento da classe:

```java
    private Double nota;

    private Double frequencia;
```

> O `ddl-auto=update` no `application.properties` cria as colunas automaticamente ao reiniciar o backend.

#### 2️⃣ Criar `MatriculaRequest.java`

**Localização:** `backend/src/main/java/br/com/minerva/minerva/dto/MatriculaRequest.java`

```java
package br.com.minerva.minerva.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MatriculaRequest {

    @NotNull(message = "O ID do aluno é obrigatório")
    private Long alunoId;

    @NotNull(message = "O ID da matéria é obrigatório")
    private Long materiaId;

    @NotBlank(message = "A situação é obrigatória")
    private String situacao; // ATIVA, CONCLUIDA, CANCELADA, REPROVADA, TRANCADA
}
```

#### 3️⃣ Criar `MatriculaResponse.java`

**Localização:** `backend/src/main/java/br/com/minerva/minerva/dto/MatriculaResponse.java`

```java
package br.com.minerva.minerva.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MatriculaResponse {

    private Long id;
    private Long alunoId;
    private String alunoNome;
    private Long materiaId;
    private String materiaNome;
    private String cursoNome;
    private String dataCriacao; // dd/MM/yyyy
    private String situacao;
    private Double nota;
    private Double frequencia;
}
```

#### 4️⃣ Criar `NotasRequest.java`

**Localização:** `backend/src/main/java/br/com/minerva/minerva/dto/NotasRequest.java`

```java
package br.com.minerva.minerva.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NotasRequest {

    @NotNull(message = "A nota é obrigatória")
    @DecimalMin(value = "0.0", message = "A nota mínima é 0")
    @DecimalMax(value = "10.0", message = "A nota máxima é 10")
    private Double nota;

    @NotNull(message = "A frequência é obrigatória")
    @DecimalMin(value = "0.0", message = "A frequência mínima é 0%")
    @DecimalMax(value = "100.0", message = "A frequência máxima é 100%")
    private Double frequencia;
}
```

#### 5️⃣ Criar `ProfessorMateriaRequest.java`

**Localização:** `backend/src/main/java/br/com/minerva/minerva/dto/ProfessorMateriaRequest.java`

```java
package br.com.minerva.minerva.dto;

import jakarta.validation.constraints.NotEmpty;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProfessorMateriaRequest {

    @NotEmpty(message = "Informe ao menos uma matéria")
    private List<Long> materiaIds;
}
```

### ✅ Checklist

- [ ] Adicionar `nota` e `frequencia` em `Matricula.java`
- [ ] Criar `MatriculaRequest.java`
- [ ] Criar `MatriculaResponse.java`
- [ ] Criar `NotasRequest.java`
- [ ] Criar `ProfessorMateriaRequest.java`
- [ ] Compilar: `cd backend` → `.\mvnw.cmd -DskipTests compile`
- [ ] Avisar Pessoa 2 quando terminar

---

## 📋 JP: Repository + MatriculaService

**Tempo estimado:** 50 minutos  
**Dificuldade:** ⭐⭐⭐ Médio/Alto  
**Dependência:** Espera Pessoa 1 terminar os DTOs e a entidade

### O que fazer

Implementar toda a lógica de negócio de matrículas.

#### 1️⃣ Expandir `MatriculaRepository.java`

**Localização:** `backend/src/main/java/br/com/minerva/minerva/repository/MatriculaRepository.java`

```java
package br.com.minerva.minerva.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import br.com.minerva.minerva.model.Matricula;

@Repository
public interface MatriculaRepository extends JpaRepository<Matricula, Long> {

    List<Matricula> findByAlunoId(Long alunoId);

    List<Matricula> findByMateriaId(Long materiaId);

    Optional<Matricula> findByAlunoIdAndMateriaId(Long alunoId, Long materiaId);

    boolean existsByAlunoIdAndMateriaId(Long alunoId, Long materiaId);
}
```

#### 2️⃣ Criar `MatriculaService.java`

**Localização:** `backend/src/main/java/br/com/minerva/minerva/service/MatriculaService.java`

Métodos obrigatórios:

| Método | Descrição |
|--------|-----------|
| `listarTodas()` | Retorna todas as matrículas |
| `listarPorAluno(Long alunoId)` | Filtro por aluno |
| `listarPorMateria(Long materiaId)` | Filtro por matéria (turma) |
| `buscarPorId(Long id)` | Uma matrícula |
| `criar(MatriculaRequest)` | Valida aluno/materia, impede duplicata, salva |
| `atualizarSituacao(Long id, String situacao)` | Altera ATIVA/CONCLUIDA/CANCELADA etc. |
| `lancarNotas(Long id, NotasRequest)` | Grava nota + frequência (RF07) |
| `excluir(Long id)` | Remove matrícula |

Regras de negócio:

- Não permitir matricular o mesmo aluno duas vezes na mesma matéria (`existsByAlunoIdAndMateriaId`).
- Aluno e matéria devem existir (`RecursoNaoEncontradoException`).
- `situacao` sempre em maiúsculas: `ATIVA`, `CONCLUIDA`, `CANCELADA`, `REPROVADA`, `TRANCADA`.
- `dataCriacao` formatada como `dd/MM/yyyy` no response.
- `lancarNotas`: só em matrículas com situação `ATIVA` (ou flexível — documentar a escolha).

Esqueleto:

```java
package br.com.minerva.minerva.service;

import java.time.format.DateTimeFormatter;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import br.com.minerva.minerva.dto.*;
import br.com.minerva.minerva.exception.RecursoNaoEncontradoException;
import br.com.minerva.minerva.model.*;
import br.com.minerva.minerva.repository.*;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MatriculaService {

    private final MatriculaRepository matriculaRepository;
    private final AlunoRepository alunoRepository;
    private final MateriaRepository materiaRepository;

    @Transactional(readOnly = true)
    public List<MatriculaResponse> listarTodas() {
        return matriculaRepository.findAll().stream().map(this::paraResponse).toList();
    }

    @Transactional
    public MatriculaResponse criar(MatriculaRequest request) {
        // 1. buscar aluno e matéria
        // 2. validar duplicata
        // 3. salvar e retornar MatriculaResponse
        throw new UnsupportedOperationException("Implementar");
    }

    @Transactional
    public MatriculaResponse lancarNotas(Long id, NotasRequest request) {
        Matricula matricula = buscarEntidade(id);
        matricula.setNota(request.getNota());
        matricula.setFrequencia(request.getFrequencia());
        return paraResponse(matriculaRepository.save(matricula));
    }

    private Matricula buscarEntidade(Long id) {
        return matriculaRepository.findById(id)
            .orElseThrow(() -> new RecursoNaoEncontradoException("Matrícula não encontrada com id: " + id));
    }

    private MatriculaResponse paraResponse(Matricula m) {
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("dd/MM/yyyy");
        return new MatriculaResponse(
            m.getId(),
            m.getAluno().getId(),
            m.getAluno().getNome(),
            m.getMateria().getId(),
            m.getMateria().getNome(),
            m.getMateria().getCurso().getNome(),
            m.getDataCriacao().format(fmt),
            normalizarSituacao(m.getSituacao()),
            m.getNota(),
            m.getFrequencia()
        );
    }

    private String normalizarSituacao(String situacao) {
        return situacao == null ? "ATIVA" : situacao.trim().toUpperCase();
    }
}
```

### ✅ Checklist

- [ ] Expandir `MatriculaRepository.java` com os 4 métodos novos
- [ ] Criar `MatriculaService.java` com todos os métodos
- [ ] Tratar duplicata de matrícula (retornar 409 ou mensagem clara)
- [ ] Compilar sem erros
- [ ] Avisar Pessoa 3 quando terminar

---

## 📋 Cauan: MatriculaController + Endpoints do Professor

**Tempo estimado:** 45 minutos  
**Dificuldade:** ⭐⭐⭐ Médio/Alto  
**Dependência:** Espera Pessoa 2 terminar o `MatriculaService`

### O que fazer

Expor a API REST e completar o `ProfessorController`.

#### 1️⃣ Criar `MatriculaController.java`

**Localização:** `backend/src/main/java/br/com/minerva/minerva/controller/MatriculaController.java`

```java
package br.com.minerva.minerva.controller;

import java.net.URI;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import br.com.minerva.minerva.dto.*;
import br.com.minerva.minerva.service.MatriculaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/matriculas")
@RequiredArgsConstructor
public class MatriculaController {

    private final MatriculaService matriculaService;

    @GetMapping
    public List<MatriculaResponse> listar(
            @RequestParam(required = false) Long alunoId,
            @RequestParam(required = false) Long materiaId) {
        if (alunoId != null) return matriculaService.listarPorAluno(alunoId);
        if (materiaId != null) return matriculaService.listarPorMateria(materiaId);
        return matriculaService.listarTodas();
    }

    @GetMapping("/{id}")
    public MatriculaResponse buscarPorId(@PathVariable Long id) {
        return matriculaService.buscarPorId(id);
    }

    @PostMapping
    public ResponseEntity<MatriculaResponse> criar(@Valid @RequestBody MatriculaRequest request) {
        MatriculaResponse criada = matriculaService.criar(request);
        return ResponseEntity.created(URI.create("/matriculas/" + criada.getId())).body(criada);
    }

    @PutMapping("/{id}/situacao")
    public MatriculaResponse atualizarSituacao(
            @PathVariable Long id,
            @RequestParam String situacao) {
        return matriculaService.atualizarSituacao(id, situacao);
    }

    @PatchMapping("/{id}/notas")
    public MatriculaResponse lancarNotas(
            @PathVariable Long id,
            @Valid @RequestBody NotasRequest request) {
        return matriculaService.lancarNotas(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void excluir(@PathVariable Long id) {
        matriculaService.excluir(id);
    }
}
```

#### 2️⃣ Completar `ProfessorController.java`

Adicionar endpoints que faltam:

| Método | Rota | Descrição |
|--------|------|-----------|
| `POST` | `/professores` | Criar professor (já existe no `ProfessorService.criar`) |
| `GET` | `/professores/turmas?email=` | Matrículas das matérias do professor logado |
| `PUT` | `/professores/{id}/materias` | Vincular professor a matérias (tabela `professor_materia`) |

Exemplo do `POST` que falta:

```java
@PostMapping
@ResponseStatus(HttpStatus.CREATED)
public ProfessorResponse criar(@Valid @RequestBody ProfessorRequest request) {
    return professorService.criar(request);
}
```

Exemplo de turmas:

```java
@GetMapping("/turmas")
public List<MatriculaResponse> listarTurmas(@RequestParam String email) {
    return professorService.listarMatriculasDasTurmas(email);
}
```

> A Pessoa 4 implementa `listarMatriculasDasTurmas` e `vincularMaterias` no `ProfessorService`.

### ✅ Checklist

- [ ] Criar `MatriculaController.java` com CRUD + `PATCH /{id}/notas`
- [ ] Adicionar `POST /professores` no `ProfessorController`
- [ ] Adicionar `GET /professores/turmas` e `PUT /professores/{id}/materias`
- [ ] Testar no Swagger: `http://localhost:8080/swagger-ui.html`
- [ ] Avisar Pessoa 4 quando terminar

---

## 📋 Augusto: Sincronização Professor + Boletim/Histórico Real

**Tempo estimado:** 40 minutos  
**Dificuldade:** ⭐⭐⭐ Médio  
**Dependência:** Espera Pessoas 2 e 3 (parcialmente em paralelo)

### O que fazer

Espelhar o que já foi feito para alunos: sincronizar `usuarios` → `professores` e fazer boletim/histórico retornarem notas reais.

#### 1️⃣ Expandir `ProfessorRepository.java`

```java
Optional<Professor> findByEmail(String email);
```

#### 2️⃣ Expandir `ProfessorService.java`

Novos métodos:

| Método | Descrição |
|--------|-----------|
| `garantirProfessorDeUsuario(Usuario usuario)` | Cria `Professor` se não existir (mesmo e-mail do login) |
| `vincularMaterias(Long professorId, ProfessorMateriaRequest)` | Atualiza lista N:N de matérias |
| `listarMatriculasDasTurmas(String email)` | Busca professor → matérias → matrículas de cada matéria |

#### 3️⃣ Editar `UsuarioService.java`

No `cadastrar` e no `login`, quando `tipo=PROFESSOR`:

```java
if ("PROFESSOR".equals(resolverTipo(usuario))) {
    professorService.garantirProfessorDeUsuario(usuario);
}
```

(Mesmo padrão já usado para `alunoService.garantirAlunoDeUsuario`.)

#### 4️⃣ Editar `AlunoService.java` — notas reais no boletim/histórico

Trocar os `null` fixos por valores da matrícula:

```java
// Em obterBoletimPorEmail, na linha que monta DisciplinaAcademicaResponse:
return new DisciplinaAcademicaResponse(
    materia.getId(),
    materia.getNome(),
    normalizarSituacao(matricula.getSituacao()),
    matricula.getNota(),        // era null
    matricula.getFrequencia()   // era null
);

// Em obterHistoricoPorEmail, idem:
.map(matricula -> new DisciplinaAcademicaResponse(
    matricula.getMateria().getId(),
    matricula.getMateria().getNome(),
    normalizarSituacao(matricula.getSituacao()),
    matricula.getNota(),
    matricula.getFrequencia()))
```

#### 5️⃣ (Opcional / bônus) Exceção de matrícula duplicada

Criar `MatriculaDuplicadaException` → HTTP 409 no `GlobalExceptionHandler`, se ainda não existir.

### ✅ Checklist

- [ ] `findByEmail` em `ProfessorRepository`
- [ ] `garantirProfessorDeUsuario` + `vincularMaterias` + `listarMatriculasDasTurmas`
- [ ] Sincronizar professor no `UsuarioService` (cadastro + login)
- [ ] Boletim e histórico retornam `nota` e `frequencia` reais
- [ ] Compilar e testar fluxo completo (ver seção abaixo)
- [ ] Avisar o time quando terminar

---

## 🔄 Fluxo de Integração (Fase 2)

```
TEMPO │ PESSOA 1       │ PESSOA 2           │ PESSOA 3            │ PESSOA 4
──────┼────────────────┼────────────────────┼─────────────────────┼──────────────────
0min  │ ✅ INICIA      │ ⏳ AGUARDA         │ ⏳ AGUARDA          │ ⏳ AGUARDA
      │ DTOs + Model   │                    │                     │
──────┼────────────────┼────────────────────┼─────────────────────┼──────────────────
25min │ ✅ TERMINA     │ ✅ INICIA          │ ⏳ AGUARDA          │ ⏳ AGUARDA
      │ + Avisa P2     │ MatriculaService   │                     │
──────┼────────────────┼────────────────────┼─────────────────────┼──────────────────
75min │ ✅ FINALIZA    │ ✅ TERMINA         │ ✅ INICIA           │ ⏳ AGUARDA
      │                │ + Avisa P3         │ Controllers         │
──────┼────────────────┼────────────────────┼─────────────────────┼──────────────────
120min│ ⏳ ESPERA      │ ⏳ ESPERA          │ ✅ TERMINA          │ ✅ INICIA
      │                │                    │ + Avisa P4          │ Sync + Boletim
──────┼────────────────┼────────────────────┼─────────────────────┼──────────────────
160min│ 🧪 TODOS TESTAM JUNTO
```

---

## 🧪 Teste Final (Todos Juntos)

### 1. Subir o backend

```powershell
cd backend
.\mvnw.cmd clean compile
.\mvnw.cmd spring-boot:run
```

### 2. Fluxo completo no Swagger ou PowerShell

```powershell
# 1) Matricular aluno (use IDs reais do seu banco)
$matricula = @{
  alunoId = 1
  materiaId = 1
  situacao = "ATIVA"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8080/matriculas" -Method POST -Body $matricula -ContentType "application/json"

# 2) Professor lança nota (id da matrícula criada acima)
$notas = @{ nota = 8.5; frequencia = 92.0 } | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:8080/matriculas/1/notas" -Method PATCH -Body $notas -ContentType "application/json"

# 3) Aluno vê boletim com nota
Invoke-RestMethod -Uri "http://localhost:8080/alunos/boletim?email=EMAIL_DO_ALUNO"

# 4) Concluir disciplina → vai para histórico
Invoke-RestMethod -Uri "http://localhost:8080/matriculas/1/situacao?situacao=CONCLUIDA" -Method PUT
Invoke-RestMethod -Uri "http://localhost:8080/alunos/historico?email=EMAIL_DO_ALUNO"
```

### 3. Critérios de aceite

- [ ] `POST /matriculas` cria vínculo aluno ↔ matéria
- [ ] `GET /matriculas` lista matrículas (filtro por `alunoId` e `materiaId`)
- [ ] `PATCH /matriculas/{id}/notas` grava nota e frequência
- [ ] `GET /alunos/boletim` mostra notas das matrículas ATIVAS
- [ ] `GET /alunos/historico` mostra matrículas CONCLUIDA/REPROVADA/TRANCADA
- [ ] `GET /professores/turmas?email=` lista alunos das turmas do professor
- [ ] Login como professor cria/sincroniza registro em `professores`
- [ ] Frontend `/matriculas` e `/professor/notas` podem ser conectados (já têm UI pronta)

---

## 📞 Comunicação

- **Pessoa 1** → Avisa quando DTOs + entidade prontos
- **Pessoa 2** → Avisa quando `MatriculaService` pronto
- **Pessoa 3** → Avisa quando controllers expostos
- **Pessoa 4** → Avisa quando sync professor + boletim real prontos
- **Todos** → Testam o fluxo matrícula → nota → boletim juntos

---

## 🎯 Resumo Rápido

| Pessoa | O que faz | Tempo | Arquivos principais |
|--------|-----------|-------|---------------------|
| 1 | DTOs + campos `nota`/`frequencia` | 25min | 4 DTOs + editar `Matricula.java` |
| 2 | Repository + `MatriculaService` | 50min | 2 arquivos |
| 3 | `MatriculaController` + professor endpoints | 45min | 2 controllers |
| 4 | Sync professor + boletim real | 40min | 4 edições |
| **TOTAL** | **Backend funcional end-to-end** | **~2h40** | **12+ arquivos** |

---

## 📎 Integração com o Frontend (após backend)

| Tela | Endpoint a conectar |
|------|---------------------|
| `/matriculas` | `POST /matriculas`, `GET /matriculas` |
| `/professor/notas` | `GET /professores/turmas?email=`, `PATCH /matriculas/{id}/notas` |
| `/aluno/boletim` | Já conectado — passará a mostrar notas após Pessoa 4 |
| `/aluno/historico` | Já conectado — passará a mostrar histórico após matrículas concluídas |

---

## ⚠️ Fora do escopo desta fase (opcional depois)

- **Spring Security** com JWT e proteção por perfil (`SECRETARIA`, `PROFESSOR`, `ALUNO`)
- Upload real do documento de especialidade do professor (hoje só salva o nome do arquivo)
- Testes automatizados (`@SpringBootTest`, `@WebMvcTest`)

**BOA SORTE! 🚀**
