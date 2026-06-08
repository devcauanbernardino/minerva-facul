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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import br.com.minerva.minerva.dto.MatriculaResponse;
import br.com.minerva.minerva.dto.ProfessorMateriaRequest;
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

	@GetMapping("/turmas")
	public List<MatriculaResponse> listarTurmas(@RequestParam String email) {
		return professorService.listarMatriculasDasTurmas(email);
	}

	@GetMapping("/{id}")
	public ProfessorResponse buscarPorId(@PathVariable Long id) {
		return professorService.buscarPorId(id);
	}

	@PostMapping
	@ResponseStatus(HttpStatus.CREATED)
	public ProfessorResponse criar(@Valid @RequestBody ProfessorRequest request) {
		return professorService.criar(request);
	}

	@PutMapping("/{id}")
	public ProfessorResponse atualizar(@PathVariable Long id, @Valid @RequestBody ProfessorRequest request) {
		return professorService.atualizar(id, request);
	}

	@PutMapping("/{id}/materias")
	public ProfessorResponse vincularMaterias(
			@PathVariable Long id,
			@Valid @RequestBody ProfessorMateriaRequest request) {
		return professorService.vincularMaterias(id, request);
	}

	@DeleteMapping("/{id}")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void excluir(@PathVariable Long id) {
		professorService.excluir(id);
	}
}
