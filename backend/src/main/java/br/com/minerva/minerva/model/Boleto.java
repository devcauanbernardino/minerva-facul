package br.com.minerva.minerva.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "boletos")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Boleto {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "aluno_id", nullable = false)
    private Aluno aluno;

    @Column(nullable = false)
    private BigDecimal valor;

    @Column(nullable = false)
    private LocalDate vencimento;

    @Column(nullable = false)
    private String status = "PENDENTE"; // PENDENTE, PAGO, ATRASADO

    private String referencia; // ex: "Mensalidade 03/2026"

    private LocalDate dataPagamento;
}
