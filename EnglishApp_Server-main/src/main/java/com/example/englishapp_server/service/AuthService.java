package com.example.englishapp_server.service;

import com.example.englishapp_server.common.enums.AccountStatus;
import com.example.englishapp_server.common.enums.UserRole;
import com.example.englishapp_server.dto.request.auth.LoginRequest;
import com.example.englishapp_server.dto.request.auth.RegisterRequest;
import com.example.englishapp_server.dto.response.auth.AuthDto;
import com.example.englishapp_server.dto.response.auth.AuthResponse;
import com.example.englishapp_server.entity.User;
import com.example.englishapp_server.entity.security.JwtConfig;
import com.example.englishapp_server.entity.security.PasswordEncryption;
import com.example.englishapp_server.repository.jpa.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@Slf4j
public class AuthService {
    private final UserRepository userRepository;
    private final JwtConfig jwtConfig;

    @Autowired
    public AuthService(UserRepository userRepository, JwtConfig jwtConfig) {
        this.userRepository = userRepository;
        this.jwtConfig = jwtConfig;
    }

    @Transactional
    public AuthResponse login(LoginRequest input) {
        User targetUser = userRepository.findByEmail(input.email());
        if (targetUser == null) {
            return new AuthResponse(false, "Wrong password or email", null);
        }
        boolean isPasswordMatch = PasswordEncryption.checkPassword(input.password(), targetUser.getPasswordHash());
        if (!isPasswordMatch) {
            return new AuthResponse(false, "Wrong password or email", null);
        }
        if (targetUser.getAccountStatus() == AccountStatus.LOCKED) {
            return new AuthResponse(false, "Tài khoản đã bị khóa", null);
        }
        targetUser.setLastLoginAt(LocalDateTime.now());
        userRepository.save(targetUser);
        //FIXME: Add int value for UserRole
        String jwtToken = jwtConfig.generateToken(targetUser.getId(), targetUser.getRole().ordinal());
        AuthDto dto = getAuthDto(targetUser, jwtToken);
        return new AuthResponse(true, "Login success!", dto);
    }

    @Transactional
    public AuthResponse register(RegisterRequest input) {
        User existUser = this.userRepository.findByEmail(input.email());
        if (existUser != null) {
            return new AuthResponse(false, "Account already exists", null);
        }
        User newUser = new User();
        newUser.setEmail(input.email());
        newUser.setUsername(input.username());
        newUser.setPasswordHash(PasswordEncryption.hashPassword(input.password()));
        newUser.setAccountStatus(AccountStatus.ACTIVE);
        this.userRepository.save(newUser);
        return new AuthResponse(true, "Register success!", null);
    }

    private static AuthDto getAuthDto(User targetUser, String jwtToken) {
        AuthDto dto = new AuthDto();
        dto.setId(targetUser.getId());
        dto.setAvatar(targetUser.getAvatarUrl());
//        dto.setDescription(targetUser.getDescription());
        dto.setDisplayName(targetUser.getUsername());
        dto.setEmail(targetUser.getEmail());
//        dto.setGender(targetUser.getGender());
        dto.setRole(UserRole.valueOf(String.valueOf(targetUser.getRole())));
        dto.setUsername(targetUser.getUsername());
        dto.setVerified(targetUser.isVerified());
        dto.setJwtToken(jwtToken);
        return dto;
    }
}
