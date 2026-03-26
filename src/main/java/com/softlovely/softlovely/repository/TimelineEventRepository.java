package com.softlovely.softlovely.repository;

import com.softlovely.softlovely.model.TimelineEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TimelineEventRepository extends JpaRepository<TimelineEvent, String> {

    List<TimelineEvent> findByCoupleIdOrderByEventDateDesc(String coupleId);

}