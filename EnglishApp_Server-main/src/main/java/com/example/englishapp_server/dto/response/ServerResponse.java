package com.example.englishapp_server.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Data;

@Data
@Builder

@JsonInclude(JsonInclude.Include.NON_NULL)
public class ServerResponse<T> {
    private int code;
    private String message;
    private T data;

    public static <T> ServerResponse<T> success(T data) {
        return ServerResponse.<T>builder()
                .code(200)
                .message("Success")
                .data(data)
                .build();
    }

    public static <T> ServerResponse<T> error(int code, String message) {
        return ServerResponse.<T>builder()
                .code(code)
                .message(message)
                .build();
    }
}
