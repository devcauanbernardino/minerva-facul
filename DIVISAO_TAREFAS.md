# 👥 Divisão de Tarefas - Projeto Minerva (4 Pessoas)

## 🎯 Objetivo Final
Completar o backend do Minerva em paralelo. Cada pessoa trabalha independente e depois integra.

---

## 📋 PESSOA 1: DTOs (Data Transfer Objects)
**Tempo estimado:** 20 minutos  
**Dificuldade:** ⭐ Fácil  
**Dependência:** Nenhuma - pode começar AGORA!

### O que fazer:
Criar 2 arquivos DTO (objetos que carregam dados entre frontend e backend)

#### 1️⃣ Criar arquivo: `MateriaRequest.java`
**Localização:** `backend/src/main/java/br/com/minerva/minerva/dto/MateriaRequest.java`

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
public class MateriaRequest {

	@NotBlank(message = "O nome da matéria é obrigatório")
	private String nome;

	@NotNull(message = "O ID do curso é obrigatório")
	private Long cursoId;
}
```

#### 2️⃣ Criar arquivo: `LoginResponse.java`
**Localização:** `backend/src/main/java/br/com/minerva/minerva/dto/LoginResponse.java`

```java
package br.com.minerva.minerva.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponse {

	private Long id;
	private String nome;
	private String email;
	private String tipo; // "ALUNO" ou "PROFESSOR"
}
```

### ✅ Checklist:
- [ ] Criar MateriaRequest.java
- [ ] Criar LoginResponse.java
- [ ] Compilar sem erros: `.\mvnw -DskipTests compile`
- [ ] Avisar Pessoa 2 quando terminar

---

## 📋 PESSOA 2: Repository + Service de Materia
**Tempo estimado:** 40 minutos  
**Dificuldade:** ⭐⭐ Médio  
**Dependência:** Espera Pessoa 1 terminar os DTOs

### O que fazer:
Criar 2 arquivos que vão fazer as operações (CRUD) de Materia no banco de dados

#### 1️⃣ Criar arquivo: `MateriaRepository.java`
**Localização:** `backend/src/main/java/br/com/minerva/minerva/repository/MateriaRepository.java`

```java
package br.com.minerva.minerva.repository;

import br.com.minerva.minerva.model.Materia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MateriaRepository extends JpaRepository<Materia, Long> {
	
}
```

#### 2️⃣ Criar arquivo: `MateriaService.java`
**Localização:** `backend/src/main/java/br/com/minerva/minerva/service/MateriaService.java`

```java
package br.com.minerva.minerva.service;

import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import br.com.minerva.minerva.dto.MateriaRequest;
import br.com.minerva.minerva.dto.MateriaResponse;
import br.com.minerva.minerva.exception.RecursoNaoEncontradoException;
import br.com.minerva.minerva.model.Curso;
import br.com.minerva.minerva.model.Materia;
import br.com.minerva.minerva.repository.CursoRepository;
import br.com.minerva.minerva.repository.MateriaRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MateriaService {
	
	private final MateriaRepository materiaRepository;
	private final CursoRepository cursoRepository;

	@Transactional(readOnly = true)
	public List<MateriaResponse> listarTodas() {
		return materiaRepository.findAll().stream().map(this::paraResponse).toList();
	}

	@Transactional(readOnly = true)
	public MateriaResponse buscarPorId(Long id) {
		return paraResponse(buscarEntidade(id));
	}

	@Transactional
	public MateriaResponse criar(MateriaRequest request) {
		Curso curso = cursoRepository.findById(request.getCursoId())
			.orElseThrow(() -> new RecursoNaoEncontradoException("Curso não encontrado com id: " + request.getCursoId()));
		
		Materia m = new Materia();
		m.setNome(request.getNome());
		m.setCurso(curso);
		
		return paraResponse(materiaRepository.save(m));
	}

	@Transactional
	public MateriaResponse atualizar(Long id, MateriaRequest request) {
		Materia m = buscarEntidade(id);
		Curso curso = cursoRepository.findById(request.getCursoId())
			.orElseThrow(() -> new RecursoNaoEncontradoException("Curso não encontrado com id: " + request.getCursoId()));
		
		m.setNome(request.getNome());
		m.setCurso(curso);
		
		return paraResponse(materiaRepository.save(m));
	}

	@Transactional
	public void excluir(Long id) {
		materiaRepository.delete(buscarEntidade(id));
	}

	private Materia buscarEntidade(Long id) {
		return materiaRepository.findById(id)
			.orElseThrow(() -> new RecursoNaoEncontradoException("Matéria não encontrada com id: " + id));
	}

	private MateriaResponse paraResponse(Materia m) {
		return new MateriaResponse(m.getId(), m.getNome(), m.getCurso().getId(), m.getCurso().getNome());
	}
}
```

### ✅ Checklist:
- [ ] Criar MateriaRepository.java
- [ ] Criar MateriaService.java
- [ ] Compilar sem erros: `.\mvnw -DskipTests compile`
- [ ] Avisar Pessoa 3 quando terminar

---

## 📋 PESSOA 3: Controllers REST (URLs)
**Tempo estimado:** 45 minutos  
**Dificuldade:** ⭐⭐⭐ Médio/Alto  
**Dependência:** Espera Pessoa 2 terminar o Service

### O que fazer:
Criar 2 controladores que vão expor as URLs da API

#### 1️⃣ Criar arquivo: `MateriaController.java`
**Localização:** `backend/src/main/java/br/com/minerva/minerva/controller/MateriaController.java`

```java
package br.com.minerva.minerva.controller;

