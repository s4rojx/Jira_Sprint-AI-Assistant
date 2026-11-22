# Test Evidence
## JIRA Sprint AI Assistant

**Course:** Software Engineering & Project Management (S5CCS02), 2026–27 ODD SEM

---

## 1. Test Suite Overview

Run `mvn clean test` from the repository root to execute the full test suite. All tests pass with no live JIRA connection required — the JIRA integration tests use WireMock to stub HTTP responses.

```
[INFO] Tests run: <N>, Failures: 0, Errors: 0, Skipped: 0
[INFO] BUILD SUCCESS
```

> **Screenshot placeholder:** Paste a terminal screenshot of the final `mvn clean test` output showing `BUILD SUCCESS` and the test count here before the viva.

---

## 2. Test Classes

### 2.1 `SprintAssistantApplicationTests`

**Location:** `src/test/java/com/ablmvp/sprintassistant/SprintAssistantApplicationTests.java`  
**Tests:** 1  
**What it covers:** Spring application context loads successfully with stub JIRA properties injected via `@TestPropertySource`. Verifies that all beans wire without error (JiraProperties, JiraAgileApiClient, JiraDataService, SprintMetricsService, SprintAIAnalyzer, SprintApiController) and that validation constraints on `JiraProperties` are satisfied by the stub values.

---

### 2.2 `JiraIssueMapperTest`

**Location:** `src/test/java/com/ablmvp/sprintassistant/jira/JiraIssueMapperTest.java`  
**Tests:** 8+  
**What it covers:**

| Test | Assertion |
|------|-----------|
| Story points from `customfield_10016` | `issue.storyPoints()` equals expected value |
| Story points from `customfield_10028` fallback | Reads second field when first is absent |
| No story points field present | `storyPoints()` is null; no NPE |
| `statusCategory` correctly nested | `issue.statusCategory()` equals `"Done"` from nested JSON |
| `isCompleted()` true when statusCategory is "Done" | Returns `true` |
| `isCompleted()` false when statusCategory is "In Progress" | Returns `false` |
| Labels parsed correctly | `issue.labels()` contains all label strings |
| `sprintId` and `sprintName` from last element of `customfield_10020` array | Correct values from last element when multiple sprints present |
| Null-safe on minimal JSON (all optional fields absent) | No NPE; all nullable fields are null; labels is empty list |

---

### 2.3 `JiraDataServiceTest`

**Location:** `src/test/java/com/ablmvp/sprintassistant/jira/JiraDataServiceTest.java`  
**Tests:** 6+  
**What it covers:** Uses WireMock to stub `GET /rest/agile/1.0/board/1/sprint` and `GET /rest/agile/1.0/sprint/{id}/issue`.

| Test | Assertion |
|------|-----------|
| `listSprints()` returns mapped Sprint records | Correct sprint names, states, and IDs |
| `getSprint(id)` returns Sprint with issues attached | Issue count matches mocked response |
| `getActiveSprint()` returns the sprint with `state = "active"` | Correct sprint returned |
| `getSprint("unknown-id")` throws `SprintNotFoundException` | Exception type and message |
| `invalidateCache()` causes a re-fetch | WireMock request count increments from 1 to 2 on second call |
| Response field mapping | `issue.assignee()`, `issue.storyPoints()`, `issue.statusCategory()` correct |

---

### 2.4 `SprintMetricsServiceTest`

**Location:** `src/test/java/com/ablmvp/sprintassistant/metrics/SprintMetricsServiceTest.java`  
**Tests:** 10+  
**What it covers:** All tests build `Sprint` and `Issue` instances in-memory — no Spring context, no JIRA.

| Test | Assertion |
|------|-----------|
| Zero issues | `totalIssues = 0`, `completionRate = 0` |
| All issues completed | `completionRate = 100.0`, status = `HEALTHY` |
| Mixed state (completed, in-progress, blocked) | Correct counts in `SprintAnalysisResponse` |
| Blocked issues affect health | `blockedIssues` count matches; recommendation text contains "blocked" |
| HEALTHY band | Rate 85%, blocked ratio 10% → `HEALTHY` |
| WATCH band | Rate 70%, blocked ratio 25% → `WATCH` |
| AT_RISK band | Rate 50%, blocked ratio 50% → `AT_RISK` |
| Story-point sum ignores null values | Total equals sum of non-null story points only |
| Workload map includes only non-completed assigned issues | Completed issues not counted |
| Recommendations present when blocked > 0 | List is non-empty |

