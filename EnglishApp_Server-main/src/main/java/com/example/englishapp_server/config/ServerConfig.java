package com.example.englishapp_server.config;

import com.example.englishapp_server.entity.security.AdminRoleInterceptor;
import com.example.englishapp_server.entity.security.JwtHttpInterceptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class ServerConfig implements WebMvcConfigurer {

    @Autowired
    private JwtHttpInterceptor jwtHttpInterceptor;

    @Autowired
    private AdminRoleInterceptor adminRoleInterceptor;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(jwtHttpInterceptor)
                .addPathPatterns("/**")
                .excludePathPatterns("/auth/**", "/verify/**");

        registry.addInterceptor(adminRoleInterceptor)
                .addPathPatterns("/admin/**");
    }
}
