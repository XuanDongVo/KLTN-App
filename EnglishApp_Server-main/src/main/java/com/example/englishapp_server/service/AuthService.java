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
import com.example.englishapp_server.dto.request.auth.RefreshTokenRequest;
import com.example.englishapp_server.entity.auth.RefreshToken;
import com.example.englishapp_server.repository.jpa.RefreshTokenRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import java.time.LocalDateTime;

@Service
@Slf4j
public class AuthService {
    private final UserRepository userRepository;
    private final JwtConfig jwtConfig;
    private final RefreshTokenRepository refreshTokenRepository;

    @Autowired
    public AuthService(UserRepository userRepository, JwtConfig jwtConfig, RefreshTokenRepository refreshTokenRepository) {
        this.userRepository = userRepository;
        this.jwtConfig = jwtConfig;
        this.refreshTokenRepository = refreshTokenRepository;
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
        
        // Generate Refresh Token
        String tokenStr = UUID.randomUUID().toString();
        RefreshToken refreshToken = RefreshToken.builder()
                .token(tokenStr)
                .userId(targetUser.getId())
                .createdAt(LocalDateTime.now())
                .expiredAt(LocalDateTime.now().plusDays(30))
                .build();
        refreshTokenRepository.save(refreshToken);
        
        AuthDto dto = getAuthDto(targetUser, jwtToken, tokenStr);
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

    @Transactional
    public AuthResponse refresh(RefreshTokenRequest request) {
        Optional<RefreshToken> tokenOpt = refreshTokenRepository.findByToken(request.getRefreshToken());
        if (tokenOpt.isEmpty()) {
            return new AuthResponse(false, "Invalid refresh token", null);
        }
        RefreshToken refreshToken = tokenOpt.get();
        if (refreshToken.getExpiredAt().isBefore(LocalDateTime.now())) {
            refreshTokenRepository.delete(refreshToken);
            return new AuthResponse(false, "Refresh token expired. Please login again.", null);
        }
        
        User user = userRepository.findById(refreshToken.getUserId()).orElse(null);
        if (user == null || user.getAccountStatus() == AccountStatus.LOCKED) {
            return new AuthResponse(false, "Tài khoản không tồn tại hoặc đã bị khóa", null);
        }
        
        // Cấp JWT mới
        String newJwt = jwtConfig.generateToken(user.getId(), user.getRole().ordinal());
        AuthDto dto = getAuthDto(user, newJwt, refreshToken.getToken());
        return new AuthResponse(true, "Refresh success", dto);
    }

    @Transactional
    public AuthResponse logout(RefreshTokenRequest request) {
        Optional<RefreshToken> tokenOpt = refreshTokenRepository.findByToken(request.getRefreshToken());
        tokenOpt.ifPresent(refreshTokenRepository::delete);
        return new AuthResponse(true, "Logout success", null);
    }

    @Transactional
    public AuthResponse logoutAll(String email) {
        User user = userRepository.findByEmail(email);
        if (user != null) {
            refreshTokenRepository.deleteByUserId(user.getId());
            return new AuthResponse(true, "Logged out from all devices", null);
        }
        return new AuthResponse(false, "User not found", null);
    }

    private static AuthDto getAuthDto(User targetUser, String jwtToken, String refreshToken) {
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
        dto.setRefreshToken(refreshToken);
        return dto;
    }
}
