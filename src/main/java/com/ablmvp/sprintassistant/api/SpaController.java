package com.ablmvp.sprintassistant.api;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/** Serves the React entry point for browser routes handled by React Router. */
@Controller
public class SpaController {

    @GetMapping({"/", "/analysis", "/insights"})
    public String forwardToFrontend() {
        return "forward:/index.html";
    }
}
