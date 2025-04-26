package com.example.cosmeticsshop.controller;

import com.example.cosmeticsshop.domain.response.PromptDTO;
import com.example.cosmeticsshop.service.ChatGPTService;
import org.springframework.web.bind.annotation.*;

@CrossOrigin("*")
@RestController
@RequestMapping("/api/v1/chat")
public class ChatGPTController {
    private final ChatGPTService chatGPTService;

    public ChatGPTController(ChatGPTService chatGPTService) {
        this.chatGPTService = chatGPTService;
    }

    @PostMapping
    public String chat(@RequestBody PromptDTO userInput) {
        return chatGPTService.getChatResponse(userInput);
    }
}