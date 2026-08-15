package com.archlens.parser;

import com.archlens.model.CodeEdge;
import com.archlens.model.CodeNode;
import com.archlens.model.EdgeType;
import com.archlens.model.NodeType;
import com.github.javaparser.JavaParser;
import com.github.javaparser.ParseResult;
import com.github.javaparser.ast.CompilationUnit;
import com.github.javaparser.ast.body.*;
import com.github.javaparser.ast.expr.AnnotationExpr;
import com.github.javaparser.ast.expr.MethodCallExpr;
import org.springframework.stereotype.Component;

import java.util.*;

@Component
public class JavaAstParser {

    private final JavaParser javaParser;

    public JavaAstParser() {
        this.javaParser = new JavaParser();
    }

    public static class ParsedFileResult {
        private final List<CodeNode> nodes = new ArrayList<>();
        private final List<CodeEdge> edges = new ArrayList<>();
        private final List<String> unresolvedCalls = new ArrayList<>();
        private final List<String> fieldTypes = new ArrayList<>();

        public List<CodeNode> getNodes() { return nodes; }
        public List<CodeEdge> getEdges() { return edges; }
        public List<String> getUnresolvedCalls() { return unresolvedCalls; }
        public List<String> getFieldTypes() { return fieldTypes; }
    }

    public ParsedFileResult parseJavaCode(String fileName, String sourceCode) {
        ParsedFileResult result = new ParsedFileResult();
        if (sourceCode == null || sourceCode.trim().isEmpty()) {
            return result;
        }

        ParseResult<CompilationUnit> parseResult = javaParser.parse(sourceCode);
        if (!parseResult.isSuccessful() || parseResult.getResult().isEmpty()) {
            return result;
        }

        CompilationUnit cu = parseResult.getResult().get();
        String packageName = cu.getPackageDeclaration()
                .map(pd -> pd.getName().asString())
                .orElse("default");

        // Parse types (Classes, Interfaces, Records, Enums)
        for (TypeDeclaration<?> typeDecl : cu.getTypes()) {
            String className = typeDecl.getNameAsString();
            String classId = packageName + "." + className;

            List<String> annotations = extractAnnotations(typeDecl.getAnnotations());
            NodeType nodeType = determineNodeType(typeDecl, annotations);
            String classBasePath = getClassBasePath(typeDecl);

            CodeNode classNode = new CodeNode(classId, className, nodeType, packageName);
            classNode.setClassName(className);
            classNode.setAnnotations(annotations);
            classNode.setFilePath(fileName);
            classNode.setSourceCode(typeDecl.toString());
            classNode.setLinesOfCode(typeDecl.getRange().map(r -> r.end.line - r.begin.line + 1).orElse(1));
            typeDecl.getRange().ifPresent(r -> {
                classNode.setStartLine(r.begin.line);
                classNode.setEndLine(r.end.line);
            });

            // Extract complexity estimate
            int cyclomaticComplexity = 1;

            // Extract Fields (Dependencies / Injections)
            for (FieldDeclaration field : typeDecl.getFields()) {
                for (VariableDeclarator var : field.getVariables()) {
                    String fieldType = var.getTypeAsString();
                    result.getFieldTypes().add(fieldType);
                    classNode.addMetadata("field:" + var.getNameAsString(), fieldType);
                }
            }

            // Extract Methods & Endpoints
            for (MethodDeclaration method : typeDecl.getMethods()) {
                String methodName = method.getNameAsString();
                String methodId = classId + "#" + methodName;
                List<String> methodAnnotations = extractAnnotations(method.getAnnotations());

                // Cyclomatic complexity rough estimation (if, for, while, switch, catch)
                long branches = method.findAll(com.github.javaparser.ast.stmt.IfStmt.class).size()
                        + method.findAll(com.github.javaparser.ast.stmt.ForStmt.class).size()
                        + method.findAll(com.github.javaparser.ast.stmt.WhileStmt.class).size()
                        + method.findAll(com.github.javaparser.ast.stmt.CatchClause.class).size();
                cyclomaticComplexity += branches;

                // Check if this method exposes an HTTP Endpoint
                String httpMethod = getHttpMethod(methodAnnotations);
                String path = getHttpPath(method, classBasePath);

                if (httpMethod != null || (nodeType == NodeType.CONTROLLER && path != null)) {
                    String endpointPath = path != null ? path : (classBasePath + "/" + methodName.toLowerCase());
                    if (endpointPath.isEmpty()) endpointPath = "/";
                    String endpointId = (httpMethod != null ? httpMethod : "HTTP") + " " + endpointPath;
                    CodeNode endpointNode = new CodeNode(endpointId, endpointPath, NodeType.ENDPOINT, packageName);
                    endpointNode.setClassName(className);
                    endpointNode.setSignature((httpMethod != null ? httpMethod : "ANY") + " " + endpointPath);
                    endpointNode.addMetadata("httpMethod", httpMethod != null ? httpMethod : "ANY");
                    endpointNode.addMetadata("controllerClass", className);
                    result.getNodes().add(endpointNode);

                    // Edge: Controller EXPOSES Endpoint
                    result.getEdges().add(new CodeEdge(classId, endpointId, EdgeType.EXPOSES, "Exposes " + endpointId));
                    // Edge: Endpoint CALLS Method
                    result.getEdges().add(new CodeEdge(endpointId, classId, EdgeType.CALLS, "Routes to " + methodName));
                }

                // Check if Event Listener or Kafka
                if (methodAnnotations.stream().anyMatch(a -> a.contains("KafkaListener") || a.contains("EventListener"))) {
                    CodeNode listenerNode = new CodeNode(methodId + "_Listener", methodName + " [Consumer]", NodeType.EVENT_LISTENER, packageName);
                    result.getNodes().add(listenerNode);
                    result.getEdges().add(new CodeEdge(listenerNode.getId(), classId, EdgeType.CALLS, "Invokes on event"));
                }

                // Extract Method Calls inside this method body
                method.findAll(MethodCallExpr.class).forEach(mce -> {
                    String calledMethod = mce.getNameAsString();
                    mce.getScope().ifPresent(scope -> {
                        result.getUnresolvedCalls().add(scope.toString() + "." + calledMethod);
                    });
                });
            }

            classNode.setComplexity(cyclomaticComplexity);
            result.getNodes().add(classNode);
        }

        return result;
    }

