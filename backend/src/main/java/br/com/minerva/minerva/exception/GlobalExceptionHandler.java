package br.com.minerva.minerva.exception;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

	@ExceptionHandler(RecursoNaoEncontradoException.class)
	public ResponseEntity<ErroResponse> recursoNaoEncontrado(RecursoNaoEncontradoException ex) {
		ErroResponse body = ErroResponse.builder()
			.timestamp(Instant.now())
			.status(HttpStatus.NOT_FOUND.value())
			.erro("Não encontrado")
			.mensagem(ex.getMessage())
			.build();
		return ResponseEntity.status(HttpStatus.NOT_FOUND).body(body);
	}

	@ExceptionHandler(MethodArgumentNotValidException.class)
	public ResponseEntity<ErroResponse> validacao(MethodArgumentNotValidException ex) {
		var errosPorCampo = ex.getBindingResult()
			.getFieldErrors()
			.stream()
			.collect(Collectors.groupingBy(FieldError::getField,
					Collectors.mapping(FieldError::getDefaultMessage, Collectors.toList())));
		ErroResponse body = ErroResponse.builder()
			.timestamp(Instant.now())
			.status(HttpStatus.BAD_REQUEST.value())
			.erro("Dados inválidos")
			.mensagem("Corrija os campos indicados abaixo.")
			.errosValidacao(errosPorCampo)
			.build();
		return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
	}
}
