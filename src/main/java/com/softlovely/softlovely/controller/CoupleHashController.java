package com.softlovely.softlovely.controller;

import com.softlovely.softlovely.dto.CoupleDtos;
import com.softlovely.softlovely.service.CoupleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/couples/hash")
@CrossOrigin(origins = "http://localhost:3000")
public class CoupleHashController {

    @Autowired
    private CoupleService coupleService;

    @GetMapping("/{hash}")
    public ResponseEntity<?> getCoupleByHash(@PathVariable String hash) {
        try {
            CoupleDtos.CoupleResponse response = coupleService.getCoupleByHash(hash);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new CoupleDtos.CoupleResponse());
        }
    }
}

