package br.com.minerva.minerva.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginRequest {

	@NotBlank(message = "A matrícula é obrigatória")
	private String matricula;

	@NotBlank(message = "A senha é obrigatória")
	private String senha;
}
