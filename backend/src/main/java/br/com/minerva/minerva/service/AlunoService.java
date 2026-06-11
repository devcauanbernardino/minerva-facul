package br.com.minerva.minerva.service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import br.com.minerva.minerva.dto.*;
import br.com.minerva.minerva.exception.*;
import br.com.minerva.minerva.model.*;
import br.com.minerva.minerva.repository.*;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AlunoService {

    private static final Set<String> SITUACOES_HISTORICO = Set.of("CONCLUIDA", "REPROVADA", "TRANCADA");

    private final AlunoRepository alunoRepository;
    private final UsuarioRepository usuarioRepository;
    private final CursoRepository cursoRepository;
    private final MateriaRepository materiaRepository;
    private final MatriculaRepository matriculaRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public List<AlunoResponse> listarTodos() {
        return alunoRepository.findAll().stream().map(this::paraResponse).toList();
    }

    @Transactional(readOnly = true)
    public AlunoResponse buscarPorId(Long id) {
        return paraResponse(buscarEntidade(id));
    }

    @Transactional
    public AlunoResponse criar(AlunoRequest request) {
        if (alunoRepository.existsByEmail(request.getEmail())) {
            throw new EmailJaCadastradoException("Este e-mail já está cadastrado para um aluno.");
        }
        Curso curso = cursoRepository.findById(request.getCursoId())
            .orElseThrow(() -> new RecursoNaoEncontradoException("Curso não encontrado com id: " + request.getCursoId()));
        Aluno aluno = new Aluno();
        aluno.setNome(request.getNome());
        aluno.setEmail(request.getEmail());
        aluno.setSenha(passwordEncoder.encode(request.getSenha()));
        aluno.setBolsa(request.getBolsa());
        aluno.setCurso(curso);
        aluno.setMatricula(LocalDateTime.now());
        return paraResponse(alunoRepository.save(aluno));
    }

    @Transactional
    public AlunoResponse atualizar(Long id, AlunoRequest request) {
        Aluno aluno = buscarEntidade(id);
        if (!aluno.getEmail().equals(request.getEmail()) && alunoRepository.existsByEmail(request.getEmail())) {
            throw new EmailJaCadastradoException("Este e-mail já está cadastrado para outro aluno.");
        }
        Curso curso = cursoRepository.findById(request.getCursoId())
            .orElseThrow(() -> new RecursoNaoEncontradoException("Curso não encontrado com id: " + request.getCursoId()));
        aluno.setNome(request.getNome());
        aluno.setEmail(request.getEmail());
        aluno.setSenha(passwordEncoder.encode(request.getSenha()));
        aluno.setBolsa(request.getBolsa());
        aluno.setCurso(curso);
        return paraResponse(alunoRepository.save(aluno));
    }

    @Transactional
    public void excluir(Long id) {
        alunoRepository.delete(buscarEntidade(id));
    }

    @Transactional
    public Aluno garantirAlunoDeUsuario(Usuario usuario) {
        return alunoRepository.findByEmail(usuario.getEmail())
            .orElseGet(() -> criarAlunoDeUsuario(usuario));
    }

    @Transactional
    public BoletimResponse obterBoletimPorEmail(String email) {
        Aluno aluno = buscarOuSincronizarPorEmail(email);
        List<Matricula> matriculas = matriculaRepository.findByAlunoId(aluno.getId());
        Map<Long, Matricula> matriculaPorMateria = new HashMap<>();
        for (Matricula matricula : matriculas) {
            matriculaPorMateria.put(matricula.getMateria().getId(), matricula);
        }

        List<DisciplinaAcademicaResponse> disciplinas = materiaRepository
            .findByCursoIdOrderByNomeAsc(aluno.getCurso().getId())
            .stream()
            .map(materia -> {
                Matricula matricula = matriculaPorMateria.get(materia.getId());
                if (matricula == null) {
                    return new DisciplinaAcademicaResponse(
                        materia.getId(), materia.getNome(), "DISPONIVEL", null, null);
                }
                if (SITUACOES_HISTORICO.contains(normalizarSituacao(matricula.getSituacao()))) {
                    return null;
                }
                return new DisciplinaAcademicaResponse(
                    materia.getId(),
                    materia.getNome(),
                    normalizarSituacao(matricula.getSituacao()),
                    matricula.getNota(),
                    matricula.getFrequencia());
            })
            .filter(item -> item != null)
            .toList();

        return montarResumoAcademico(aluno, disciplinas, BoletimResponse.class);
    }

    @Transactional
    public HistoricoResponse obterHistoricoPorEmail(String email) {
        Aluno aluno = buscarOuSincronizarPorEmail(email);
        List<DisciplinaAcademicaResponse> disciplinas = matriculaRepository.findByAlunoId(aluno.getId())
            .stream()
            .filter(matricula -> SITUACOES_HISTORICO.contains(normalizarSituacao(matricula.getSituacao())))
            .map(matricula -> new DisciplinaAcademicaResponse(
                matricula.getMateria().getId(),
                matricula.getMateria().getNome(),
                normalizarSituacao(matricula.getSituacao()),
                matricula.getNota(),
                matricula.getFrequencia()))
            .toList();

        return montarResumoAcademico(aluno, disciplinas, HistoricoResponse.class);
    }

    private Aluno criarAlunoDeUsuario(Usuario usuario) {
        Curso curso = cursoRepository.findByNome(usuario.getCurso())
            .orElseThrow(() -> new RecursoNaoEncontradoException(
                "Curso não encontrado para o aluno: " + usuario.getCurso()));

        Aluno aluno = new Aluno();
        aluno.setNome(usuario.getNome());
        aluno.setEmail(usuario.getEmail());
        aluno.setSenha(usuario.getSenha());
        aluno.setBolsa(usuario.getBolsista() != null ? usuario.getBolsista() : false);
        aluno.setCurso(curso);
        aluno.setMatricula(LocalDateTime.now());
        return alunoRepository.save(aluno);
    }

    private Aluno buscarOuSincronizarPorEmail(String email) {
        return alunoRepository.findByEmail(email)
            .orElseGet(() -> usuarioRepository.findByEmail(email)
                .filter(usuario -> "ALUNO".equals(normalizarTipoUsuario(usuario)))
                .map(this::garantirAlunoDeUsuario)
                .orElseThrow(() -> new RecursoNaoEncontradoException(
                    "Registro acadêmico não encontrado para o e-mail: " + email)));
    }

    private String normalizarTipoUsuario(Usuario usuario) {
        String tipo = usuario.getTipo();
        if (tipo != null && !tipo.isBlank()) {
            return tipo.trim().toUpperCase();
        }
        if (usuario.getEspecialidade() != null && !usuario.getEspecialidade().isBlank()) {
            return "PROFESSOR";
        }
        return "ALUNO";
    }

    private String normalizarSituacao(String situacao) {
        return situacao == null ? "ATIVA" : situacao.trim().toUpperCase();
    }

    private <T> T montarResumoAcademico(Aluno aluno, List<DisciplinaAcademicaResponse> disciplinas, Class<T> tipo) {
        if (tipo == BoletimResponse.class) {
            return tipo.cast(new BoletimResponse(
                aluno.getNome(),
                aluno.getEmail(),
                aluno.getCurso().getNome(),
                aluno.getBolsa(),
                disciplinas));
        }
        return tipo.cast(new HistoricoResponse(
            aluno.getNome(),
            aluno.getEmail(),
            aluno.getCurso().getNome(),
            aluno.getBolsa(),
            disciplinas));
    }

    private Aluno buscarEntidade(Long id) {
        return alunoRepository.findById(id)
            .orElseThrow(() -> new RecursoNaoEncontradoException("Aluno não encontrado com id: " + id));
    }

    private AlunoResponse paraResponse(Aluno aluno) {
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
        String matriculaFormatada = aluno.getMatricula().format(fmt);
        Curso c = aluno.getCurso();
        CursoResponse cursoResp = new CursoResponse(c.getId(), c.getNome(), c.getCargaHoraria(), c.getDuracaoSemestres());
        return new AlunoResponse(aluno.getId(), matriculaFormatada, cursoResp, aluno.getNome(), aluno.getEmail(), aluno.getBolsa());
    }
}