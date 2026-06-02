package br.com.minerva.minerva.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MateriaRequest {
    @NotBlank(message = "O nome da matéria é obrigatório")
    private String nome;

    @NotNull(message = "O ID do curso é obrigatório")
    private Long cursoId;
}

