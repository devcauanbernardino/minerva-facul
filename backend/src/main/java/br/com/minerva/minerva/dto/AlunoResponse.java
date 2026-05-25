package br.com.minerva.minerva.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AlunoResponse {
    private Long id;
    private String matricula; // string formatada
    private CursoResponse curso;
    private String nome;
    private String email;
    private Boolean bolsa;
}