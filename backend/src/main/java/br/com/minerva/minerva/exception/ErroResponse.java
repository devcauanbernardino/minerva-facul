package br.com.minerva.minerva.exception;

import java.time.Instant;
import java.util.List;
import java.util.Map;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ErroResponse {

	private Instant timestamp;
	private int status;
	private String erro;
	private String mensagem;
	private Map<String, List<String>> errosValidacao;
}
