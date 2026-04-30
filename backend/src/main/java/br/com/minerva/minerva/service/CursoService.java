package br.com.minerva.minerva.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.minerva.minerva.dto.CursoRequest;
import br.com.minerva.minerva.dto.CursoResponse;
import br.com.minerva.minerva.exception.RecursoNaoEncontradoException;
import br.com.minerva.minerva.model.Curso;
import br.com.minerva.minerva.repository.CursoRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CursoService {

	private final CursoRepository cursoRepository;

	@Transactional(readOnly = true)
	public List<CursoResponse> listarTodos() {
		return cursoRepository.findAll().stream().map(this::paraResponse).toList();
	}

	@Transactional(readOnly = true)
	public CursoResponse buscarPorId(Long id) {
		return paraResponse(buscarEntidade(id));
	}

	@Transactional
	public CursoResponse criar(CursoRequest request) {
		Curso curso = new Curso();
		aplicar(request, curso);
		return paraResponse(cursoRepository.save(curso));
	}

	@Transactional
	public CursoResponse atualizar(Long id, CursoRequest request) {
		Curso curso = buscarEntidade(id);
		aplicar(request, curso);
		return paraResponse(cursoRepository.save(curso));
	}

	@Transactional
	public void excluir(Long id) {
		Curso curso = buscarEntidade(id);
		cursoRepository.delete(curso);
	}

	private Curso buscarEntidade(Long id) {
		return cursoRepository.findById(id)
			.orElseThrow(() -> new RecursoNaoEncontradoException("Curso não encontrado com id: " + id));
	}

	private void aplicar(CursoRequest request, Curso curso) {
		curso.setNome(request.getNome());
		curso.setCargaHoraria(request.getCargaHoraria());
		curso.setDuracaoSemestres(request.getDuracaoSemestres());
	}

	private CursoResponse paraResponse(Curso curso) {
		return new CursoResponse(curso.getId(), curso.getNome(), curso.getCargaHoraria(), curso.getDuracaoSemestres());
	}
}
