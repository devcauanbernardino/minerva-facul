package br.com.minerva.minerva.service;

import java.time.format.DateTimeFormatter;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import br.com.minerva.minerva.dto.MatriculaRequest;
import br.com.minerva.minerva.dto.MatriculaResponse;
import br.com.minerva.minerva.dto.NotasRequest;
import br.com.minerva.minerva.exception.RecursoNaoEncontradoException;
import br.com.minerva.minerva.model.Aluno;
import br.com.minerva.minerva.model.Materia;
import br.com.minerva.minerva.model.Matricula;
import br.com.minerva.minerva.model.Usuario;
import br.com.minerva.minerva.repository.AlunoRepository;
import br.com.minerva.minerva.repository.MateriaRepository;
import br.com.minerva.minerva.repository.MatriculaRepository;
import br.com.minerva.minerva.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MatriculaService {

    private final AlunoRepository alunoRepository;
    private final MateriaRepository materiaRepository;
    private final MatriculaRepository matriculaRepository;
    private final UsuarioRepository usuarioRepository;

    private static final double NOTA_MINIMA_APROVACAO = 6.0;
    private static final double FREQUENCIA_MINIMA_APROVACAO = 75.0;

    @Transactional(readOnly = true)
    public List<MatriculaResponse> listarTodas() {
        return matriculaRepository.findAll().stream().map(this::paraResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<MatriculaResponse> listarPorAluno(Long alunoId) {
        return matriculaRepository.findByAlunoId(alunoId).stream().map(this::paraResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<MatriculaResponse> listarPorMateria(Long materiaId) {
        return matriculaRepository.findByMateriaId(materiaId).stream().map(this::paraResponse).toList();
    }

    @Transactional(readOnly = true)
    public MatriculaResponse buscarPorId(Long id) {
        return paraResponse(buscarEntidade(id));
    }

    @Transactional
    public MatriculaResponse criar(MatriculaRequest request) {
        Aluno aluno = alunoRepository.findById(request.getAlunoId())
                .orElseThrow(() -> new RecursoNaoEncontradoException("Aluno não encontrado com id: " + request.getAlunoId()));
        Materia materia = materiaRepository.findById(request.getMateriaId())
                .orElseThrow(() -> new RecursoNaoEncontradoException("Materia não encontrada com id: " + request.getMateriaId()));

        if (matriculaRepository.findByAlunoIdAndMateriaId(aluno.getId(), materia.getId()).isPresent()) {
            throw new IllegalStateException("Aluno já está matriculado nessa disciplina.");
        }

        List<String> prerequisitosPendentes = materia.getPrerequisitos().stream()
                .filter(pre -> !concluiuMateria(aluno.getId(), pre.getId()))
                .map(Materia::getNome)
                .toList();
        if (!prerequisitosPendentes.isEmpty()) {
            throw new IllegalStateException(
                    "Aluno não cumpriu os pré-requisitos: " + String.join(", ", prerequisitosPendentes));
        }

        Matricula matricula = new Matricula();
        matricula.setAluno(aluno);
        matricula.setMateria(materia);
        matricula.setSituacao("ATIVA");
        return paraResponse(matriculaRepository.save(matricula));
    }

    @Transactional
    public MatriculaResponse lancarNotas(Long id, NotasRequest request) {
        Matricula matricula = buscarEntidade(id);
        matricula.setNota(request.getNota());
        matricula.setFrequencia(request.getFrequencia());
        matricula.setSituacao(calcularSituacaoFinal(matricula));
        return paraResponse(matriculaRepository.save(matricula));
    }

    @Transactional
    public MatriculaResponse atualizarSituacao(Long id, String novaSituacao) {
        Matricula matricula = buscarEntidade(id);
        matricula.setSituacao(novaSituacao);
        return paraResponse(matriculaRepository.save(matricula));
    }

    @Transactional
    public void excluir(Long id) {
        matriculaRepository.delete(buscarEntidade(id));
    }

    private Matricula buscarEntidade(Long id) {
        return matriculaRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Matricula não encontrada com id: " + id));
    }

    private MatriculaResponse paraResponse(Matricula matricula) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
        String alunoMatricula = usuarioRepository.findByEmail(matricula.getAluno().getEmail())
                .map(Usuario::getMatricula)
                .orElse(null);
        return new MatriculaResponse(
                matricula.getId(),
                matricula.getAluno().getId(),
                matricula.getAluno().getNome(),
                alunoMatricula,
                matricula.getMateria().getId(),
                matricula.getMateria().getNome(),
                matricula.getMateria().getCurso().getNome(),
                matricula.getDataCriacao().format(formatter),
                normalizarSituacao(matricula.getSituacao()),
                matricula.getNota(),
                matricula.getFrequencia());
    }

    private boolean concluiuMateria(Long alunoId, Long materiaId) {
        return matriculaRepository.findByAlunoIdAndMateriaId(alunoId, materiaId)
                .map(m -> {
                    String situacao = normalizarSituacao(m.getSituacao());
                    return situacao.equals("CONCLUIDA") || situacao.equals("APROVADO");
                })
                .orElse(false);
    }

    private String normalizarSituacao(String situacao) {
        return situacao == null ? "ATIVA" : situacao.trim().toUpperCase();
    }

    private String calcularSituacaoFinal(Matricula matricula){
        if (matricula.getNota() == null || matricula.getFrequencia() == null){
            return matricula.getSituacao();
        }
        boolean aprovado = matricula.getNota() >= NOTA_MINIMA_APROVACAO && matricula.getFrequencia() >= FREQUENCIA_MINIMA_APROVACAO;
            return aprovado ? "APROVADO" : "REPROVADO";
    }
}
