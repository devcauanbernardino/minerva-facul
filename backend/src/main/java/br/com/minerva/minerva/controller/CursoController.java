package br.com.minerva.minerva.controller;

import java.net.URI;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.minerva.minerva.dto.CursoRequest;
import br.com.minerva.minerva.dto.CursoResponse;
import br.com.minerva.minerva.service.CursoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/cursos")
@RequiredArgsConstructor
public class CursoController {

	private final CursoService cursoService;

	@GetMapping
	public ResponseEntity<List<CursoResponse>> listar() {
		return ResponseEntity.ok(cursoService.listarTodos());
	}

	@GetMapping("/{id}")
	public ResponseEntity<CursoResponse> buscarPorId(@PathVariable Long id) {
		return ResponseEntity.ok(cursoService.buscarPorId(id));
	}

	@PostMapping
	public ResponseEntity<CursoResponse> criar(@Valid @RequestBody CursoRequest request) {
		CursoResponse criado = cursoService.criar(request);
		URI location = URI.create("/cursos/" + criado.getId());
		return ResponseEntity.created(location).body(criado);
	}

	@PutMapping("/{id}")
	public ResponseEntity<CursoResponse> atualizar(@PathVariable Long id, @Valid @RequestBody CursoRequest request) {
		return ResponseEntity.ok(cursoService.atualizar(id, request));
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<Void> excluir(@PathVariable Long id) {
		cursoService.excluir(id);
		return ResponseEntity.noContent().build();
	}
}
