package br.com.minerva.minerva.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import br.com.minerva.minerva.model.Aluno;

public interface AlunoRepository extends JpaRepository<Aluno, Long> {
    boolean existsByEmail(String email);
}