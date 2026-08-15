package com.archlens.model;

import java.util.*;

public class CodeNode {
    private String id;
    private String name;
    private String packageName;
    private String className;
    private NodeType type;
    private List<String> annotations = new ArrayList<>();
    private String signature;
    private String filePath;
    private String sourceCode;
    private int startLine;
    private int endLine;
    private int linesOfCode;
    private int complexity = 1;
    private Map<String, Object> metadata = new HashMap<>();

    public CodeNode() {}

    public CodeNode(String id, String name, NodeType type, String packageName) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.packageName = packageName;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getPackageName() {
        return packageName;
    }

    public void setPackageName(String packageName) {
        this.packageName = packageName;
    }

    public String getClassName() {
        return className;
    }

    public void setClassName(String className) {
        this.className = className;
    }

    public NodeType getType() {
        return type;
    }

    public void setType(NodeType type) {
        this.type = type;
    }

    public List<String> getAnnotations() {
        return annotations;
    }

    public void setAnnotations(List<String> annotations) {
        this.annotations = annotations != null ? annotations : new ArrayList<>();
    }

    public String getSignature() {
        return signature;
    }

    public void setSignature(String signature) {
        this.signature = signature;
    }

    public String getFilePath() {
        return filePath;
    }

    public void setFilePath(String filePath) {
        this.filePath = filePath;
    }

    public String getSourceCode() {
        return sourceCode;
    }

    public void setSourceCode(String sourceCode) {
        this.sourceCode = sourceCode;
    }

    public int getStartLine() {
        return startLine;
    }

    public void setStartLine(int startLine) {
        this.startLine = startLine;
    }

    public int getEndLine() {
        return endLine;
    }

    public void setEndLine(int endLine) {
        this.endLine = endLine;
    }

    public int getLinesOfCode() {
        return linesOfCode;
    }

    public void setLinesOfCode(int linesOfCode) {
        this.linesOfCode = linesOfCode;
    }

    public int getComplexity() {
        return complexity;
    }

    public void setComplexity(int complexity) {
        this.complexity = complexity;
    }

    public Map<String, Object> getMetadata() {
        return metadata;
    }

    public void setMetadata(Map<String, Object> metadata) {
        this.metadata = metadata != null ? metadata : new HashMap<>();
    }

    public void addMetadata(String key, Object value) {
        this.metadata.put(key, value);
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        CodeNode codeNode = (CodeNode) o;
        return Objects.equals(id, codeNode.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    @Override
    public String toString() {
        return "CodeNode{" +
                "id='" + id + '\'' +
                ", name='" + name + '\'' +
                ", type=" + type +
                ", packageName='" + packageName + '\'' +
                '}';
    }
}
