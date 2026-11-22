# Software Requirements Specification
## JIRA Sprint AI Assistant

**Course:** Software Engineering & Project Management (S5CCS02), 2026–27 ODD SEM  
**Version:** 1.0  
**Date:** December 2026

---

## 1. Introduction

### 1.1 Purpose

This document specifies the functional and non-functional requirements for the JIRA Sprint AI Assistant. It is the authoritative reference for what the system must do and serves as the basis for the Software Design Specification (SDS) and test evidence.

### 1.2 Scope

The system is a single Spring Boot web application that integrates with the JIRA Cloud REST API to provide real-time sprint health monitoring, AI-driven completion predictions, risk identification, and task-assignment recommendations. It exposes a REST API, a React single-page dashboard, and a command-line interface. It deploys as a Docker container on a Kubernetes cluster managed by Minikube, with a Jenkins CI/CD pipeline.

### 1.3 Definitions

| Term | Meaning |
|------|---------|
| Sprint | A JIRA Scrum sprint — a time-boxed iteration with a set of issues |
| Issue | A JIRA work item (Story, Bug, Task, Sub-task, Epic) |
| Story points | A numeric complexity estimate attached to an issue via JIRA custom field |
| Completion rate | Completed story points ÷ total story points × 100 |
| Blocked issue | An issue whose JIRA status name contains the word "blocked" |
| Unassigned issue | An active (non-Done) issue with no JIRA assignee |
| Health status | One of `HEALTHY`, `WATCH`, or `AT_RISK` |
| Completion probability | A score in [0.05, 0.98] produced by the three-heuristic model |

### 1.4 References

- JIRA Agile REST API v1.0 — `https://developer.atlassian.com/cloud/jira/software/rest/api-group-board/`
- Spring Boot 3.5 reference — `https://docs.spring.io/spring-boot/docs/3.5.x/reference/`
- FINAL_IMPLEMENTATION_PLAN.md (repository root)

---

## 2. System Scope

The system reads data from one JIRA Scrum board, configured at startup via environment variables. It does not write back to JIRA. It has no persistent database — all state is held in a short-lived in-memory cache (default TTL: 5 minutes). The system is single-tenant: one JIRA board per deployment.

---

## 3. User Roles

| Role | Description |
|------|-------------|
| Scrum Master | Primary user. Views the dashboard daily to monitor sprint health, reads AI insights, and uses recommendations to unblock the team. |
| Developer | Views the dashboard to understand their assigned issues and workload. |
| Product Owner | Checks sprint health and completion probability to plan scope changes. |
| CI/CD System | Triggers the Jenkins pipeline on every push to `main`. Deploys the Docker image to Minikube. |

---

## 4. Functional Requirements

### FR-01 — List sprints
The system shall fetch all sprints for the configured board via `GET /rest/agile/1.0/board/{boardId}/sprint` and return them as a JSON array through `GET /api/v1/sprints`.

### FR-02 — Active sprint
The system shall identify the sprint with `state = "active"` and return it with its full issue list through `GET /api/v1/sprints/active`. If no active sprint exists the system shall return HTTP 404.

### FR-03 — Sprint by ID
The system shall return the full sprint detail (including all issues) for a given sprint ID through `GET /api/v1/sprints/{id}`. An unknown ID shall return HTTP 404. A blank or null ID shall return HTTP 400.

### FR-04 — Issue data
Each issue returned by the system shall include: key, summary, issue type, status, status category, priority, assignee display name, story points, time-tracking fields, created/updated/resolution dates, labels, and the most recent sprint ID and name from `customfield_10020`.

### FR-05 — Story-point metrics
The system shall compute total story points and completed story points for a sprint by summing the `storyPoints` field across all issues and completed issues respectively. It shall compute the completion rate as `(completedSP / totalSP) × 100`, rounded to one decimal place.

### FR-06 — Sprint analysis
`GET /api/v1/sprints/{id}/analysis` shall return total issues, completed issues, in-progress issues, blocked issues, unassigned active issues, total story points, completed story points, completion rate, workload by assignee (map of assignee name → active issue count), and a list of identified risk strings.

### FR-07 — Sprint health classification
`GET /api/v1/sprints/{id}/health` shall classify the sprint into one of three statuses using these thresholds:
- `HEALTHY`: completion rate ≥ 80% **and** blocked ratio ≤ 20%.
- `WATCH`: completion rate ≥ 60% **or** blocked ratio ≤ 40% (and not HEALTHY).
- `AT_RISK`: completion rate < 60% **and** blocked ratio > 40%.

The response shall include the status, a human-readable reason, and a list of actionable recommendations.

### FR-08 — Completion prediction
`GET /api/v1/sprints/{id}/prediction` shall return a completion probability between 0.05 and 0.98 using three heuristics:
- **H1** (progress-pace ratio): `min(1.0, completionRatio / max(elapsedFraction, 0.01))`. Measures whether the team is ahead of a linear pace.
- **H2** (blocked penalty): `min(0.40, blockedCount × 0.05)`. Deducts 5% per blocked issue, capped at 40%.
- **H3** (unassigned penalty): `min(0.20, unassignedCount × 0.03)`. Deducts 3% per unassigned active issue, capped at 20%.

