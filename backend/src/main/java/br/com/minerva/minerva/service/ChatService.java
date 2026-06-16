package br.com.minerva.minerva.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import br.com.minerva.minerva.dto.ChatRequest;
import br.com.minerva.minerva.dto.ChatResponse;

@Service
public class ChatService {

    @Value("${groq.api.key:}")
    private String apiKey;

    private final RestClient restClient = RestClient.create();
    private final ObjectMapper mapper = new ObjectMapper();

    public ChatResponse enviarMensagem(ChatRequest request) {
        if (apiKey == null || apiKey.isBlank()) {
            return new ChatResponse("⚠️ Chave da API não configurada. Adicione `groq.api.key` no application.properties.");
        }

        String systemPrompt = buildSystemPrompt(request.tipoPerfil(), request.nomeUsuario());

        List<Map<String, String>> messages = new ArrayList<>();
        messages.add(Map.of("role", "system", "content", systemPrompt));
        request.messages().forEach(m -> messages.add(Map.of("role", m.role(), "content", m.content())));

        Map<String, Object> body = Map.of(
                "model", "llama-3.3-70b-versatile",
                "max_tokens", 1024,
                "messages", messages
        );

        try {
            String responseJson = restClient.post()
                    .uri("https://api.groq.com/openai/v1/chat/completions")
                    .header("Authorization", "Bearer " + apiKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(body)
                    .retrieve()
                    .body(String.class);

            JsonNode root = mapper.readTree(responseJson);
            String texto = root.path("choices").get(0).path("message").path("content").asText();
            return new ChatResponse(texto);
        } catch (Exception e) {
            return new ChatResponse("Erro ao contactar a IA: " + e.getMessage());
        }
    }

    private String buildSystemPrompt(String tipoPerfil, String nomeUsuario) {
        String nome = nomeUsuario != null ? nomeUsuario : "usuário";
        String base = """
                Você é o Minerva, o mascote e assistente virtual do sistema acadêmico Minerva.
                Você é simpático, direto e prestativo. Responda sempre em português brasileiro.
                Nunca invente informações — se não souber algo específico do sistema, oriente o usuário a entrar em contato com a secretaria.
                Seja conciso: respostas curtas são preferidas, a menos que o usuário peça mais detalhes.
                O nome do usuário é: %s.
                """.formatted(nome);

        String contexto = switch (tipoPerfil != null ? tipoPerfil.toUpperCase() : "") {
            case "ALUNO" -> """
                    Este usuário é um ALUNO. Você pode ajudá-lo com:
                    - Como ver seu boletim e histórico acadêmico
                    - Como funciona o sistema de notas e frequência (mínimo 6.0 e 75%% para aprovação)
                    - Dúvidas sobre boletos e financeiro
                    - Navegação geral no sistema Minerva
                    """;
            case "PROFESSOR" -> """
                    Este usuário é um PROFESSOR. Você pode ajudá-lo com:
                    - Como lançar notas e frequência para suas turmas
                    - Como funciona o sistema de avaliação
                    - Dúvidas sobre as disciplinas vinculadas ao seu perfil
                    - Navegação geral no sistema Minerva
                    """;
            case "SECRETARIA" -> """
                    Este usuário é da SECRETARIA. Você pode ajudá-lo com:
                    - Cadastro e gestão de alunos, professores, cursos e matérias
                    - Gestão de matrículas e situações acadêmicas
                    - Emissão e controle de boletos
                    - Navegação e funcionalidades administrativas do sistema Minerva
                    """;
            default -> "Este usuário está acessando o sistema Minerva.";
        };

        return base + contexto;
    }
}
