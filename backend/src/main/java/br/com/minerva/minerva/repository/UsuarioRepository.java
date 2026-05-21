package br.com.minerva.minerva.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import br.com.minerva.minerva.model.Usuario;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    boolean existsByEmail(String email);
}