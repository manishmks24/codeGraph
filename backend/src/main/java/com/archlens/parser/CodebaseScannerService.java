package com.archlens.parser;

import com.archlens.model.*;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.*;
import java.util.stream.Stream;

@Service
public class CodebaseScannerService {

    private final JavaAstParser javaAstParser;
    private final TypeScriptJsParser tsJsParser;
    private final PythonCodeParser pythonParser;

    public CodebaseScannerService(JavaAstParser javaAstParser,
                                  TypeScriptJsParser tsJsParser,
                                  PythonCodeParser pythonParser) {
        this.javaAstParser = javaAstParser;
        this.tsJsParser = tsJsParser;
        this.pythonParser = pythonParser;
    }

    public CodeGraph scanFiles(Map<String, String> filesByPath) {
        CodeGraph graph = new CodeGraph();
        Map<String, JavaAstParser.ParsedFileResult> parseResults = new HashMap<>();
        Map<String, String> simpleToFullClassName = new HashMap<>();

        // Phase 1: Parse all files according to language extension
        for (Map.Entry<String, String> entry : filesByPath.entrySet()) {
            String path = entry.getKey();
            String code = entry.getValue();

            JavaAstParser.ParsedFileResult result;
            if (path.endsWith(".java")) {
                result = javaAstParser.parseJavaCode(path, code);
            } else if (path.endsWith(".ts") || path.endsWith(".tsx") || path.endsWith(".js") || path.endsWith(".jsx")) {
                result = tsJsParser.parseTypeScriptJs(path, code);
            } else if (path.endsWith(".py")) {
                result = pythonParser.parsePythonCode(path, code);
            } else {
                // Generic file node
                result = createGenericFileResult(path, code);
            }

            parseResults.put(path, result);

            for (CodeNode node : result.getNodes()) {
                graph.addNode(node);
                if (node.getClassName() != null && node.getType() != NodeType.ENDPOINT && node.getType() != NodeType.EVENT_LISTENER) {
                    simpleToFullClassName.put(node.getClassName(), node.getId());
                }
            }

            for (CodeEdge edge : result.getEdges()) {
                graph.addEdge(edge);
            }
        }

        // Phase 2: Cross-class and cross-module dependency resolution
        for (Map.Entry<String, JavaAstParser.ParsedFileResult> entry : parseResults.entrySet()) {
            JavaAstParser.ParsedFileResult result = entry.getValue();

            for (CodeNode sourceNode : result.getNodes()) {
                if (sourceNode.getClassName() == null || sourceNode.getType() == NodeType.ENDPOINT || sourceNode.getType() == NodeType.EVENT_LISTENER) continue;

                // 2a. Injections / Imports
                for (String fieldType : result.getFieldTypes()) {
                    String targetId = simpleToFullClassName.get(fieldType);
                    if (targetId != null && !targetId.equals(sourceNode.getId())) {
                        CodeNode targetNode = graph.getNode(targetId);
                        EdgeType edgeType = EdgeType.INJECTS;
                        if (targetNode != null && targetNode.getType() == NodeType.REPOSITORY && sourceNode.getType() == NodeType.SERVICE) {
                            edgeType = EdgeType.INJECTS;
                        } else if (sourceNode.getType() == NodeType.COMPONENT) {
                            edgeType = EdgeType.IMPORTS;
                        }
                        graph.addEdge(new CodeEdge(sourceNode.getId(), targetId, edgeType, "Depends on " + fieldType));
                    }
                }

                // 2b. Method Call Resolution
                for (String unresolved : result.getUnresolvedCalls()) {
                    for (Map.Entry<String, String> classEntry : simpleToFullClassName.entrySet()) {
                        String simpleClass = classEntry.getKey();
                        String varName = Character.toLowerCase(simpleClass.charAt(0)) + (simpleClass.length() > 1 ? simpleClass.substring(1) : "");
                        if (unresolved.toLowerCase().contains(varName.toLowerCase()) || unresolved.toLowerCase().contains(simpleClass.toLowerCase())) {
                            String targetId = classEntry.getValue();
                            if (!targetId.equals(sourceNode.getId())) {
                                EdgeType callType = EdgeType.CALLS;
                                CodeNode targetNode = graph.getNode(targetId);
                                if (targetNode != null && targetNode.getType() == NodeType.ENTITY) {
                                    callType = EdgeType.WRITES_TO;
                                }
                                graph.addEdge(new CodeEdge(sourceNode.getId(), targetId, callType, "Calls " + simpleClass));
                            }
                        }
                    }
                }

                // 2c. Entity Relationships (Repository -> Entity)
                if (sourceNode.getType() == NodeType.REPOSITORY) {
                    for (CodeNode node : graph.getNodes()) {
                        if (node.getType() == NodeType.ENTITY && sourceNode.getName().startsWith(node.getName())) {
                            graph.addEdge(new CodeEdge(sourceNode.getId(), node.getId(), EdgeType.READS_FROM, "Manages Entity " + node.getName()));
                        }
                    }
                }
            }
        }

        // Phase 3: Compute Summary Stats
        computeSummaryStats(graph);
        return graph;
    }

    public CodeGraph scanDirectory(String directoryPath) throws IOException {
        File dir = new File(directoryPath);
        if (!dir.exists() || !dir.isDirectory()) {
            throw new IllegalArgumentException("Invalid directory path: " + directoryPath);
        }

        Map<String, String> files = new HashMap<>();
        try (Stream<Path> stream = Files.walk(dir.toPath())) {
            stream.filter(p -> !Files.isDirectory(p))
                    .forEach(p -> {
                        try {
                            String content = Files.readString(p);
                            files.put(p.getFileName().toString(), content);
                        } catch (IOException ignored) {}
                    });
        }
        return scanFiles(files);
    }

    private JavaAstParser.ParsedFileResult createGenericFileResult(String path, String code) {
        JavaAstParser.ParsedFileResult res = new JavaAstParser.ParsedFileResult();
        String name = path.contains("/") ? path.substring(path.lastIndexOf('/') + 1) : path;
        CodeNode node = new CodeNode(path, name, NodeType.COMPONENT, "generic");
        node.setFilePath(path);
        node.setLinesOfCode(code.split("\r\n|\r|\n").length);
        node.setSourceCode(code);
        res.getNodes().add(node);
        return res;
    }

    private void computeSummaryStats(CodeGraph graph) {
        Map<String, Object> stats = new HashMap<>();
        Map<String, Integer> nodeCounts = new HashMap<>();
        Map<String, Integer> edgeCounts = new HashMap<>();

        for (CodeNode node : graph.getNodes()) {
            nodeCounts.merge(node.getType().name(), 1, Integer::sum);
        }
        for (CodeEdge edge : graph.getEdges()) {
            edgeCounts.merge(edge.getType().name(), 1, Integer::sum);
        }

        stats.put("totalNodes", graph.getNodes().size());
        stats.put("totalEdges", graph.getEdges().size());
        stats.put("nodeTypeCounts", nodeCounts);
        stats.put("edgeTypeCounts", edgeCounts);

        graph.setSummaryStats(stats);
    }
}
