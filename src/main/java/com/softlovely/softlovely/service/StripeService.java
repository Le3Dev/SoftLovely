package com.softlovely.softlovely.service;

import com.softlovely.softlovely.repository.CoupleRepository;
import com.stripe.Stripe;
import com.stripe.model.Event;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.net.Webhook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class StripeService {

    @Value("${stripe.secret-key}")
    private String stripeSecretKey;

    @Value("${stripe.webhook-secret}")
    private String webhookSecret;

    @Value("${app.base-url}")
    private String baseUrl;

    @Value("${app.frontend-url:http://localhost:3000}")
    private String frontendUrl;

    @Autowired
    private CoupleRepository coupleRepository;

    @Autowired
    private QRCodeService qrCodeService;

    public StripeService() {
    }

    public String createCheckoutSession(String coupleId, boolean isPremium) throws Exception {
        Stripe.apiKey = stripeSecretKey;

        long price = isPremium ? 1990 : 1490; // $

        SessionCreateParams params = SessionCreateParams.builder()
                .addPaymentMethodType(SessionCreateParams.PaymentMethodType.CARD)
                .setMode(SessionCreateParams.Mode.PAYMENT)
                .setSuccessUrl(frontendUrl + "/payment-success?coupleId=" + coupleId)
                .setCancelUrl(frontendUrl + "/payment-cancel?coupleId=" + coupleId)
                .addLineItem(
                        SessionCreateParams.LineItem.builder()
                                .setQuantity(1L)
                                .setPriceData(
                                        SessionCreateParams.LineItem.PriceData.builder()
                                                .setCurrency("brl")
                                                .setUnitAmount(price)
                                                .setProductData(
                                                        SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                                                .setName(isPremium ? "Premium Subscription" : "Basic Features")
                                                                .build())
                                                .build())
                                .build())
                .putMetadata("coupleId", coupleId)
                .putMetadata("isPremium", String.valueOf(isPremium))
                .build();

        Session session = Session.create(params);
        return session.getId();
    }

    public String getCheckoutSessionUrl(String sessionId) throws Exception {
        Stripe.apiKey = stripeSecretKey;
        Session session = Session.retrieve(sessionId);
        return session.getUrl();
    }

    public void handleWebhook(String payload, String sigHeader) throws Exception {
        Stripe.apiKey = stripeSecretKey;

        try {
            Event event = Webhook.constructEvent(payload, sigHeader, webhookSecret);

            if ("checkout.session.completed".equals(event.getType())) {
                handleCheckoutSessionCompleted(event);
            }
        } catch (SignatureVerificationException e) {
            System.out.println("Webhook signature verification failed: " + e.getMessage());
            throw new Exception("Webhook signature verification failed");
        }
    }

    private void handleCheckoutSessionCompleted(Event event) throws Exception {
        Session session = (Session) event.getDataObjectDeserializer().getObject().orElse(null);
        if (session != null) {
            String coupleId = session.getMetadata().get("coupleId");
            String isPremiumStr = session.getMetadata().get("isPremium");

            if (session.getPaymentStatus().equals("paid")) {
                coupleRepository.findById(coupleId).ifPresent(couple -> {
                    try {
                        // Gerar hash único se ainda não existe
                        if (couple.getUniqueHash() == null) {
                            String uniqueHash = qrCodeService.generateUniqueHash(coupleId);
                            couple.setUniqueHash(uniqueHash);
                        }
                        
                        // Marcar como premium se necessário
                        if ("true".equals(isPremiumStr)) {
                            couple.setPremium(true);
                        }
                        
                        coupleRepository.save(couple);
                    } catch (Exception e) {
                        System.out.println("Erro ao processar pagamento: " + e.getMessage());
                    }
                });
            }
        }
    }
}

