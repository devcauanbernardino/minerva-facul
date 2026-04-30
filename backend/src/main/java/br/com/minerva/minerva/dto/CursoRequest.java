package br.com.minerva.minerva.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CursoRequest {

	@NotBlank(message = "O nome do curso é obrigatório")
	private String nome;

	@NotNull(message = "A carga horária é obrigatória")
	@Positive(message = "A carga horária deve ser positiva")
	private Integer cargaHoraria;

	@NotNull(message = "A duração em semestres é obrigatória")
	@Positive(message = "A duração em semestres deve ser positiva")
	private Integer duracaoSemestres;
}
