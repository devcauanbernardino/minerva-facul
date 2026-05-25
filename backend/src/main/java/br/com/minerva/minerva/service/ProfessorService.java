package br.com.minerva.minerva.service;

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
public class ProfessorService {
    private final ProfessorRepository professorRepository;
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

    @Transactional
    public void excluir(Long id) {
        professorRepository.delete(buscarEntidade(id));
    }

    private Professor buscarEntidade(Long id) {
        return professorRepository.findById(id)
            .orElseThrow(() -> new RecursoNaoEncontradoException("Professor não encontrado com id: " + id));
    }

    private ProfessorResponse paraResponse(Professor p) {
        return new ProfessorResponse(p.getId(), p.getNome(), p.getEmail(), p.getEspecialidade());
    }
}