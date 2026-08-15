package com.archlens;

import com.archlens.graph.ArchitectureRuleEngine;
import com.archlens.graph.GraphStore;
import com.archlens.model.ArchitectureSummary;
import com.archlens.model.ArchitectureViolation;
import com.archlens.model.CodeGraph;
import com.archlens.parser.CodebaseScannerService;
import com.archlens.samples.SampleCodebaseProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

public class ArchitectureRuleEngineTest {

    private ArchitectureRuleEngine ruleEngine;
    private GraphStore graphStore;
    private CodebaseScannerService scanner;

    @BeforeEach
    public void setUp() {
        graphStore = new GraphStore();
        ruleEngine = new ArchitectureRuleEngine(graphStore);
        scanner = new CodebaseScannerService(
                new com.archlens.parser.JavaAstParser(),
                new com.archlens.parser.TypeScriptJsParser(),
                new com.archlens.parser.PythonCodeParser()
        );

        SampleCodebaseProvider provider = new SampleCodebaseProvider();
        Map<String, String> sampleFiles = provider.getECommerceSampleCodebase();
        CodeGraph graph = scanner.scanFiles(sampleFiles);
        graphStore.saveGraph(graph);
    }

    @Test
    public void testDetectCyclesAndLayerBypasses() {
        List<ArchitectureViolation> violations = ruleEngine.auditArchitecture();

        assertNotNull(violations);
        assertFalse(violations.isEmpty(), "Should detect architectural issues in sample project");

        boolean hasCycle = violations.stream().anyMatch(v -> v.getRuleName().toLowerCase().contains("circular"));
        assertTrue(hasCycle, "Should detect circular dependency between OrderService and PaymentService");

        boolean hasLayerBypass = violations.stream().anyMatch(v -> v.getRuleName().toLowerCase().contains("bypass"));
        assertTrue(hasLayerBypass, "Should detect Controller directly injecting repository");
    }

    @Test
    public void testGenerateSummaryAndHealthScore() {
        ArchitectureSummary summary = ruleEngine.generateSummary();

        assertNotNull(summary);
        assertTrue(summary.getTotalClasses() > 0);
        assertTrue(summary.getTotalDependencies() > 0);
        assertTrue(summary.getHealthScore() < 100.0, "Health score should reflect violations");
    }
}
