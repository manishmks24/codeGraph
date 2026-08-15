package com.archlens.parser;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.*;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.*;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

@Service
public class ProjectIngestionService {

    private static final Set<String> ALLOWED_EXTENSIONS = Set.of(
            "java", "ts", "tsx", "js", "jsx", "py", "go", "rs", "cs", "cpp", "c",
            "json", "yaml", "yml", "properties", "xml", "sql", "md", "env"
    );

    private static final Set<String> IGNORED_PATHS = Set.of(
            "node_modules", ".git", "target", "dist", "build", ".next", ".nuxt",
            "venv", ".venv", "__pycache__", ".idea", ".vscode", "bin", "obj"
    );

    private final HttpClient httpClient;

    public ProjectIngestionService() {
        this.httpClient = HttpClient.newBuilder()
                .followRedirects(HttpClient.Redirect.ALWAYS)
                .connectTimeout(Duration.ofSeconds(30))
                .build();
    }

    public static class IngestedProject {
        private String projectName;
        private Map<String, String> filesByPath = new LinkedHashMap<>();
        private String primaryLanguage;
        private int totalFiles;
        private long totalLines;

        public String getProjectName() { return projectName; }
        public void setProjectName(String projectName) { this.projectName = projectName; }
        public Map<String, String> getFilesByPath() { return filesByPath; }
        public void setFilesByPath(Map<String, String> filesByPath) { this.filesByPath = filesByPath; }
        public String getPrimaryLanguage() { return primaryLanguage; }
        public void setPrimaryLanguage(String primaryLanguage) { this.primaryLanguage = primaryLanguage; }
        public int getTotalFiles() { return totalFiles; }
        public void setTotalFiles(int totalFiles) { this.totalFiles = totalFiles; }
        public long getTotalLines() { return totalLines; }
        public void setTotalLines(long totalLines) { this.totalLines = totalLines; }
    }

    public IngestedProject ingestZipFile(MultipartFile file) throws IOException {
        String originalName = file.getOriginalFilename() != null ? file.getOriginalFilename() : "Uploaded-Project.zip";
        String projectName = originalName.replaceAll("\\.zip$", "");
        try (InputStream is = file.getInputStream()) {
            return extractZipStream(is, projectName);
        }
    }

    public IngestedProject ingestGitHubRepo(String repoUrl, String branch, String token) throws Exception {
        // Normalize repository URL
        String cleanUrl = repoUrl.trim()
                .replaceAll("\\.git$", "")
                .replaceAll("/+$", "")
                .replace("http://", "https://");

        if (cleanUrl.startsWith("github.com/")) {
            cleanUrl = "https://" + cleanUrl;
        } else if (!cleanUrl.startsWith("https://github.com/")) {
            // Assume format "owner/repo"
            cleanUrl = "https://github.com/" + cleanUrl;
        }

        String pathPart = cleanUrl.replace("https://github.com/", "");
        String[] parts = pathPart.split("/");
        if (parts.length < 2) {
            throw new IllegalArgumentException("Invalid GitHub repository URL: " + repoUrl + ". Expected format: https://github.com/owner/repository");
        }

        String owner = parts[0];
        String repo = parts[1];
        String effectiveBranch = branch != null && !branch.trim().isEmpty() ? branch.trim() : null;

        // Check if URL contained /tree/branch
        if (parts.length >= 4 && "tree".equalsIgnoreCase(parts[2])) {
            effectiveBranch = parts[3];
        }

        String projectName = owner + "/" + repo;

        // Try downloading zipball via GitHub API and fallback endpoints
        List<String> targetUrls = new ArrayList<>();
        if (effectiveBranch != null && !effectiveBranch.equalsIgnoreCase("main")) {
            targetUrls.add("https://api.github.com/repos/" + owner + "/" + repo + "/zipball/" + effectiveBranch);
            targetUrls.add("https://codeload.github.com/" + owner + "/" + repo + "/zip/refs/heads/" + effectiveBranch);
        }
        // Always try default branch zipball
        targetUrls.add("https://api.github.com/repos/" + owner + "/" + repo + "/zipball");
        targetUrls.add("https://codeload.github.com/" + owner + "/" + repo + "/zip/refs/heads/main");
        targetUrls.add("https://codeload.github.com/" + owner + "/" + repo + "/zip/refs/heads/master");

        byte[] zipBytes = null;
        Exception lastError = null;

        for (String url : targetUrls) {
            try {
                HttpRequest.Builder req = HttpRequest.newBuilder()
                        .uri(URI.create(url))
                        .GET()
                        .header("User-Agent", "ArchLens-AI-Engine/1.0")
                        .header("Accept", "application/vnd.github+json");

                if (token != null && !token.trim().isEmpty()) {
                    req.header("Authorization", "Bearer " + token.trim());
                }

                HttpResponse<byte[]> response = httpClient.send(req.build(), HttpResponse.BodyHandlers.ofByteArray());
                if (response.statusCode() == 200 && response.body().length > 0) {
                    zipBytes = response.body();
                    break;
                }
            } catch (Exception e) {
                lastError = e;
            }
        }

        if (zipBytes == null) {
            String msg = "Could not download GitHub repository from " + repoUrl + ". Please verify the repository is public or provide a valid GitHub Personal Access Token.";
            if (lastError != null) {
                msg += " (Error: " + lastError.getMessage() + ")";
            }
            throw new IOException(msg);
        }

        try (InputStream is = new ByteArrayInputStream(zipBytes)) {
            return extractZipStream(is, projectName);
        }
    }

