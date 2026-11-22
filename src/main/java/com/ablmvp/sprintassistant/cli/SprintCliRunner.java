package com.ablmvp.sprintassistant.cli;

import com.ablmvp.sprintassistant.api.dto.SprintAnalysisResponse;
import com.ablmvp.sprintassistant.api.dto.SprintHealthResponse;
import com.ablmvp.sprintassistant.domain.Sprint;
import com.ablmvp.sprintassistant.jira.JiraDataService;
import com.ablmvp.sprintassistant.metrics.SprintMetricsService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import java.util.Comparator;
import java.util.List;

@Component
@ConditionalOnProperty(name = "cli.enabled", havingValue = "true")
public class SprintCliRunner implements CommandLineRunner {

    private final JiraDataService jiraDataService;
    private final SprintMetricsService metricsService;

    public SprintCliRunner(JiraDataService jiraDataService, SprintMetricsService metricsService) {
        this.jiraDataService = jiraDataService;
        this.metricsService = metricsService;
    }

    @Override
    public void run(String... args) {
        if (args.length == 0) {
            printUsage();
            return;
        }
        switch (args[0]) {
            case "list-sprints" -> doListSprints();
            case "analyze-sprint" -> {
                if (args.length < 2 || args[1].isBlank()) {
                    System.err.println("Error: provide a sprint ID.");
                    printUsage();
                } else {
                    doAnalyzeSprint(args[1]);
                }
            }
            default -> {
                System.err.println("Unknown command: " + args[0]);
                printUsage();
            }
        }
    }

    private void doListSprints() {
        List<Sprint> sprints = jiraDataService.listSprints();
        System.out.printf("%n%-10s  %-40s  %-12s  %7s%n", "ID", "Name", "State", "Issues");
        System.out.println("-".repeat(76));
        sprints.stream().sorted(Comparator.comparing(Sprint::name,
                        Comparator.nullsLast(String.CASE_INSENSITIVE_ORDER)))
                .forEach(s -> System.out.printf("%-10s  %-40.40s  %-12s  %7d%n",
                        s.id(), s.name(), s.state(), s.totalIssues()));
        System.out.println("\nTotal: " + sprints.size() + " sprints");
    }

    private void doAnalyzeSprint(String sprintId) {
        Sprint sprint = jiraDataService.getSprint(sprintId);
        SprintAnalysisResponse analysis = metricsService.analyze(sprint);
        SprintHealthResponse health = metricsService.health(sprint);

        System.out.println("\n=== " + sprint.name() + " (" + sprint.state() + ") ===");
        System.out.println("ID: " + sprint.id());
        System.out.printf("Period: %s to %s%n", sprint.startDate(), sprint.endDate());
        System.out.println("\nIssues:");
        System.out.println("  Total       : " + analysis.totalIssues());
        System.out.println("  Completed   : " + analysis.completedIssues());
        System.out.println("  In Progress : " + analysis.inProgressIssues());
        System.out.println("  Blocked     : " + analysis.blockedIssues());
        System.out.println("  Unassigned  : " + analysis.unassignedActiveIssues());
        System.out.println("\nStory Points:");
        System.out.println("  Total       : " + analysis.totalStoryPoints());
        System.out.println("  Completed   : " + analysis.completedStoryPoints());
        System.out.println("  Completion  : " + analysis.completionRate() + "%");
        System.out.println("\nHealth: " + health.status());
        System.out.println("Reason: " + health.statusReason());
        if (!health.recommendations().isEmpty()) {
            System.out.println("\nRecommendations:");
            health.recommendations().forEach(item -> System.out.println("  * " + item));
        }
        if (!analysis.identifiedRisks().isEmpty()) {
            System.out.println("\nRisks:");
            analysis.identifiedRisks().forEach(item -> System.out.println("  ! " + item));
        }
    }

    private void printUsage() {
        System.out.println("""

                JIRA Sprint AI Assistant - CLI
                Usage (run with -Dcli.enabled=true):
                  list-sprints                List all sprints on the board
                  analyze-sprint <sprintId>   Full analysis of a specific sprint

                Examples:
                  java -Dcli.enabled=true -jar sprint-assistant.jar list-sprints
                  java -Dcli.enabled=true -jar sprint-assistant.jar analyze-sprint 42
                """);
    }
}
