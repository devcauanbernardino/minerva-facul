package br.com.minerva.minerva.config;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

import br.com.minerva.minerva.model.Curso;
import br.com.minerva.minerva.repository.CursoRepository;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class CursoDataInitializer implements ApplicationRunner {

	private final CursoRepository cursoRepository;

	@Override
	public void run(ApplicationArguments args) {
		if (cursoRepository.count() > 0) {
			return;
		}

		salvar("Engenharia de Software", 3200, 10);
		salvar("Ciência da Computação", 3000, 8);
		salvar("Administração", 2400, 8);
		salvar("Direito", 3600, 10);
		salvar("Medicina", 7200, 12);
		salvar("Psicologia", 2800, 10);
		salvar("Engenharia Civil", 3400, 10);
		salvar("Arquitetura e Urbanismo", 3800, 10);
	}

	private void salvar(String nome, int cargaHoraria, int duracaoSemestres) {
		Curso curso = new Curso();
		curso.setNome(nome);
		curso.setCargaHoraria(cargaHoraria);
		curso.setDuracaoSemestres(duracaoSemestres);
		cursoRepository.save(curso);
	}
}
