package com.softlovely.softlovely.repository;

import com.softlovely.softlovely.model.Couple;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface CoupleRepository extends JpaRepository<Couple, String> {
    Optional<Couple> findBySlug(String slug);
    Optional<Couple> findByUniqueHash(String uniqueHash);
    List<Couple> findByOwnerId(String ownerId);
}

