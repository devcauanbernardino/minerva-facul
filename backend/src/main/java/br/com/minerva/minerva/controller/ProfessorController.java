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
