package com.archlens.model;

import java.util.*;

public class CodeGraph {
    private String id = UUID.randomUUID().toString();
    private String projectName = "ArchLens-Project";
    private Map<String, CodeNode> nodes = new LinkedHashMap<>();
    private List<CodeEdge> edges = new ArrayList<>();
    private Map<String, List<CodeEdge>> outgoingEdges = new HashMap<>();
    private Map<String, List<CodeEdge>> incomingEdges = new HashMap<>();
    private Map<String, Object> summaryStats = new HashMap<>();

    public CodeGraph() {}

    public synchronized void addNode(CodeNode node) {
        if (node != null && node.getId() != null) {
            nodes.put(node.getId(), node);
        }
    }

    public synchronized void addEdge(CodeEdge edge) {
        if (edge != null && edge.getSourceId() != null && edge.getTargetId() != null) {
            // Avoid duplicate edges
            if (!edges.contains(edge)) {
                edges.add(edge);
                outgoingEdges.computeIfAbsent(edge.getSourceId(), k -> new ArrayList<>()).add(edge);
                incomingEdges.computeIfAbsent(edge.getTargetId(), k -> new ArrayList<>()).add(edge);
            }
        }
    }

    public CodeNode getNode(String id) {
        return nodes.get(id);
    }

    public List<CodeEdge> getOutgoingEdges(String sourceId) {
        return outgoingEdges.getOrDefault(sourceId, Collections.emptyList());
    }

    public List<CodeEdge> getIncomingEdges(String targetId) {
        return incomingEdges.getOrDefault(targetId, Collections.emptyList());
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getProjectName() {
        return projectName;
    }

    public void setProjectName(String projectName) {
        this.projectName = projectName;
    }

    public Collection<CodeNode> getNodes() {
        return nodes.values();
    }

    public Map<String, CodeNode> getNodeMap() {
        return nodes;
    }

    public List<CodeEdge> getEdges() {
        return edges;
    }

    public Map<String, Object> getSummaryStats() {
        return summaryStats;
    }

    public void setSummaryStats(Map<String, Object> summaryStats) {
        this.summaryStats = summaryStats;
    }
}
