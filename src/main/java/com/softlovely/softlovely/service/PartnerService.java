package com.softlovely.softlovely.service;

import com.softlovely.softlovely.dto.PartnerDtos;
import com.softlovely.softlovely.model.Partner;
import com.softlovely.softlovely.repository.PartnerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class PartnerService {

    @Autowired
    private PartnerRepository partnerRepository;

    public PartnerDtos.PartnerResponse createPartner(PartnerDtos.CreateRequest req) throws Exception {
        Partner partner = new Partner();
        partner.setCoupleId(req.coupleId);
        partner.setName(req.name);
        partner = partnerRepository.save(partner);

        return new PartnerDtos.PartnerResponse(partner.getId(), partner.getCoupleId(), partner.getName());
    }

    public PartnerDtos.PartnerResponse getPartnerById(String id) throws Exception {
        Partner partner = partnerRepository.findById(id)
                .orElseThrow(() -> new Exception("Parceiro não encontrado"));
        return new PartnerDtos.PartnerResponse(partner.getId(), partner.getCoupleId(), partner.getName());
    }

    public List<PartnerDtos.PartnerResponse> getPartnersByCoupleId(String coupleId) {
        return partnerRepository.findByCoupleId(coupleId).stream()
                .map(p -> new PartnerDtos.PartnerResponse(p.getId(), p.getCoupleId(), p.getName()))
                .collect(Collectors.toList());
    }

    public PartnerDtos.PartnerResponse updatePartner(String id, PartnerDtos.UpdateRequest req) throws Exception {
        Partner partner = partnerRepository.findById(id)
                .orElseThrow(() -> new Exception("Parceiro não encontrado"));

        if (req.name != null) {
            partner.setName(req.name);
        }
        partner = partnerRepository.save(partner);

        return new PartnerDtos.PartnerResponse(partner.getId(), partner.getCoupleId(), partner.getName());
    }

    public void deletePartner(String id) throws Exception {
        if (!partnerRepository.existsById(id)) {
            throw new Exception("Parceiro não encontrado");
        }
        partnerRepository.deleteById(id);
    }
}
