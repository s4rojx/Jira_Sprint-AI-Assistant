# Contribution Log
## JIRA Sprint AI Assistant

**Course:** Software Engineering & Project Management (S5CCS02), 2026–27 ODD SEM

Each row represents one deliverable task. Branch naming follows the convention `feat/PROJ-<n>-short-description` for features and `fix/PROJ-<n>-...` for fixes. Every PR references the JIRA issue key in its title.

---

## Teammate 1 — Phases 1 & 2

| Task | Branch | PR | Status |
|------|--------|----|--------|
| Delete CSV layer, rewrite domain models (`Issue`, `Sprint`), add `JiraProperties`, rewrite `application.properties`, add `.env.example` | `feat/PROJ-1-remove-csv-layer` | #1 | Merged |
| Update `pom.xml`: remove commons-csv, add JIRA client and Caffeine deps, add Atlassian repository | `feat/PROJ-2-pom-jira-deps` | #2 | Merged |
| Add `JiraClientConfig`, `JiraApiException` | `feat/PROJ-3-jira-client-config` | #3 | Merged |
| Implement `JiraAgileApiClient` (fetchSprints, fetchIssuesForSprint) | `feat/PROJ-4-agile-api-client` | #4 | Merged |
| Implement `JiraIssueMapper` and `JiraSprintMapper` | `feat/PROJ-5-jira-mappers` | #5 | Merged |
| Implement `JiraDataService` with Caffeine cache | `feat/PROJ-6-jira-data-service` | #6 | Merged |
| Add Phase 2 DTOs (`SprintSummaryResponse`, `SprintDetailResponse`, etc.) | `feat/PROJ-7-phase2-dtos` | #7 | Merged |
| Rewrite `SprintApiController` with live JIRA endpoints | `feat/PROJ-8-sprint-api-controller` | #8 | Merged |
| Add `JiraIssueMapperTest` (WireMock stubs, 8 test cases) | `feat/PROJ-9-issue-mapper-tests` | #9 | Merged |
| Add `JiraDataServiceTest` (WireMock stubs, 6 test cases) | `feat/PROJ-10-data-service-tests` | #10 | Merged |

---

## Teammate 2 — Phase 3

| Task | Branch | PR | Status |
|------|--------|----|--------|
| Implement `SprintMetricsService` (`analyze()`, `health()`) | `feat/PROJ-11-metrics-service` | #11 | Merged |
| Implement `SprintAIAnalyzer` (`predict()`, `identifyRisks()`, `recommendAssignments()`) | `feat/PROJ-12-ai-analyzer` | #12 | Merged |
| Add Phase 3 DTOs (`SprintHealthResponse`, `SprintAnalysisResponse`, `SprintPredictionResponse`, `RiskItemResponse`, `AssignmentRecommendationResponse`) | `feat/PROJ-13-phase3-dtos` | #13 | Merged |
| Add prediction, risks, and recommendations endpoints to `SprintApiController` | `feat/PROJ-14-ai-endpoints` | #14 | Merged |
| Add `SprintMetricsServiceTest` (10 test cases covering all three health bands) | `feat/PROJ-15-metrics-tests` | #15 | Merged |
| Add `SprintAIAnalyzerTest` (11 test cases covering probability bounds, risk levels, recommendations) | `feat/PROJ-16-ai-analyzer-tests` | #16 | Merged |

---

## Teammate 3 — Phase 4

| Task | Branch | PR | Status |
|------|--------|----|--------|
| Bootstrap React + Vite + TypeScript frontend, configure Tailwind CSS | `feat/PROJ-17-frontend-bootstrap` | #17 | Merged |
| Implement TypeScript API client (`src/api/client.ts`) and type definitions (`src/types/sprint.ts`) | `feat/PROJ-18-api-client-ts` | #18 | Merged |
| Implement shared components: `HealthBadge`, `MetricCard`, `SprintSelector`, `IssueTable`, `CompletionChart` | `feat/PROJ-19-shared-components` | #19 | Merged |
| Implement `RiskList` and `RecommendationList` components | `feat/PROJ-20-risk-rec-components` | #20 | Merged |
| Implement Dashboard page (health badge, metric cards, completion bar, recommendations, refresh button) | `feat/PROJ-21-dashboard-page` | #21 | Merged |
| Implement Sprint Analysis page (selector, story-point chart, workload table, issue table) | `feat/PROJ-22-analysis-page` | #22 | Merged |
| Implement AI Insights page (prediction, trend, risk table, assignment recommendations) | `feat/PROJ-23-ai-insights-page` | #23 | Merged |
| Add `frontend-maven-plugin` and `maven-resources-plugin` to `pom.xml`; verify `mvn clean package` bundles the React assets | `feat/PROJ-24-maven-frontend-build` | #24 | Merged |
| Add `SpaController` for React client-side routing fallback | `feat/PROJ-25-spa-controller` | #25 | Merged |
| Implement `SprintCliRunner` (`list-sprints`, `analyze-sprint` commands) | `feat/PROJ-26-cli-runner` | #26 | Merged |

---

## Teammate 4 — Phases 5 & 6

| Task | Branch | PR | Status |
|------|--------|----|--------|
| Create `Dockerfile` (multi-stage, non-root user, HEALTHCHECK) and `.dockerignore` | `feat/PROJ-27-dockerfile` | #27 | Merged |
| Create Kubernetes manifests: `namespace.yaml`, `secret.yaml`, `deployment.yaml`, `service.yaml` | `feat/PROJ-28-k8s-manifests` | #28 | Merged |
| Create `Jenkinsfile` (six-stage declarative pipeline) | `feat/PROJ-29-jenkinsfile` | #29 | Merged |
| Create `scripts/deploy-local.sh` | `feat/PROJ-30-deploy-script` | #30 | Merged |
| Write `README.md` (ten sections: purpose, prerequisites, quick-start, JIRA setup, env vars, API reference, CLI reference, Docker, Kubernetes, team table) | `feat/PROJ-31-readme` | #31 | Merged |
| Write `docs/SRS.md` (FR-01 through FR-15, five NFRs, constraints, assumptions) | `feat/PROJ-32-srs` | #32 | Merged |
| Write `docs/SDS.md` (architecture, package structure, domain model, all eight endpoint shapes, data flow, security design, technology choices) | `feat/PROJ-33-sds` | #33 | Merged |
| Write `docs/UML_DIAGRAMS.md` (four Mermaid diagrams: use case, activity, sequence, deployment) | `feat/PROJ-34-uml-diagrams` | #34 | Merged |
| Write `docs/DEMO_SCRIPT.md` (pre-demo checklist, six demo steps, Q&A table) | `feat/PROJ-35-demo-script` | #35 | Merged |
| Write `docs/TEST_EVIDENCE.md` (test class table, Swagger screenshot placeholder, pod screenshot placeholder) | `feat/PROJ-36-test-evidence` | #36 | Merged |
| Write `docs/CONTRIBUTION_LOG.md` | `feat/PROJ-37-contribution-log` | #37 | Merged |
