package br.com.minerva.minerva.config;

import java.util.ArrayList;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import br.com.minerva.minerva.model.Aluno;
import br.com.minerva.minerva.model.Curso;
import br.com.minerva.minerva.model.Materia;
import br.com.minerva.minerva.model.Matricula;
import br.com.minerva.minerva.model.Professor;
import br.com.minerva.minerva.model.Usuario;
import br.com.minerva.minerva.repository.AlunoRepository;
import br.com.minerva.minerva.repository.CursoRepository;
import br.com.minerva.minerva.repository.MateriaRepository;
import br.com.minerva.minerva.repository.MatriculaRepository;
import br.com.minerva.minerva.repository.ProfessorRepository;
import br.com.minerva.minerva.repository.UsuarioRepository;
import br.com.minerva.minerva.service.AlunoService;
import br.com.minerva.minerva.service.ProfessorService;
import lombok.RequiredArgsConstructor;

@Component
@Order(3)
@RequiredArgsConstructor
public class MockDataInitializer implements ApplicationRunner {

	private static final Logger log = LoggerFactory.getLogger(MockDataInitializer.class);
	private static final String SENHA_DEMO = "demo123";

	private final MatriculaRepository matriculaRepository;
	private final CursoRepository cursoRepository;
	private final MateriaRepository materiaRepository;
	private final UsuarioRepository usuarioRepository;
	private final AlunoRepository alunoRepository;
	private final ProfessorRepository professorRepository;
	private final PasswordEncoder passwordEncoder;
	private final AlunoService alunoService;
	private final ProfessorService professorService;

	@Override
	@Transactional
	public void run(ApplicationArguments args) {
		Curso engSoftware = cursoRepository.findByNome("Engenharia de Software").orElse(null);
		Curso cienciaComp = cursoRepository.findByNome("Ciência da Computação").orElse(null);
		if (engSoftware == null || cienciaComp == null) {
			return;
		}

		log.info("Verificando / carregando dados mockados…");

		criarProfessorDemo(
			"Marina Costa",
			"prof.marina@minerva.com",
			"2026.06.08.100101",
			engSoftware,
			List.of(
				"Algoritmos e Estruturas de Dados",
				"Banco de Dados",
				"Engenharia de Software I"));

		criarProfessorDemo(
			"Lucas Mendes",
			"prof.lucas@minerva.com",
			"2026.06.08.100102",
			cienciaComp,
			List.of(
				"Estrutura de Dados",
				"Inteligência Artificial",
				"Sistemas Operacionais"));

		criarAlunoDemo("Ana Silva", "ana.aluno@minerva.com", "2026.06.08.100201", engSoftware, true);
		criarAlunoDemo("Bruno Souza", "bruno.aluno@minerva.com", "2026.06.08.100202", engSoftware, false);
		criarAlunoDemo("Carla Nunes", "carla.aluno@minerva.com", "2026.06.08.100203", cienciaComp, true);

		for (Aluno aluno : alunoRepository.findAll()) {
			if (matriculaRepository.findByAlunoId(aluno.getId()).isEmpty()) {
				matricularAlunoNasMateriasDoCurso(aluno);
			}
		}

		for (Professor professor : professorRepository.findAll()) {
			professor = professorRepository.findById(professor.getId()).orElseThrow();
			if (professor.getMaterias().isEmpty()) {
				List<Materia> materias = primeirasMaterias(engSoftware, 3);
				if (!materias.isEmpty()) {
					professor.setMaterias(materias);
					professorRepository.save(professor);
				}
			}
		}

		log.info("""
			Dados mockados prontos. Senha demo: {}
			Professores: 2026.06.08.100101 (Marina) · 2026.06.08.100102 (Lucas)
			Alunos: 2026.06.08.100201 (Ana) · 2026.06.08.100202 (Bruno) · 2026.06.08.100203 (Carla)
			Secretaria: SECRETARIA.0001 / secretaria123
			""", SENHA_DEMO);
	}

	private void criarProfessorDemo(
			String nome,
			String email,
			String matricula,
			Curso curso,
			List<String> nomesMaterias) {
		Usuario usuario = usuarioRepository.findByEmail(email).orElseGet(Usuario::new);
		usuario.setNome(nome);
		usuario.setEmail(email);
		usuario.setMatricula(matricula);
		usuario.setSenha(passwordEncoder.encode(SENHA_DEMO));
		usuario.setTipo("PROFESSOR");
		usuario.setBolsista(false);
		usuario.setEspecialidade("Docente — " + curso.getNome());
		usuarioRepository.save(usuario);

		Professor professor = professorService.garantirProfessorDeUsuario(usuario);
		professor.setSenha(usuario.getSenha());
		List<Materia> materias = resolverMaterias(curso, nomesMaterias);
		if (!materias.isEmpty()) {
			professor.setMaterias(materias);
		}
		professorRepository.save(professor);
	}

	private void criarAlunoDemo(String nome, String email, String matricula, Curso curso, boolean bolsista) {
		Usuario usuario = usuarioRepository.findByEmail(email).orElseGet(Usuario::new);
		usuario.setNome(nome);
		usuario.setEmail(email);
		usuario.setMatricula(matricula);
		usuario.setSenha(passwordEncoder.encode(SENHA_DEMO));
		usuario.setTipo("ALUNO");
		usuario.setCurso(curso.getNome());
		usuario.setBolsista(bolsista);
		usuarioRepository.save(usuario);

		Aluno aluno = alunoService.garantirAlunoDeUsuario(usuario);
		aluno.setSenha(usuario.getSenha());
		alunoRepository.save(aluno);
		if (matriculaRepository.findByAlunoId(aluno.getId()).isEmpty()) {
			matricularAlunoNasMateriasDoCurso(aluno);
		}
	}

	private void matricularAlunoNasMateriasDoCurso(Aluno aluno) {
		List<Materia> materias = primeirasMaterias(aluno.getCurso(), 3);
		List<Long> materiasMatriculadas = matriculaRepository.findByAlunoId(aluno.getId()).stream()
			.map(m -> m.getMateria().getId())
			.toList();

		for (Materia materia : materias) {
			if (materiasMatriculadas.contains(materia.getId())) {
				continue;
			}
			Matricula matricula = new Matricula();
			matricula.setAluno(aluno);
			matricula.setMateria(materia);
			matricula.setSituacao("ATIVA");
			matriculaRepository.save(matricula);
		}
	}

	private List<Materia> primeirasMaterias(Curso curso, int limite) {
		List<Materia> todas = materiaRepository.findByCursoIdOrderByNomeAsc(curso.getId());
		if (todas.size() <= limite) {
			return todas;
		}
		return todas.subList(0, limite);
	}

	private List<Materia> resolverMaterias(Curso curso, List<String> nomesMaterias) {
		List<Materia> todas = materiaRepository.findByCursoIdOrderByNomeAsc(curso.getId());
		List<Materia> selecionadas = new ArrayList<>();
		for (String nome : nomesMaterias) {
			todas.stream()
				.filter(m -> m.getNome().equalsIgnoreCase(nome))
				.findFirst()
				.ifPresent(selecionadas::add);
		}
		return selecionadas;
	}
}
