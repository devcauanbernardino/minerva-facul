package br.com.minerva.minerva.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.minerva.minerva.dto.CadastroRequest;
import br.com.minerva.minerva.dto.LoginRequest;
import br.com.minerva.minerva.dto.LoginResponse;
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
	private final AlunoService alunoService;
	private final ProfessorService professorService;
	private final PasswordEncoder passwordEncoder;

	@Transactional
	public UsuarioResponse cadastrar(CadastroRequest request) {
		if ("SECRETARIA".equalsIgnoreCase(request.getTipo())) {
			throw new EmailJaCadastradoException("Cadastro de secretaria não é permitido por esta rota.");
		}
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
		usuario.setTipo(normalizarTipo(request.getTipo()));
		usuario.setCurso(request.getCurso());
		usuario.setBolsista(request.getBolsista() != null ? request.getBolsista() : false);
		usuario.setEspecialidade(request.getEspecialidade());

		Usuario salvo = usuarioRepository.save(usuario);
		if ("ALUNO".equals(salvo.getTipo())) {
			alunoService.garantirAlunoDeUsuario(salvo);
		}
		if ("PROFESSOR".equals(salvo.getTipo())) {
			professorService.garantirProfessorDeUsuario(salvo);
		}
		return paraResponse(salvo);
	}

	@Transactional(readOnly = true)
	public LoginResponse login(LoginRequest request) {
		String matricula = normalizarMatricula(request.getMatricula());
		Usuario usuario = usuarioRepository.findByMatricula(matricula)
			.orElseThrow(() -> new CredenciaisInvalidasException("Matrícula ou senha incorretos."));

		if (!passwordEncoder.matches(request.getSenha(), usuario.getSenha())) {
			throw new CredenciaisInvalidasException("Matrícula ou senha incorretos.");
		}

		if ("ALUNO".equals(resolverTipo(usuario))) {
			alunoService.garantirAlunoDeUsuario(usuario);
		}
		if ("PROFESSOR".equals(resolverTipo(usuario))) {
			professorService.garantirProfessorDeUsuario(usuario);
		}

		return paraLoginResponse(usuario);
	}

	private LoginResponse paraLoginResponse(Usuario usuario) {
		return new LoginResponse(
			usuario.getId(),
			usuario.getNome(),
			usuario.getEmail(),
			usuario.getMatricula(),
			resolverTipo(usuario));
	}

	private String normalizarTipo(String tipo) {
		return tipo == null ? null : tipo.trim().toUpperCase();
	}

	private String resolverTipo(Usuario usuario) {
		String tipo = normalizarTipo(usuario.getTipo());
		if (tipo != null && !tipo.isEmpty()) {
			return tipo;
		}
		if (usuario.getMatricula() != null && usuario.getMatricula().startsWith("SECRETARIA")) {
			return "SECRETARIA";
		}
		if (usuario.getEspecialidade() != null && !usuario.getEspecialidade().isBlank()) {
			return "PROFESSOR";
		}
		return "ALUNO";
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