    private List<String> extractAnnotations(List<AnnotationExpr> annotations) {
        List<String> result = new ArrayList<>();
        if (annotations != null) {
            for (AnnotationExpr a : annotations) {
                result.add(a.getNameAsString());
            }
        }
        return result;
    }

    private String extractAnnotationValue(AnnotationExpr ann) {
        if (ann.isSingleMemberAnnotationExpr()) {
            String val = ann.asSingleMemberAnnotationExpr().getMemberValue().toString();
            return val.replaceAll("^\"|\"$", "");
        } else if (ann.isNormalAnnotationExpr()) {
            for (var pair : ann.asNormalAnnotationExpr().getPairs()) {
                String pairName = pair.getNameAsString();
                if ("value".equals(pairName) || "path".equals(pairName)) {
                    return pair.getValue().toString().replaceAll("^\"|\"$", "");
                }
            }
        }
        return null;
    }

    private String getClassBasePath(TypeDeclaration<?> typeDecl) {
        for (AnnotationExpr ann : typeDecl.getAnnotations()) {
            if ("RequestMapping".equals(ann.getNameAsString())) {
                String val = extractAnnotationValue(ann);
                if (val != null && !val.isEmpty()) {
                    return val.startsWith("/") ? val : "/" + val;
                }
            }
        }
        return "";
    }

    private NodeType determineNodeType(TypeDeclaration<?> typeDecl, List<String> annotations) {
        for (String ann : annotations) {
            if (ann.equals("RestController") || ann.equals("Controller")) {
                return NodeType.CONTROLLER;
            }
            if (ann.equals("Service")) {
                return NodeType.SERVICE;
            }
            if (ann.equals("Repository")) {
                return NodeType.REPOSITORY;
            }
            if (ann.equals("Entity") || ann.equals("Table") || ann.equals("Document")) {
                return NodeType.ENTITY;
            }
            if (ann.equals("Configuration")) {
                return NodeType.CONFIGURATION;
            }
            if (ann.equals("Component")) {
                return NodeType.COMPONENT;
            }
        }
        String name = typeDecl.getNameAsString();
        if (name.endsWith("Controller")) return NodeType.CONTROLLER;
        if (name.endsWith("Service") || name.endsWith("ServiceImpl")) return NodeType.SERVICE;
        if (name.endsWith("Repository") || name.endsWith("Dao")) return NodeType.REPOSITORY;
        if (name.endsWith("Entity") || name.endsWith("Model")) return NodeType.ENTITY;
        if (name.endsWith("Config") || name.endsWith("Configuration")) return NodeType.CONFIGURATION;

        if (typeDecl.isClassOrInterfaceDeclaration() && typeDecl.asClassOrInterfaceDeclaration().isInterface()) {
            return NodeType.INTERFACE;
        }

        return NodeType.COMPONENT;
    }

    private String getHttpMethod(List<String> annotations) {
        for (String ann : annotations) {
            if (ann.equals("GetMapping")) return "GET";
            if (ann.equals("PostMapping")) return "POST";
            if (ann.equals("PutMapping")) return "PUT";
            if (ann.equals("DeleteMapping")) return "DELETE";
            if (ann.equals("PatchMapping")) return "PATCH";
            if (ann.equals("RequestMapping")) return "REQUEST";
        }
        return null;
    }

    private String getHttpPath(MethodDeclaration method, String classBasePath) {
        for (AnnotationExpr ann : method.getAnnotations()) {
            String annName = ann.getNameAsString();
            if (annName.endsWith("Mapping")) {
                String val = extractAnnotationValue(ann);
                String subPath = (val != null && !val.isEmpty()) ? (val.startsWith("/") ? val : "/" + val) : "";
                String base = (classBasePath != null && !classBasePath.isEmpty()) ? (classBasePath.startsWith("/") ? classBasePath : "/" + classBasePath) : "";
                String full = base + subPath;
                if (full.isEmpty()) {
                    return "/" + method.getNameAsString().toLowerCase();
                }
                return full;
            }
        }
        return null;
    }
}
