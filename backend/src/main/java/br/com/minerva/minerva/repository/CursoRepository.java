package br.com.minerva.minerva.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import br.com.minerva.minerva.model.Curso;

public interface CursoRepository extends JpaRepository<Curso, Long> {
}
