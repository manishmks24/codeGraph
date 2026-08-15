package com.archlens;

import com.archlens.graph.GraphStore;
import com.archlens.model.CodeGraph;
import com.archlens.parser.CodebaseScannerService;
import com.archlens.samples.SampleCodebaseProvider;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import java.util.Map;

@SpringBootApplication
public class ArchLensApplication {

    public static void main(String[] args) {
        SpringApplication.run(ArchLensApplication.class, args);
    }

    @Bean
    public CommandLineRunner initSampleCodebase(CodebaseScannerService scannerService,
                                                GraphStore graphStore,
                                                SampleCodebaseProvider sampleProvider) {
        return args -> {
            System.out.println("===============================================================");
            System.out.println("  ArchLens AI - Knowledge Graph & Architectural Copilot Initialized");
            System.out.println("===============================================================");
            
            // Auto-index demo benchmark on startup for immediate zero-config operation
            Map<String, String> sampleFiles = sampleProvider.getECommerceSampleCodebase();
            CodeGraph graph = scannerService.scanFiles(sampleFiles);
            graph.setProjectName("E-Commerce Order & Payment Microservice");
            graphStore.saveGraph(graph);
            
            System.out.println("✓ Indexed " + graph.getNodes().size() + " AST code nodes.");
            System.out.println("✓ Mapped " + graph.getEdges().size() + " topological dependencies.");
            System.out.println("✓ ArchLens Backend Ready on http://localhost:8080");
        };
    }
}
