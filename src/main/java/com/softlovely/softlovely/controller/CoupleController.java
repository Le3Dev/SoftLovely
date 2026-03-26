package com.softlovely.softlovely.controller;

import com.softlovely.softlovely.dto.CoupleDtos;
import com.softlovely.softlovely.service.CoupleService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/couples")
@CrossOrigin(origins = "http://localhost:3000")
public class CoupleController {

    @Autowired
    private CoupleService coupleService;

    @GetMapping("/slug/{slug}")
    public ResponseEntity<?> getCoupleBySlug(@PathVariable String slug) {
        try {
            CoupleDtos.CoupleResponse response = coupleService.getCoupleBySlug(slug);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new CoupleDtos.CoupleResponse());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getCoupleById(@PathVariable String id) {
        try {
            CoupleDtos.CoupleResponse response = coupleService.getCoupleById(id);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new CoupleDtos.CoupleResponse());
        }
    }

    @GetMapping("/owner/{ownerId}")
    public ResponseEntity<?> getCouplesByOwner(@PathVariable String ownerId) {
        try {
            List<CoupleDtos.CoupleResponse> response = coupleService.getCouplesByOwnerId(ownerId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @PostMapping
    public ResponseEntity<?> createCouple(@RequestHeader(value = "Authorization", required = false) String authHeader, @Valid @RequestBody CoupleDtos.CreateRequest req) {
        try {
            // Validar dados obrigatórios
            if (req.slug == null || req.slug.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new ErrorResponse("Slug é obrigatório"));
            }

            // Extract userId from JWT token (simplified - implement proper JWT extraction)
            String userId = authHeader != null && !authHeader.isEmpty()
                    ? authHeader.replace("Bearer ", "")
                    : "user-" + System.currentTimeMillis(); // userId padrão para testes

            CoupleDtos.CoupleResponse response = coupleService.createCouple(userId, req);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            e.printStackTrace(); // Log completo do erro
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse("Erro ao criar casal: " + e.getMessage()));
        }
    }


    @GetMapping("/{id}/qrcode")
    public ResponseEntity<?> getQRCode(@PathVariable String id) {
        try {
            String qrCode = coupleService.generateQRCodeForCouple(id);
            return ResponseEntity.ok(new QRCodeResponse(qrCode));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponse("Erro ao gerar QR Code: " + e.getMessage()));
        }
    }

    // Classes internas para responses
    public static class QRCodeResponse {
        public String qrCode;

        public QRCodeResponse(String qrCode) {
            this.qrCode = qrCode;
        }
    }

    public static class ErrorResponse {
        public String message;

        public ErrorResponse(String message) {
            this.message = message;
        }
    }
}

