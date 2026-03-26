package com.softlovely.softlovely.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class AwsS3Service {

    private final Path uploadsDir = Paths.get("uploads");

    public AwsS3Service() {
        try {
            if (!Files.exists(uploadsDir)) Files.createDirectories(uploadsDir);
        } catch (IOException e) {
            throw new RuntimeException("Unable to create uploads directory", e);
        }
    }

    // Simple local fallback that writes the file to uploads/ and returns a relative URL
    public String upload(MultipartFile file) {
        String filename = UUID.randomUUID().toString() + "-" + sanitize(file.getOriginalFilename());
        Path target = uploadsDir.resolve(filename);
        try {
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
            // In production this would be the S3 public URL
            return "/uploads/" + filename;
        } catch (IOException e) {
            throw new RuntimeException("Failed to store file", e);
        }
    }

    private String sanitize(String original) {
        if (original == null) return "file";
        return original.replaceAll("[^a-zA-Z0-9._-]", "_");
    }
}

