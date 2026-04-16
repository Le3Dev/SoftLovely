package com.softlovely.softlovely.service;

import com.softlovely.softlovely.dto.CoupleDtos;
import com.softlovely.softlovely.model.Couple;
import com.softlovely.softlovely.repository.CoupleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CoupleService {

    @Autowired
    private CoupleRepository coupleRepository;

    @Autowired
    private QRCodeService qrCodeService;

    public CoupleDtos.CoupleResponse createCouple(String ownerId, CoupleDtos.CreateRequest req) throws Exception {
        // Slugs podem ser duplicados - o hash único é o diferenciador
        Couple couple = new Couple();
        couple.setOwnerId(ownerId);
        couple.setSlug(req.slug);
        couple.setAnniversaryDate(req.anniversaryDate);
        couple.setThemeColor(req.themeColor != null ? req.themeColor : "pink");
        couple.setMusicUrl(req.musicUrl);
        couple.setPremium(false);
        couple = coupleRepository.save(couple);

        return new CoupleDtos.CoupleResponse(couple.getId(), couple.getSlug(), couple.getAnniversaryDate(),
                couple.getThemeColor(), couple.getMusicUrl(), couple.isPremium(), couple.getOwnerId());
    }

    public CoupleDtos.CoupleResponse getCoupleBySlug(String slug) throws Exception {
        Couple couple = coupleRepository.findBySlug(slug)
                .orElseThrow(() -> new Exception("Casal não encontrado"));
        return new CoupleDtos.CoupleResponse(couple.getId(), couple.getSlug(), couple.getAnniversaryDate(),
                couple.getThemeColor(), couple.getMusicUrl(), couple.isPremium(), couple.getOwnerId());
    }

    public CoupleDtos.CoupleResponse getCoupleById(String id) throws Exception {
        Couple couple = coupleRepository.findById(id)
                .orElseThrow(() -> new Exception("Casal não encontrado"));
        return new CoupleDtos.CoupleResponse(couple.getId(), couple.getSlug(), couple.getAnniversaryDate(),
                couple.getThemeColor(), couple.getMusicUrl(), couple.isPremium(), couple.getOwnerId());
    }

    public CoupleDtos.CoupleResponse getCoupleByHash(String hash) throws Exception {
        Couple couple = coupleRepository.findByUniqueHash(hash)
                .orElseThrow(() -> new Exception("Casal não encontrado"));
        return new CoupleDtos.CoupleResponse(couple.getId(), couple.getSlug(), couple.getAnniversaryDate(),
                couple.getThemeColor(), couple.getMusicUrl(), couple.isPremium(), couple.getOwnerId());
    }

    public List<CoupleDtos.CoupleResponse> getCouplesByOwnerId(String ownerId) {
        return coupleRepository.findByOwnerId(ownerId).stream()
                .map(c -> new CoupleDtos.CoupleResponse(c.getId(), c.getSlug(), c.getAnniversaryDate(),
                        c.getThemeColor(), c.getMusicUrl(), c.isPremium(), c.getOwnerId()))
                .collect(Collectors.toList());
    }

    public CoupleDtos.CoupleResponse updateCouple(String id, CoupleDtos.UpdateRequest req) throws Exception {
        Couple couple = coupleRepository.findById(id)
                .orElseThrow(() -> new Exception("Casal não encontrado"));

        if (req.anniversaryDate != null) {
            couple.setAnniversaryDate(req.anniversaryDate);
        }
        if (req.themeColor != null) {
            couple.setThemeColor(req.themeColor);
        }
        if (req.musicUrl != null) {
            couple.setMusicUrl(req.musicUrl);
        }
        couple = coupleRepository.save(couple);

        return new CoupleDtos.CoupleResponse(couple.getId(), couple.getSlug(), couple.getAnniversaryDate(),
                couple.getThemeColor(), couple.getMusicUrl(), couple.isPremium(), couple.getOwnerId());
    }

    public String generateQRCodeForCouple(String coupleId) throws Exception {
        Couple couple = coupleRepository.findById(coupleId)
                .orElseThrow(() -> new Exception("Casal não encontrado"));
        
        if (couple.getUniqueHash() == null) {
            couple.setUniqueHash(qrCodeService.generateUniqueHash(coupleId));
            coupleRepository.save(couple);
        }
        
        return qrCodeService.generateQRCodeForCouple(couple.getUniqueHash());
    }

    public void upgradeToPremium(String coupleId) throws Exception {
        Couple couple = coupleRepository.findById(coupleId)
                .orElseThrow(() -> new Exception("Casal não encontrado"));
        couple.setPremium(true);
        coupleRepository.save(couple);
    }

    public void updateCoupleHash(String coupleId, String hash) throws Exception {
        Couple couple = coupleRepository.findById(coupleId)
                .orElseThrow(() -> new Exception("Casal não encontrado"));
        couple.setUniqueHash(hash);
        coupleRepository.save(couple);
    }
}

