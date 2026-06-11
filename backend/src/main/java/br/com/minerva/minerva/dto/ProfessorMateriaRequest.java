package br.com.minerva.minerva.dto;

import java.util.List;

import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProfessorMateriaRequest {

	@NotEmpty(message = "Informe ao menos uma matéria")
	private List<Long> materiaIds;
}
