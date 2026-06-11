package br.com.minerva.minerva.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MatriculaResponse {

	private Long id;
	private String alunoNome;
	private Long materiaId;
	private String materiaNome;
	private String cursoNome;
	private String dataCriacao;
	private String situacao;
	private Double nota;
	private Double frequencia;
}
