# JIRA Sprint AI Assistant

## 1. What it does

JIRA Sprint AI Assistant connects to a live JIRA Scrum board, fetches real sprint and issue data, and surfaces sprint health, story-point metrics, and AI-driven insights through a React dashboard and a REST API. The "AI" layer uses three deterministic heuristics — progress-pace ratio, blocked-issue penalty, and unassigned-issue penalty — to predict sprint completion probability, flag at-risk issues with mitigations, and recommend task assignments. It also exposes a CLI for quick terminal analysis and ships with a full Docker + Kubernetes + Jenkins delivery pipeline.

---

## 2. Prerequisites

| Tool | Minimum version |
|------|----------------|
| Java (JDK) | 21 |
| Apache Maven | 3.9 |
| Docker | 24 |
| Minikube | 1.32 |
| kubectl | 1.29 |
| JIRA Cloud account | — (personal API token required) |

---

## 3. Local quick-start

```bash
# 1. Clone the repository
git clone https://github.com/your-org/jira-sprint-ai-assistant.git
cd jira-sprint-ai-assistant

# 2. Copy the environment template and fill in your JIRA credentials
cp .env.example .env
# Edit .env — set JIRA_BASE_URL, JIRA_USERNAME, JIRA_API_TOKEN, JIRA_PROJECT_KEY, JIRA_BOARD_ID

# 3. Build and test
mvn clean package

# 4. Run the application
java --env-file .env -jar target/sprint-assistant-*.jar
# Or with explicit env vars:
# JIRA_BASE_URL=https://your-domain.atlassian.net JIRA_USERNAME=... JIRA_API_TOKEN=... \
#   java -jar target/sprint-assistant-*.jar

# 5. Open the dashboard
open http://localhost:8080
```

The Swagger UI is available at `http://localhost:8080/swagger-ui.html`.

---

## 4. JIRA setup

### Create a personal API token

1. Log in to your Atlassian account at <https://id.atlassian.com/manage-profile/security/api-tokens>.
2. Click **Create API token**, give it a label (e.g. `sprint-assistant`), and copy the token value.
3. Set `JIRA_USERNAME` to your Atlassian account email and `JIRA_API_TOKEN` to the token.

### Find your board ID

1. Open JIRA and navigate to the Scrum board you want to analyse.
2. The board ID is in the URL: `https://your-domain.atlassian.net/jira/software/projects/PROJ/boards/42` — the number at the end (`42`) is `JIRA_BOARD_ID`.

---

## 5. Environment variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `JIRA_BASE_URL` | Yes | — | Your Atlassian Cloud URL, e.g. `https://your-domain.atlassian.net` |
| `JIRA_USERNAME` | Yes | — | Your Atlassian account email address |
| `JIRA_API_TOKEN` | Yes | — | Personal API token from Atlassian account settings |
| `JIRA_PROJECT_KEY` | Yes | — | JIRA project key, e.g. `PROJ` |
| `JIRA_BOARD_ID` | Yes | — | Numeric ID of the Scrum board |
| `JIRA_MAX_RESULTS` | No | `100` | Maximum issues fetched per sprint |
| `JIRA_CACHE_TTL` | No | `5` | Cache time-to-live in minutes |

Never commit a `.env` file containing real credentials. Use `kubectl create secret` or the provided `kubernetes/secret.yaml` for Kubernetes deployments.

---

## 6. API reference

All endpoints are under the base path `/api/v1/sprints`.

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/v1/sprints` | List all sprints (bare, no issues) from the configured board |
| `GET` | `/api/v1/sprints/active` | Active sprint with full issue list |
| `GET` | `/api/v1/sprints/{id}` | Sprint detail by ID with full issue list |
| `GET` | `/api/v1/sprints/{id}/analysis` | Story-point metrics, workload map, identified risks |
| `GET` | `/api/v1/sprints/{id}/health` | Health status (`HEALTHY` / `WATCH` / `AT_RISK`) with recommendations |
| `GET` | `/api/v1/sprints/{id}/prediction` | Completion probability (0.05–0.98), trend, insights |
| `GET` | `/api/v1/sprints/{id}/risks` | Per-issue risk items sorted by score descending |
| `GET` | `/api/v1/sprints/{id}/recommendations` | Assignment recommendations for unassigned issues |
| `POST` | `/api/v1/sprints/refresh` | Clear in-memory cache; force next request to re-fetch from JIRA |

Actuator endpoints: `GET /actuator/health`, `GET /actuator/info`, `GET /actuator/metrics`.

---

## 7. CLI reference

Activate the CLI by passing `-Dcli.enabled=true`. The web server does **not** start in CLI mode.

```bash
# List all sprints
java -Dcli.enabled=true -jar target/sprint-assistant-*.jar list-sprints

# Example output:
#
# ID          Name                                      State      Issues
# ----------------------------------------------------------------------
# 42          Sprint 7 — Backend Hardening              active         18
# 41          Sprint 6 — Auth & Permissions             closed         22
# 40          Sprint 5 — API Layer                      closed         19
#
# Total: 3 sprints


# Full analysis of a specific sprint
java -Dcli.enabled=true -jar target/sprint-assistant-*.jar analyze-sprint 42

# Example output:
#
# === Sprint 7 — Backend Hardening (active) ===
# ID: 42
# Period: 2026-11-18T09:00 to 2026-12-02T18:00
#
# Issues:
#   Total       : 18
#   Completed   : 11
#   In Progress : 5
#   Blocked     : 2
#   Unassigned  : 1
#
# Story Points:
#   Total       : 55.0
#   Completed   : 34.0
#   Completion  : 61.8%
#
# Health: WATCH
# Reason: Completion rate 60-79% or blocked ratio 20-40%.
#
# Recommendations:
#   * Resolve 2 blocked issue(s) in today's standup.
#   * Increase daily check-in frequency to catch blockers early.
#
# Risks:
#   ! 2 issue(s) are blocked
```

---

## 8. Docker

```bash
# Build the image
docker build -t sprint-assistant:latest .

# Run with environment file
docker run --rm -p 8080:8080 --env-file .env sprint-assistant:latest

# Health check
curl http://localhost:8080/actuator/health
```

---

## 9. Kubernetes deployment

```bash
# Start Minikube (if not already running)
minikube start

# Edit kubernetes/secret.yaml with real JIRA credentials, then deploy
./scripts/deploy-local.sh

# Verify the pod is running
kubectl get pods -n sprint-assistant

# Open the dashboard
open http://$(minikube ip):30080
```

The script builds the JAR, builds the Docker image, loads it into Minikube's registry, applies all four manifests (`namespace`, `secret`, `deployment`, `service`), and waits for the rollout to complete.

---

## 10. Team

| Name | USN | Assigned phase |
|------|-----|----------------|
| Teammate 1 | USN-001 | Phase 1 — Codebase surgery & Phase 2 — Live JIRA data layer |
| Teammate 2 | USN-002 | Phase 3 — Metrics and AI analysis |
| Teammate 3 | USN-003 | Phase 4 — React frontend and CLI |
| Teammate 4 | USN-004 | Phase 5 — DevOps pipeline & Phase 6 — Documentation and demo |

**Course:** Software Engineering & Project Management (S5CCS02), 2026–27 ODD SEM  
**Deadline:** 16 December 2026
