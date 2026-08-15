package com.archlens.api;

import com.archlens.graph.GraphStore;
import com.archlens.model.CodeGraph;
import com.archlens.model.CodeNode;
import com.archlens.parser.CodebaseScannerService;
import com.archlens.parser.ProjectIngestionService;
import com.archlens.samples.SampleCodebaseProvider;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/codebase")
@CrossOrigin(originPatterns = "*")
public class CodebaseController {

    private final CodebaseScannerService scannerService;
    private final ProjectIngestionService ingestionService;
    private final GraphStore graphStore;
    private final SampleCodebaseProvider sampleProvider;

    public CodebaseController(CodebaseScannerService scannerService,
                              ProjectIngestionService ingestionService,
                              GraphStore graphStore,
                              SampleCodebaseProvider sampleProvider) {
        this.scannerService = scannerService;
        this.ingestionService = ingestionService;
        this.graphStore = graphStore;
        this.sampleProvider = sampleProvider;
    }

    public static class GitHubImportRequest {
        private String repoUrl;
        private String branch;
        private String token;

        public String getRepoUrl() { return repoUrl; }
        public void setRepoUrl(String repoUrl) { this.repoUrl = repoUrl; }
        public String getBranch() { return branch; }
        public void setBranch(String branch) { this.branch = branch; }
        public String getToken() { return token; }
        public void setToken(String token) { this.token = token; }
    }

    @PostMapping(value = "/upload-zip", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadZipFile(@RequestParam("file") MultipartFile file) {
        try {
            ProjectIngestionService.IngestedProject project = ingestionService.ingestZipFile(file);
            CodeGraph graph = scannerService.scanFiles(project.getFilesByPath());
            graph.setProjectName(project.getProjectName());
            graphStore.saveGraph(graph);
            return ResponseEntity.ok(Map.of(
                    "graph", graph,
                    "primaryLanguage", project.getPrimaryLanguage(),
                    "totalFiles", project.getTotalFiles(),
                    "totalLines", project.getTotalLines()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to extract and scan zip file: " + e.getMessage()));
        }
    }

    @PostMapping("/import-github")
    public ResponseEntity<?> importGitHubRepo(@RequestBody GitHubImportRequest request) {
        try {
            if (request.getRepoUrl() == null || request.getRepoUrl().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "GitHub repository URL is required."));
            }
            ProjectIngestionService.IngestedProject project = ingestionService.ingestGitHubRepo(
                    request.getRepoUrl(),
                    request.getBranch(),
                    request.getToken()
            );
            CodeGraph graph = scannerService.scanFiles(project.getFilesByPath());
            graph.setProjectName(project.getProjectName());
            graphStore.saveGraph(graph);
            return ResponseEntity.ok(Map.of(
                    "graph", graph,
                    "primaryLanguage", project.getPrimaryLanguage(),
                    "totalFiles", project.getTotalFiles(),
                    "totalLines", project.getTotalLines()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "GitHub import failed: " + e.getMessage()));
        }
    }

    @PostMapping("/scan-sample")
    public ResponseEntity<CodeGraph> scanSampleCodebase() {
        Map<String, String> sampleFiles = sampleProvider.getECommerceSampleCodebase();
        CodeGraph graph = scannerService.scanFiles(sampleFiles);
        graph.setProjectName("E-Commerce Order & Payment Microservice");
        graphStore.saveGraph(graph);
        return ResponseEntity.ok(graph);
    }

    @PostMapping("/scan-custom")
    public ResponseEntity<CodeGraph> scanCustomFiles(@RequestBody Map<String, String> filesByPath) {
        CodeGraph graph = scannerService.scanFiles(filesByPath);
        graphStore.saveGraph(graph);
        return ResponseEntity.ok(graph);
    }

    @GetMapping("/graph")
    public ResponseEntity<CodeGraph> getActiveGraph() {
        CodeGraph graph = graphStore.getActiveGraph();
        if (graph == null) {
            return scanSampleCodebase();
        }
        return ResponseEntity.ok(graph);
    }

    @GetMapping("/nodes/{id}")
    public ResponseEntity<CodeNode> getNodeDetails(@PathVariable String id) {
        CodeGraph graph = graphStore.getActiveGraph();
        if (graph == null) return ResponseEntity.notFound().build();
        CodeNode node = graph.getNode(id);
        if (node == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(node);
    }
}
