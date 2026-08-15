package com.archlens.model;

import java.util.ArrayList;
import java.util.List;

public class BlastRadiusReport {
    private String targetNodeId;
    private String targetNodeName;
    private String riskLevel; // LOW, MEDIUM, HIGH, CRITICAL
    private int totalImpactedNodes;
    private List<ImpactedNodeDetail> impactedNodes = new ArrayList<>();
    private List<String> affectedEndpoints = new ArrayList<>();
    private List<String> affectedDatabaseEntities = new ArrayList<>();
    private List<List<String>> impactPaths = new ArrayList<>();
    private String aiSummary;

    public BlastRadiusReport() {}

    public BlastRadiusReport(String targetNodeId, String targetNodeName) {
        this.targetNodeId = targetNodeId;
        this.targetNodeName = targetNodeName;
    }

    public static class ImpactedNodeDetail {
        private String id;
        private String name;
        private NodeType type;
        private int hopDistance;
        private String dependencyType;

        public ImpactedNodeDetail() {}

        public ImpactedNodeDetail(String id, String name, NodeType type, int hopDistance, String dependencyType) {
            this.id = id;
            this.name = name;
            this.type = type;
            this.hopDistance = hopDistance;
            this.dependencyType = dependencyType;
        }

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public NodeType getType() { return type; }
        public void setType(NodeType type) { this.type = type; }
        public int getHopDistance() { return hopDistance; }
        public void setHopDistance(int hopDistance) { this.hopDistance = hopDistance; }
        public String getDependencyType() { return dependencyType; }
        public void setDependencyType(String dependencyType) { this.dependencyType = dependencyType; }
    }

    public String getTargetNodeId() { return targetNodeId; }
    public void setTargetNodeId(String targetNodeId) { this.targetNodeId = targetNodeId; }
    public String getTargetNodeName() { return targetNodeName; }
    public void setTargetNodeName(String targetNodeName) { this.targetNodeName = targetNodeName; }
    public String getRiskLevel() { return riskLevel; }
    public void setRiskLevel(String riskLevel) { this.riskLevel = riskLevel; }
    public int getTotalImpactedNodes() { return totalImpactedNodes; }
    public void setTotalImpactedNodes(int totalImpactedNodes) { this.totalImpactedNodes = totalImpactedNodes; }
    public List<ImpactedNodeDetail> getImpactedNodes() { return impactedNodes; }
    public void setImpactedNodes(List<ImpactedNodeDetail> impactedNodes) { this.impactedNodes = impactedNodes; }
    public List<String> getAffectedEndpoints() { return affectedEndpoints; }
    public void setAffectedEndpoints(List<String> affectedEndpoints) { this.affectedEndpoints = affectedEndpoints; }
    public List<String> getAffectedDatabaseEntities() { return affectedDatabaseEntities; }
    public void setAffectedDatabaseEntities(List<String> affectedDatabaseEntities) { this.affectedDatabaseEntities = affectedDatabaseEntities; }
    public List<List<String>> getImpactPaths() { return impactPaths; }
    public void setImpactPaths(List<List<String>> impactPaths) { this.impactPaths = impactPaths; }
    public String getAiSummary() { return aiSummary; }
    public void setAiSummary(String aiSummary) { this.aiSummary = aiSummary; }
}
