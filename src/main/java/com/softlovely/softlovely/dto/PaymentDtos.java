package com.softlovely.softlovely.dto;

import java.time.LocalDate;
import java.util.List;

public class PaymentDtos {
    public static class CheckoutRequest {
        public String coupleId;
        public boolean isPremium;
    }

    public static class CheckoutResponse {
        public String sessionId;
        public String checkoutUrl;

        public CheckoutResponse() {}
        public CheckoutResponse(String sessionId) { 
            this.sessionId = sessionId;
        }
        public CheckoutResponse(String sessionId, String checkoutUrl) {
            this.sessionId = sessionId;
            this.checkoutUrl = checkoutUrl;
        }
    }

    public static class SuccessResponse {
        public String message;
        public boolean isPremium;
        public String qrCodeData;
        public String coupleHash;
        public String pageUrl;
        public String coupleId;
        public String coupleSlug;
        public LocalDate anniversaryDate;
        public String themeColor;
        public List<PartnerInfo> partners;

        public SuccessResponse() {}
        public SuccessResponse(String message, boolean isPremium, String qrCodeData, String coupleHash, String pageUrl) {
            this.message = message;
            this.isPremium = isPremium;
            this.qrCodeData = qrCodeData;
            this.coupleHash = coupleHash;
            this.pageUrl = pageUrl;
        }
    }

    public static class PartnerInfo {
        public String id;
        public String name;
        public String profileImageUrl;

        public PartnerInfo(String id, String name, String profileImageUrl) {
            this.id = id;
            this.name = name;
            this.profileImageUrl = profileImageUrl;
        }
    }

    public static class ErrorResponse {
        public String message;

        public ErrorResponse() {}
        public ErrorResponse(String message) {
            this.message = message;
        }
    }
}

