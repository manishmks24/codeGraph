package com.archlens.api;

import com.archlens.graph.ArchitectureRuleEngine;
import com.archlens.graph.BlastRadiusAnalyzer;
import com.archlens.model.ArchitectureSummary;
import com.archlens.model.ArchitectureViolation;
import com.archlens.model.BlastRadiusReport;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/analysis")
@CrossOrigin(originPatterns = "*")
public class AnalysisController {

    private final BlastRadiusAnalyzer blastRadiusAnalyzer;
    private final ArchitectureRuleEngine ruleEngine;

    public AnalysisController(BlastRadiusAnalyzer blastRadiusAnalyzer, ArchitectureRuleEngine ruleEngine) {
        this.blastRadiusAnalyzer = blastRadiusAnalyzer;
        this.ruleEngine = ruleEngine;
    }

    @GetMapping("/blast-radius")
    public ResponseEntity<BlastRadiusReport> getBlastRadius(
            @RequestParam(defaultValue = "PaymentService") String target,
            @RequestParam(defaultValue = "4") int depth) {
        BlastRadiusReport report = blastRadiusAnalyzer.calculateBlastRadius(target, depth);
        return ResponseEntity.ok(report);
    }

    @GetMapping("/violations")
    public ResponseEntity<List<ArchitectureViolation>> getViolations() {
        List<ArchitectureViolation> violations = ruleEngine.auditArchitecture();
        return ResponseEntity.ok(violations);
    }

    @GetMapping("/summary")
    public ResponseEntity<ArchitectureSummary> getSummary() {
        ArchitectureSummary summary = ruleEngine.generateSummary();
        return ResponseEntity.ok(summary);
    }
}
