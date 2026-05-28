package br.com.minerva.minerva.model;

import jakarta.persistence.*;
import lombok.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "materias")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Materia {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nome;

    @ManyToOne
    @JoinColumn(name = "curso_id", nullable = false)
    private Curso curso;

    @ManyToMany(mappedBy = "materias")
    private List<Professor> professores = new ArrayList<>();

    @OneToMany(mappedBy = "materia")
    private List<Matricula> matriculas = new ArrayList<>();
}