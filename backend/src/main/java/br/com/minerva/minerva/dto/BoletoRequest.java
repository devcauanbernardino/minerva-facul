package br.com.minerva.minerva.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.DecimalMin;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BoletoRequest {

    @NotNull(message = "O ID do aluno é obrigatório")
    private Long alunoId;

    @NotNull(message = "O valor do boleto é obrigatório")
    @DecimalMin(value = "0.01", message = "O valor deve ser maior que zero")
    private BigDecimal valor;

    @NotNull(message = "A data de vencimento é obrigatória")
    private LocalDate vencimento;

    @NotBlank(message = "A referência do boleto é obrigatória")
    private String referencia;
}
