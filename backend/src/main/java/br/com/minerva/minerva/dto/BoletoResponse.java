package br.com.minerva.minerva.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BoletoResponse {
    private Long id;
    private Long alunoId;
    private String alunoNome;
    private BigDecimal valor;
    private LocalDate vencimento;
    private String status;
    private String referencia;
    private LocalDate dataPagamento;
}