---

### 2.5 `SprintAIAnalyzerTest`

**Location:** `src/test/java/com/ablmvp/sprintassistant/metrics/SprintAIAnalyzerTest.java`  
**Tests:** 10+  
**What it covers:** All tests build in-memory Sprint/Issue instances.

| Test | Assertion |
|------|-----------|
| High probability when sprint is ahead | `completionProbability > 0.80` when 90% done and 50% elapsed |
| Low probability when mostly blocked | `completionProbability < 0.50` when 4 of 10 issues blocked |
| Probability clamped to [0.05, 0.98] | No value outside range regardless of extreme input |
| Trend `AHEAD` when completionRatio > elapsedFraction + 0.10 | Correct trend string |
| Trend `BEHIND` when completionRatio < elapsedFraction − 0.10 | Correct trend string |
| Risk `HIGH` for blocked + unassigned issue | Score ≥ 0.65, level = "HIGH" |
| Risk `LOW` for small assigned in-progress issue | Score > 0.25 but < 0.40, level = "LOW" |
| Completed issues not in risk list | No RiskItemResponse for Done issues |
| Recommendations only for unassigned non-Done issues | Assigned issues not in list |
| `daysRemaining` returns 0 when end date is in the past | Correct value |
| `daysRemaining` returns 7 when sprint has no end date | Default fallback |

---

## 3. Swagger UI Screenshot

> **Screenshot placeholder:** Capture `http://localhost:8080/swagger-ui.html` with all endpoints expanded — show the nine `/api/v1/sprints/...` endpoints and the actuator endpoints. Paste the screenshot here before the viva.

The Swagger UI lists the following endpoints (all described with `@Operation` annotations):

| Method | Path | Summary |
|--------|------|---------|
| `GET` | `/api/v1/sprints` | List all sprints from the configured JIRA board |
| `GET` | `/api/v1/sprints/active` | Get the currently active sprint with issues |
| `GET` | `/api/v1/sprints/{sprintId}` | Get sprint details by ID |
| `GET` | `/api/v1/sprints/{sprintId}/analysis` | Full sprint analysis with story-point metrics |
| `GET` | `/api/v1/sprints/{sprintId}/health` | Sprint health status with recommendations |
| `GET` | `/api/v1/sprints/{sprintId}/prediction` | AI-powered sprint completion prediction |
| `GET` | `/api/v1/sprints/{sprintId}/risks` | Identify at-risk issues with explanations |
| `GET` | `/api/v1/sprints/{sprintId}/recommendations` | Task assignment recommendations for unassigned issues |
| `POST` | `/api/v1/sprints/refresh` | Clear the data cache and force a refresh from JIRA |

---

## 4. Kubernetes Pod Screenshot

> **Screenshot placeholder:** Run `kubectl get pods -n sprint-assistant` and paste a screenshot showing one pod with status `Running` and `READY 1/1`. Also run `kubectl describe pod <name> -n sprint-assistant | grep -E "Image:|State:"` and include that output.

Expected output shape:

```
NAME                               READY   STATUS    RESTARTS   AGE
sprint-assistant-7d9f8b6c5-xk2pq  1/1     Running   0          5m
```

---

## 5. How to Reproduce

```bash
# 1. Clone and configure
git clone https://github.com/your-org/jira-sprint-ai-assistant.git
cd jira-sprint-ai-assistant

# 2. Run all tests (no JIRA credentials required)
mvn clean test

# 3. View Surefire reports
open target/surefire-reports/

# 4. Build and run
cp .env.example .env   # fill in real JIRA credentials
mvn clean package
java -jar target/sprint-assistant-*.jar

# 5. Open Swagger UI
open http://localhost:8080/swagger-ui.html
```
