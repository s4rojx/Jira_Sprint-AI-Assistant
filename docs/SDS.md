# Software Design Specification
## JIRA Sprint AI Assistant

**Course:** Software Engineering & Project Management (S5CCS02), 2026–27 ODD SEM  
**Version:** 1.0  
**Date:** December 2026

---

## 1. Architecture Overview

The system follows a layered architecture within a single Spring Boot application. There is no separate microservice split; the React frontend is bundled as static assets inside the same JAR.

```
Browser
  │  HTTP (port 8080)
  ▼
Spring Boot Application
  ├── api/         Controllers, DTOs, exception handlers
  ├── metrics/     SprintMetricsService, SprintAIAnalyzer
  ├── jira/        JiraAgileApiClient, mappers, JiraDataService (cache)
  ├── domain/      Issue, Sprint (Java records)
  ├── config/      JiraProperties
  └── cli/         SprintCliRunner
  │
  │  HTTPS (Atlassian API)
  ▼
JIRA Cloud REST API
```

**Request path (dashboard loads active sprint):**
1. Browser requests `GET /api/v1/sprints/active`.
2. `SprintApiController` calls `JiraDataService.getActiveSprint()`.
3. `JiraDataService` checks the Caffeine cache. On a miss it calls `JiraAgileApiClient`.
4. `JiraAgileApiClient` sends an authenticated HTTPS request to the JIRA Agile API.
5. The raw JSON is mapped by `JiraSprintMapper` and `JiraIssueMapper` to domain records.
6. The mapped `Sprint` is stored in cache and returned.
7. `SprintApiController` converts the domain record to `SprintDetailResponse` and returns JSON.
8. The React app renders the data.

---

## 2. Package Structure

```
com.ablmvp.sprintassistant
├── SprintAssistantApplication.java       Entry point; @ConfigurationPropertiesScan
├── api/
│   ├── SprintApiController.java          Nine REST endpoints
│   ├── SpaController.java                Catch-all → index.html for React routing
│   ├── ApiExceptionHandler.java          @RestControllerAdvice
│   ├── InvalidSprintIdException.java     → HTTP 400
│   ├── SprintNotFoundException.java      → HTTP 404
│   └── dto/
│       ├── ErrorResponse.java
│       ├── SprintSummaryResponse.java
│       ├── SprintDetailResponse.java
│       ├── SprintAnalysisResponse.java
│       ├── SprintHealthResponse.java
│       ├── SprintPredictionResponse.java
│       ├── RiskItemResponse.java
│       └── AssignmentRecommendationResponse.java
├── jira/
│   ├── JiraClientConfig.java             Provides JiraRestClient bean
│   ├── JiraAgileApiClient.java           java.net.http calls to Agile API
│   ├── JiraDataService.java              Caffeine cache + orchestration
│   ├── JiraIssueMapper.java              JsonNode → Issue
│   ├── JiraSprintMapper.java             JsonNode + List<Issue> → Sprint
│   └── JiraApiException.java             Wraps HTTP errors from JIRA
├── metrics/
│   ├── SprintMetricsService.java         analyze(), health()
│   └── SprintAIAnalyzer.java             predict(), identifyRisks(), recommendAssignments()
├── domain/
│   ├── Issue.java                        Immutable record
│   └── Sprint.java                       Immutable record
├── config/
│   └── JiraProperties.java              @ConfigurationProperties(prefix = "jira")
└── cli/
    └── SprintCliRunner.java             CommandLineRunner, active when cli.enabled=true
```

---

## 3. Domain Model

Both domain types are Java records (immutable value types).

### Issue

| Field | Type | Source |
|-------|------|--------|
| `key` | `String` | `issue.key` |
| `id` | `String` | `issue.id` |
| `summary` | `String` | `fields.summary` |
| `issueType` | `String` | `fields.issuetype.name` |
| `status` | `String` | `fields.status.name` |
| `statusCategory` | `String` | `fields.status.statusCategory.name` |
| `priority` | `String` | `fields.priority.name` |
| `assignee` | `String` | `fields.assignee.displayName` (nullable) |
| `reporter` | `String` | `fields.reporter.displayName` (nullable) |
| `storyPoints` | `BigDecimal` | `fields.customfield_10016` → `customfield_10028` → `story_points` (nullable) |
| `originalEstimate` | `BigDecimal` | `fields.timetracking.originalEstimate` (nullable) |
| `remainingEstimate` | `BigDecimal` | `fields.timetracking.remainingEstimate` (nullable) |
| `timeSpent` | `BigDecimal` | `fields.timetracking.timeSpent` (nullable) |
| `created` | `LocalDateTime` | `fields.created` (nullable) |
| `updated` | `LocalDateTime` | `fields.updated` (nullable) |
| `resolutionDate` | `LocalDateTime` | `fields.resolutiondate` (nullable) |
| `labels` | `List<String>` | `fields.labels` (empty list if absent) |
| `sprintId` | `String` | Last element of `fields.customfield_10020[].id` (nullable) |
| `sprintName` | `String` | Last element of `fields.customfield_10020[].name` (nullable) |

