package br.com.minerva.minerva.config;

import java.util.List;
import java.util.Map;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import br.com.minerva.minerva.model.Curso;
import br.com.minerva.minerva.model.Materia;
import br.com.minerva.minerva.repository.CursoRepository;
import br.com.minerva.minerva.repository.MateriaRepository;
import lombok.RequiredArgsConstructor;

@Component
@Order(2)
@RequiredArgsConstructor
public class MateriaDataInitializer implements ApplicationRunner {

	private static final Map<String, List<String>> MATERIAS_POR_CURSO = Map.ofEntries(
		Map.entry("Engenharia de Software", List.of(
			"Algoritmos e Estruturas de Dados",
			"Banco de Dados",
			"Engenharia de Software I",
			"Programação Orientada a Objetos",
			"Redes de Computadores")),
		Map.entry("Ciência da Computação", List.of(
			"Estrutura de Dados",
			"Inteligência Artificial",
			"Sistemas Operacionais",
			"Teoria da Computação",
			"Matemática Discreta")),
		Map.entry("Administração", List.of(
			"Contabilidade Geral",
			"Economia Empresarial",
			"Gestão de Pessoas",
			"Marketing",
			"Finanças Corporativas")),
		Map.entry("Direito", List.of(
			"Direito Civil",
			"Direito Penal",
			"Direito Constitucional",
			"Direito do Trabalho",
			"Ética Jurídica")),
		Map.entry("Medicina", List.of(
			"Anatomia Humana",
			"Fisiologia",
			"Farmacologia",
			"Patologia Geral",
			"Clínica Médica")),
		Map.entry("Psicologia", List.of(
			"Psicologia Geral",
			"Desenvolvimento Humano",
			"Psicopatologia",
			"Neurociência",
			"Psicologia Social")),
		Map.entry("Engenharia Civil", List.of(
			"Resistência dos Materiais",
			"Estruturas de Concreto",
			"Hidráulica",
			"Topografia",
			"Geotecnia")),
		Map.entry("Arquitetura e Urbanismo", List.of(
			"Desenho Arquitetônico",
			"História da Arquitetura",
			"Urbanismo",
			"Paisagismo",
			"Conforto Ambiental")));

	private static final List<String> MATERIAS_PADRAO = List.of(
		"Introdução ao Curso",
		"Metodologia Científica",
		"Comunicação e Expressão",
		"Ética Profissional",
		"Trabalho de Conclusão");

	private final CursoRepository cursoRepository;
	private final MateriaRepository materiaRepository;

	@Override
	public void run(ApplicationArguments args) {
		for (Curso curso : cursoRepository.findAll()) {
			if (materiaRepository.countByCursoId(curso.getId()) > 0) {
				continue;
			}
			List<String> nomes = MATERIAS_POR_CURSO.getOrDefault(curso.getNome(), MATERIAS_PADRAO);
			for (String nome : nomes) {
				Materia materia = new Materia();
				materia.setNome(nome);
				materia.setCurso(curso);
				materiaRepository.save(materia);
			}
		}
	}
}