    private IngestedProject extractZipStream(InputStream inputStream, String fallbackProjectName) throws IOException {
        IngestedProject project = new IngestedProject();
        project.setProjectName(fallbackProjectName);

        Map<String, Integer> langCounts = new HashMap<>();
        long totalLines = 0;

        try (ZipInputStream zis = new ZipInputStream(inputStream)) {
            ZipEntry entry;
            while ((entry = zis.getNextEntry()) != null) {
                if (entry.isDirectory()) continue;

                String entryName = entry.getName().replace("\\", "/");
                // Strip top-level directory wrapper if present (e.g. repo-main/src/...)
                if (entryName.contains("/")) {
                    entryName = entryName.substring(entryName.indexOf('/') + 1);
                }

                if (isIgnoredPath(entryName)) continue;

                String ext = getFileExtension(entryName).toLowerCase();
                if (!ALLOWED_EXTENSIONS.contains(ext)) continue;

                ByteArrayOutputStream baos = new ByteArrayOutputStream();
                byte[] buffer = new byte[8192];
                int read;
                while ((read = zis.read(buffer)) != -1) {
                    baos.write(buffer, 0, read);
                }

                String content = baos.toString(StandardCharsets.UTF_8);
                if (content.length() > 500_000) {
                    content = content.substring(0, 500_000);
                }

                project.getFilesByPath().put(entryName, content);
                totalLines += content.split("\r\n|\r|\n").length;
                langCounts.merge(ext, 1, Integer::sum);
            }
        }

        if (project.getFilesByPath().isEmpty()) {
            throw new IOException("No supported source files (.java, .ts, .js, .py, etc.) found in the repository.");
        }

        project.setTotalFiles(project.getFilesByPath().size());
        project.setTotalLines(totalLines);

        String dominantExt = langCounts.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse("java");

        project.setPrimaryLanguage(resolveLanguageName(dominantExt));
        return project;
    }

    private boolean isIgnoredPath(String path) {
        String lower = path.toLowerCase();
        for (String ignored : IGNORED_PATHS) {
            if (lower.startsWith(ignored + "/") || lower.contains("/" + ignored + "/")) {
                return true;
            }
        }
        return false;
    }

    private String getFileExtension(String fileName) {
        int dot = fileName.lastIndexOf('.');
        return dot >= 0 ? fileName.substring(dot + 1) : "";
    }

    private String resolveLanguageName(String ext) {
        return switch (ext) {
            case "java" -> "Java (Spring Boot)";
            case "ts", "tsx" -> "TypeScript";
            case "js", "jsx" -> "JavaScript";
            case "py" -> "Python";
            case "go" -> "Go";
            case "rs" -> "Rust";
            case "cs" -> "C# (.NET)";
            default -> "Multi-language";
        };
    }
}
