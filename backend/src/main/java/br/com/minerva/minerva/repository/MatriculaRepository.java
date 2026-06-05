package br.com.minerva.minerva.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import br.com.minerva.minerva.model.Matricula;

@Repository
public interface MatriculaRepository extends JpaRepository<Matricula, Long> {

	java.util.List<Matricula> findByAlunoId(Long alunoId);
}