import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import br.com.minerva.minerva.dto.MateriaRequest;
import br.com.minerva.minerva.dto.MateriaResponse;
import br.com.minerva.minerva.service.MateriaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/materias")
@RequiredArgsConstructor
public class MateriaController {
	
	private final MateriaService materiaService;

	@GetMapping
	public List<MateriaResponse> listarTodas() {
		return materiaService.listarTodas();
	}

	@GetMapping("/{id}")
	public MateriaResponse buscarPorId(@PathVariable Long id) {
		return materiaService.buscarPorId(id);
	}

	@PostMapping
	@ResponseStatus(HttpStatus.CREATED)
	public MateriaResponse criar(@Valid @RequestBody MateriaRequest request) {
		return materiaService.criar(request);
	}

	@PutMapping("/{id}")
	public MateriaResponse atualizar(@PathVariable Long id, @Valid @RequestBody MateriaRequest request) {
		return materiaService.atualizar(id, request);
	}

	@DeleteMapping("/{id}")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void excluir(@PathVariable Long id) {
		materiaService.excluir(id);
	}
}
```

#### 2️⃣ Criar arquivo: `ProfessorController.java`
**Localização:** `backend/src/main/java/br/com/minerva/minerva/controller/ProfessorController.java`

```java
package br.com.minerva.minerva.controller;

import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import br.com.minerva.minerva.dto.ProfessorRequest;
import br.com.minerva.minerva.dto.ProfessorResponse;
import br.com.minerva.minerva.service.ProfessorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/professores")
@RequiredArgsConstructor
public class ProfessorController {
	
	private final ProfessorService professorService;

	@GetMapping
	public List<ProfessorResponse> listarTodos() {
		return professorService.listarTodos();
	}

	@GetMapping("/{id}")
	public ProfessorResponse buscarPorId(@PathVariable Long id) {
		return professorService.buscarPorId(id);
	}

	@PutMapping("/{id}")
	public ProfessorResponse atualizar(@PathVariable Long id, @Valid @RequestBody ProfessorRequest request) {
		return professorService.atualizar(id, request);
	}

	@DeleteMapping("/{id}")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void excluir(@PathVariable Long id) {
		professorService.excluir(id);
	}
}
```

### ✅ Checklist:
- [ ] Criar MateriaController.java
- [ ] Criar ProfessorController.java
- [ ] Compilar sem erros: `.\mvnw -DskipTests compile`
- [ ] Avisar Pessoa 4 quando terminar

---

## 📋 PESSOA 4: Relacionamentos (Banco de Dados)
**Tempo estimado:** 30 minutos  
**Dificuldade:** ⭐⭐⭐⭐ Alto  
**Dependência:** Espera Pessoa 3 terminar

### O que fazer:
Conectar Professor com Materia (muitos-para-muitos) e Aluno com Materia (via Matricula)

#### 1️⃣ Editar arquivo: `Professor.java` (ADICIONAR relacionamento)
**Localização:** `backend/src/main/java/br/com/minerva/minerva/model/Professor.java`

Adicionar NO FINAL da classe (antes do fechamento `}`):

```java
	@ManyToMany
	@JoinTable(
		name = "professor_materia",
		joinColumns = @JoinColumn(name = "professor_id"),
		inverseJoinColumns = @JoinColumn(name = "materia_id")
	)
	private List<Materia> materias = new ArrayList<>();
```

No topo do arquivo adicionar import:
```java
import java.util.ArrayList;
import java.util.List;
```

#### 2️⃣ Editar arquivo: `Materia.java` (ADICIONAR relacionamento com Professor)
**Localização:** `backend/src/main/java/br/com/minerva/minerva/model/Materia.java`

Adicionar NO FINAL da classe:

```java
	@ManyToMany(mappedBy = "materias")
	private List<Professor> professores = new ArrayList<>();