Helper methods: `isCompleted()`, `isInProgress()`, `isToDo()` — all test `statusCategory`.

### Sprint

| Field | Type | Source |
|-------|------|--------|
| `id` | `String` | `sprint.id` |
| `name` | `String` | `sprint.name` |
| `state` | `String` | `sprint.state` (`"active"` / `"future"` / `"closed"`) |
| `goal` | `String` | `sprint.goal` (nullable) |
| `startDate` | `LocalDateTime` | `sprint.startDate` (nullable) |
| `endDate` | `LocalDateTime` | `sprint.endDate` (nullable) |
| `completeDate` | `LocalDateTime` | `sprint.completeDate` (nullable) |
| `boardId` | `int` | From `JiraProperties.boardId()` |
| `issues` | `List<Issue>` | Populated by `JiraDataService.getSprint()` |

Computed methods on `Sprint`: `isActive()`, `totalIssues()`, `completedIssues()`, `inProgressIssues()`, `blockedIssues()`, `unassignedIssues()`.

---

## 4. API Design

### 4.1 `GET /api/v1/sprints` → `List<SprintSummaryResponse>`

```json
[
  {
    "id": "42",
    "name": "Sprint 7",
    "state": "active",
    "goal": "Complete auth layer",
    "startDate": "2026-11-18T09:00:00",
    "endDate": "2026-12-02T18:00:00",
    "totalIssues": 18,
    "completedIssues": 11
  }
]
```

### 4.2 `GET /api/v1/sprints/active` and `GET /api/v1/sprints/{id}` → `SprintDetailResponse`

```json
{
  "id": "42",
  "name": "Sprint 7",
  "state": "active",
  "goal": "Complete auth layer",
  "startDate": "2026-11-18T09:00:00",
  "endDate": "2026-12-02T18:00:00",
  "completeDate": null,
  "totalIssues": 18,
  "completedIssues": 11,
  "inProgressIssues": 5,
  "blockedIssues": 2,
  "issues": [ ... ]
}
```

### 4.3 `GET /api/v1/sprints/{id}/analysis` → `SprintAnalysisResponse`

```json
{
  "sprintId": "42",
  "sprintName": "Sprint 7",
  "state": "active",
  "totalIssues": 18,
  "completedIssues": 11,
  "inProgressIssues": 5,
  "blockedIssues": 2,
  "unassignedActiveIssues": 1,
  "totalStoryPoints": 55.0,
  "completedStoryPoints": 34.0,
  "completionRate": 61.8,
  "workloadByAssignee": {
    "Alice": 3,
    "Bob": 4,
    "Carol": 2
  },
  "identifiedRisks": [
    "2 issue(s) are blocked",
    "1 active issue(s) have no assignee"
  ]
}
```

### 4.4 `GET /api/v1/sprints/{id}/health` → `SprintHealthResponse`

```json
{
  "sprintId": "42",
  "status": "WATCH",
  "statusReason": "Completion rate 60-79% or blocked ratio 20-40%.",
  "completionRate": 61.8,
  "totalIssues": 18,
  "completedIssues": 11,
  "blockedIssues": 2,
  "recommendations": [
    "Resolve 2 blocked issue(s) in today's standup.",
    "Increase daily check-in frequency to catch blockers early."
  ]
}
```

### 4.5 `GET /api/v1/sprints/{id}/prediction` → `SprintPredictionResponse`

```json
{
  "sprintId": "42",
  "completionProbability": 0.74,
  "daysRemaining": 6,
  "trend": "BEHIND",
  "insights": [
    "Moderate risk — keep focus through the sprint.",
    "Velocity is below expected pace.",
    "2 blocked issue(s) require attention."
  ],
  "bottlenecks": [
    "Bob has 4 active tasks.",
    "Multiple blocked issues suggest a dependency chain."
  ],
  "suggestedActions": [
    "Resolve all blockers before end of day.",
    "Assign all unowned issues now."
  ]
}
```

### 4.6 `GET /api/v1/sprints/{id}/risks` → `List<RiskItemResponse>`

