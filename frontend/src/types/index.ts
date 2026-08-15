export type NodeType =
  | 'CONTROLLER'
  | 'SERVICE'
  | 'REPOSITORY'
  | 'ENTITY'
  | 'ENDPOINT'
  | 'METHOD'
  | 'INTERFACE'
  | 'CONFIGURATION'
  | 'EVENT_LISTENER'
  | 'KAFKA_TOPIC'
  | 'COMPONENT';

export type EdgeType =
  | 'CALLS'
  | 'INJECTS'
  | 'IMPORTS'
  | 'EXPOSES'
  | 'IMPLEMENTS'
  | 'EXTENDS'
  | 'WRITES_TO'
  | 'READS_FROM'
  | 'PUBLISHES_EVENT'
  | 'CONSUMES_EVENT';

export interface CodeNode {
  id: string;
  name: string;
  packageName: string;
  className?: string;
  type: NodeType;
  annotations: string[];
  signature?: string;
  filePath?: string;
  sourceCode?: string;
  startLine?: number;
  endLine?: number;
  linesOfCode?: number;
  complexity?: number;
  metadata?: Record<string, any>;
}

export interface CodeEdge {
  id: string;
  sourceId: string;
  targetId: string;
  type: EdgeType;
  label: string;
  weight?: number;
  metadata?: Record<string, any>;
}

export interface CodeGraph {
  id: string;
  projectName: string;
  nodes: CodeNode[];
  edges: CodeEdge[];
  summaryStats?: Record<string, any>;
}

export interface ImpactedNodeDetail {
  id: string;
  name: string;
  type: NodeType;
  hopDistance: number;
  dependencyType: string;
}

export interface BlastRadiusReport {
  targetNodeId: string;
  targetNodeName: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  totalImpactedNodes: number;
  impactedNodes: ImpactedNodeDetail[];
  affectedEndpoints: string[];
  affectedDatabaseEntities: string[];
  impactPaths: string[][];
  aiSummary: string;
}

export interface ArchitectureViolation {
  id: string;
  ruleName: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  description: string;
  sourceComponent: string;
  targetComponent: string;
  cyclePath?: string[];
  remediationAdvice?: string;
}

export interface RefactorSuggestion {
  id: string;
  targetClass: string;
  filePath: string;
  goal: string;
  rationale: string;
  originalCode: string;
  refactoredCode: string;
  diffUnified?: string;
  appliedPatterns: string[];
  affectedDependencies?: string[];
}

export interface ArchitectureSummary {
  totalClasses: number;
  totalControllers: number;
  totalServices: number;
  totalRepositories: number;
  totalEntities: number;
  totalEndpoints: number;
  totalDependencies: number;
  totalViolations: number;
  healthScore: number;
  nodeTypeCounts?: Record<string, number>;
  edgeTypeCounts?: Record<string, number>;
}

export interface LayerBreakdown {
  layerName: string;
  purpose: string;
  nodeCount: number;
  keyComponents: string[];
  allowedDependencies: string[];
  status: 'HEALTHY' | 'WARNING' | 'VIOLATION';
}

export interface DataFlowPath {
  flowName: string;
  triggerEndpoint: string;
  stepSequence: string[];
  description: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface ArchitecturalReviewReport {
  projectName: string;
  architecturalPattern: string;
  executiveSummary: string;
  healthScore: number;
  layers: LayerBreakdown[];
  keyDataFlows: DataFlowPath[];
  architecturalStrengths: string[];
  criticalBottlenecks: string[];
  actionableRecommendations: string[];
  metrics: Record<string, any>;
}

export interface ProjectSkill {
  skillName: string;
  version: string;
  description: string;
  fullMarkdown: string;
  stackSummary: string;
  architecturalInvariants: string[];
  layerRules: string[];
  workflows: string[];
  componentRoles?: Record<string, string>;
  generatedAt: string;
}

export interface IngestionResult {
  graph: CodeGraph;
  primaryLanguage: string;
  totalFiles: number;
  totalLines: number;
}

export interface ChatResponse {
  message: string;
  agentThoughts: string[];
  blastRadiusReport?: BlastRadiusReport;
  violations?: ArchitectureViolation[];
  refactorSuggestion?: RefactorSuggestion;
  modelUsed?: string;
}
