package br.com.minerva.minerva.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import br.com.minerva.minerva.dto.CadastroRequest;
import br.com.minerva.minerva.dto.UsuarioResponse;
import br.com.minerva.minerva.exception.EmailJaCadastradoException;
import br.com.minerva.minerva.model.Usuario;
import br.com.minerva.minerva.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
@Service
@RequiredArgsConstructor
public class UsuarioService {
    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    @Transactional
    public UsuarioResponse cadastrar(CadastroRequest request) {
        if (usuarioRepository.existsByEmail(request.getEmail())) {
            throw new EmailJaCadastradoException("Este e-mail já está cadastrado.");
        }
        Usuario usuario = new Usuario();
        usuario.setNome(request.getNome());
        usuario.setEmail(request.getEmail());
        usuario.setSenha(passwordEncoder.encode(request.getSenha()));
        Usuario salvo = usuarioRepository.save(usuario);
        return paraResponse(salvo);
    }
    private UsuarioResponse paraResponse(Usuario usuario) {
        return new UsuarioResponse(usuario.getId(), usuario.getNome(), usuario.getEmail());
    }
}