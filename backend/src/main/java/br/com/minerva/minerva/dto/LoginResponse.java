package br.com.minerva.minerva.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponse {

	private Long id;
	private String nome;
	private String email;
	private String tipo; // "ALUNO" ou "PROFESSOR"
}