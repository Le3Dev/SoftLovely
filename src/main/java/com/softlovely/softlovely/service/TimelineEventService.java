package com.softlovely.softlovely.service;

import com.softlovely.softlovely.dto.EventDtos;
import com.softlovely.softlovely.model.TimelineEvent;
import com.softlovely.softlovely.repository.TimelineEventRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TimelineEventService {

    @Autowired
    private TimelineEventRepository eventRepository;

    /* converte entidade → DTO garantindo que imageUrl seja incluído */
    private EventDtos.EventResponse toResponse(TimelineEvent event) {
        EventDtos.EventResponse resp = new EventDtos.EventResponse(
                event.getId(), event.getCoupleId(), event.getEventDate(),
                event.getTitle(), event.getDescription(), event.getCategory());
        resp.imageUrl = event.getImageUrl();   // campo que estava sendo omitido
        resp.aiStory  = event.getAiStory();
        return resp;
    }

    public EventDtos.EventResponse createEvent(EventDtos.CreateRequest req) throws Exception {
        TimelineEvent event = new TimelineEvent();
        event.setCoupleId(req.coupleId);
        event.setEventDate(req.eventDate);
        event.setTitle(req.title);
        event.setDescription(req.description);
        event.setCategory(req.category);
        event.setImageUrl(req.imageUrl);
        event = eventRepository.save(event);
        return toResponse(event);
    }

    public EventDtos.EventResponse getEventById(String id) throws Exception {
        TimelineEvent event = eventRepository.findById(id)
                .orElseThrow(() -> new Exception("Evento não encontrado"));
        return toResponse(event);
    }

    public List<EventDtos.EventResponse> getEventsByCoupleId(String coupleId) {
        return eventRepository.findByCoupleIdOrderByEventDateDesc(coupleId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public EventDtos.EventResponse updateEvent(String id, EventDtos.UpdateRequest req) throws Exception {
        TimelineEvent event = eventRepository.findById(id)
                .orElseThrow(() -> new Exception("Evento não encontrado"));

        if (req.eventDate    != null) event.setEventDate(req.eventDate);
        if (req.title        != null) event.setTitle(req.title);
        if (req.description  != null) event.setDescription(req.description);
        if (req.category     != null) event.setCategory(req.category);
        if (req.imageUrl     != null) event.setImageUrl(req.imageUrl);

        event = eventRepository.save(event);
        return toResponse(event);
    }

    public void deleteEvent(String id) throws Exception {
        if (!eventRepository.existsById(id)) {
            throw new Exception("Evento não encontrado");
        }
        eventRepository.deleteById(id);
    }
}
