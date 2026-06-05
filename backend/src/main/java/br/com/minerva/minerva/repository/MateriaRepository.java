package br.com.minerva.minerva.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import br.com.minerva.minerva.model.Materia;

public interface MateriaRepository extends JpaRepository<Materia, Long> {
}
