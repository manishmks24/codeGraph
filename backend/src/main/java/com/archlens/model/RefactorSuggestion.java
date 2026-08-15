package com.archlens.model;

import java.util.ArrayList;
import java.util.List;

public class RefactorSuggestion {
    private String id;
    private String targetClass;
    private String filePath;
    private String goal;
    private String rationale;
    private String originalCode;
    private String refactoredCode;
    private String diffUnified;
    private List<String> appliedPatterns = new ArrayList<>();
    private List<String> affectedDependencies = new ArrayList<>();

    public RefactorSuggestion() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getTargetClass() { return targetClass; }
    public void setTargetClass(String targetClass) { this.targetClass = targetClass; }
    public String getFilePath() { return filePath; }
    public void setFilePath(String filePath) { this.filePath = filePath; }
    public String getGoal() { return goal; }
    public void setGoal(String goal) { this.goal = goal; }
    public String getRationale() { return rationale; }
    public void setRationale(String rationale) { this.rationale = rationale; }
    public String getOriginalCode() { return originalCode; }
    public void setOriginalCode(String originalCode) { this.originalCode = originalCode; }
    public String getRefactoredCode() { return refactoredCode; }
    public void setRefactoredCode(String refactoredCode) { this.refactoredCode = refactoredCode; }
    public String getDiffUnified() { return diffUnified; }
    public void setDiffUnified(String diffUnified) { this.diffUnified = diffUnified; }
    public List<String> getAppliedPatterns() { return appliedPatterns; }
    public void setAppliedPatterns(List<String> appliedPatterns) { this.appliedPatterns = appliedPatterns; }
    public List<String> getAffectedDependencies() { return affectedDependencies; }
    public void setAffectedDependencies(List<String> affectedDependencies) { this.affectedDependencies = affectedDependencies; }
}
