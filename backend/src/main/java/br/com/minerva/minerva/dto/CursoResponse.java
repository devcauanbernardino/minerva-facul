package br.com.minerva.minerva.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CursoResponse {

	private Long id;
	private String nome;
	private Integer cargaHoraria;
	private Integer duracaoSemestres;
}
