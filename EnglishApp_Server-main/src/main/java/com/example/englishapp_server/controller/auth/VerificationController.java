package com.example.englishapp_server.controller.auth;

import com.example.englishapp_server.common.enums.VerificationType;
import com.example.englishapp_server.dto.request.auth.VerifyRequest;
import com.example.englishapp_server.dto.response.ServerResponse;
import com.example.englishapp_server.dto.response.auth.VerifyResponse;
import com.example.englishapp_server.service.VerificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/verify")
public class VerificationController {
    private final VerificationService verificationService;

    @Autowired
    public VerificationController(VerificationService verificationService) {
        this.verificationService = verificationService;
    }

    @PostMapping("/send/reset-password")
    public ResponseEntity<ServerResponse<Object>> sendResetPassword(@RequestBody String email) {
        VerifyResponse response = verificationService.sendVerificationCode(email, VerificationType.RESET_PASSWORD);
        if (response.result()) {
            return ResponseEntity.ok(ServerResponse.success(null));
        } else {
            return ResponseEntity.badRequest().body(ServerResponse.error(400, response.message()));
        }
    }

    @PostMapping("/send/account")
    public ResponseEntity<ServerResponse<Object>> sendVerifyAccount(@RequestBody String email) {
        VerifyResponse response = verificationService.sendVerificationCode(email, VerificationType.VERIFY_USER);
        if (response.result()) {
            return ResponseEntity.ok(ServerResponse.success(null));
        } else {
            return ResponseEntity.badRequest().body(ServerResponse.error(400, response.message()));
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ServerResponse<Object>> resetPassword(@RequestBody VerifyRequest request) {
        VerifyResponse response = verificationService.verifyResetPassword(request.email(), request.code(), request.newPassword());
        if (response.result()) {
            return ResponseEntity.ok(ServerResponse.success(null));
        } else {
            return ResponseEntity.badRequest().body(ServerResponse.error(400, response.message()));
        }
    }

    @PostMapping("/account")
    public ResponseEntity<ServerResponse<Object>> verifyAccount(@RequestBody VerifyRequest request) {
        VerifyResponse response = verificationService.verifyUser(request.email(), request.code());
        if (response.result()) {
            return ResponseEntity.ok(ServerResponse.success(null));
        } else {
            return ResponseEntity.badRequest().body(ServerResponse.error(400, response.message()));
        }
    }
}
