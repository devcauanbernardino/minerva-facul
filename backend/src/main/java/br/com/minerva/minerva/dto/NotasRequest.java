package br.com.minerva.minerva.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NotasRequest {

	@NotNull(message = "A nota é obrigatória")
	@DecimalMin(value = "0.0", message = "A nota mínima é 0")
	@DecimalMax(value = "10.0", message = "A nota máxima é 10")
	private Double nota;

	@NotNull(message = "A frequência é obrigatória")
	@DecimalMin(value = "0.0", message = "A frequência mínima é 0%")
	@DecimalMax(value = "100.0", message = "A frequência máxima é 100%")
	private Double frequencia;
}
