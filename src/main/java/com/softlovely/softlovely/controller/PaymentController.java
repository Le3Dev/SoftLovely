package com.softlovely.softlovely.controller;

import com.softlovely.softlovely.dto.PaymentDtos;
import com.softlovely.softlovely.service.StripeService;
import com.softlovely.softlovely.service.CoupleService;
import com.softlovely.softlovely.service.QRCodeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "http://localhost:3000")
public class PaymentController {

    @Autowired
    private StripeService stripeService;

    @Autowired
    private CoupleService coupleService;

    @Autowired
    private QRCodeService qrCodeService;

    @PostMapping("/checkout")
    public ResponseEntity<?> createCheckout(@RequestBody PaymentDtos.CheckoutRequest req) {
        try {
            String sessionId = stripeService.createCheckoutSession(req.coupleId, req.isPremium);
            String checkoutUrl = stripeService.getCheckoutSessionUrl(sessionId);
            return ResponseEntity.ok(new PaymentDtos.CheckoutResponse(sessionId, checkoutUrl));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new PaymentDtos.ErrorResponse("Erro ao criar sessão de pagamento: " + e.getMessage()));
        }
    }

    @PostMapping("/webhook")
    public ResponseEntity<String> handleWebhook(
            @RequestBody String payload,
            @RequestHeader(value = "Stripe-Signature", required = false) String sigHeader) {
        try {
            stripeService.handleWebhook(payload, sigHeader);
            return ResponseEntity.ok("received");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Webhook error: " + e.getMessage());
        }
    }

    @GetMapping("/success/{coupleId}")
    public ResponseEntity<?> paymentSuccess(@PathVariable String coupleId) {
        try {
            var coupleResponse = coupleService.getCoupleById(coupleId);
            
            // Gerar hash se não existir
            String hash = coupleResponse.uniqueHash;
            if (hash == null || hash.isEmpty()) {
                hash = qrCodeService.generateUniqueHash(coupleId);
                // Atualizar no banco
                coupleService.updateCoupleHash(coupleId, hash);
                coupleResponse.uniqueHash = hash;
            }
            
            String qrCodeBase64 = qrCodeService.generateQRCodeForCouple(coupleId);
            String pageUrl = "http://localhost:3000/c/" + hash;
            
            return ResponseEntity.ok(new PaymentDtos.SuccessResponse(
                "Pagamento realizado com sucesso!", 
                coupleResponse.isPremium,
                qrCodeBase64,
                hash,
                pageUrl
            ));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new PaymentDtos.ErrorResponse("Erro: " + e.getMessage()));
        }
    }

    @GetMapping("/cancel/{coupleId}")
    public ResponseEntity<?> paymentCancel(@PathVariable String coupleId) {
        return ResponseEntity.ok(new PaymentDtos.ErrorResponse("Pagamento cancelado"));
    }
}

