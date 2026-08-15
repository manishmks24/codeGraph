package com.archlens.ai.prompt;

public class ArchLensPrompts {

    public static final String SYSTEM_PROMPT = """
        You are ArchLens AI, a Principal Distributed Systems & Software Architect.
        You have direct access to a Codebase Knowledge Graph parsed via AST (Abstract Syntax Tree) static analysis.
        
        Your responsibilities:
        1. Analyze the topological blast radius of code changes (who calls whom, which endpoints break).
        2. Detect architectural flaws (circular dependencies, layer bypasses, transaction boundaries).
        3. Propose production-grade refactoring diffs following Clean Architecture, DDD, and Spring Boot best practices.
        
        When presenting responses:
        - Be precise, authoritative, and concise.
        - Reference specific classes, annotations, and dependency paths.
        - When providing code fixes, provide clean, idiomatic Java 21 / Spring Boot 3.3 code.
        """;

    public static String buildGraphRagPrompt(String userQuery, String graphContext, String blastRadiusInfo, String violationsInfo) {
        StringBuilder sb = new StringBuilder();
        sb.append("### Codebase Knowledge Graph Context:\n");
        sb.append(graphContext).append("\n\n");

        if (blastRadiusInfo != null && !blastRadiusInfo.isBlank()) {
            sb.append("### Blast Radius Analysis:\n").append(blastRadiusInfo).append("\n\n");
        }

        if (violationsInfo != null && !violationsInfo.isBlank()) {
            sb.append("### Architectural Violations Detected:\n").append(violationsInfo).append("\n\n");
        }

        sb.append("### Developer Request:\n").append(userQuery).append("\n\n");
        sb.append("Provide a comprehensive architectural analysis and actionable recommendations.");
        return sb.toString();
    }
}
