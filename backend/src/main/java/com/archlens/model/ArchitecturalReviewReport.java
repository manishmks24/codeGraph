package com.archlens.model;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class ArchitecturalReviewReport {
    private String projectName;
    private String architecturalPattern;
    private String executiveSummary;
    private int healthScore;
    private List<LayerBreakdown> layers = new ArrayList<>();
    private List<DataFlowPath> keyDataFlows = new ArrayList<>();
    private List<String> architecturalStrengths = new ArrayList<>();
    private List<String> criticalBottlenecks = new ArrayList<>();
    private List<String> actionableRecommendations = new ArrayList<>();
    private Map<String, Object> metrics = new HashMap<>();

    public static class LayerBreakdown {
        private String layerName;
        private String purpose;
        private int nodeCount;
        private List<String> keyComponents = new ArrayList<>();
        private List<String> allowedDependencies = new ArrayList<>();
        private String status; // "HEALTHY", "WARNING", "VIOLATION"

        public String getLayerName() { return layerName; }
        public void setLayerName(String layerName) { this.layerName = layerName; }
        public String getPurpose() { return purpose; }
        public void setPurpose(String purpose) { this.purpose = purpose; }
        public int getNodeCount() { return nodeCount; }
        public void setNodeCount(int nodeCount) { this.nodeCount = nodeCount; }
        public List<String> getKeyComponents() { return keyComponents; }
        public void setKeyComponents(List<String> keyComponents) { this.keyComponents = keyComponents; }
        public List<String> getAllowedDependencies() { return allowedDependencies; }
        public void setAllowedDependencies(List<String> allowedDependencies) { this.allowedDependencies = allowedDependencies; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
    }

    public static class DataFlowPath {
        private String flowName;
        private String triggerEndpoint;
        private List<String> stepSequence = new ArrayList<>();
        private String description;
        private String riskLevel; // "LOW", "MEDIUM", "HIGH"

        public String getFlowName() { return flowName; }
        public void setFlowName(String flowName) { this.flowName = flowName; }
        public String getTriggerEndpoint() { return triggerEndpoint; }
        public void setTriggerEndpoint(String triggerEndpoint) { this.triggerEndpoint = triggerEndpoint; }
        public List<String> getStepSequence() { return stepSequence; }
        public void setStepSequence(List<String> stepSequence) { this.stepSequence = stepSequence; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public String getRiskLevel() { return riskLevel; }
        public void setRiskLevel(String riskLevel) { this.riskLevel = riskLevel; }
    }

    public String getProjectName() { return projectName; }
    public void setProjectName(String projectName) { this.projectName = projectName; }
    public String getArchitecturalPattern() { return architecturalPattern; }
    public void setArchitecturalPattern(String architecturalPattern) { this.architecturalPattern = architecturalPattern; }
    public String getExecutiveSummary() { return executiveSummary; }
    public void setExecutiveSummary(String executiveSummary) { this.executiveSummary = executiveSummary; }
    public int getHealthScore() { return healthScore; }
    public void setHealthScore(int healthScore) { this.healthScore = healthScore; }
    public List<LayerBreakdown> getLayers() { return layers; }
    public void setLayers(List<LayerBreakdown> layers) { this.layers = layers; }
    public List<DataFlowPath> getKeyDataFlows() { return keyDataFlows; }
    public void setKeyDataFlows(List<DataFlowPath> keyDataFlows) { this.keyDataFlows = keyDataFlows; }
    public List<String> getArchitecturalStrengths() { return architecturalStrengths; }
    public void setArchitecturalStrengths(List<String> architecturalStrengths) { this.architecturalStrengths = architecturalStrengths; }
    public List<String> getCriticalBottlenecks() { return criticalBottlenecks; }
    public void setCriticalBottlenecks(List<String> criticalBottlenecks) { this.criticalBottlenecks = criticalBottlenecks; }
    public List<String> getActionableRecommendations() { return actionableRecommendations; }
    public void setActionableRecommendations(List<String> actionableRecommendations) { this.actionableRecommendations = actionableRecommendations; }
    public Map<String, Object> getMetrics() { return metrics; }
    public void setMetrics(Map<String, Object> metrics) { this.metrics = metrics; }
}
