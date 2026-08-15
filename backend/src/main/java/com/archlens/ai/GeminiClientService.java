package com.archlens.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.*;

@Service
public class GeminiClientService {

    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;

    // Ordered list of prioritized models to attempt
    private static final List<String> CANDIDATE_MODELS = List.of(
            "gemini-2.0-flash",
            "gemini-1.5-flash-latest",
            "gemini-1.5-flash",
            "gemini-2.5-flash",
            "gemini-2.0-flash-exp",
            "gemini-1.5-pro-latest",
            "gemini-1.5-pro",
            "gemini-1.5-flash-8b"
    );

    public GeminiClientService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
        this.httpClient = HttpClient.newBuilder()
                .followRedirects(HttpClient.Redirect.ALWAYS)
                .connectTimeout(Duration.ofSeconds(25))
                .build();
    }

    public Map<String, Object> validateKeyDetailed(String apiKey) {
        if (apiKey == null || apiKey.trim().isEmpty()) {
            return Map.of("valid", false, "error", "API key cannot be empty.");
        }

        String cleanKey = apiKey.trim().replaceAll("^\"|\"$", "").replaceAll("^'|'$", "");

        try {
            String url = "https://generativelanguage.googleapis.com/v1beta/models?key=" + cleanKey;
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .GET()
                    .header("User-Agent", "ArchLens-AI-Engine/1.0")
                    .timeout(Duration.ofSeconds(12))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() == 200) {
                return Map.of("valid", true, "message", "API Key verified with Google AI Studio!");
            }

            try {
                JsonNode errNode = objectMapper.readTree(response.body());
                String errMsg = errNode.path("error").path("message").asText();
                if (!errMsg.isEmpty()) {
                    return Map.of("valid", false, "error", errMsg);
                }
            } catch (Exception ignored) {}

            return Map.of("valid", false, "error", "Google returned HTTP status " + response.statusCode());
        } catch (Exception e) {
            return Map.of("valid", false, "error", "Connection error: " + e.getMessage());
        }
    }

    public boolean validateKey(String apiKey) {
        Map<String, Object> result = validateKeyDetailed(apiKey);
        return Boolean.TRUE.equals(result.get("valid"));
    }

    /**
     * Discovers all model names available for this key that support generateContent
     */
    public List<String> listSupportedModels(String cleanKey) {
        List<String> models = new ArrayList<>();
        try {
            String url = "https://generativelanguage.googleapis.com/v1beta/models?key=" + cleanKey;
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .GET()
                    .header("User-Agent", "ArchLens-AI-Engine/1.0")
                    .timeout(Duration.ofSeconds(10))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() == 200) {
                JsonNode root = objectMapper.readTree(response.body());
                JsonNode modelsNode = root.path("models");
                if (modelsNode.isArray()) {
                    for (JsonNode m : modelsNode) {
                        String name = m.path("name").asText(""); // e.g. "models/gemini-2.0-flash"
                        JsonNode methods = m.path("supportedGenerationMethods");
                        boolean supportsGenerate = false;
                        if (methods.isArray()) {
                            for (JsonNode method : methods) {
                                if ("generateContent".equals(method.asText())) {
                                    supportsGenerate = true;
                                    break;
                                }
                            }
                        }
                        if (supportsGenerate && !name.isEmpty()) {
                            String simpleName = name.replace("models/", "");
                            models.add(simpleName);
                        }
                    }
                }
            }
        } catch (Exception ignored) {}
        return models;
    }

    public String generateContent(String apiKey, String preferredModel, String systemInstruction, String userPrompt) {
        if (apiKey == null || apiKey.trim().isEmpty()) {
            throw new IllegalArgumentException("Google Gemini API Key is required. Please provide your API key in ArchLens settings.");
        }

        String cleanKey = apiKey.trim().replaceAll("^\"|\"$", "").replaceAll("^'|'$", "");

        // Build list of models to try in priority order
        LinkedHashSet<String> modelsToTry = new LinkedHashSet<>();
        if (preferredModel != null && !preferredModel.trim().isEmpty()) {
            String cleanPreferred = preferredModel.trim().replace("models/", "");
            modelsToTry.add(cleanPreferred);
            if (cleanPreferred.equals("gemini-1.5-flash")) {
                modelsToTry.add("gemini-2.0-flash");
                modelsToTry.add("gemini-1.5-flash-latest");
            }
        }
        modelsToTry.addAll(CANDIDATE_MODELS);

        // Dynamically discover models supported by user's key
        List<String> dynamicModels = listSupportedModels(cleanKey);
        modelsToTry.addAll(dynamicModels);

        Exception lastException = null;
        String lastErrorMsg = null;

        for (String model : modelsToTry) {
            try {
                String result = executeGenerateContent(cleanKey, model, "v1beta", systemInstruction, userPrompt, true);
                if (result != null && !result.isBlank()) {
                    return result;
                }
            } catch (Exception e) {
                lastException = e;
                lastErrorMsg = e.getMessage();

                // If system_instruction was rejected or version issue, try v1 endpoint or prepend system prompt
                try {
                    String result = executeGenerateContent(cleanKey, model, "v1beta", null,
                            (systemInstruction != null ? (systemInstruction + "\n\n" + userPrompt) : userPrompt), false);
                    if (result != null && !result.isBlank()) {
                        return result;
                    }
                } catch (Exception ignored) {}
            }
        }

        throw new RuntimeException("Gemini generation failed across candidate models: " + (lastErrorMsg != null ? lastErrorMsg : (lastException != null ? lastException.getMessage() : "Unknown error")), lastException);
    }

    private String executeGenerateContent(String cleanKey, String model, String apiVersion, String systemInstruction, String userPrompt, boolean useSystemInstructionField) throws Exception {
        String cleanModel = model.startsWith("models/") ? model.replace("models/", "") : model;
        String url = "https://generativelanguage.googleapis.com/" + apiVersion + "/models/" + cleanModel + ":generateContent?key=" + cleanKey;

        Map<String, Object> requestPayload = new HashMap<>();

        // System instruction
        if (useSystemInstructionField && systemInstruction != null && !systemInstruction.isBlank()) {
            requestPayload.put("system_instruction", Map.of(
                    "parts", List.of(Map.of("text", systemInstruction))
            ));
        }

        // User contents
        requestPayload.put("contents", List.of(
                Map.of("role", "user", "parts", List.of(Map.of("text", userPrompt)))
        ));

        // Generation config
        requestPayload.put("generationConfig", Map.of(
                "temperature", 0.3,
                "maxOutputTokens", 4096
        ));

        String requestJson = objectMapper.writeValueAsString(requestPayload);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .header("Content-Type", "application/json")
                .header("User-Agent", "ArchLens-AI-Engine/1.0")
                .POST(HttpRequest.BodyPublishers.ofString(requestJson))
                .timeout(Duration.ofSeconds(45))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() != 200) {
            JsonNode errNode = objectMapper.readTree(response.body());
            String errMsg = errNode.path("error").path("message").asText("Gemini HTTP " + response.statusCode());
            throw new RuntimeException(errMsg);
        }

        JsonNode root = objectMapper.readTree(response.body());
        JsonNode textNode = root.path("candidates").path(0).path("content").path("parts").path(0).path("text");
        if (textNode.isMissingNode() || textNode.asText().isEmpty()) {
            return "Gemini did not return text content.";
        }

        return textNode.asText();
    }
}
