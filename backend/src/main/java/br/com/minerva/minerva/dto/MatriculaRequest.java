package br.com.minerva.minerva.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MatriculaRequest {

	@NotNull(message = "O ID do aluno é obrigatório")
	private Long alunoId;

	@NotNull(message = "O ID da matéria é obrigatório")
	private Long materiaId;
}
