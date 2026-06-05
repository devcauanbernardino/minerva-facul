package br.com.minerva.minerva.controller;

import java.net.URI;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import br.com.minerva.minerva.dto.*;
import br.com.minerva.minerva.service.AlunoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/alunos")
@RequiredArgsConstructor
public class AlunoController {
    private final AlunoService alunoService;

    @GetMapping
    public ResponseEntity<List<AlunoResponse>> listar() { return ResponseEntity.ok(alunoService.listarTodos()); }

    @GetMapping("/boletim")
    public ResponseEntity<BoletimResponse> boletim(@RequestParam String email) {
        return ResponseEntity.ok(alunoService.obterBoletimPorEmail(email));
    }

    @GetMapping("/historico")
    public ResponseEntity<HistoricoResponse> historico(@RequestParam String email) {
        return ResponseEntity.ok(alunoService.obterHistoricoPorEmail(email));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AlunoResponse> buscarPorId(@PathVariable Long id) { return ResponseEntity.ok(alunoService.buscarPorId(id)); }

    @PostMapping
    public ResponseEntity<AlunoResponse> criar(@Valid @RequestBody AlunoRequest request) {
        AlunoResponse criado = alunoService.criar(request);
        URI location = URI.create("/alunos/" + criado.getId());
        return ResponseEntity.created(location).body(criado);
    }

    @PutMapping("/{id}")
    public ResponseEntity<AlunoResponse> atualizar(@PathVariable Long id, @Valid @RequestBody AlunoRequest request) {
        return ResponseEntity.ok(alunoService.atualizar(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        alunoService.excluir(id);
        return ResponseEntity.noContent().build();
    }
}