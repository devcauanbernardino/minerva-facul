package br.com.minerva.minerva.repository;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

import br.com.minerva.minerva.model.Curso;

public interface CursoRepository extends JpaRepository<Curso, Long> {

	Optional<Curso> findByNome(String nome);
}
