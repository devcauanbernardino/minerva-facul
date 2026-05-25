package br.com.minerva.minerva.dto;

import jakarta.validation.constraints.*;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AlunoRequest {
    @NotBlank(message = "O nome do aluno é obrigatório")
    private String nome;

    @NotBlank(message = "O e-mail é obrigatório")
    @Email(message = "E-mail inválido")
    private String email;

    @NotBlank(message = "A senha é obrigatória")
    private String senha;

    @NotNull(message = "O curso é obrigatório")
    private Long cursoId;

    @NotNull(message = "O campo bolsa é obrigatório")
    private Boolean bolsa;
}