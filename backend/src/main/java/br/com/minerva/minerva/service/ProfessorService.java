package br.com.minerva.minerva.service;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
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
public class ProfessorService {
    private final ProfessorRepository professorRepository;
    private final MateriaRepository materiaRepository;
    private final MatriculaRepository matriculaRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public List<ProfessorResponse> listarTodos() {
        return professorRepository.findAll().stream().map(this::paraResponse).toList();
    }

    @Transactional(readOnly = true)
    public ProfessorResponse buscarPorId(Long id) {
        return paraResponse(buscarEntidade(id));
    }

    @Transactional
    public ProfessorResponse criar(ProfessorRequest request) {
        if (professorRepository.existsByEmail(request.getEmail())) {
            throw new EmailJaCadastradoException("Este e-mail já está cadastrado para um professor.");
        }
        Professor p = new Professor();
        p.setNome(request.getNome());
        p.setEmail(request.getEmail());
        p.setSenha(passwordEncoder.encode(request.getSenha()));
        p.setEspecialidade(request.getEspecialidade());
        return paraResponse(professorRepository.save(p));
    }

    @Transactional
    public ProfessorResponse atualizar(Long id, ProfessorRequest request) {
        Professor p = buscarEntidade(id);
        if (!p.getEmail().equals(request.getEmail()) && professorRepository.existsByEmail(request.getEmail())) {
            throw new EmailJaCadastradoException("Este e-mail já está cadastrado para outro professor.");
        }
        p.setNome(request.getNome());
        p.setEmail(request.getEmail());
        p.setSenha(passwordEncoder.encode(request.getSenha()));
        p.setEspecialidade(request.getEspecialidade());
        return paraResponse(professorRepository.save(p));
    }

    @Transactional(readOnly = true)
    public List<MatriculaResponse> listarMatriculasDasTurmas(String email) {
        Professor professor = professorRepository.findByEmail(email)
            .orElseThrow(() -> new RecursoNaoEncontradoException("Professor não encontrado para o e-mail: " + email));

        List<MatriculaResponse> resposta = new ArrayList<>();
        for (Materia materia : professor.getMaterias()) {
            List<Matricula> matriculas = matriculaRepository.findByMateriaId(materia.getId());
            for (Matricula matricula : matriculas) {
                resposta.add(paraResponse(matricula));
            }
        }
        return resposta;
    }

    @Transactional
    public ProfessorResponse vincularMaterias(Long id, ProfessorMateriaRequest request) {
        Professor professor = buscarEntidade(id);
        List<Materia> materias = materiaRepository.findAllById(request.getMateriaIds());
        if (materias.size() != request.getMateriaIds().size()) {
            throw new RecursoNaoEncontradoException("Uma ou mais matérias informadas não foram encontradas.");
        }
        professor.setMaterias(materias);
        return paraResponse(professorRepository.save(professor));
    }

    @Transactional
    public void excluir(Long id) {
        professorRepository.delete(buscarEntidade(id));
    }

    @Transactional
    public Professor garantirProfessorDeUsuario(Usuario usuario) {
        return professorRepository.findByEmail(usuario.getEmail())
            .orElseGet(() -> {
                Professor professor = new Professor();
                professor.setNome(usuario.getNome());
                professor.setEmail(usuario.getEmail());
                professor.setSenha(usuario.getSenha());
                professor.setEspecialidade(usuario.getEspecialidade());
                return professorRepository.save(professor);
            });
    }

    private Professor buscarEntidade(Long id) {
        return professorRepository.findById(id)
            .orElseThrow(() -> new RecursoNaoEncontradoException("Professor não encontrado com id: " + id));
    }

    private MatriculaResponse paraResponse(Matricula matricula) {
        return new MatriculaResponse(
            matricula.getId(),
            matricula.getAluno().getNome(),
            matricula.getMateria().getId(),
            matricula.getMateria().getNome(),
            matricula.getMateria().getCurso().getNome(),
            matricula.getDataCriacao().format(java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy")),
            matricula.getSituacao(),
            matricula.getNota(),
            matricula.getFrequencia());
    }

    private ProfessorResponse paraResponse(Professor p) {
        List<Long> materiaIds = p.getMaterias().stream().map(Materia::getId).toList();
        return new ProfessorResponse(p.getId(), p.getNome(), p.getEmail(), p.getEspecialidade(), materiaIds);
    }
}