`probability = clamp(H1 − H2 − H3, 0.05, 0.98)`

The response shall also include days remaining, trend (`AHEAD` / `ON_TRACK` / `BEHIND`), insights, bottlenecks, and suggested actions.

### FR-09 — Risk identification
`GET /api/v1/sprints/{id}/risks` shall evaluate every non-Done issue against five risk factors and return items with score > 0.25, sorted by score descending:
- Blocked: +0.40
- High/Highest priority and not started: +0.30
- In-progress and not updated for > 3 days: +0.20
- Story points > 8: +0.15
- No assignee: +0.10

Risk level: `HIGH` ≥ 0.65, `MEDIUM` ≥ 0.40, `LOW` > 0.25.

### FR-10 — Assignment recommendations
`GET /api/v1/sprints/{id}/recommendations` shall, for each unassigned non-Done issue, recommend the team member with the fewest current active tasks (ties broken alphabetically). Confidence = `max(0.40, 1.0 − load × 0.10)`.

### FR-11 — Cache and refresh
The system shall cache sprint lists and sprint details in memory using Caffeine. The default TTL is 5 minutes (configurable via `JIRA_CACHE_TTL`). `POST /api/v1/sprints/refresh` shall invalidate all caches and return HTTP 204.

### FR-12 — React dashboard
The application shall serve a React + TypeScript single-page application at `/` that shows:
- **Dashboard page**: active sprint health badge, four metric cards (total/completed/in-progress/blocked), completion percentage bar, and AI recommendations.
- **Sprint Analysis page**: sprint selector, metric cards, story-point bar chart, workload table, and paginated issue table.
- **AI Insights page**: completion probability, trend badge, days remaining, insights, risk table, and assignment recommendations.

### FR-13 — CLI
The application shall expose two CLI commands when started with `-Dcli.enabled=true`:
- `list-sprints`: prints a formatted table of all sprints (ID, name, state, issue count).
- `analyze-sprint <sprintId>`: prints full metrics and health for the specified sprint.

### FR-14 — Error handling
All API errors shall return a JSON body `{"status": <httpCode>, "message": "<description>"}`. HTTP 404 for unknown sprints, HTTP 400 for blank sprint IDs, HTTP 500 for unexpected errors.

### FR-15 — Actuator health
`GET /actuator/health` shall return `{"status": "UP"}` when the application is running. This endpoint is used by the Kubernetes liveness and readiness probes and by the Jenkins smoke test stage.

---

## 5. Non-Functional Requirements

### NFR-01 — Performance
The API shall respond within 2 seconds for cached requests. Fresh JIRA fetches (cache miss) are bounded by JIRA API latency plus mapper overhead, which must not exceed 10 seconds.

### NFR-02 — Security
- JIRA credentials (base URL, username, API token) shall be supplied exclusively via environment variables. They shall never appear in source code, log output, or HTTP responses.
- The application shall use HTTPS to communicate with the JIRA API.
- In Kubernetes, credentials shall be stored in a `Secret` object, not in `ConfigMap` or `Deployment` manifests.

### NFR-03 — Usability
The React dashboard shall render correctly in a modern desktop browser (Chrome, Firefox, Edge). Key metrics shall be visible without scrolling on a 1280×800 viewport.

### NFR-04 — Reliability
The application shall not crash when JIRA returns null or missing fields for optional issue attributes. All optional fields (story points, assignee, dates) shall be treated as nullable throughout the domain model and mappers.

### NFR-05 — Testability
Every service and mapper shall be unit-testable without a live JIRA connection. Integration tests shall use WireMock to stub JIRA HTTP responses. The test suite shall pass with `mvn clean test` without any real JIRA credentials set.

### NFR-06 — Deployability
The application shall be packaged as a single executable JAR and as a Docker image. The Docker image shall run as a non-root user. A Kubernetes Deployment manifest shall define liveness and readiness probes.

### NFR-07 — Maintainability
Package structure shall follow a layered architecture: `api` (controllers + DTOs), `jira` (HTTP client + mappers), `metrics` (services), `domain` (records), `config`, `cli`. No layer shall depend on a higher layer.

---

## 6. Constraints

- The system uses Java 21 and Spring Boot 3.5. No older Java version is supported.
- The JIRA integration targets JIRA Cloud (Atlassian REST API v2 and Agile REST API v1). JIRA Server / Data Center are not tested.
- The system does not persist data to a database. Historical trend analysis across multiple runs is out of scope.
- The team is four members; each member owns one or two phases as documented in the work allocation table.

---

## 7. Assumptions

- The configured JIRA board has at least one active sprint during the demo.
- Story points are stored in JIRA custom field `customfield_10016` (the standard Atlassian field for next-gen projects). The mapper also falls back to `customfield_10028`.
- The demo environment has outbound HTTPS access to `atlassian.net`.
- Minikube is running on a machine with at least 4 GB of RAM available to the cluster.
