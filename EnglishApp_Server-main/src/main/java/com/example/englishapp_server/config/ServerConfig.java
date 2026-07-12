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
        // 1. Yêu cầu đăng nhập cho MỌI API (trừ login/register)
        registry.addInterceptor(jwtHttpInterceptor)
                .addPathPatterns("/**")
                .excludePathPatterns("/auth/**");

        // 2. Cửa VIP: Yêu cầu quyền Admin cho các API có chữ /admin/
        registry.addInterceptor(adminRoleInterceptor)
                .addPathPatterns("/admin/**");
    }
}
