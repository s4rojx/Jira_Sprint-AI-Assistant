export interface SprintSummary {
  id: string
  name: string
  state: string
  goal: string | null
  startDate: string | null
  endDate: string | null
  totalIssues: number
  completedIssues: number
}

export interface Issue {
  key: string
  id: string
  summary: string
  issueType: string
  status: string
  statusCategory: string
  priority: string | null
  assignee: string | null
  reporter: string | null
  storyPoints: number | null
  labels: string[]
}

export interface SprintDetail extends SprintSummary {
  completeDate: string | null
  inProgressIssues: number
  blockedIssues: number
  issues: Issue[]
}

export interface SprintAnalysis {
  sprintId: string
  sprintName: string
  state: string
  totalIssues: number
  completedIssues: number
  inProgressIssues: number
  blockedIssues: number
  unassignedActiveIssues: number
  totalStoryPoints: number
  completedStoryPoints: number
  completionRate: number
  workloadByAssignee: Record<string, number>
  identifiedRisks: string[]
}

export interface SprintHealth {
  sprintId: string
  status: 'HEALTHY' | 'WATCH' | 'AT_RISK' | string
  statusReason: string
  completionRate: number
  totalIssues: number
  completedIssues: number
  blockedIssues: number
  recommendations: string[]
}

export interface SprintPrediction {
  sprintId: string
  completionProbability: number
  daysRemaining: number
  trend: 'AHEAD' | 'ON_TRACK' | 'BEHIND' | string
  insights: string[]
  bottlenecks: string[]
  suggestedActions: string[]
}

export interface RiskItem {
  issueKey: string
  summary: string
  assignee: string | null
  riskScore: number
  riskLevel: 'HIGH' | 'MEDIUM' | 'LOW' | string
  factors: string[]
  mitigations: string[]
}

export interface AssignmentRecommendation {
  issueKey: string
  issueSummary: string
  recommendedAssignee: string
  reason: string
  confidence: number
}

export interface SprintWorkspace {
  sprint: SprintDetail
  analysis: SprintAnalysis
  health: SprintHealth
  prediction: SprintPrediction
  risks: RiskItem[]
  recommendations: AssignmentRecommendation[]
}
