package br.com.minerva.minerva.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.minerva.minerva.dto.CadastroRequest;
import br.com.minerva.minerva.dto.LoginRequest;
import br.com.minerva.minerva.dto.UsuarioResponse;
import br.com.minerva.minerva.exception.CredenciaisInvalidasException;
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
		String matricula = normalizarMatricula(request.getMatricula());
		if (usuarioRepository.existsByMatricula(matricula)) {
			throw new EmailJaCadastradoException("Esta matrícula já está cadastrada.");
		}

		Usuario usuario = new Usuario();
		usuario.setNome(request.getNome());
		usuario.setEmail(request.getEmail());
		usuario.setMatricula(matricula);
		usuario.setSenha(passwordEncoder.encode(request.getSenha()));
		usuario.setTipo(request.getTipo());
		usuario.setCurso(request.getCurso());
		usuario.setBolsista(request.getBolsista() != null ? request.getBolsista() : false);
		usuario.setEspecialidade(request.getEspecialidade());

		Usuario salvo = usuarioRepository.save(usuario);
		return paraResponse(salvo);
	}

	@Transactional(readOnly = true)
	public UsuarioResponse login(LoginRequest request) {
		String matricula = normalizarMatricula(request.getMatricula());
		Usuario usuario = usuarioRepository.findByMatricula(matricula)
			.orElseThrow(() -> new CredenciaisInvalidasException("Matrícula ou senha incorretos."));

		if (!passwordEncoder.matches(request.getSenha(), usuario.getSenha())) {
			throw new CredenciaisInvalidasException("Matrícula ou senha incorretos.");
		}

		return paraResponse(usuario);
	}

	private UsuarioResponse paraResponse(Usuario usuario) {
		return new UsuarioResponse(
			usuario.getId(),
			usuario.getNome(),
			usuario.getEmail(),
			usuario.getMatricula());
	}

	private String normalizarMatricula(String matricula) {
		return matricula == null ? "" : matricula.trim();
	}
}