```json
[
  {
    "issueKey": "PROJ-55",
    "summary": "Implement OAuth token refresh",
    "assignee": null,
    "riskScore": 0.85,
    "riskLevel": "HIGH",
    "factors": ["Issue is blocked", "No assignee"],
    "mitigations": ["Escalate blocker in today's standup", "Assign immediately"]
  }
]
```

### 4.7 `GET /api/v1/sprints/{id}/recommendations` → `List<AssignmentRecommendationResponse>`

```json
[
  {
    "issueKey": "PROJ-61",
    "issueSummary": "Write unit tests for parser",
    "recommendedAssignee": "Alice",
    "reason": "Least loaded member with 2 active task(s)",
    "confidence": 0.80
  }
]
```

### 4.8 `POST /api/v1/sprints/refresh` → `204 No Content`

No request body. Clears the Caffeine cache.

### 4.9 Error response (all error cases)

```json
{
  "status": 404,
  "message": "Sprint not found: 999"
}
```

---

## 5. Data Flow

```
JIRA Agile REST API
        │
        │  JSON (application/json)
        ▼
JiraAgileApiClient          java.net.http.HttpClient
  fetchSprints()            GET /rest/agile/1.0/board/{boardId}/sprint
  fetchIssuesForSprint()    GET /rest/agile/1.0/sprint/{id}/issue
        │
        │  JsonNode (Jackson)
        ▼
JiraIssueMapper.map()       JsonNode → Issue (record)
JiraSprintMapper.map()      JsonNode + List<Issue> → Sprint (record)
        │
        ▼
JiraDataService             Caffeine cache (TTL from jira.cache-ttl-minutes)
  listSprints()             → List<Sprint> (bare, no issues)
  getSprint(id)             → Sprint (with issues)
  getActiveSprint()         → Sprint (active, with issues)
        │
        ▼
SprintApiController         Maps domain records → response DTOs
SprintMetricsService        analyze(), health() — pure functions over Sprint
SprintAIAnalyzer            predict(), identifyRisks(), recommendAssignments()
        │
        ▼
HTTP JSON Response           Browser / CLI consumer
```

---

## 6. Security Design

**API token handling:**
- Credentials are read exclusively from environment variables via `JiraProperties` (a `@ConfigurationProperties` record).
- They are never logged. `JiraAgileApiClient` constructs the `Authorization: Basic ...` header at construction time and holds it in a private final field.
- The header value is a Base64-encoded `username:apiToken` string — standard HTTP Basic authentication over HTTPS.

**No secrets in code:**
- `application.properties` holds only placeholder defaults referencing the env var names (e.g. `${JIRA_API_TOKEN:your-api-token-here}`).
- `.env` and `*.env` are listed in `.gitignore`.
- The Kubernetes `Secret` resource uses `stringData` with placeholder values; real values must be applied manually and are never committed to the repository.

**Principle of least privilege:**
- The Docker container runs as a non-root OS user (`spring`, uid 1001).
- The JIRA API token used should have read-only scope for the project (Browse Projects permission only).
- The application exposes no write operations against JIRA.

**Input validation:**
- Sprint IDs received as path variables are validated (non-blank) before being passed to `JiraDataService`.
- Error responses never echo back raw JIRA API error bodies in production mode.

---

## 7. Technology Choices

| Technology | Version | Rationale |
|-----------|---------|-----------|
| Java | 21 | LTS release; records, pattern matching, virtual threads available |
| Spring Boot | 3.5 | Auto-configuration, actuator, validation, embedded Tomcat |
| `java.net.http.HttpClient` | (JDK built-in) | No extra dependency for Agile API calls; straightforward sync API |
| Caffeine | (Spring Boot BOM) | High-performance in-memory cache; zero config for single-node demo |
| Jackson | (Spring Boot BOM) | Flexible JSON tree model (JsonNode) for mapping variable JIRA fields |
| springdoc-openapi | 2.8 | Generates Swagger UI from `@Operation` annotations; no XML config |
| React + Vite + TypeScript | 18 / 5 / 5 | Fast dev server, type-safe components, small production bundle |
| Recharts | 2 | Declarative bar charts with minimal boilerplate |
| Tailwind CSS | 3 | Utility-first; no CSS files to maintain |
| frontend-maven-plugin | 1.15 | Embeds the npm build in the Maven lifecycle; single `mvn package` produces the full JAR |
| WireMock | 3.5 | Stubs JIRA HTTP responses in integration tests; no live JIRA needed in CI |
| Docker (multi-stage) | 24 | Build stage uses Maven image; runtime stage uses minimal Alpine JRE |
| Minikube | 1.32 | Single-node local Kubernetes for the demo |
| Jenkins | 2.x | Declarative pipeline with five stages; `junit` step publishes test results |
