package br.com.minerva.minerva.repository;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import br.com.minerva.minerva.model.Aluno;

public interface AlunoRepository extends JpaRepository<Aluno, Long> {
    boolean existsByEmail(String email);

    Optional<Aluno> findByEmail(String email);
}