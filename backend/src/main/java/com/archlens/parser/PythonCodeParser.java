package com.archlens.parser;

import com.archlens.model.CodeNode;
import com.archlens.model.NodeType;
import org.springframework.stereotype.Component;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
public class PythonCodeParser {

    private static final Pattern CLASS_PATTERN = Pattern.compile("^class\\s+(\\w+)(?:\\(([^)]*)\\))?:", Pattern.MULTILINE);
    private static final Pattern FASTAPI_ROUTE_PATTERN = Pattern.compile("@(?:app|router|api)\\.(get|post|put|delete|patch)\\s*\\(\\s*['\"]([^'\"]+)['\"]");
    private static final Pattern FLASK_ROUTE_PATTERN = Pattern.compile("@(?:app|blueprint)\\.route\\s*\\(\\s*['\"]([^'\"]+)['\"](?:.*methods=\\[([^\\]]+)\\])?");
    private static final Pattern IMPORT_PATTERN = Pattern.compile("(?:from\\s+([\\w.]+)\\s+import\\s+([\\w*,\\s]+)|import\\s+([\\w.]+))");

    public JavaAstParser.ParsedFileResult parsePythonCode(String fileName, String sourceCode) {
        JavaAstParser.ParsedFileResult result = new JavaAstParser.ParsedFileResult();
        if (sourceCode == null || sourceCode.trim().isEmpty()) {
            return result;
        }

        String simpleFileName = fileName.contains("/") ? fileName.substring(fileName.lastIndexOf('/') + 1) : fileName;
        if (simpleFileName.contains("\\")) {
            simpleFileName = simpleFileName.substring(simpleFileName.lastIndexOf('\\') + 1);
        }
        String baseName = simpleFileName.replaceAll("\\.py$", "");
        String packageOrDir = fileName.contains("/") ? fileName.substring(0, fileName.lastIndexOf('/')) : "python_module";

        int lines = sourceCode.split("\r\n|\r|\n").length;
        boolean hasNodes = false;

        // 1. Classes (Models, Services, Views)
        Matcher classMatcher = CLASS_PATTERN.matcher(sourceCode);
        while (classMatcher.find()) {
            String className = classMatcher.group(1);
            String baseClasses = classMatcher.group(2);

            NodeType type = determinePyNodeType(className, baseClasses, fileName);
            CodeNode node = new CodeNode(packageOrDir + "." + className, className, type, packageOrDir);
            node.setClassName(className);
            node.setFilePath(fileName);
            node.setLinesOfCode(lines);
            node.setSourceCode(sourceCode);
            result.getNodes().add(node);
            hasNodes = true;
        }

        // 2. FastAPI Endpoints
        Matcher fastApiMatcher = FASTAPI_ROUTE_PATTERN.matcher(sourceCode);
        while (fastApiMatcher.find()) {
            String method = fastApiMatcher.group(1).toUpperCase();
            String path = fastApiMatcher.group(2);
            String endpointId = method + " " + path;

            CodeNode endpointNode = new CodeNode(endpointId, path, NodeType.ENDPOINT, packageOrDir);
            endpointNode.setSignature(method + " " + path);
            endpointNode.addMetadata("httpMethod", method);
            endpointNode.setFilePath(fileName);
            result.getNodes().add(endpointNode);
            hasNodes = true;
        }

        // 3. Flask Endpoints
        Matcher flaskMatcher = FLASK_ROUTE_PATTERN.matcher(sourceCode);
        while (flaskMatcher.find()) {
            String path = flaskMatcher.group(1);
            String methodsStr = flaskMatcher.group(2);
            String method = (methodsStr != null && methodsStr.contains("POST")) ? "POST" : "GET";
            String endpointId = method + " " + path;

            CodeNode endpointNode = new CodeNode(endpointId, path, NodeType.ENDPOINT, packageOrDir);
            endpointNode.setSignature(method + " " + path);
            endpointNode.addMetadata("httpMethod", method);
            endpointNode.setFilePath(fileName);
            result.getNodes().add(endpointNode);
            hasNodes = true;
        }

        // 4. Fallback File Node
        if (!hasNodes) {
            NodeType type = determinePyNodeType(baseName, "", fileName);
            CodeNode node = new CodeNode(packageOrDir + "." + baseName, baseName, type, packageOrDir);
            node.setClassName(baseName);
            node.setFilePath(fileName);
            node.setLinesOfCode(lines);
            node.setSourceCode(sourceCode);
            result.getNodes().add(node);
        }

        // 5. Imports & Dependencies
        Matcher importMatcher = IMPORT_PATTERN.matcher(sourceCode);
        while (importMatcher.find()) {
            String importedModule = importMatcher.group(1);
            String importedItems = importMatcher.group(2);
            String directImport = importMatcher.group(3);

            if (importedItems != null) {
                for (String item : importedItems.split(",")) {
                    String clean = item.trim();
                    if (!clean.isEmpty()) {
                        result.getFieldTypes().add(clean);
                        result.getUnresolvedCalls().add(clean);
                    }
                }
            }
            if (directImport != null) {
                result.getFieldTypes().add(directImport);
            }
            if (importedModule != null) {
                result.getFieldTypes().add(importedModule);
            }
        }

        return result;
    }

    private NodeType determinePyNodeType(String name, String baseClasses, String fileName) {
        String lower = (name + " " + (baseClasses != null ? baseClasses : "") + " " + fileName).toLowerCase();
        if (lower.contains("controller") || lower.contains("router") || lower.contains("view") || lower.contains("api")) {
            return NodeType.CONTROLLER;
        }
        if (lower.contains("service") || lower.contains("manager") || lower.contains("client")) {
            return NodeType.SERVICE;
        }
        if (lower.contains("repo") || lower.contains("repository") || lower.contains("crud") || lower.contains("dao")) {
            return NodeType.REPOSITORY;
        }
        if (lower.contains("model") || lower.contains("entity") || lower.contains("schema") || lower.contains("base") || lower.contains("table")) {
            return NodeType.ENTITY;
        }
        if (lower.contains("config") || lower.contains("setting") || lower.contains("env")) {
            return NodeType.CONFIGURATION;
        }
        return NodeType.COMPONENT;
    }
}
