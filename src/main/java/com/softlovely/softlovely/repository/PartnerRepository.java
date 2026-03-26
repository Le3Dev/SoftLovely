package com.softlovely.softlovely.repository;

import com.softlovely.softlovely.model.Partner;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PartnerRepository extends JpaRepository<Partner, String> {
    List<Partner> findByCoupleId(String coupleId);
}

