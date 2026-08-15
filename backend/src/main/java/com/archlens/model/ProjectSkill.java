package com.archlens.model;

import java.time.Instant;
import java.util.List;
import java.util.Map;

public class ProjectSkill {
    private String skillName;
    private String version;
    private String description;
    private String fullMarkdown;
    private String stackSummary;
    private List<String> architecturalInvariants;
    private List<String> layerRules;
    private List<String> workflows;
    private Map<String, String> componentRoles;
    private String generatedAt;

    public ProjectSkill() {
        this.generatedAt = Instant.now().toString();
    }

    public String getSkillName() { return skillName; }
    public void setSkillName(String skillName) { this.skillName = skillName; }

    public String getVersion() { return version; }
    public void setVersion(String version) { this.version = version; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getFullMarkdown() { return fullMarkdown; }
    public void setFullMarkdown(String fullMarkdown) { this.fullMarkdown = fullMarkdown; }

    public String getStackSummary() { return stackSummary; }
    public void setStackSummary(String stackSummary) { this.stackSummary = stackSummary; }

    public List<String> getArchitecturalInvariants() { return architecturalInvariants; }
    public void setArchitecturalInvariants(List<String> architecturalInvariants) { this.architecturalInvariants = architecturalInvariants; }

    public List<String> getLayerRules() { return layerRules; }
    public void setLayerRules(List<String> layerRules) { this.layerRules = layerRules; }

    public List<String> getWorkflows() { return workflows; }
    public void setWorkflows(List<String> workflows) { this.workflows = workflows; }

    public Map<String, String> getComponentRoles() { return componentRoles; }
    public void setComponentRoles(Map<String, String> componentRoles) { this.componentRoles = componentRoles; }

    public String getGeneratedAt() { return generatedAt; }
    public void setGeneratedAt(String generatedAt) { this.generatedAt = generatedAt; }
}
