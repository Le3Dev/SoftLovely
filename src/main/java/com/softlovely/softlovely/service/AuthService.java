package com.softlovely.softlovely.service;

import com.softlovely.softlovely.dto.AuthDtos;
import com.softlovely.softlovely.model.User;
import com.softlovely.softlovely.model.Couple;
import com.softlovely.softlovely.model.Partner;
import com.softlovely.softlovely.repository.UserRepository;
import com.softlovely.softlovely.repository.CoupleRepository;
import com.softlovely.softlovely.repository.PartnerRepository;
import com.softlovely.softlovely.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CoupleRepository coupleRepository;

    @Autowired
    private PartnerRepository partnerRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    public AuthDtos.AuthResponse register(AuthDtos.RegisterRequest req) throws Exception {
        // Verificar se email já existe
        if (userRepository.findByEmail(req.email).isPresent()) {
            throw new Exception("Email já registrado");
        }

        // Verificar se slug já existe
        if (coupleRepository.findBySlug(req.slug).isPresent()) {
            throw new Exception("Slug já em uso");
        }

        // Criar usuário
        User user = new User();
        user.setEmail(req.email);
        user.setPasswordHash(passwordEncoder.encode(req.password));
        user = userRepository.save(user);

        // Criar casal
        Couple couple = new Couple();
        couple.setOwnerId(user.getId());
        couple.setSlug(req.slug);
        couple.setPremium(false);
        couple = coupleRepository.save(couple);

        // Criar parceiros
        Partner partner1 = new Partner();
        partner1.setCoupleId(couple.getId());
        partner1.setName(req.partnerName1);
        partnerRepository.save(partner1);

        Partner partner2 = new Partner();
        partner2.setCoupleId(couple.getId());
        partner2.setName(req.partnerName2);
        partnerRepository.save(partner2);

        // Gerar token JWT
        String token = jwtUtil.generateToken(user.getId(), user.getEmail());
        return new AuthDtos.AuthResponse(token, user.getId(), user.getEmail());
    }

    public AuthDtos.AuthResponse login(AuthDtos.LoginRequest req) throws Exception {
        User user = userRepository.findByEmail(req.email)
                .orElseThrow(() -> new Exception("Usuário não encontrado"));

        if (!passwordEncoder.matches(req.password, user.getPasswordHash())) {
            throw new Exception("Senha incorreta");
        }

        String token = jwtUtil.generateToken(user.getId(), user.getEmail());
        return new AuthDtos.AuthResponse(token, user.getId(), user.getEmail());
    }

    public User getUserById(String userId) throws Exception {
        return userRepository.findById(userId)
                .orElseThrow(() -> new Exception("Usuário não encontrado"));
    }
}

