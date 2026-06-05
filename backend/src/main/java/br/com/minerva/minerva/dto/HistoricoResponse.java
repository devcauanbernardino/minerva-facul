package br.com.minerva.minerva.dto;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class HistoricoResponse {
	private String nome;
	private String email;
	private String cursoNome;
	private Boolean bolsa;
	private List<DisciplinaAcademicaResponse> disciplinas;
}
