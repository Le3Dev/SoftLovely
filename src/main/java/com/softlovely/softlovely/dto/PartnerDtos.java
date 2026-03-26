package com.softlovely.softlovely.dto;

public class PartnerDtos {

    public static class CreateRequest {
        public String coupleId;
        public String name;

        public CreateRequest() {}
    }

    public static class UpdateRequest {
        public String name;

        public UpdateRequest() {}
    }

    public static class PartnerResponse {
        public String id;
        public String coupleId;
        public String name;

        public PartnerResponse() {}
        public PartnerResponse(String id, String coupleId, String name) {
            this.id = id;
            this.coupleId = coupleId;
            this.name = name;
        }
    }
}
