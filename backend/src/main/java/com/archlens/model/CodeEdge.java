package com.archlens.model;

import java.util.HashMap;
import java.util.Map;
import java.util.Objects;

public class CodeEdge {
    private String id;
    private String sourceId;
    private String targetId;
    private EdgeType type;
    private String label;
    private int weight = 1;
    private Map<String, Object> metadata = new HashMap<>();

    public CodeEdge() {}

    public CodeEdge(String sourceId, String targetId, EdgeType type, String label) {
        this.id = sourceId + "->" + type.name() + "->" + targetId;
        this.sourceId = sourceId;
        this.targetId = targetId;
        this.type = type;
        this.label = label;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getSourceId() {
        return sourceId;
    }

    public void setSourceId(String sourceId) {
        this.sourceId = sourceId;
    }

    public String getTargetId() {
        return targetId;
    }

    public void setTargetId(String targetId) {
        this.targetId = targetId;
    }

    public EdgeType getType() {
        return type;
    }

    public void setType(EdgeType type) {
        this.type = type;
    }

    public String getLabel() {
        return label;
    }

    public void setLabel(String label) {
        this.label = label;
    }

    public int getWeight() {
        return weight;
    }

    public void setWeight(int weight) {
        this.weight = weight;
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
        CodeEdge codeEdge = (CodeEdge) o;
        return Objects.equals(id, codeEdge.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    @Override
    public String toString() {
        return "CodeEdge{" +
                "sourceId='" + sourceId + '\'' +
                ", targetId='" + targetId + '\'' +
                ", type=" + type +
                ", label='" + label + '\'' +
                '}';
    }
}
