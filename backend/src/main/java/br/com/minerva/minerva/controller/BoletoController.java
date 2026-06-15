package br.com.minerva.minerva.controller;

import br.com.minerva.minerva.dto.BoletoRequest;
import br.com.minerva.minerva.dto.BoletoResponse;
import br.com.minerva.minerva.service.BoletoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/boletos")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class BoletoController {
    private final BoletoService boletoService;

    @GetMapping
    public List<BoletoResponse> listar(@RequestParam(required = false) Long alunoId) {
        if (alunoId != null) {
            return boletoService.listarPorAluno(alunoId);
        }
        return boletoService.listarTodos();
    }

    @GetMapping("/{id}")
    public BoletoResponse buscarPorId(@PathVariable Long id) {
        return boletoService.buscarPorId(id);
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
