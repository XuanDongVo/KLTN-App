package com.example.englishapp_server.exception;

import com.example.englishapp_server.dto.response.ServerResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class HandlingException {
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ServerResponse<Object>> handleGeneralException(Exception ex) {
        // Log errors
        ex.printStackTrace();

        // Returns JSON to Frontend
        ServerResponse<Object> errorResponse = ServerResponse.error(500, "Error: " + ex.getMessage());
        return ResponseEntity.status(500).body(errorResponse);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ServerResponse<Object>> handleBadRequest(IllegalArgumentException ex) {
        ServerResponse<Object> errorResponse = ServerResponse.error(400, ex.getMessage());
        return ResponseEntity.status(400).body(errorResponse);
    }

    @ExceptionHandler(java.util.NoSuchElementException.class)
    public ResponseEntity<ServerResponse<Object>> handleNotFound(java.util.NoSuchElementException ex) {
        return ResponseEntity.status(404).body(ServerResponse.error(404, ex.getMessage()));
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<ServerResponse<Object>> handleConflict(IllegalStateException ex) {
        return ResponseEntity.status(409).body(ServerResponse.error(409, ex.getMessage()));
    }

    @ExceptionHandler(SecurityException.class)
    public ResponseEntity<ServerResponse<Object>> handleForbidden(SecurityException ex) {
        return ResponseEntity.status(403).body(ServerResponse.error(403, ex.getMessage()));
    }
}
