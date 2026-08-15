package com.archlens.graph;

import com.archlens.model.*;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class ArchitectureRuleEngine {

    private final GraphStore graphStore;

    public ArchitectureRuleEngine(GraphStore graphStore) {
        this.graphStore = graphStore;
    }

    public List<ArchitectureViolation> auditArchitecture() {
        CodeGraph graph = graphStore.getActiveGraph();
        if (graph == null) return Collections.emptyList();

        List<ArchitectureViolation> violations = new ArrayList<>();

        // 1. Detect Cyclic Dependencies
        detectCycles(graph, violations);

        // 2. Detect Layer Violations (e.g. Controller calling Repository directly)
        detectLayerBypasses(graph, violations);

        // 3. Detect Inverted Dependencies (e.g. Repository depending on Service)
        detectInvertedDependencies(graph, violations);

        // 4. Detect Missing Transactional boundaries on State-Modifying Services
        detectMissingTransactionBoundaries(graph, violations);

        return violations;
    }

    public ArchitectureSummary generateSummary() {
        CodeGraph graph = graphStore.getActiveGraph();
        ArchitectureSummary summary = new ArchitectureSummary();
        if (graph == null) return summary;

        List<ArchitectureViolation> violations = auditArchitecture();

        int controllers = 0, services = 0, repositories = 0, entities = 0, endpoints = 0;
        for (CodeNode node : graph.getNodes()) {
            switch (node.getType()) {
                case CONTROLLER -> controllers++;
                case SERVICE -> services++;
                case REPOSITORY -> repositories++;
                case ENTITY -> entities++;
                case ENDPOINT -> endpoints++;
                default -> {}
            }
        }

        summary.setTotalClasses((int) graph.getNodes().stream().filter(n -> n.getType() != NodeType.ENDPOINT).count());
        summary.setTotalControllers(controllers);
        summary.setTotalServices(services);
        summary.setTotalRepositories(repositories);
        summary.setTotalEntities(entities);
        summary.setTotalEndpoints(endpoints);
        summary.setTotalDependencies(graph.getEdges().size());
        summary.setTotalViolations(violations.size());

        // Calculate 0-100 Health Score
        double health = 100.0;
        for (ArchitectureViolation v : violations) {
            switch (v.getSeverity()) {
                case "CRITICAL" -> health -= 25.0;
                case "HIGH" -> health -= 15.0;
                case "MEDIUM" -> health -= 8.0;
                case "LOW" -> health -= 3.0;
            }
        }
        summary.setHealthScore(Math.max(0.0, Math.min(100.0, health)));

        return summary;
    }

    private void detectCycles(CodeGraph graph, List<ArchitectureViolation> violations) {
        Set<String> visited = new HashSet<>();
        Set<String> recursionStack = new HashSet<>();
        List<String> currentPath = new ArrayList<>();
        Set<String> reportedCycles = new HashSet<>();

        for (CodeNode node : graph.getNodes()) {
            if (node.getType() == NodeType.ENDPOINT) continue; // endpoints are entrypoints
            if (!visited.contains(node.getId())) {
                findCyclesDfs(node.getId(), graph, visited, recursionStack, currentPath, violations, reportedCycles);
            }
        }
    }

    private void findCyclesDfs(String currentId, CodeGraph graph, Set<String> visited,
                              Set<String> recStack, List<String> path,
                              List<ArchitectureViolation> violations, Set<String> reportedCycles) {
        visited.add(currentId);
        recStack.add(currentId);
        path.add(currentId);

        List<CodeEdge> outgoing = graph.getOutgoingEdges(currentId);
        for (CodeEdge edge : outgoing) {
            String targetId = edge.getTargetId();
            CodeNode targetNode = graph.getNode(targetId);
            if (targetNode == null || targetNode.getType() == NodeType.ENDPOINT) continue;

            if (recStack.contains(targetId)) {
                // Cycle detected!
                int startIndex = path.indexOf(targetId);
                if (startIndex != -1) {
                    List<String> cycle = new ArrayList<>(path.subList(startIndex, path.size()));
                    cycle.add(targetId);
                    String cycleKey = String.join("->", cycle);

                    if (!reportedCycles.contains(cycleKey)) {
                        reportedCycles.add(cycleKey);
                        CodeNode startNode = graph.getNode(targetId);
                        CodeNode endNode = graph.getNode(currentId);

                        ArchitectureViolation violation = new ArchitectureViolation(
                                UUID.randomUUID().toString(),
                                "Circular Dependency Detected",
                                "CRITICAL",
                                "Circular dependency detected between " + (startNode != null ? startNode.getName() : targetId) +
                                        " and " + (endNode != null ? endNode.getName() : currentId) + ". This violates Clean Architecture and risks runtime BeanCreationException.",
                                startNode != null ? startNode.getName() : targetId,
                                endNode != null ? endNode.getName() : currentId
                        );
                        violation.setCyclePath(cycle);
                        violation.setRemediationAdvice("Break the cyclic dependency by introducing an Event Publisher/Listener or extracting shared logic into a common domain service.");
                        violations.add(violation);
                    }
                }
            } else if (!visited.contains(targetId)) {
                findCyclesDfs(targetId, graph, visited, recStack, path, violations, reportedCycles);
            }
        }

        path.remove(path.size() - 1);
        recStack.remove(currentId);
    }

    private void detectLayerBypasses(CodeGraph graph, List<ArchitectureViolation> violations) {
        for (CodeEdge edge : graph.getEdges()) {
            CodeNode source = graph.getNode(edge.getSourceId());
            CodeNode target = graph.getNode(edge.getTargetId());

            if (source == null || target == null) continue;

            // Controller -> Repository directly (Layer Bypass)
            if (source.getType() == NodeType.CONTROLLER && target.getType() == NodeType.REPOSITORY) {
                violations.add(new ArchitectureViolation(
                        UUID.randomUUID().toString(),
                        "Controller Bypasses Service Layer",
                        "HIGH",
                        "Controller '" + source.getName() + "' directly calls/injects Repository '" + target.getName() + "'. Business logic and transaction boundary must reside in a Service.",
                        source.getName(),
                        target.getName()
                ));
            }
        }
    }

    private void detectInvertedDependencies(CodeGraph graph, List<ArchitectureViolation> violations) {
        for (CodeEdge edge : graph.getEdges()) {
            CodeNode source = graph.getNode(edge.getSourceId());
            CodeNode target = graph.getNode(edge.getTargetId());

            if (source == null || target == null) continue;

            // Repository -> Service or Controller (Inversion)
            if (source.getType() == NodeType.REPOSITORY && (target.getType() == NodeType.SERVICE || target.getType() == NodeType.CONTROLLER)) {
                violations.add(new ArchitectureViolation(
                        UUID.randomUUID().toString(),
                        "Inverted Layer Dependency",
                        "CRITICAL",
                        "Repository '" + source.getName() + "' depends on upper layer '" + target.getName() + "'. Lower persistence layer must never depend on higher layers.",
                        source.getName(),
                        target.getName()
                ));
            }
        }
    }

    private void detectMissingTransactionBoundaries(CodeGraph graph, List<ArchitectureViolation> violations) {
        for (CodeNode node : graph.getNodes()) {
            if (node.getType() == NodeType.SERVICE) {
                // If service writes to entities or modifies state without @Transactional
                boolean writesToDb = graph.getOutgoingEdges(node.getId()).stream()
                        .anyMatch(e -> e.getType() == EdgeType.WRITES_TO || (graph.getNode(e.getTargetId()) != null && graph.getNode(e.getTargetId()).getType() == NodeType.REPOSITORY));

                boolean hasTransactional = node.getAnnotations().contains("Transactional") ||
                        (node.getSourceCode() != null && node.getSourceCode().contains("@Transactional"));

                if (writesToDb && !hasTransactional) {
                    violations.add(new ArchitectureViolation(
                            UUID.randomUUID().toString(),
                            "Missing @Transactional Boundary",
                            "MEDIUM",
                            "Service '" + node.getName() + "' orchestrates persistence updates without declaring @Transactional. In failure conditions, partial writes may cause database inconsistency.",
                            node.getName(),
                            "Database"
                    ));
                }
            }
        }
    }
}
