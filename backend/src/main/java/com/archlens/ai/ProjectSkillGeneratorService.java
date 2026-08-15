package com.archlens.ai;

import com.archlens.graph.GraphStore;
import com.archlens.model.CodeEdge;
import com.archlens.model.CodeGraph;
import com.archlens.model.CodeNode;
import com.archlens.model.NodeType;
import com.archlens.model.ProjectSkill;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class ProjectSkillGeneratorService {

    private final GraphStore graphStore;
    private final GeminiClientService geminiClient;

    public ProjectSkillGeneratorService(GraphStore graphStore, GeminiClientService geminiClient) {
        this.graphStore = graphStore;
        this.geminiClient = geminiClient;
    }

    public ProjectSkill generateProjectSkill(String geminiApiKey, String modelName) {
        CodeGraph graph = graphStore.getActiveGraph();
        if (graph == null) {
            throw new IllegalStateException("No active codebase graph found. Please scan or upload a project first.");
        }

        String projectName = graph.getProjectName() != null ? graph.getProjectName() : "ArchLens Project";
        String cleanSkillName = projectName.toLowerCase().replaceAll("[^a-z0-9]+", "-").replaceAll("^-|-$", "");
        if (cleanSkillName.isEmpty()) cleanSkillName = "custom-project";

        // Aggregate project topology
        List<CodeNode> controllers = graph.getNodes().stream().filter(n -> n.getType() == NodeType.CONTROLLER).toList();
        List<CodeNode> services = graph.getNodes().stream().filter(n -> n.getType() == NodeType.SERVICE).toList();
        List<CodeNode> repos = graph.getNodes().stream().filter(n -> n.getType() == NodeType.REPOSITORY).toList();
        List<CodeNode> entities = graph.getNodes().stream().filter(n -> n.getType() == NodeType.ENTITY).toList();
        List<CodeNode> endpoints = graph.getNodes().stream().filter(n -> n.getType() == NodeType.ENDPOINT).toList();
        List<CodeNode> components = graph.getNodes().stream().filter(n -> n.getType() == NodeType.COMPONENT).toList();

        StringBuilder sb = new StringBuilder();
        sb.append("---\n");
        sb.append("name: ").append(cleanSkillName).append("-architecture-guide\n");
        sb.append("description: Production Architectural & Development Skill for ").append(projectName).append(".\n");
        sb.append("version: 1.0.0\n");
        sb.append("framework: ArchLens AI Copilot Engine\n");
        sb.append("---\n\n");

        sb.append("# ").append(projectName).append(" - Architectural Skill & Copilot Rules\n\n");
        sb.append("> **Generated autonomously by ArchLens AI Engine**\n");
        sb.append("> This skill defines the mandatory architectural invariants, layer boundaries, dependency contracts, and development workflows for this codebase.\n\n");

        sb.append("## 1. System Architecture & Topology Overview\n\n");
        sb.append("- **Total Indexed Nodes:** `").append(graph.getNodes().size()).append("`\n");
        sb.append("- **Direct Dependency Edges:** `").append(graph.getEdges().size()).append("`\n");
        sb.append("- **Controllers / API Entrypoints:** `").append(controllers.size()).append("`\n");
        sb.append("- **Domain / Business Services:** `").append(services.size()).append("`\n");
        sb.append("- **Data Access Repositories:** `").append(repos.size()).append("`\n");
        sb.append("- **Database Entities / Models:** `").append(entities.size()).append("`\n");
        sb.append("- **Public Endpoints:** `").append(endpoints.size()).append("`\n\n");

        sb.append("## 2. Core Architectural Invariants (Must Never Be Broken)\n\n");
        sb.append("1. **Strict Layered Encapsulation:** Controllers/Routers must only interact with Business Services. Direct access from Controllers to Repositories/Database entities is strictly forbidden.\n");
        sb.append("2. **Zero Circular Dependencies:** Services must never create cyclic dependencies (`A -> B -> A`). All cross-domain communication must use asynchronous events or clear domain boundaries.\n");
        sb.append("3. **Transactional Integrity:** Any state mutation spanning multiple repositories must be wrapped in atomic transactional boundaries.\n");
        sb.append("4. **Blast Radius Minimization:** Any proposed modification to core entities (`").append(entities.stream().limit(3).map(CodeNode::getName).collect(Collectors.joining(", "))).append("`) requires running an AST blast radius audit before merging.\n\n");

        sb.append("## 3. Component Taxonomy & Responsibilities\n\n");
        sb.append("### 3.1 Presentation & API Layer\n");
        for (CodeNode c : controllers) {
            sb.append("- **`").append(c.getName()).append("`** (`").append(c.getPackageName()).append("`): Manages request validation, route handling, and delegates to service layer.\n");
        }
        if (controllers.isEmpty()) {
            sb.append("- *UI / Component entrypoints registered in topology.*\n");
        }

        sb.append("\n### 3.2 Business & Domain Service Layer\n");
        for (CodeNode s : services) {
            sb.append("- **`").append(s.getName()).append("`**: Coordinates business workflows and domain rules.\n");
        }

        sb.append("\n### 3.3 Persistence & Data Access Layer\n");
        for (CodeNode r : repos) {
            sb.append("- **`").append(r.getName()).append("`**: Handles query execution and persistence isolation.\n");
        }

        sb.append("\n## 4. Standard Operational Workflows\n\n");
        sb.append("### 4.1 Workflow: Adding a New Feature / Endpoint\n");
        sb.append("```\n");
        sb.append("Step 1: Define Model/Entity in Domain layer\n");
        sb.append("Step 2: Create Repository interface for data access\n");
        sb.append("Step 3: Implement Business Logic in Service class\n");
        sb.append("Step 4: Expose clean REST/GraphQL endpoint in Controller\n");
        sb.append("Step 5: Run ArchLens Blast Radius check to verify zero regression\n");
        sb.append("```\n\n");

        sb.append("### 4.2 Workflow: Refactoring & Decoupling\n");
        sb.append("When decoupling tightly coupled services:\n");
        sb.append("1. Extract common interfaces or introduce event-driven messaging.\n");
        sb.append("2. Use Constructor Dependency Injection exclusively.\n");
        sb.append("3. Verify through Monaco Diff before applying changes.\n\n");

        sb.append("## 5. Active Copilot Directive\n");
        sb.append("When assisting developers with this codebase, ArchLens AI must always enforce the above rules, prioritize architectural hygiene, and cite relevant graph nodes.");

        ProjectSkill skill = new ProjectSkill();
        skill.setSkillName(cleanSkillName);
        skill.setVersion("1.0.0");
        skill.setDescription("Autonomous Architectural Skill for " + projectName);
        skill.setStackSummary(graph.getNodes().size() + " nodes across " + controllers.size() + " controllers, " + services.size() + " services, " + repos.size() + " repos.");
        skill.setArchitecturalInvariants(List.of(
                "Strict Layered Architecture: Controllers -> Services -> Repositories.",
                "Zero Circular Dependencies across domain services.",
                "Atomic transaction boundaries on multi-repository mutations.",
                "Mandatory AST Blast Radius verification on core model modifications."
        ));
        skill.setLayerRules(List.of(
                "API layer must never import database entities directly.",
                "All external network calls must have resilience/timeout policies.",
                "Entities must not contain business processing logic."
        ));
        skill.setWorkflows(List.of(
                "Feature Extension Workflow",
                "Decoupling & Refactoring Workflow",
                "Blast Radius Regression Verification",
                "Architecture Health Audit"
        ));

        // If Gemini API Key is supplied, enhance the markdown dynamically
        if (geminiApiKey != null && !geminiApiKey.trim().isEmpty()) {
            try {
                String prompt = "Review this codebase topology summary and enhance the markdown skill document with specialized best practices and architectural advice for " + projectName + ":\n\n" + sb;
                String aiEnhanced = geminiClient.generateContent(geminiApiKey, modelName, "You are a Principal Software Architect synthesizing a SKILL.md for an AI coding assistant.", prompt);
                if (aiEnhanced != null && !aiEnhanced.isBlank()) {
                    sb = new StringBuilder(aiEnhanced);
                }
            } catch (Exception ignored) {
                // Keep deterministic skill if LLM request fails
            }
        }

        skill.setFullMarkdown(sb.toString());
        return skill;
    }
}
