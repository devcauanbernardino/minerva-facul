package br.com.minerva.minerva;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Info;

@SpringBootApplication
@OpenAPIDefinition(
	info = @Info(
		title = "Minerva — Gestão Acadêmica",
		version = "0.0.1",
		description = "API REST — controle de alunos, disciplinas e notas"
	)
)
public class MinervaApplication {

	public static void main(String[] args) {
		SpringApplication.run(MinervaApplication.class, args);
	}

}
