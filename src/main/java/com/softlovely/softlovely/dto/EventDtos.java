package com.softlovely.softlovely.dto;

import java.time.LocalDate;
import java.util.List;

public class EventDtos {

    public static class CreateRequest {
        public String coupleId;
        public LocalDate eventDate;
        public String title;
        public String description;
        public String category;
        public String imageUrl;

        public CreateRequest() {}
    }

    public static class UpdateRequest {
        public LocalDate eventDate;
        public String title;
        public String description;
        public String category;
        public String imageUrl;

        public UpdateRequest() {}
    }

    public static class EventResponse {
        public String id;
        public String coupleId;
        public LocalDate eventDate;
        public String title;
        public String description;
        public String aiStory;
        public String imageUrl;
        public String category;

        public EventResponse() {}
        public EventResponse(String id, String coupleId, LocalDate eventDate, String title, String description, String category) {
            this.id = id;
            this.coupleId = coupleId;
            this.eventDate = eventDate;
            this.title = title;
            this.description = description;
            this.category = category;
        }
    }

    public static class PhotoUploadResponse {
        public List<String> paths;

        public PhotoUploadResponse(List<String> paths) {
            this.paths = paths;
        }
    }
}

