package com.example.englishapp_server.curriculum;

import com.example.englishapp_server.curriculum.importer.CurriculumImportService;
import com.example.englishapp_server.entity.security.JwtConfig;
import tools.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.core.io.ClassPathResource;
import org.springframework.test.context.TestPropertySource;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@TestPropertySource(properties = "spring.datasource.url=jdbc:h2:mem:curriculum_http_api;MODE=MySQL;DB_CLOSE_DELAY=-1")
class CurriculumHttpApiTests {
    @LocalServerPort int port;
    @Autowired CurriculumImportService importService;
    @Autowired JwtConfig jwtConfig;
    @Autowired ObjectMapper objectMapper;

    @Autowired com.example.englishapp_server.repository.jpa.UserRepository userRepository;

    @Test
    void protectsApiAndServesSessionWithoutAnswerKeys() throws Exception {
        try (var input = new ClassPathResource("curriculum/starters-v4/manifest.json").getInputStream()) {
            importService.importPackage(input);
        }

        HttpClient client = HttpClient.newHttpClient();
        URI pathUri = URI.create("http://127.0.0.1:" + port + "/api/learner/path?level=PRE_A1_STARTERS");
        var unauthorized = client.send(HttpRequest.newBuilder(pathUri).GET().build(), HttpResponse.BodyHandlers.ofString());
        assertThat(unauthorized.statusCode()).isEqualTo(401);

        com.example.englishapp_server.entity.User user = new com.example.englishapp_server.entity.User();
        user.setUsername("testlearner_" + UUID.randomUUID().toString().substring(0, 8));
        user.setEmail("learner_" + UUID.randomUUID().toString().substring(0, 8) + "@example.com");
        user.setPasswordHash("hash");
        user.setRole(com.example.englishapp_server.common.enums.UserRole.USER);
        user.setAccountStatus(com.example.englishapp_server.common.enums.AccountStatus.ACTIVE);
        user = userRepository.save(user);

        String token = jwtConfig.generateToken(user.getId(), 0);
        var pathResponse = client.send(HttpRequest.newBuilder(pathUri)
                .header("Authorization", "Bearer " + token).GET().build(), HttpResponse.BodyHandlers.ofString());
        assertThat(pathResponse.statusCode()).isEqualTo(200);
        var pathData = objectMapper.readTree(pathResponse.body()).path("data");
        assertThat(pathData.path("units").size()).isEqualTo(5);
        assertThat(pathData.path("units").get(0).path("lessons").size()).isEqualTo(5);
        assertThat(pathData.path("units").get(0).path("lessons").get(0).path("unlocked").asBoolean()).isTrue();
        assertThat(pathData.path("units").get(0).path("lessons").get(1).path("unlocked").asBoolean()).isFalse();
        long lessonId = pathData.path("units").get(0).path("lessons").get(0).path("id").asLong();

        URI startUri = URI.create("http://127.0.0.1:" + port + "/api/lessons/" + lessonId + "/sessions");
        var sessionResponse = client.send(HttpRequest.newBuilder(startUri)
                .header("Authorization", "Bearer " + token)
                .POST(HttpRequest.BodyPublishers.noBody()).build(), HttpResponse.BodyHandlers.ofString());
        assertThat(sessionResponse.statusCode()).isEqualTo(200);
        assertThat(sessionResponse.body()).contains("STARTERS_L01_A01", "LISTEN_CHOICE", "SPEAK");
        assertThat(sessionResponse.body()).doesNotContain("answerJson", "\"answer\"", "accepted");

        URI imageUri = URI.create("http://127.0.0.1:" + port + "/curriculum/starters-2026.2/hello.png");
        var imageResponse = client.send(HttpRequest.newBuilder(imageUri).GET().build(),
                HttpResponse.BodyHandlers.ofByteArray());
        assertThat(imageResponse.statusCode()).isEqualTo(200);
        assertThat(imageResponse.body().length).isGreaterThan(100_000);
    }
}
