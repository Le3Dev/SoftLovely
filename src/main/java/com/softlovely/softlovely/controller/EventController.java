package com.softlovely.softlovely.controller;

import com.softlovely.softlovely.dto.EventDtos;
import com.softlovely.softlovely.service.TimelineEventService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/events")
@CrossOrigin(origins = "http://localhost:3000")
public class EventController {

    @Autowired
    private TimelineEventService eventService;

    @GetMapping("/{id}")
    public ResponseEntity<?> getEventById(@PathVariable String id) {
        try {
            EventDtos.EventResponse response = eventService.getEventById(id);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new EventDtos.EventResponse());
        }
    }

    @GetMapping("/couple/{coupleId}")
    public ResponseEntity<?> getEventsByCoupleId(@PathVariable String coupleId) {
        try {
            List<EventDtos.EventResponse> response = eventService.getEventsByCoupleId(coupleId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @PostMapping
    public ResponseEntity<?> createEvent(@RequestBody EventDtos.CreateRequest req) {
        try {
            EventDtos.EventResponse response = eventService.createEvent(req);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new EventDtos.EventResponse());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateEvent(@PathVariable String id, @RequestBody EventDtos.UpdateRequest req) {
        try {
            EventDtos.EventResponse response = eventService.updateEvent(id, req);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new EventDtos.EventResponse());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteEvent(@PathVariable String id) {
        try {
            eventService.deleteEvent(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @PostMapping("/{coupleId}/upload-photos")
    public ResponseEntity<?> uploadPhotos(@PathVariable String coupleId, @RequestParam("files") MultipartFile[] files) {
        try {
            List<String> uploadedPaths = new ArrayList<>();
            String uploadDir = "uploads/" + coupleId;
            
            // Create directory if it doesn't exist
            Files.createDirectories(Paths.get(uploadDir));
            
            for (MultipartFile file : files) {
                if (!file.isEmpty()) {
                    String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
                    Path filePath = Paths.get(uploadDir, fileName);
                    Files.write(filePath, file.getBytes());
                    uploadedPaths.add("/uploads/" + coupleId + "/" + fileName);
                }
            }
            
            return ResponseEntity.ok(new EventDtos.PhotoUploadResponse(uploadedPaths));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Erro ao fazer upload das fotos");
        }
    }
}

