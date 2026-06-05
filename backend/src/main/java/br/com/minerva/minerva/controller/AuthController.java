package br.com.minerva.minerva.controller;

import java.net.URI;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import br.com.minerva.minerva.dto.CadastroRequest;
import br.com.minerva.minerva.dto.LoginRequest;
import br.com.minerva.minerva.dto.LoginResponse;
import br.com.minerva.minerva.dto.UsuarioResponse;
import br.com.minerva.minerva.service.UsuarioService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UsuarioService usuarioService;

    @PostMapping(value = "/cadastro", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<UsuarioResponse> cadastrar(@Valid @RequestBody CadastroRequest request) {
        UsuarioResponse criado = usuarioService.cadastrar(request);
        URI location = URI.create("/auth/usuarios/" + criado.getId());
        return ResponseEntity.created(location).body(criado);
    }

    @PostMapping(value = "/cadastro", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<UsuarioResponse> cadastrarMultipart(
            @RequestParam String nome,
            @RequestParam String email,
            @RequestParam String matricula,
            @RequestParam String senha,
            @RequestParam String tipo,
            @RequestParam(required = false) String curso,
            @RequestParam(required = false) Boolean bolsista,
            @RequestPart("especialidadeDoc") MultipartFile especialidadeDoc) {

        CadastroRequest request = new CadastroRequest();
        request.setNome(nome);
        request.setEmail(email);
        request.setMatricula(matricula);
        request.setSenha(senha);
        request.setTipo(tipo);
        request.setCurso(curso);
        request.setBolsista(bolsista);
        request.setEspecialidade(especialidadeDoc.getOriginalFilename());

        UsuarioResponse criado = usuarioService.cadastrar(request);
        URI location = URI.create("/auth/usuarios/" + criado.getId());
        return ResponseEntity.created(location).body(criado);
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(usuarioService.login(request));
    }
}