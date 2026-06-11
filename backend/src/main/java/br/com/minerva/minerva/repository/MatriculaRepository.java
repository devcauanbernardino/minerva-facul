package br.com.minerva.minerva.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import br.com.minerva.minerva.model.Matricula;

@Repository
public interface MatriculaRepository extends JpaRepository<Matricula, Long> {

	List<Matricula> findByAlunoId(Long alunoId);
	
	List<Matricula> findByMateriaId(Long materiaId);
	
	Optional<Matricula> findByAlunoIdAndMateriaId(long alunoId, Long materiaId);

	boolean existsByAlunoIdAndMateriaId(Long alunoId, Long materiaId);
}
