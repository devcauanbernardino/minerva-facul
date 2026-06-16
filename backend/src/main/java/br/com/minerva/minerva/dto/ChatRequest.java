package br.com.minerva.minerva.dto;

import java.util.List;

public record ChatRequest(List<ChatMessage> messages, String tipoPerfil, String nomeUsuario) {}
