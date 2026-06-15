package br.com.minerva.minerva.repository;

import br.com.minerva.minerva.model.Boleto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface BoletoRepository extends JpaRepository<Boleto, Long> {
    List<Boleto> findByAlunoId(Long alunoId);
}
