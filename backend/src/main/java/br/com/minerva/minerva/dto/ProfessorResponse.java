package br.com.minerva.minerva.dto;

import java.util.List;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProfessorResponse {
    private Long id;
    private String nome;
    private String email;
    private String especialidade;
    private List<Long> materiaIds;
}