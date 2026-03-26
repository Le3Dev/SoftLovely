package com.softlovely.softlovely.dto;

import java.time.LocalDate;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class CoupleDtos {

    public static class CreateRequest {
        @NotBlank(message = "Slug é obrigatório")
        public String slug;
        
        @NotNull(message = "Data de aniversário é obrigatória")
        public LocalDate anniversaryDate;
        
        public String themeColor;

        public CreateRequest() {}
    }

    public static class UpdateRequest {
        public LocalDate anniversaryDate;
        public String themeColor;

        public UpdateRequest() {}
    }

    public static class CoupleResponse {
        public String id;
        public String slug;
        public String uniqueHash;
        public LocalDate anniversaryDate;
        public String themeColor;
        public boolean isPremium;
        public String ownerId;

        public CoupleResponse() {}
        public CoupleResponse(String id, String slug, LocalDate anniversaryDate, String themeColor, boolean isPremium, String ownerId) {
            this.id = id;
            this.slug = slug;
            this.anniversaryDate = anniversaryDate;
            this.themeColor = themeColor;
            this.isPremium = isPremium;
            this.ownerId = ownerId;
        }
    }
}

