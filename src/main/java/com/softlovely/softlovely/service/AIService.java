package com.softlovely.softlovely.service;

import com.softlovely.softlovely.model.Couple;
import com.softlovely.softlovely.model.TimelineEvent;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AIService {

    // For MVP provide a local/story-builder fallback. Later replace with OpenAI integration.
    public String generateStory(Couple couple, List<TimelineEvent> events) {
        StringBuilder sb = new StringBuilder();
        sb.append("Capítulo 1 — O começo\n\n");
        sb.append("Esta é a história de ").append(couple.getSlug() == null ? "um casal" : couple.getSlug()).append(".\n\n");

        int i = 1;
        for (TimelineEvent e : events) {
            sb.append("Capítulo ").append(i + 1).append(" — ");
            sb.append(e.getTitle() == null || e.getTitle().isEmpty() ? "Um momento" : e.getTitle()).append("\n\n");
            if (e.getEventDate() != null) {
                sb.append("Em ").append(e.getEventDate().toString()).append(". ");
            }
            sb.append(e.getDescription() == null ? "" : e.getDescription()).append("\n\n");
            i++;
        }

        sb.append("FIM\n");
        return sb.toString();
    }
}
