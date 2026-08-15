package com.archlens.api;

import com.archlens.ai.AiCopilotService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.Map;

@RestController
@RequestMapping("/api/copilot")
@CrossOrigin(originPatterns = "*")
public class CopilotChatController {

    private final AiCopilotService copilotService;

    public CopilotChatController(AiCopilotService copilotService) {
        this.copilotService = copilotService;
    }

    @PostMapping("/chat")
    public ResponseEntity<AiCopilotService.ChatResponse> chat(
            @RequestBody Map<String, String> request,
            @RequestHeader(value = "X-Gemini-Api-Key", required = false) String headerKey) {
        String query = request.getOrDefault("query", "");
        String bodyKey = request.get("apiKey");
        String apiKey = (headerKey != null && !headerKey.isBlank()) ? headerKey : bodyKey;
        String model = request.getOrDefault("model", "gemini-1.5-flash");

        AiCopilotService.ChatResponse response = copilotService.processQuery(query, apiKey, model);
        return ResponseEntity.ok(response);
    }

    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamChat(
            @RequestParam String query,
            @RequestParam(required = false) String apiKey,
            @RequestParam(defaultValue = "gemini-1.5-flash") String model,
            @RequestHeader(value = "X-Gemini-Api-Key", required = false) String headerKey) {
        SseEmitter emitter = new SseEmitter(90_000L);
        String effectiveKey = (headerKey != null && !headerKey.isBlank()) ? headerKey : apiKey;
        copilotService.streamQuery(query, effectiveKey, model, emitter);
        return emitter;
    }
}
