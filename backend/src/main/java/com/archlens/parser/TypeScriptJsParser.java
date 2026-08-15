package com.archlens.parser;

import com.archlens.model.CodeEdge;
import com.archlens.model.CodeNode;
import com.archlens.model.EdgeType;
import com.archlens.model.NodeType;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
public class TypeScriptJsParser {

    private static final Pattern IMPORT_PATTERN = Pattern.compile("import\\s+(?:\\{([^}]+)\\}|([\\w*]+))\\s+from\\s+['\"]([^'\"]+)['\"]");
    private static final Pattern COMPONENT_FUNC_PATTERN = Pattern.compile("(?:export\\s+)?(?:default\\s+)?(?:const|function)\\s+([A-Z]\\w+)\\s*(?:=\\s*(?:React\\.)?FC|:\\s*React\\.FC|\\()");
    private static final Pattern CLASS_PATTERN = Pattern.compile("(?:export\\s+)?class\\s+(\\w+)(?:\\s+extends\\s+(\\w+))?(?:\\s+implements\\s+([\\w,\\s]+))?");
    private static final Pattern ROUTE_PATTERN = Pattern.compile("(?:app|router)\\.(get|post|put|delete|patch)\\s*\\(\\s*['\"]([^'\"]+)['\"]");
    private static final Pattern NEXTJS_API_PATTERN = Pattern.compile("export\\s+(?:async\\s+)?function\\s+(GET|POST|PUT|DELETE|PATCH)\\s*\\(");
    private static final Pattern SERVICE_OR_HOOK_PATTERN = Pattern.compile("(?:export\\s+)?(?:const|function)\\s+(use[A-Z]\\w+|[a-z]\\w+Service|[a-z]\\w+Api|fetch\\w+|get\\w+|save\\w+)\\s*\\(");

