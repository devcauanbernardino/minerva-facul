package br.com.minerva.minerva.controller;

import java.net.URI;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.minerva.minerva.dto.CadastroRequest;
import br.com.minerva.minerva.dto.UsuarioResponse;
import br.com.minerva.minerva.service.UsuarioService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UsuarioService usuarioService;

    @PostMapping("/cadastro")
    public ResponseEntity<UsuarioResponse> cadastrar(@Valid @RequestBody CadastroRequest request) {
        UsuarioResponse criado = usuarioService.cadastrar(request);
        URI location = URI.create("/auth/usuarios/" + criado.getId());
        return ResponseEntity.created(location).body(criado);
    }
}