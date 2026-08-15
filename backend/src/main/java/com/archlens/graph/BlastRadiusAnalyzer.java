package com.archlens.graph;

import com.archlens.model.*;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class BlastRadiusAnalyzer {

    private final GraphStore graphStore;

    public BlastRadiusAnalyzer(GraphStore graphStore) {
        this.graphStore = graphStore;
    }

    public BlastRadiusReport calculateBlastRadius(String targetIdentifier, int maxDepth) {
        CodeGraph graph = graphStore.getActiveGraph();
        if (graph == null) {
            return new BlastRadiusReport(targetIdentifier, "No active codebase graph found");
        }

        // Find target node by ID, simple name, or method signature
        CodeNode targetNode = resolveTargetNode(graph, targetIdentifier);
        if (targetNode == null) {
            BlastRadiusReport notFound = new BlastRadiusReport(targetIdentifier, targetIdentifier);
            notFound.setAiSummary("Target node '" + targetIdentifier + "' could not be found in the current codebase graph.");
            notFound.setRiskLevel("LOW");
            return notFound;
        }

        BlastRadiusReport report = new BlastRadiusReport(targetNode.getId(), targetNode.getName());
        Set<String> visited = new HashSet<>();
        Queue<TraversalStep> queue = new ArrayDeque<>();
        List<BlastRadiusReport.ImpactedNodeDetail> impactedDetails = new ArrayList<>();
        Set<String> affectedEndpoints = new LinkedHashSet<>();
        Set<String> affectedEntities = new LinkedHashSet<>();
        List<List<String>> impactPaths = new ArrayList<>();

        queue.add(new TraversalStep(targetNode.getId(), 0, List.of(targetNode.getName())));
        visited.add(targetNode.getId());

        while (!queue.isEmpty()) {
            TraversalStep current = queue.poll();

            if (current.depth >= maxDepth) continue;

            // We look at INCOMING edges (who depends on this node / who calls this node)
            List<CodeEdge> incoming = graph.getIncomingEdges(current.nodeId);
            for (CodeEdge edge : incoming) {
                String sourceId = edge.getSourceId();
                CodeNode sourceNode = graph.getNode(sourceId);

                if (sourceNode != null) {
                    List<String> newPath = new ArrayList<>(current.path);
                    newPath.add(sourceNode.getName());

                    if (!visited.contains(sourceId)) {
                        visited.add(sourceId);
                        int hop = current.depth + 1;
                        impactedDetails.add(new BlastRadiusReport.ImpactedNodeDetail(
                                sourceNode.getId(),
                                sourceNode.getName(),
                                sourceNode.getType(),
                                hop,
                                edge.getType().name() + ": " + edge.getLabel()
                        ));

                        if (sourceNode.getType() == NodeType.ENDPOINT) {
                            affectedEndpoints.add(sourceNode.getName() + " (" + sourceNode.getSignature() + ")");
                        } else if (sourceNode.getType() == NodeType.ENTITY) {
                            affectedEntities.add(sourceNode.getName());
                        }

                        impactPaths.add(newPath);
                        queue.add(new TraversalStep(sourceId, hop, newPath));
                    }
                }
            }
        }

        report.setTotalImpactedNodes(impactedDetails.size());
        report.setImpactedNodes(impactedDetails);
        report.setAffectedEndpoints(new ArrayList<>(affectedEndpoints));
        report.setAffectedDatabaseEntities(new ArrayList<>(affectedEntities));
        report.setImpactPaths(impactPaths);

        // Determine Risk Score
        report.setRiskLevel(calculateRisk(impactedDetails.size(), affectedEndpoints.size(), targetNode.getType()));

        // Synthesize dynamic summary
        report.setAiSummary(generateSummary(targetNode, report));

        return report;
    }

    private CodeNode resolveTargetNode(CodeGraph graph, String query) {
        if (query == null || query.isBlank()) return null;
        CodeNode direct = graph.getNode(query);
        if (direct != null) return direct;

        for (CodeNode node : graph.getNodes()) {
            if (node.getName().equalsIgnoreCase(query) ||
                (node.getClassName() != null && node.getClassName().equalsIgnoreCase(query)) ||
                (node.getId().endsWith("." + query)) ||
                (node.getSignature() != null && node.getSignature().contains(query))) {
                return node;
            }
        }
        return null;
    }

    private String calculateRisk(int totalImpacted, int affectedEndpoints, NodeType type) {
        if (affectedEndpoints > 3 || totalImpacted > 10) return "CRITICAL";
        if (affectedEndpoints > 0 || totalImpacted > 5) return "HIGH";
        if (totalImpacted > 2) return "MEDIUM";
        return "LOW";
    }

    private String generateSummary(CodeNode target, BlastRadiusReport report) {
        StringBuilder sb = new StringBuilder();
        sb.append("Modifying '").append(target.getName()).append("' (").append(target.getType()).append(") ");
        sb.append("will cascade to ").append(report.getTotalImpactedNodes()).append(" dependent component(s). ");
        if (!report.getAffectedEndpoints().isEmpty()) {
            sb.append("CRITICAL: ").append(report.getAffectedEndpoints().size())
              .append(" external HTTP endpoint(s) are in the direct blast zone: ")
              .append(String.join(", ", report.getAffectedEndpoints())).append(". ");
        }
        if (!report.getAffectedDatabaseEntities().isEmpty()) {
            sb.append("Directly affects database persistence models: ")
              .append(String.join(", ", report.getAffectedDatabaseEntities())).append(". ");
        }
        return sb.toString();
    }

    private static class TraversalStep {
        final String nodeId;
        final int depth;
        final List<String> path;

        TraversalStep(String nodeId, int depth, List<String> path) {
            this.nodeId = nodeId;
            this.depth = depth;
            this.path = path;
        }
    }
}
