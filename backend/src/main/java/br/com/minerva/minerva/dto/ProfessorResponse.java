package br.com.minerva.minerva.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProfessorResponse {
    private Long id;
    private String nome;
    private String email;
    private String especialidade;
}