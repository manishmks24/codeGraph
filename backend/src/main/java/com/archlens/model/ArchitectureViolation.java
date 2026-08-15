package com.archlens.model;

import java.util.ArrayList;
import java.util.List;

public class ArchitectureViolation {
    private String id;
    private String ruleName;
    private String severity; // CRITICAL, HIGH, MEDIUM, LOW
    private String description;
    private String sourceComponent;
    private String targetComponent;
    private List<String> cyclePath = new ArrayList<>();
    private String remediationAdvice;

    public ArchitectureViolation() {}

    public ArchitectureViolation(String id, String ruleName, String severity, String description, String sourceComponent, String targetComponent) {
        this.id = id;
        this.ruleName = ruleName;
        this.severity = severity;
        this.description = description;
        this.sourceComponent = sourceComponent;
        this.targetComponent = targetComponent;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getRuleName() { return ruleName; }
    public void setRuleName(String ruleName) { this.ruleName = ruleName; }
    public String getSeverity() { return severity; }
    public void setSeverity(String severity) { this.severity = severity; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getSourceComponent() { return sourceComponent; }
    public void setSourceComponent(String sourceComponent) { this.sourceComponent = sourceComponent; }
    public String getTargetComponent() { return targetComponent; }
    public void setTargetComponent(String targetComponent) { this.targetComponent = targetComponent; }
    public List<String> getCyclePath() { return cyclePath; }
    public void setCyclePath(List<String> cyclePath) { this.cyclePath = cyclePath; }
    public String getRemediationAdvice() { return remediationAdvice; }
    public void setRemediationAdvice(String remediationAdvice) { this.remediationAdvice = remediationAdvice; }
}
