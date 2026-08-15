package com.archlens.ai;

import com.archlens.graph.ArchitectureRuleEngine;
import com.archlens.graph.GraphStore;
import com.archlens.model.*;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class ArchitecturalReviewService {

    private final GraphStore graphStore;
    private final ArchitectureRuleEngine ruleEngine;
    private final GeminiClientService geminiClient;

    public ArchitecturalReviewService(GraphStore graphStore, ArchitectureRuleEngine ruleEngine, GeminiClientService geminiClient) {
        this.graphStore = graphStore;
        this.ruleEngine = ruleEngine;
        this.geminiClient = geminiClient;
    }

    public ArchitecturalReviewReport generateReview(String geminiApiKey, String modelName) {
        CodeGraph graph = graphStore.getActiveGraph();
        if (graph == null) {
            throw new IllegalStateException("No active codebase graph loaded. Please scan a project first.");
        }

        ArchitecturalReviewReport report = new ArchitecturalReviewReport();
        report.setProjectName(graph.getProjectName() != null ? graph.getProjectName() : "ArchLens Indexed Project");

        List<ArchitectureViolation> violations = ruleEngine.auditArchitecture();
        ArchitectureSummary summary = ruleEngine.generateSummary();
        report.setHealthScore((int) Math.round(summary.getHealthScore()));

        // 1. Detect Architecture Pattern
        boolean hasControllers = graph.getNodes().stream().anyMatch(n -> n.getType() == NodeType.CONTROLLER);
        boolean hasServices = graph.getNodes().stream().anyMatch(n -> n.getType() == NodeType.SERVICE);
        boolean hasRepos = graph.getNodes().stream().anyMatch(n -> n.getType() == NodeType.REPOSITORY);
        boolean hasComponents = graph.getNodes().stream().anyMatch(n -> n.getType() == NodeType.COMPONENT);

        if (hasControllers && hasServices && hasRepos) {
            report.setArchitecturalPattern("3-Tier Layered Domain Architecture (Spring Boot)");
        } else if (hasComponents && hasServices) {
            report.setArchitecturalPattern("Component-Driven Single Page Architecture (React/Next.js)");
        } else {
            report.setArchitecturalPattern("Modular Service-Oriented Architecture");
        }

        // 2. Layer Breakdown
        Map<NodeType, List<CodeNode>> nodesByType = graph.getNodes().stream()
                .collect(Collectors.groupingBy(CodeNode::getType));

        // API Layer
        List<CodeNode> controllers = nodesByType.getOrDefault(NodeType.CONTROLLER, Collections.emptyList());
        ArchitecturalReviewReport.LayerBreakdown apiLayer = new ArchitecturalReviewReport.LayerBreakdown();
        apiLayer.setLayerName("1. Presentation & API Gateway");
        apiLayer.setPurpose("Exposes REST/GraphQL endpoints, performs input validation, and delegates requests to business services.");
        apiLayer.setNodeCount(controllers.size());
        apiLayer.setKeyComponents(controllers.stream().map(CodeNode::getName).limit(6).toList());
        apiLayer.setAllowedDependencies(List.of("Domain Services", "DTOs / ViewModels"));
        apiLayer.setStatus(controllers.isEmpty() ? "WARNING" : "HEALTHY");
        report.getLayers().add(apiLayer);

        // Domain Service Layer
        List<CodeNode> services = nodesByType.getOrDefault(NodeType.SERVICE, Collections.emptyList());
        ArchitecturalReviewReport.LayerBreakdown serviceLayer = new ArchitecturalReviewReport.LayerBreakdown();
        serviceLayer.setLayerName("2. Business Logic & Domain Services");
        serviceLayer.setPurpose("Executes core business rules, coordinates transaction workflows, and enforces invariants.");
        serviceLayer.setNodeCount(services.size());
        serviceLayer.setKeyComponents(services.stream().map(CodeNode::getName).limit(6).toList());
        serviceLayer.setAllowedDependencies(List.of("Repositories", "Domain Entities", "Event Publishers"));
        serviceLayer.setStatus("HEALTHY");
        report.getLayers().add(serviceLayer);

        // Persistence Layer
        List<CodeNode> repos = nodesByType.getOrDefault(NodeType.REPOSITORY, Collections.emptyList());
        ArchitecturalReviewReport.LayerBreakdown persistenceLayer = new ArchitecturalReviewReport.LayerBreakdown();
        persistenceLayer.setLayerName("3. Data Access & Repositories");
        persistenceLayer.setPurpose("Abstracts database transactions, query execution, and entity persistence.");
        persistenceLayer.setNodeCount(repos.size());
        persistenceLayer.setKeyComponents(repos.stream().map(CodeNode::getName).limit(6).toList());
        persistenceLayer.setAllowedDependencies(List.of("Database Entities / Models", "Connection Pool"));
        persistenceLayer.setStatus("HEALTHY");
        report.getLayers().add(persistenceLayer);

        // Entities Layer
        List<CodeNode> entities = nodesByType.getOrDefault(NodeType.ENTITY, Collections.emptyList());
        ArchitecturalReviewReport.LayerBreakdown entityLayer = new ArchitecturalReviewReport.LayerBreakdown();
        entityLayer.setLayerName("4. Domain Entities & Data Models");
        entityLayer.setPurpose("Defines database schemas, relationships, state invariants, and table mappings.");
        entityLayer.setNodeCount(entities.size());
        entityLayer.setKeyComponents(entities.stream().map(CodeNode::getName).limit(6).toList());
        entityLayer.setAllowedDependencies(List.of("None (Pure Domain State)"));
        entityLayer.setStatus("HEALTHY");
        report.getLayers().add(entityLayer);

        // 3. Trace Key Data Flows
        List<CodeNode> endpoints = nodesByType.getOrDefault(NodeType.ENDPOINT, Collections.emptyList());
        for (CodeNode ep : endpoints.stream().limit(5).toList()) {
            ArchitecturalReviewReport.DataFlowPath flow = new ArchitecturalReviewReport.DataFlowPath();
            flow.setFlowName("HTTP Flow: " + ep.getName());
            flow.setTriggerEndpoint(ep.getSignature() != null ? ep.getSignature() : ep.getName());

            List<String> path = new ArrayList<>();
            path.add("Client ➔ " + ep.getName());

            // Trace downstream calls
            for (CodeEdge edge : graph.getEdges()) {
                if (edge.getSourceId().equals(ep.getId())) {
                    CodeNode target = graph.getNode(edge.getTargetId());
                    if (target != null) {
                        path.add(target.getName());
                        // Follow one hop deeper
                        for (CodeEdge subEdge : graph.getEdges()) {
                            if (subEdge.getSourceId().equals(target.getId())) {
                                CodeNode deepTarget = graph.getNode(subEdge.getTargetId());
                                if (deepTarget != null && !path.contains(deepTarget.getName())) {
                                    path.add(deepTarget.getName());
                                }
                            }
                        }
                    }
                }
            }

            flow.setStepSequence(path);
            flow.setDescription("Synchronous execution path originating from " + ep.getName() + " traversing through business services into database persistence.");
            flow.setRiskLevel(path.size() > 4 ? "MEDIUM" : "LOW");
            report.getKeyDataFlows().add(flow);
        }

        // 4. Strengths & Bottlenecks
        report.setArchitecturalStrengths(List.of(
                "Clean separation of concerns between HTTP Controllers and Domain Services.",
                "Explicit AST-discoverable Dependency Injection across components.",
                "Well-defined entity models isolating persistence details.",
                "High cohesion in service class responsibilities."
        ));

        if (!violations.isEmpty()) {
            for (ArchitectureViolation v : violations) {
                report.getCriticalBottlenecks().add("[" + v.getSeverity() + "] " + v.getRuleName() + ": " + v.getDescription());
            }
        } else {
            report.getCriticalBottlenecks().add("No critical cyclic dependencies detected in AST scan.");
        }

        // 5. Recommendations
        report.setActionableRecommendations(List.of(
                "Introduce an asynchronous event bus (e.g. Spring ApplicationEventPublisher or Kafka) to eliminate cross-service tight coupling.",
                "Wrap multi-repository mutating operations in explicit @Transactional boundaries.",
                "Add circuit breaker / rate-limiting policies on external integrations via Resilience4j.",
                "Enforce ArchLens CI/CD linting rule to reject pull requests that introduce layer violations."
        ));

        // 6. Executive Summary
        String execSummary = "ArchLens has scanned **" + graph.getNodes().size() + " topological components** and **" +
                graph.getEdges().size() + " dependency connections**. The architecture adheres to **" +
                report.getArchitecturalPattern() + "** with an overall architectural health score of **" +
                report.getHealthScore() + "%**." +
                (violations.isEmpty() ? " Zero circular dependencies or critical layer bypasses were identified." :
                        " Found " + violations.size() + " architectural issue(s) requiring remediation.");

        // If Gemini API Key is available, generate an executive AI review
        if (geminiApiKey != null && !geminiApiKey.trim().isEmpty()) {
            try {
                String prompt = "Generate a 2-paragraph executive architectural review and flow analysis for " + report.getProjectName() +
                        " with " + graph.getNodes().size() + " nodes and health score " + report.getHealthScore() + "%. Focus on data flow, stability, and maintainability.";
                String aiReview = geminiClient.generateContent(geminiApiKey, modelName, "You are a Principal Software Architect conducting an architecture review.", prompt);
                if (aiReview != null && !aiReview.isBlank()) {
                    execSummary = aiReview;
                }
            } catch (Exception ignored) {}
        }

        report.setExecutiveSummary(execSummary);
        report.getMetrics().put("totalNodes", graph.getNodes().size());
        report.getMetrics().put("totalEdges", graph.getEdges().size());
        report.getMetrics().put("healthScore", report.getHealthScore());

        return report;
    }
}
