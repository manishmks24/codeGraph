package com.archlens.ai.tools;

import com.archlens.graph.BlastRadiusAnalyzer;
import com.archlens.model.BlastRadiusReport;
import org.springframework.stereotype.Component;

import java.util.function.Function;

@Component
public class BlastRadiusTool implements Function<BlastRadiusTool.Request, BlastRadiusReport> {

    private final BlastRadiusAnalyzer analyzer;

    public BlastRadiusTool(BlastRadiusAnalyzer analyzer) {
        this.analyzer = analyzer;
    }

    public record Request(String targetIdentifier, int maxDepth) {}

    @Override
    public BlastRadiusReport apply(Request request) {
        int depth = request.maxDepth() > 0 ? request.maxDepth() : 4;
        return analyzer.calculateBlastRadius(request.targetIdentifier(), depth);
    }
}