```

Adicionar import:
```java
import java.util.ArrayList;
import java.util.List;
```

#### 3️⃣ Criar arquivo: `Matricula.java` (Nova entidade)
**Localização:** `backend/src/main/java/br/com/minerva/minerva/model/Matricula.java`

```java
package br.com.minerva.minerva.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "matriculas")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Matricula {
	
	@Id @GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	
	@ManyToOne(optional = false)
	@JoinColumn(name = "aluno_id")
	private Aluno aluno;
	
	@ManyToOne(optional = false)
	@JoinColumn(name = "materia_id")
	private Materia materia;
	
	@Column(nullable = false)
	private LocalDate dataCriacao = LocalDate.now();
	
	@Column(name = "situacao")
	private String situacao = "ATIVA"; // ATIVA, CONCLUIDA, CANCELADA
}
```

#### 4️⃣ Editar arquivo: `Aluno.java` (ADICIONAR relacionamento com Matricula)
**Localização:** `backend/src/main/java/br/com/minerva/minerva/model/Aluno.java`

Adicionar NO FINAL da classe:

```java
	@OneToMany(mappedBy = "aluno", cascade = CascadeType.ALL, orphanRemoval = true)
	private List<Matricula> matriculas = new ArrayList<>();
```

Adicionar import se não existir:
```java
import java.util.ArrayList;
import java.util.List;
import jakarta.persistence.CascadeType;
```

#### 5️⃣ Editar arquivo: `Materia.java` (ADICIONAR relacionamento com Matricula)
**Localização:** `backend/src/main/java/br/com/minerva/minerva/model/Materia.java`

Adicionar NO FINAL da classe (se não tiver já):

```java
	@OneToMany(mappedBy = "materia")
	private List<Matricula> matriculas = new ArrayList<>();
```

#### 6️⃣ Criar arquivo: `MatriculaRepository.java`
**Localização:** `backend/src/main/java/br/com/minerva/minerva/repository/MatriculaRepository.java`

```java
package br.com.minerva.minerva.repository;

import br.com.minerva.minerva.model.Matricula;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MatriculaRepository extends JpaRepository<Matricula, Long> {
	
}
```

### ✅ Checklist:
- [ ] Editar Professor.java (adicionar @ManyToMany)
- [ ] Editar Materia.java (adicionar @ManyToMany)
- [ ] Criar Matricula.java (nova entidade)
- [ ] Editar Aluno.java (adicionar @OneToMany)
- [ ] Editar Materia.java (adicionar @OneToMany para Matricula)
- [ ] Criar MatriculaRepository.java
- [ ] Compilar sem erros: `.\mvnw -DskipTests compile`

---

## 🔄 Fluxo de Integração

```
TEMPO │ PESSOA 1    │ PESSOA 2         │ PESSOA 3         │ PESSOA 4
─────┼─────────────┼──────────────────┼──────────────────┼──────────────
0min  │ ✅ INICIA   │ ⏳ AGUARDA       │ ⏳ AGUARDA       │ ⏳ AGUARDA
      │ DTOs        │                  │                  │
─────┼─────────────┼──────────────────┼──────────────────┼──────────────
20min │ ✅ TERMINA  │ ✅ INICIA        │ ⏳ AGUARDA       │ ⏳ AGUARDA
      │ + Avisa P2  │ Repository+Svc   │                  │
─────┼─────────────┼──────────────────┼──────────────────┼──────────────
25min │ ✅ FINALIZA │                  │ ⏳ AGUARDA       │ ⏳ AGUARDA
      │ + Testa     │                  │                  │
─────┼─────────────┼──────────────────┼──────────────────┼──────────────
60min │ ⏳ ESPERA   │ ✅ TERMINA       │ ✅ INICIA        │ ⏳ AGUARDA
      │            │ + Avisa P3       │ Controllers      │
─────┼─────────────┼──────────────────┼──────────────────┼──────────────
75min │ ⏳ ESPERA   │ ⏳ ESPERA        │ ✅ TERMINA       │ ✅ INICIA
      │            │                  │ + Avisa P4       │ Relacionam.
─────┼─────────────┼──────────────────┼──────────────────┼──────────────
105min│ ✅ PRONTO   │ ✅ PRONTO        │ ✅ PRONTO        │ ✅ TERMINA
      │            │                  │                  │
─────┼─────────────┼──────────────────┼──────────────────┼──────────────
120min│ 🧪 TODOS TESTAM JUNTO → Rodam: .\mvnw -DskipTests spring-boot:run
```

---

## 🧪 Teste Final (Todos Juntos)

Depois que terminar tudo, em um terminal de POWERSHell:

```powershell
cd backend
.\mvnw clean compile
.\mvnw -DskipTests spring-boot:run
```

Se compilar e rodar sem erros, o backend está pronto! ✅

---

## 📞 Comunicação

- **Pessoa 1** → Avisa quando DTOs prontos
- **Pessoa 2** → Avisa quando Repository + Service prontos
- **Pessoa 3** → Avisa quando Controllers prontos
- **Pessoa 4** → Avisa quando Relacionamentos prontos
- **Todos** → Testam junto no final

---

## 🎯 Resumo Rápido

| Pessoa | O que faz | Tempo | Arquivos |
|--------|-----------|-------|----------|
| 1 | DTOs | 20min | 2 arquivos |
| 2 | Repository + Service | 40min | 2 arquivos |
| 3 | Controllers | 45min | 2 arquivos |
| 4 | Relacionamentos | 30min | 6 edições |
| **TOTAL** | **Backend Completo** | **~2h** | **10+ arquivos** |

**BOA SORTE! 🚀**
