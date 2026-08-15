package com.archlens.ai;

import com.archlens.ai.prompt.ArchLensPrompts;
import com.archlens.ai.tools.ArchitectureAuditTool;
import com.archlens.ai.tools.BlastRadiusTool;
import com.archlens.ai.tools.CodeRefactorTool;
import com.archlens.graph.GraphStore;
import com.archlens.model.*;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

@Service
public class AiCopilotService {

    private final GraphStore graphStore;
    private final BlastRadiusTool blastRadiusTool;
    private final ArchitectureAuditTool auditTool;
    private final CodeRefactorTool refactorTool;
    private final GeminiClientService geminiClient;
    private final ProjectSkillGeneratorService skillGenerator;

    public AiCopilotService(GraphStore graphStore,
                            BlastRadiusTool blastRadiusTool,
                            ArchitectureAuditTool auditTool,
                            CodeRefactorTool refactorTool,
                            GeminiClientService geminiClient,
                            ProjectSkillGeneratorService skillGenerator) {
        this.graphStore = graphStore;
        this.blastRadiusTool = blastRadiusTool;
        this.auditTool = auditTool;
        this.refactorTool = refactorTool;
        this.geminiClient = geminiClient;
        this.skillGenerator = skillGenerator;
    }

    public static class ChatResponse {
        private String message;
        private List<String> agentThoughts = new ArrayList<>();
        private BlastRadiusReport blastRadiusReport;
        private List<ArchitectureViolation> violations;
        private RefactorSuggestion refactorSuggestion;
        private String modelUsed = "CodeGraph Dynamic Knowledge Engine";

        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
        public List<String> getAgentThoughts() { return agentThoughts; }
        public void setAgentThoughts(List<String> agentThoughts) { this.agentThoughts = agentThoughts; }
        public BlastRadiusReport getBlastRadiusReport() { return blastRadiusReport; }
        public void setBlastRadiusReport(BlastRadiusReport blastRadiusReport) { this.blastRadiusReport = blastRadiusReport; }
        public List<ArchitectureViolation> getViolations() { return violations; }
        public void setViolations(List<ArchitectureViolation> violations) { this.violations = violations; }
        public RefactorSuggestion getRefactorSuggestion() { return refactorSuggestion; }
        public void setRefactorSuggestion(RefactorSuggestion refactorSuggestion) { this.refactorSuggestion = refactorSuggestion; }
        public String getModelUsed() { return modelUsed; }
        public void setModelUsed(String modelUsed) { this.modelUsed = modelUsed; }
    }

