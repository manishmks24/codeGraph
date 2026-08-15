package com.archlens.ai.tools;

import com.archlens.graph.ArchitectureRuleEngine;
import com.archlens.model.ArchitectureViolation;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.function.Function;

@Component
public class ArchitectureAuditTool implements Function<ArchitectureAuditTool.Request, List<ArchitectureViolation>> {

    private final ArchitectureRuleEngine ruleEngine;

    public ArchitectureAuditTool(ArchitectureRuleEngine ruleEngine) {
        this.ruleEngine = ruleEngine;
    }

    public record Request(String filterSeverity) {}

    @Override
    public List<ArchitectureViolation> apply(Request request) {
        List<ArchitectureViolation> violations = ruleEngine.auditArchitecture();
        if (request.filterSeverity() != null && !request.filterSeverity().isBlank()) {
            return violations.stream()
                    .filter(v -> v.getSeverity().equalsIgnoreCase(request.filterSeverity()))
                    .toList();
        }
        return violations;
    }
}
