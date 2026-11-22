# UML Diagrams
## JIRA Sprint AI Assistant

**Course:** Software Engineering & Project Management (S5CCS02), 2026–27 ODD SEM

All diagrams are written in [Mermaid](https://mermaid.js.org/) and render natively in GitHub, GitLab, and most modern markdown viewers.

---

## 1. Use Case Diagram

```mermaid
graph TD
    User((User\nScrum Master /\nDeveloper /\nProduct Owner))
    CICD((CI/CD System\nJenkins))

    UC1[View Dashboard]
    UC2[Select Sprint]
    UC3[View Sprint Analysis]
    UC4[View AI Insights]
    UC5[View Risk Items]
    UC6[View Assignment Recommendations]
    UC7[Refresh Data Cache]
    UC8[Run CLI — list-sprints]
    UC9[Run CLI — analyze-sprint]
    UC10[Trigger Jenkins Pipeline]
    UC11[Deploy to Kubernetes]
    UC12[Run Smoke Test]

    User --> UC1
    User --> UC2
    User --> UC3
    User --> UC4
    User --> UC5
    User --> UC6
    User --> UC7
    User --> UC8
    User --> UC9

    CICD --> UC10
    UC10 --> UC11
    UC11 --> UC12

    UC1 -.->|includes| UC2
    UC3 -.->|includes| UC2
    UC4 -.->|includes| UC5
    UC4 -.->|includes| UC6
```

---

## 2. Activity Diagram — From Browser Open to Sprint Analysis

```mermaid
flowchart TD
    A([User opens browser]) --> B[React app loads at /]
    B --> C[Dashboard page mounts]
    C --> D{Fetch active sprint\nGET /api/v1/sprints/active}
    D -->|Cache hit| E[Return cached Sprint]
    D -->|Cache miss| F[JiraAgileApiClient\ncalls JIRA API]
    F --> G{JIRA returns\n200 OK?}
    G -->|Yes| H[Map JSON → Sprint + Issues]
    H --> I[Store in Caffeine cache]
    I --> E
    G -->|No| J[Throw JiraApiException]
    J --> K[ApiExceptionHandler\nreturns HTTP 500]
    K --> L[React shows error state]
    E --> M[SprintMetricsService.health]
    M --> N{Completion rate\n≥ 80% and\nblocked ≤ 20%?}
    N -->|Yes| O[status = HEALTHY]
    N -->|No| P{Rate ≥ 60% or\nblocked ≤ 40%?}
    P -->|Yes| Q[status = WATCH]
    P -->|No| R[status = AT_RISK]
    O --> S[Render Dashboard\nHealth badge + metric cards]
    Q --> S
    R --> S
    S --> T[User selects sprint\nfrom dropdown]
    T --> U[Fetch GET /api/v1/sprints/{id}/analysis]
    U --> V[Render Sprint Analysis page\nChart + Workload table + Issue table]
    V --> W([Done])
```

---

## 3. Sequence Diagram — Browser → React → Spring Boot → JIRA API

```mermaid
sequenceDiagram
    actor User
    participant Browser as Browser (React)
    participant API as SprintApiController
    participant DS as JiraDataService
    participant Cache as Caffeine Cache
    participant Client as JiraAgileApiClient
    participant JIRA as JIRA Cloud REST API

    User->>Browser: Open http://localhost:8080

    Note over Browser: Dashboard mounts, calls sprintApi.getActiveSprint()
    Browser->>API: GET /api/v1/sprints/active
    API->>DS: getActiveSprint()
    DS->>DS: listSprints() → find active
    DS->>Cache: get("all")
    Cache-->>DS: miss

    DS->>Client: fetchSprints()
    Client->>JIRA: GET /rest/agile/1.0/board/42/sprint
    JIRA-->>Client: 200 OK [sprintArray]
    Client-->>DS: List<JsonNode>

    DS->>DS: map to Sprint records (bare)
    DS->>Cache: put("all", sprints)

    DS->>Cache: get(sprintId)
    Cache-->>DS: miss

    DS->>Client: fetchIssuesForSprint("42")
    Client->>JIRA: GET /rest/agile/1.0/sprint/42/issue
    JIRA-->>Client: 200 OK {issues:[...]}
    Client-->>DS: List<JsonNode>

    DS->>DS: JiraIssueMapper.map() × N
    DS->>DS: JiraSprintMapper.map(node, issues)
    DS->>Cache: put("42", sprint)
    DS-->>API: Sprint

    API->>API: toDetail(sprint)
    API-->>Browser: 200 SprintDetailResponse (JSON)

    Note over Browser: Calls sprintApi.getHealth()
    Browser->>API: GET /api/v1/sprints/42/health
    API->>DS: getSprint("42")
    DS->>Cache: get("42")
    Cache-->>DS: hit → Sprint
    DS-->>API: Sprint
    API->>API: SprintMetricsService.health(sprint)
    API-->>Browser: 200 SprintHealthResponse (JSON)

    Browser->>User: Renders Dashboard\nHealth badge + metric cards
```

---

## 4. Deployment Diagram

```mermaid
graph TB
    subgraph Developer_Machine["Developer Machine"]
        DEV[Source Code\ngit push → main]
    end

    subgraph Jenkins_Server["Jenkins Server"]
        JEN_CO[Stage: Checkout]
        JEN_BT[Stage: Build & Test\nmvn clean test]
        JEN_PKG[Stage: Package\nmvn package -DskipTests]
        JEN_DOC[Stage: Docker Build\ndocker build]
        JEN_DEP[Stage: Deploy to Kubernetes\nkubectl apply + rollout]
        JEN_SMK[Stage: Smoke Test\nkubectl exec wget /actuator/health]
        JEN_CO --> JEN_BT --> JEN_PKG --> JEN_DOC --> JEN_DEP --> JEN_SMK
    end

    subgraph Minikube_Cluster["Minikube Cluster"]
        subgraph Namespace["Namespace: sprint-assistant"]
            SECRET[Secret: jira-credentials\nJIRA_BASE_URL\nJIRA_USERNAME\nJIRA_API_TOKEN\n...]
            POD[Pod: sprint-assistant\neclipse-temurin:21-jre-alpine\nSpring Boot app\nport 8080]
            SVC[Service: NodePort\nport 30080 → 8080]
            POD -.->|reads env from| SECRET
            SVC -->|routes to| POD
        end
    end

    subgraph External["External Services"]
        JIRA_CLOUD[JIRA Cloud\nhttps://your-domain.atlassian.net\nAgile REST API]
    end

    subgraph End_User["End User"]
        BROWSER[Browser\nhttp://minikube-ip:30080]
    end

    DEV -->|push| JEN_CO
    JEN_DOC -->|minikube image load| POD
    BROWSER -->|NodePort 30080| SVC
    POD -->|HTTPS| JIRA_CLOUD
```
