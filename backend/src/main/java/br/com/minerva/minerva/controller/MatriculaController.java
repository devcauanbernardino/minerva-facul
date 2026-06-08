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
