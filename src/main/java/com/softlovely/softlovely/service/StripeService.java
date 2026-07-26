package com.softlovely.softlovely.service;

import com.softlovely.softlovely.repository.CoupleRepository;
import com.softlovely.softlovely.service.NotaFiscalService;
import com.stripe.Stripe;
import com.stripe.model.Event;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.net.Webhook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.util.Map;

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

    public String createCheckoutSession(String coupleId, boolean isPremium,
                                        String customerEmail, String customerName, String customerCpf) throws Exception {
        Stripe.apiKey = stripeSecretKey;

        long price       = isPremium ? 1990 : 1490; // centavos BRL
        String planName  = isPremium ? "SoftLovely Premium" : "SoftLovely Básico";

        SessionCreateParams.Builder builder = SessionCreateParams.builder()
                /* ── Métodos de pagamento ── */
                .addPaymentMethodType(SessionCreateParams.PaymentMethodType.CARD)
                .setMode(SessionCreateParams.Mode.PAYMENT)

                /* ── URLs de retorno ── */
                .setSuccessUrl(frontendUrl + "/payment-success?coupleId=" + coupleId + "&session_id={CHECKOUT_SESSION_ID}")
                .setCancelUrl(frontendUrl + "/payment-cancel?coupleId=" + coupleId)

                /* ── Produto ── */
                .addLineItem(
                        SessionCreateParams.LineItem.builder()
                                .setQuantity(1L)
                                .setPriceData(
                                        SessionCreateParams.LineItem.PriceData.builder()
                                                .setCurrency("brl")
                                                .setUnitAmount(price)
                                                .setProductData(
                                                        SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                                                .setName(planName)
                                                                .setDescription("Página especial para casais • SoftLovely")
                                                                .build())
                                                .build())
                                .build())

                /* ── Metadata para webhook e NF ── */
                .putMetadata("coupleId",       coupleId)
                .putMetadata("isPremium",      String.valueOf(isPremium))
                .putMetadata("customerEmail",  customerEmail  != null ? customerEmail  : "")
                .putMetadata("customerName",   customerName   != null ? customerName   : "")
                .putMetadata("customerCpf",    customerCpf    != null ? customerCpf    : "")
                .putMetadata("planPrice",      String.valueOf(price));

        /* email do cliente → Stripe envia recibo automaticamente */
        if (customerEmail != null && !customerEmail.isBlank()) {
            builder.setCustomerEmail(customerEmail);
        }

        Session session = Session.create(builder.build());
        return session.getId();
    }

    public String getCheckoutSessionUrl(String sessionId) throws Exception {
        Stripe.apiKey = stripeSecretKey;
        Session session = Session.retrieve(sessionId);
        return session.getUrl();
    }

    public void handleWebhook(String payload, String sigHeader, NotaFiscalService notaFiscalService) throws Exception {
        Stripe.apiKey = stripeSecretKey;

        try {
            Event event = Webhook.constructEvent(payload, sigHeader, webhookSecret);

            if ("checkout.session.completed".equals(event.getType())) {
                handleCheckoutSessionCompleted(event, notaFiscalService);
            }
        } catch (SignatureVerificationException e) {
            System.out.println("Webhook signature verification failed: " + e.getMessage());
            throw new Exception("Webhook signature verification failed");
        }
    }

    private void handleCheckoutSessionCompleted(Event event, NotaFiscalService notaFiscalService) throws Exception {
        Session session = (Session) event.getDataObjectDeserializer().getObject().orElse(null);
        if (session != null) {
            Map<String, String> meta = session.getMetadata();
            String coupleId      = meta.get("coupleId");
            String isPremiumStr  = meta.get("isPremium");
            String customerEmail = meta.get("customerEmail");
            String customerName  = meta.get("customerName");
            String customerCpf   = meta.get("customerCpf");
            String planPrice     = meta.get("planPrice"); // centavos

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

                // Emitir NFS-e após pagamento confirmado
                try {
                    double valorReais = planPrice != null ? Long.parseLong(planPrice) / 100.0 : 0.0;
                    String planName   = "true".equals(isPremiumStr) ? "SoftLovely Premium" : "SoftLovely Básico";
                    String descricao  = "Página especial para casais - " + planName + " - SoftLovely";
                    notaFiscalService.emitirNfse(customerEmail, customerName, customerCpf, valorReais, descricao);
                } catch (Exception e) {
                    System.out.println("Erro ao emitir NFS-e: " + e.getMessage());
                }
            }
        }
    }
}

