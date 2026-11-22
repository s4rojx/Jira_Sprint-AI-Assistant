package com.ablmvp.sprintassistant;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.WebApplicationType;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@SpringBootApplication
@ConfigurationPropertiesScan
public class SprintAssistantApplication {

    public static void main(String[] args) {
        SpringApplication application = new SpringApplication(SprintAssistantApplication.class);
        if (Boolean.getBoolean("cli.enabled")) {
            application.setWebApplicationType(WebApplicationType.NONE);
        }
        application.run(args);
    }
}
