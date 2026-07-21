package com.example.englishapp_server.controller.auth;

import com.example.englishapp_server.dto.request.auth.LoginRequest;
import com.example.englishapp_server.dto.request.auth.RegisterRequest;
import com.example.englishapp_server.dto.response.ServerResponse;
import com.example.englishapp_server.dto.response.auth.AuthDto;
import com.example.englishapp_server.dto.response.auth.AuthResponse;
import com.example.englishapp_server.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService authService;

    @Autowired
    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<ServerResponse<AuthDto>> login(@RequestBody LoginRequest loginRequest) {
        AuthResponse response = this.authService.login(loginRequest);
        if (response.result()) {
            return ResponseEntity.ok(ServerResponse.success(response.authDto()));
        } else {
            return ResponseEntity.badRequest()
                    .body(ServerResponse.error(400, response.message()));
        }
    }

    @PostMapping("/register")
    public ResponseEntity<ServerResponse<Object>> register(@RequestBody RegisterRequest registerRequest) {
        AuthResponse response = this.authService.register(registerRequest);
        if (response.result()) {
            return ResponseEntity.ok(ServerResponse.success(null));
        } else {
            return ResponseEntity.badRequest()
                    .body(ServerResponse.error(400, response.message()));
        }
    }

    @PostMapping("/refresh")
    public ResponseEntity<ServerResponse<AuthDto>> refresh(@RequestBody com.example.englishapp_server.dto.request.auth.RefreshTokenRequest request) {
        AuthResponse response = this.authService.refresh(request);
        if (response.result()) {
            return ResponseEntity.ok(ServerResponse.success(response.authDto()));
        } else {
            return ResponseEntity.badRequest()
                    .body(ServerResponse.error(400, response.message()));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<ServerResponse<Object>> logout(@RequestBody com.example.englishapp_server.dto.request.auth.RefreshTokenRequest request) {
        AuthResponse response = this.authService.logout(request);
        if (response.result()) {
            return ResponseEntity.ok(ServerResponse.success(null));
        } else {
            return ResponseEntity.badRequest()
                    .body(ServerResponse.error(400, response.message()));
        }
    }

    @PostMapping("/logout-all")
    public ResponseEntity<ServerResponse<Object>> logoutAll(@RequestBody java.util.Map<String, String> body) {
        String email = body.get("email");
        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body(ServerResponse.error(400, "Email is required"));
        }
        AuthResponse response = this.authService.logoutAll(email);
        if (response.result()) {
            return ResponseEntity.ok(ServerResponse.success(null));
        } else {
            return ResponseEntity.badRequest()
                    .body(ServerResponse.error(400, response.message()));
        }
    }
}
