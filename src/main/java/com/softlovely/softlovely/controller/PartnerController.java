package com.softlovely.softlovely.controller;

import com.softlovely.softlovely.dto.PartnerDtos;
import com.softlovely.softlovely.service.PartnerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/partners")
@CrossOrigin(origins = "http://localhost:3000")
public class PartnerController {

    @Autowired
    private PartnerService partnerService;

    @GetMapping("/{id}")
    public ResponseEntity<?> getPartnerById(@PathVariable String id) {
        try {
            PartnerDtos.PartnerResponse response = partnerService.getPartnerById(id);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new PartnerDtos.PartnerResponse());
        }
    }

    @GetMapping("/couple/{coupleId}")
    public ResponseEntity<?> getPartnersByCoupleId(@PathVariable String coupleId) {
        try {
            List<PartnerDtos.PartnerResponse> response = partnerService.getPartnersByCoupleId(coupleId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @PostMapping
    public ResponseEntity<?> createPartner(@RequestBody PartnerDtos.CreateRequest req) {
        try {
            PartnerDtos.PartnerResponse response = partnerService.createPartner(req);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new PartnerDtos.PartnerResponse());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updatePartner(@PathVariable String id, @RequestBody PartnerDtos.UpdateRequest req) {
        try {
            PartnerDtos.PartnerResponse response = partnerService.updatePartner(id, req);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new PartnerDtos.PartnerResponse());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePartner(@PathVariable String id) {
        try {
            partnerService.deletePartner(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }
}
