package com.softlovely.softlovely.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "http://localhost:3000")
public class AIController {

    public static class StoryRequest {
        public String eventId;
        public String eventTitle;
        public String eventDescription;

        public StoryRequest() {}
    }

    public static class StoryResponse {
        public String story;
        public StoryResponse() {}
        public StoryResponse(String story) { this.story = story; }
    }

    @PostMapping("/generate-story")
    public ResponseEntity<?> generateStory(@RequestBody StoryRequest req) {
        try {
            // Placeholder for AI story generation
            // In production, integrate with OpenAI or similar service
            String generatedStory = "Uma história de amor sobre: " + req.eventTitle + ". " + req.eventDescription;
            return ResponseEntity.ok(new StoryResponse(generatedStory));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new StoryResponse("Erro ao gerar história"));
        }
    }
}

