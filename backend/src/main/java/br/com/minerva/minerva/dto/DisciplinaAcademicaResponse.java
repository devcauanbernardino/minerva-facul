package br.com.minerva.minerva.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DisciplinaAcademicaResponse {
	private Long materiaId;
	private String materiaNome;
	private String situacao;
	private Double nota;
	private Double frequencia;
}
