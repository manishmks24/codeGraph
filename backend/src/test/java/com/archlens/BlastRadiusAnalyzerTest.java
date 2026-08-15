package com.archlens;

import com.archlens.graph.BlastRadiusAnalyzer;
import com.archlens.graph.GraphStore;
import com.archlens.model.BlastRadiusReport;
import com.archlens.model.CodeGraph;
import com.archlens.parser.CodebaseScannerService;
import com.archlens.samples.SampleCodebaseProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

public class BlastRadiusAnalyzerTest {

    private BlastRadiusAnalyzer analyzer;
    private GraphStore graphStore;
    private CodebaseScannerService scanner;

    @BeforeEach
    public void setUp() {
        graphStore = new GraphStore();
        analyzer = new BlastRadiusAnalyzer(graphStore);
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
    public void testCalculateBlastRadiusForPaymentService() {
        BlastRadiusReport report = analyzer.calculateBlastRadius("PaymentService", 4);

        assertNotNull(report);
        assertEquals("PaymentService", report.getTargetNodeName());
        assertTrue(report.getTotalImpactedNodes() > 0, "Impacted nodes should be greater than 0");
        assertNotNull(report.getRiskLevel());
        assertFalse(report.getImpactPaths().isEmpty());
    }
}
