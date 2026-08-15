package com.archlens.graph;

import com.archlens.model.CodeEdge;
import com.archlens.model.CodeGraph;
import com.archlens.model.CodeNode;
import com.archlens.model.NodeType;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class GraphStore {

    private final Map<String, CodeGraph> graphStore = new ConcurrentHashMap<>();
    private String activeGraphId = null;

    public void saveGraph(CodeGraph graph) {
        if (graph != null) {
            graphStore.put(graph.getId(), graph);
            this.activeGraphId = graph.getId();
        }
    }

    public CodeGraph getActiveGraph() {
        if (activeGraphId != null) {
            return graphStore.get(activeGraphId);
        }
        if (!graphStore.isEmpty()) {
            return graphStore.values().iterator().next();
        }
        return null;
    }

    public CodeGraph getGraph(String id) {
        return graphStore.get(id);
    }

    public void clear() {
        graphStore.clear();
        activeGraphId = null;
    }

    public List<CodeNode> findNodesByType(NodeType type) {
        CodeGraph active = getActiveGraph();
        if (active == null) return Collections.emptyList();
        return active.getNodes().stream()
                .filter(n -> n.getType() == type)
                .toList();
    }

    public List<CodeNode> searchNodes(String query) {
        CodeGraph active = getActiveGraph();
        if (active == null || query == null || query.isBlank()) return Collections.emptyList();
        String lowerQuery = query.toLowerCase();
        return active.getNodes().stream()
                .filter(n -> (n.getName() != null && n.getName().toLowerCase().contains(lowerQuery)) ||
                             (n.getClassName() != null && n.getClassName().toLowerCase().contains(lowerQuery)) ||
                             (n.getSignature() != null && n.getSignature().toLowerCase().contains(lowerQuery)))
                .toList();
    }
}