    public ChatResponse processQuery(String userQuery, String geminiApiKey, String modelName) {
        ChatResponse response = new ChatResponse();
        String queryLower = userQuery.toLowerCase();
        CodeGraph graph = graphStore.getActiveGraph();
        String projectName = (graph != null && graph.getProjectName() != null) ? graph.getProjectName() : "Active Project";

        response.getAgentThoughts().add("Accessing active topological knowledge graph for [" + projectName + "]...");

        boolean isBlastRadiusIntent = queryLower.contains("blast") || queryLower.contains("impact") || queryLower.contains("break") || queryLower.contains("cascade");
        boolean isAuditIntent = queryLower.contains("violation") || queryLower.contains("audit") || queryLower.contains("cycle") || queryLower.contains("rule") || queryLower.contains("health");
        boolean isRefactorIntent = queryLower.contains("refactor") || queryLower.contains("decouple") || queryLower.contains("rewrite") || queryLower.contains("fix code");

        // 1. If user asks for Blast Radius
        if (isBlastRadiusIntent) {
            String target = extractTargetIdentifier(userQuery, graph);
            response.getAgentThoughts().add("Executing AST Blast Radius Tool on node [" + target + "]...");
            BlastRadiusReport report = blastRadiusTool.apply(new BlastRadiusTool.Request(target, 4));
            response.setBlastRadiusReport(report);
            response.getAgentThoughts().add("Found " + report.getTotalImpactedNodes() + " downstream impacted nodes across " + report.getAffectedEndpoints().size() + " endpoints.");

            // If Gemini is active, let Gemini synthesize a rich explanation of the blast radius
            if (geminiApiKey != null && !geminiApiKey.trim().isEmpty()) {
                try {
                    response.getAgentThoughts().add("Synthesizing architectural blast report using Google Gemini AI...");
                    ProjectSkill skill = skillGenerator.generateProjectSkill(null, null);
                    String systemInstruction = ArchLensPrompts.SYSTEM_PROMPT + "\n\n### ACTIVE PROJECT ARCHITECTURAL SKILL:\n" + skill.getFullMarkdown();

                    String prompt = "### Codebase: " + projectName + "\n" +
                            "### Blast Radius Report for " + report.getTargetNodeName() + ":\n" +
                            "- Risk Level: " + report.getRiskLevel() + "\n" +
                            "- Total Impacted Nodes: " + report.getTotalImpactedNodes() + "\n" +
                            "- Affected Endpoints: " + String.join(", ", report.getAffectedEndpoints()) + "\n" +
                            "- Impact Paths:\n" + report.getImpactPaths().stream().map(p -> "  * " + String.join(" -> ", p)).collect(Collectors.joining("\n")) + "\n\n" +
                            "### User Request:\n" + userQuery + "\n\n" +
                            "Explain the blast radius risks and suggest safe decoupling strategies for " + report.getTargetNodeName() + " in " + projectName + ".";

                    String aiText = geminiClient.generateContent(geminiApiKey, modelName, systemInstruction, prompt);
                    response.setMessage(aiText);
                    response.setModelUsed(modelName != null ? modelName : "Google Gemini 2.0 Flash");
                    return response;
                } catch (Exception e) {
                    response.getAgentThoughts().add("Gemini synthesis fallback: " + e.getMessage());
                }
            }

            // Fallback structured message
            StringBuilder answer = new StringBuilder();
            answer.append("### 🔍 Blast Radius Analysis for `").append(report.getTargetNodeName()).append("` in **").append(projectName).append("**\n\n");
            answer.append("**Risk Level:** `").append(report.getRiskLevel()).append("`\n\n");
            answer.append(report.getAiSummary()).append("\n\n");

            if (!report.getAffectedEndpoints().isEmpty()) {
                answer.append("#### 🚨 Public HTTP Endpoints at Risk:\n");
                for (String ep : report.getAffectedEndpoints()) {
                    answer.append("- `").append(ep).append("`\n");
                }
                answer.append("\n");
            }

            if (!report.getImpactPaths().isEmpty()) {
                answer.append("#### ⛓️ Dependency Cascade Paths:\n");
                for (List<String> path : report.getImpactPaths()) {
                    answer.append("- `").append(String.join(" ➔ ", path)).append("`\n");
                }
            }

            response.setMessage(answer.toString());
            return response;
        }

        // 2. If user asks for Architecture Audit
        if (isAuditIntent) {
            response.getAgentThoughts().add("Running Architecture Rule Engine across " + (graph != null ? graph.getNodes().size() : 0) + " nodes in [" + projectName + "]...");
            List<ArchitectureViolation> violations = auditTool.apply(new ArchitectureAuditTool.Request(null));
            response.setViolations(violations);
            response.getAgentThoughts().add("Audit complete. Found " + violations.size() + " architectural violations.");

            if (geminiApiKey != null && !geminiApiKey.trim().isEmpty()) {
                try {
                    response.getAgentThoughts().add("Analyzing violations and remediation advice using Google Gemini AI...");
                    ProjectSkill skill = skillGenerator.generateProjectSkill(null, null);
                    String systemInstruction = ArchLensPrompts.SYSTEM_PROMPT + "\n\n### ACTIVE PROJECT ARCHITECTURAL SKILL:\n" + skill.getFullMarkdown();

                    String prompt = "### Codebase: " + projectName + "\n" +
                            "### Detected Violations (" + violations.size() + "):\n" +
                            violations.stream().map(v -> "- [" + v.getSeverity() + "] " + v.getRuleName() + " (" + v.getSourceComponent() + " -> " + v.getTargetComponent() + "): " + v.getDescription()).collect(Collectors.joining("\n")) + "\n\n" +
                            "### User Request:\n" + userQuery + "\n\n" +
                            "Provide an in-depth architectural audit summary and actionable remediation plan for " + projectName + ".";

                    String aiText = geminiClient.generateContent(geminiApiKey, modelName, systemInstruction, prompt);
                    response.setMessage(aiText);
                    response.setModelUsed(modelName != null ? modelName : "Google Gemini 2.0 Flash");
                    return response;
                } catch (Exception e) {
                    response.getAgentThoughts().add("Gemini audit synthesis fallback: " + e.getMessage());
                }
            }

            StringBuilder answer = new StringBuilder();
            answer.append("### 🛡️ Architectural Health & Rule Audit for **").append(projectName).append("**\n\n");
            if (violations.isEmpty()) {
                answer.append("✅ **Clean Architecture Verified!** No circular dependencies, layer bypasses, or missing transaction boundaries found.");
            } else {
                answer.append("Found **").append(violations.size()).append(" architectural issue(s)**:\n\n");
                for (ArchitectureViolation v : violations) {
                    answer.append("#### [").append(v.getSeverity()).append("] ").append(v.getRuleName()).append("\n");
                    answer.append("**Description:** ").append(v.getDescription()).append("\n\n");
                    answer.append("💡 **Remediation:** ").append(v.getRemediationAdvice()).append("\n\n");
                }
            }
            response.setMessage(answer.toString());
            return response;
        }

        // 3. If user asks for Refactoring
        if (isRefactorIntent) {
            String targetClass = extractTargetIdentifier(userQuery, graph);
            response.getAgentThoughts().add("Executing Refactoring Tool on [" + targetClass + "] in [" + projectName + "]...");

            CodeNode targetNode = findNodeByName(targetClass, graph);
            String sourceCode = targetNode != null && targetNode.getSourceCode() != null ? targetNode.getSourceCode() : "public class " + targetClass + " {\n}";

            if (geminiApiKey != null && !geminiApiKey.trim().isEmpty()) {
                try {
                    response.getAgentThoughts().add("Generating production-ready refactored patch using Google Gemini AI...");
                    ProjectSkill skill = skillGenerator.generateProjectSkill(null, null);
                    String systemInstruction = "You are a Principal Software Architect. Refactor this source file according to the project's architectural skill rules. Return the complete updated code.";

                    String prompt = "### Project: " + projectName + "\n" +
                            "### Target Class: " + targetClass + "\n" +
                            "### Original Code:\n```\n" + sourceCode + "\n```\n\n" +
                            "### Goal:\n" + userQuery + "\n\n" +
                            "Return the refactored code and explain your changes.";

                    String aiText = geminiClient.generateContent(geminiApiKey, modelName, systemInstruction, prompt);

                    RefactorSuggestion suggestion = new RefactorSuggestion();
                    suggestion.setId(UUID.randomUUID().toString());
                    suggestion.setTargetClass(targetClass);
                    suggestion.setFilePath(targetNode != null && targetNode.getFilePath() != null ? targetNode.getFilePath() : targetClass + ".java");
                    suggestion.setOriginalCode(sourceCode);
                    suggestion.setRefactoredCode(aiText);
                    suggestion.setGoal(userQuery);
                    suggestion.setRationale("Refactored with Gemini AI to adhere to " + projectName + " architectural skill invariants.");
                    suggestion.setAppliedPatterns(List.of("Clean Architecture", "Dependency Decoupling", "Transactional Boundary"));
                    response.setRefactorSuggestion(suggestion);

                    response.setMessage("### 🛠️ Automated Architectural Refactor: `" + targetClass + "`\n\n" +
                            aiText + "\n\n*The refactored code has been loaded into the Monaco Diff viewer.*");
                    response.setModelUsed(modelName != null ? modelName : "Google Gemini 2.0 Flash");
                    return response;
                } catch (Exception e) {
                    response.getAgentThoughts().add("Gemini refactoring fallback: " + e.getMessage());
                }
            }

            RefactorSuggestion suggestion = refactorTool.apply(new CodeRefactorTool.Request(targetClass, userQuery));
            response.setRefactorSuggestion(suggestion);
            response.setMessage("### 🛠️ Automated Architectural Refactor: `" + targetClass + "`\n\n" +
                    "**Rationale:** " + suggestion.getRationale() + "\n\n" +
                    suggestion.getAppliedPatterns().stream().map(p -> "- " + p).collect(Collectors.joining("\n")) +
                    "\n\n*The proposed refactored code is now available in your Monaco Diff Viewer for inspection.*");
            return response;
        }

        // 4. General Q&A / Flow Query with Google Gemini
        if (geminiApiKey != null && !geminiApiKey.trim().isEmpty()) {
            response.getAgentThoughts().add("Connecting to Google Gemini (" + (modelName != null ? modelName : "gemini-2.0-flash") + ")...");
            response.getAgentThoughts().add("Injecting active [" + projectName + "] SKILL.md & " + (graph != null ? graph.getNodes().size() : 0) + " topology nodes...");

            try {
                ProjectSkill skill = skillGenerator.generateProjectSkill(null, null);
                String systemInstruction = ArchLensPrompts.SYSTEM_PROMPT + "\n\n### ACTIVE PROJECT ARCHITECTURAL SKILL:\n" + skill.getFullMarkdown();

                String graphContext = buildGraphContext(graph);
                String prompt = "### Active Codebase: " + projectName + "\n" +
                        "### Knowledge Graph Topology:\n" + graphContext + "\n\n" +
                        "### Developer Question:\n" + userQuery;

                String geminiResponse = geminiClient.generateContent(geminiApiKey, modelName, systemInstruction, prompt);
                response.setMessage(geminiResponse);
                response.setModelUsed(modelName != null ? modelName : "Google Gemini 2.0 Flash");
                response.getAgentThoughts().add("Generated response specifically tailored to [" + projectName + "] using Google Gemini AI.");
                return response;
            } catch (Exception e) {
                response.getAgentThoughts().add("Gemini API error: " + e.getMessage() + ". Using graph fallback.");
            }
        }

        // 5. Fallback Default Overview dynamically referencing the active project
        response.getAgentThoughts().add("Synthesizing active codebase topology response for [" + projectName + "]...");
        int nodeCount = graph != null ? graph.getNodes().size() : 0;
        int edgeCount = graph != null ? graph.getEdges().size() : 0;

        List<String> sampleServiceNames = graph != null ? graph.getNodes().stream()
                .filter(n -> n.getType() == NodeType.SERVICE || n.getType() == NodeType.CONTROLLER)
                .map(CodeNode::getName)
                .limit(3)
                .toList() : List.of("MainService");

        String sampleService1 = !sampleServiceNames.isEmpty() ? sampleServiceNames.get(0) : "MainService";
        String sampleService2 = sampleServiceNames.size() > 1 ? sampleServiceNames.get(1) : sampleService1;

        String answer = "### 🏛️ CodeGraph Architecture Overview: **" + projectName + "**\n\n" +
                "The active indexed codebase **`" + projectName + "`** contains **" + nodeCount + " knowledge graph nodes** and **" + edgeCount + " direct dependencies**.\n\n" +
                "**What you can ask me about `" + projectName + "`:**\n" +
                "- `What is the blast radius if I change " + sampleService1 + "?`\n" +
                "- `Audit the codebase for cyclic dependencies and layer violations`\n" +
                "- `Explain the end-to-end flow of " + projectName + "`\n" +
                "- `Refactor " + sampleService2 + " to decouple its dependencies`\n\n" +
                "*(Tip: Connect your Google Gemini API Key in the top right for instant generative reasoning with active Project Skill enforcement!)*";

        response.setMessage(answer);
        return response;
    }

