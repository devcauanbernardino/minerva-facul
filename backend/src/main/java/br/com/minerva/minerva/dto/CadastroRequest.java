package br.com.minerva.minerva.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CadastroRequest {

	@NotBlank(message = "O nome é obrigatório")
	private String nome;

	@NotBlank(message = "O e-mail é obrigatório")
	@Email(message = "E-mail inválido")
	private String email;

	@NotBlank(message = "A senha é obrigatória")
	@Size(min = 6, message = "A senha deve ter pelo menos 6 caracteres")
	private String senha;

	private String tipo;
	private String curso;
	private Boolean bolsista;
	private String especialidade;
}
