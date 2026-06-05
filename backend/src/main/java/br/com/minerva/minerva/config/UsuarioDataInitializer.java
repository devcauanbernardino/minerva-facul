package br.com.minerva.minerva.config;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import br.com.minerva.minerva.model.Usuario;
import br.com.minerva.minerva.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class UsuarioDataInitializer implements ApplicationRunner {

	private static final String MATRICULA_SECRETARIA = "SECRETARIA.0001";

	private final UsuarioRepository usuarioRepository;
	private final PasswordEncoder passwordEncoder;

	@Override
	public void run(ApplicationArguments args) {
		if (usuarioRepository.existsByMatricula(MATRICULA_SECRETARIA)) {
			return;
		}

		Usuario secretaria = new Usuario();
		secretaria.setNome("Secretaria Acadêmica");
		secretaria.setEmail("secretaria@minerva.com");
		secretaria.setMatricula(MATRICULA_SECRETARIA);
		secretaria.setSenha(passwordEncoder.encode("secretaria123"));
		secretaria.setTipo("SECRETARIA");
		secretaria.setBolsista(false);
		usuarioRepository.save(secretaria);
	}
}
