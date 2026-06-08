package br.com.minerva.minerva.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import br.com.minerva.minerva.model.Materia;

@Repository
public interface MateriaRepository extends JpaRepository<Materia, Long> {

	long countByCursoId(Long cursoId);

	java.util.List<Materia> findByCursoIdOrderByNomeAsc(Long cursoId);
}