    public JavaAstParser.ParsedFileResult parseTypeScriptJs(String fileName, String sourceCode) {
        JavaAstParser.ParsedFileResult result = new JavaAstParser.ParsedFileResult();
        if (sourceCode == null || sourceCode.trim().isEmpty()) {
            return result;
        }

        String simpleFileName = fileName.contains("/") ? fileName.substring(fileName.lastIndexOf('/') + 1) : fileName;
        if (simpleFileName.contains("\\")) {
            simpleFileName = simpleFileName.substring(simpleFileName.lastIndexOf('\\') + 1);
        }
        String baseName = simpleFileName.replaceAll("\\.(tsx?|jsx?|mjs|cjs)$", "");
        String packageOrDir = fileName.contains("/") ? fileName.substring(0, fileName.lastIndexOf('/')) : "frontend";

        int lines = sourceCode.split("\r\n|\r|\n").length;
        boolean hasNodes = false;

        // 1. Check Classes
        Matcher classMatcher = CLASS_PATTERN.matcher(sourceCode);
        while (classMatcher.find()) {
            String className = classMatcher.group(1);
            NodeType type = determineJsNodeType(className, fileName);
            CodeNode node = new CodeNode(packageOrDir + "." + className, className, type, packageOrDir);
            node.setClassName(className);
            node.setFilePath(fileName);
            node.setLinesOfCode(lines);
            node.setSourceCode(sourceCode);
            result.getNodes().add(node);
            hasNodes = true;
        }

        // 2. Check React Components
        Matcher compMatcher = COMPONENT_FUNC_PATTERN.matcher(sourceCode);
        while (compMatcher.find()) {
            String compName = compMatcher.group(1);
            String nodeId = packageOrDir + "." + compName;
            CodeNode node = new CodeNode(nodeId, compName, NodeType.COMPONENT, packageOrDir);
            node.setClassName(compName);
            node.setFilePath(fileName);
            node.setLinesOfCode(lines);
            node.setSourceCode(sourceCode);
            result.getNodes().add(node);
            hasNodes = true;
        }

        // 3. Check Express / Router Routes
        Matcher routeMatcher = ROUTE_PATTERN.matcher(sourceCode);
        while (routeMatcher.find()) {
            String method = routeMatcher.group(1).toUpperCase();
            String path = routeMatcher.group(2);
            String endpointId = method + " " + path;
            CodeNode endpointNode = new CodeNode(endpointId, path, NodeType.ENDPOINT, packageOrDir);
            endpointNode.setSignature(method + " " + path);
            endpointNode.addMetadata("httpMethod", method);
            endpointNode.setFilePath(fileName);
            result.getNodes().add(endpointNode);
            hasNodes = true;
        }

        // 4. Check Next.js App Router API Routes
        Matcher nextApiMatcher = NEXTJS_API_PATTERN.matcher(sourceCode);
        while (nextApiMatcher.find()) {
            String method = nextApiMatcher.group(1).toUpperCase();
            String path = "/" + packageOrDir.replaceAll("^app/api|^api|/route$", "");
            String endpointId = method + " " + path;
            CodeNode endpointNode = new CodeNode(endpointId, path, NodeType.ENDPOINT, packageOrDir);
            endpointNode.setSignature(method + " " + path);
            endpointNode.addMetadata("httpMethod", method);
            endpointNode.setFilePath(fileName);
            result.getNodes().add(endpointNode);
            hasNodes = true;
        }

        // 5. Fallback single Node for the file if no explicit class/component matched
        if (!hasNodes) {
            NodeType type = determineJsNodeType(baseName, fileName);
            CodeNode fileNode = new CodeNode(packageOrDir + "." + baseName, baseName, type, packageOrDir);
            fileNode.setClassName(baseName);
            fileNode.setFilePath(fileName);
            fileNode.setLinesOfCode(lines);
            fileNode.setSourceCode(sourceCode);
            result.getNodes().add(fileNode);
        }

        // 6. Extract Imports & Dependencies
        Matcher importMatcher = IMPORT_PATTERN.matcher(sourceCode);
        while (importMatcher.find()) {
            String namedImports = importMatcher.group(1);
            String defaultImport = importMatcher.group(2);
            String importPath = importMatcher.group(3);

            if (namedImports != null) {
                for (String sym : namedImports.split(",")) {
                    String clean = sym.trim().replaceAll("\\s+as\\s+.*", "");
                    if (!clean.isEmpty()) {
                        result.getFieldTypes().add(clean);
                        result.getUnresolvedCalls().add(clean);
                    }
                }
            }
            if (defaultImport != null && !defaultImport.isEmpty()) {
                result.getFieldTypes().add(defaultImport.trim());
                result.getUnresolvedCalls().add(defaultImport.trim());
            }

            // If import is a local file, extract base target
            if (importPath.startsWith("./") || importPath.startsWith("../") || importPath.startsWith("@/")) {
                String targetBase = importPath.substring(importPath.lastIndexOf('/') + 1);
                result.getFieldTypes().add(targetBase);
            }
        }

        return result;
    }

    private NodeType determineJsNodeType(String name, String fileName) {
        String lowerPath = (fileName + "/" + name).toLowerCase();
        if (lowerPath.contains("controller") || lowerPath.contains("route") || lowerPath.contains("api")) {
            return NodeType.CONTROLLER;
        }
        if (lowerPath.contains("service") || lowerPath.contains("store") || lowerPath.contains("hook") || lowerPath.contains("use")) {
            return NodeType.SERVICE;
        }
        if (lowerPath.contains("repository") || lowerPath.contains("db") || lowerPath.contains("prisma") || lowerPath.contains("model")) {
            return NodeType.REPOSITORY;
        }
        if (lowerPath.contains("entity") || lowerPath.contains("schema") || lowerPath.contains("interface") || lowerPath.contains("types")) {
            return NodeType.ENTITY;
        }
        if (lowerPath.contains("config") || lowerPath.contains("setup")) {
            return NodeType.CONFIGURATION;
        }
        return NodeType.COMPONENT;
    }
}
