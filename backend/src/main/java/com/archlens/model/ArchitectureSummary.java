package com.archlens.model;

import java.util.HashMap;
import java.util.Map;

public class ArchitectureSummary {
    private int totalClasses;
    private int totalControllers;
    private int totalServices;
    private int totalRepositories;
    private int totalEntities;
    private int totalEndpoints;
    private int totalDependencies;
    private int totalViolations;
    private double healthScore; // 0 to 100
    private Map<String, Integer> nodeTypeCounts = new HashMap<>();
    private Map<String, Integer> edgeTypeCounts = new HashMap<>();

    public ArchitectureSummary() {}

    public int getTotalClasses() { return totalClasses; }
    public void setTotalClasses(int totalClasses) { this.totalClasses = totalClasses; }
    public int getTotalControllers() { return totalControllers; }
    public void setTotalControllers(int totalControllers) { this.totalControllers = totalControllers; }
    public int getTotalServices() { return totalServices; }
    public void setTotalServices(int totalServices) { this.totalServices = totalServices; }
    public int getTotalRepositories() { return totalRepositories; }
    public void setTotalRepositories(int totalRepositories) { this.totalRepositories = totalRepositories; }
    public int getTotalEntities() { return totalEntities; }
    public void setTotalEntities(int totalEntities) { this.totalEntities = totalEntities; }
    public int getTotalEndpoints() { return totalEndpoints; }
    public void setTotalEndpoints(int totalEndpoints) { this.totalEndpoints = totalEndpoints; }
    public int getTotalDependencies() { return totalDependencies; }
    public void setTotalDependencies(int totalDependencies) { this.totalDependencies = totalDependencies; }
    public int getTotalViolations() { return totalViolations; }
    public void setTotalViolations(int totalViolations) { this.totalViolations = totalViolations; }
    public double getHealthScore() { return healthScore; }
    public void setHealthScore(double healthScore) { this.healthScore = healthScore; }
    public Map<String, Integer> getNodeTypeCounts() { return nodeTypeCounts; }
    public void setNodeTypeCounts(Map<String, Integer> nodeTypeCounts) { this.nodeTypeCounts = nodeTypeCounts; }
    public Map<String, Integer> getEdgeTypeCounts() { return edgeTypeCounts; }
    public void setEdgeTypeCounts(Map<String, Integer> edgeTypeCounts) { this.edgeTypeCounts = edgeTypeCounts; }
}
