package com.softlovely.softlovely.dto;

public class AuthDtos {

    public static class RegisterRequest {
        public String email;
        public String password;
        public String partnerName1;
        public String partnerName2;
        public String slug;

        public RegisterRequest() {}
    }

    public static class LoginRequest {
        public String email;
        public String password;

        public LoginRequest() {}
    }

    public static class AuthResponse {
        public String token;
        public String userId;
        public String email;
        public String message;

        public AuthResponse() {}
        public AuthResponse(String token, String userId, String email) {
            this.token = token;
            this.userId = userId;
            this.email = email;
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

