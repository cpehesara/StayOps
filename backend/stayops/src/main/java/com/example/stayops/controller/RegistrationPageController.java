package com.example.stayops.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
public class RegistrationPageController {

    @GetMapping("/registration")
    public String showRegistrationPage(@RequestParam("token") String token, Model model) {
        model.addAttribute("token", token);
        return "registration";
    }

    @GetMapping("/registration-success")
    public String registrationSuccess() {
        return "registration-success";
    }
}