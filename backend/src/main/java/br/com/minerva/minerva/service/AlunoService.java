package br.com.minerva.minerva.service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
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
    private final AlunoRepository alunoRepository;
    private final CursoRepository cursoRepository;
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