package com.archlens.api;

import com.archlens.ai.ArchitecturalReviewService;
import com.archlens.ai.GeminiClientService;
import com.archlens.ai.ProjectSkillGeneratorService;
import com.archlens.model.ArchitecturalReviewReport;
import com.archlens.model.ProjectSkill;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(originPatterns = "*")
public class AiPlatformController {

    private final ArchitecturalReviewService reviewService;
    private final ProjectSkillGeneratorService skillService;
    private final GeminiClientService geminiClient;

    public AiPlatformController(ArchitecturalReviewService reviewService,
                                ProjectSkillGeneratorService skillService,
                                GeminiClientService geminiClient) {
        this.reviewService = reviewService;
        this.skillService = skillService;
        this.geminiClient = geminiClient;
    }

    @PostMapping("/review")
    public ResponseEntity<ArchitecturalReviewReport> getArchitecturalReview(
            @RequestHeader(value = "X-Gemini-Api-Key", required = false) String apiKey,
            @RequestParam(value = "model", defaultValue = "gemini-1.5-flash") String model) {
        ArchitecturalReviewReport report = reviewService.generateReview(apiKey, model);
        return ResponseEntity.ok(report);
    }

    @PostMapping("/generate-skill")
    public ResponseEntity<ProjectSkill> generateSkill(
            @RequestHeader(value = "X-Gemini-Api-Key", required = false) String apiKey,
            @RequestParam(value = "model", defaultValue = "gemini-1.5-flash") String model) {
        ProjectSkill skill = skillService.generateProjectSkill(apiKey, model);
        return ResponseEntity.ok(skill);
    }

    @PostMapping("/validate-key")
    public ResponseEntity<?> validateKey(@RequestBody Map<String, String> body) {
        String key = body.get("apiKey");
        Map<String, Object> result = geminiClient.validateKeyDetailed(key);
        return ResponseEntity.ok(result);
    }
}
