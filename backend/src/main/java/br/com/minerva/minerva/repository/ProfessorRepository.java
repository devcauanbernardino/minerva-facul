package br.com.minerva.minerva.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import br.com.minerva.minerva.model.Professor;

public interface ProfessorRepository extends JpaRepository<Professor, Long> {
    boolean existsByEmail(String email);
}