    public void streamQuery(String userQuery, String geminiApiKey, String modelName, SseEmitter emitter) {
        CompletableFuture.runAsync(() -> {
            try {
                ChatResponse response = processQuery(userQuery, geminiApiKey, modelName);

                for (String thought : response.getAgentThoughts()) {
                    emitter.send(SseEmitter.event().name("thought").data(thought));
                    Thread.sleep(100);
                }

                emitter.send(SseEmitter.event().name("complete").data(response));
                emitter.complete();
            } catch (Exception e) {
                try {
                    emitter.send(SseEmitter.event().name("error").data("Streaming error: " + e.getMessage()));
                } catch (IOException ignored) {}
                emitter.completeWithError(e);
            }
        });
    }

    private String buildGraphContext(CodeGraph graph) {
        if (graph == null) return "No graph loaded.";
        StringBuilder sb = new StringBuilder();
        sb.append("Project Name: ").append(graph.getProjectName()).append("\n");
        sb.append("Total Nodes (").append(graph.getNodes().size()).append("):\n");
        for (CodeNode n : graph.getNodes()) {
            sb.append("- [").append(n.getType()).append("] ").append(n.getName()).append(" (Package/Path: ").append(n.getPackageName()).append(")\n");
            if (n.getSignature() != null) {
                sb.append("    Signature: ").append(n.getSignature()).append("\n");
            }
        }
        sb.append("Total Dependencies (").append(graph.getEdges().size()).append("):\n");
        for (CodeEdge e : graph.getEdges()) {
            sb.append("- ").append(e.getSourceId()).append(" --[").append(e.getType()).append("]--> ").append(e.getTargetId()).append(" (").append(e.getLabel()).append(")\n");
        }
        return sb.toString();
    }

    private String extractTargetIdentifier(String query, CodeGraph graph) {
        if (graph == null || graph.getNodes().isEmpty()) return "MainService";
        String q = query.toLowerCase();
        for (CodeNode node : graph.getNodes()) {
            if (q.contains(node.getName().toLowerCase()) ||
                    (node.getClassName() != null && q.contains(node.getClassName().toLowerCase()))) {
                return node.getName();
            }
        }
        // Return first service or controller from active project
        return graph.getNodes().stream()
                .filter(n -> n.getType() == NodeType.SERVICE || n.getType() == NodeType.CONTROLLER)
                .map(CodeNode::getName)
                .findFirst()
                .orElseGet(() -> graph.getNodes().stream().map(CodeNode::getName).findFirst().orElse("MainComponent"));
    }

    private CodeNode findNodeByName(String name, CodeGraph graph) {
        if (graph == null) return null;
        for (CodeNode n : graph.getNodes()) {
            if (n.getName().equalsIgnoreCase(name) || (n.getClassName() != null && n.getClassName().equalsIgnoreCase(name))) {
                return n;
            }
        }
        return null;
    }
}
