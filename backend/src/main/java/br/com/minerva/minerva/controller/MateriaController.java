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
    public ResponseEntity<List<MateriaResponse>> listar() {
        return ResponseEntity.ok(materiaService.listarTodos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<MateriaResponse> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(materiaService.buscarPorId(id));
    }

    @PostMapping
    public ResponseEntity<MateriaResponse> criar(@Valid @RequestBody MateriaRequest request) {
        MateriaResponse criado = materiaService.criar(request);
        URI location = URI.create("/materias/" + criado.getId());
        return ResponseEntity.created(location).body(criado);
    }

    @PutMapping("/{id}")
    public ResponseEntity<MateriaResponse> atualizar(@PathVariable Long id, @Valid @RequestBody MateriaRequest request) {
        return ResponseEntity.ok(materiaService.atualizar(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        materiaService.excluir(id);
        return ResponseEntity.noContent().build();
    }
}
