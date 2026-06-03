package br.com.minerva.minerva.service;

import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import br.com.minerva.minerva.dto.MateriaRequest;
import br.com.minerva.minerva.dto.MateriaResponse;
import br.com.minerva.minerva.exception.RecursoNaoEncontradoException;
import br.com.minerva.minerva.model.Curso;
import br.com.minerva.minerva.model.Materia;
import br.com.minerva.minerva.repository.CursoRepository;
import br.com.minerva.minerva.repository.MateriaRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MateriaService {

	private final MateriaRepository materiaRepository;
	private final CursoRepository cursoRepository;

	@Transactional(readOnly = true)
	public List<MateriaResponse> listarTodas() {
		return materiaRepository.findAll().stream().map(this::paraResponse).toList();
	}

	@Transactional(readOnly = true)
	public MateriaResponse buscarPorId(Long id) {
		return paraResponse(buscarEntidade(id));
	}

	@Transactional
	public MateriaResponse criar(MateriaRequest request) {
		Curso curso = cursoRepository.findById(request.getCursoId())
			.orElseThrow(() -> new RecursoNaoEncontradoException("Curso não encontrado com id: " + request.getCursoId()));

		Materia m = new Materia();
		m.setNome(request.getNome());
		m.setCurso(curso);

		return paraResponse(materiaRepository.save(m));
	}

	@Transactional
	public MateriaResponse atualizar(Long id, MateriaRequest request) {
		Materia m = buscarEntidade(id);
		Curso curso = cursoRepository.findById(request.getCursoId())
			.orElseThrow(() -> new RecursoNaoEncontradoException("Curso não encontrado com id: " + request.getCursoId()));

		m.setNome(request.getNome());
		m.setCurso(curso);

		return paraResponse(materiaRepository.save(m));
	}

	@Transactional
	public void excluir(Long id) {
		materiaRepository.delete(buscarEntidade(id));
	}

	private Materia buscarEntidade(Long id) {
		return materiaRepository.findById(id)
			.orElseThrow(() -> new RecursoNaoEncontradoException("Matéria não encontrada com id: " + id));
	}

	private MateriaResponse paraResponse(Materia m) {
		return new MateriaResponse(m.getId(), m.getNome(), m.getCurso().getId(), m.getCurso().getNome());
	}
}
