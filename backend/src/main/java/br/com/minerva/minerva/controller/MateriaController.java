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
