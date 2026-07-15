package com.example.englishapp_server;

import com.mongodb.ConnectionString;
import com.mongodb.client.MongoClients;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;

import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.sql.DriverManager;
import java.util.List;
import java.util.Properties;

import static org.assertj.core.api.Assertions.assertThat;

class LocalDatabaseResetToolTests {
    private static final String DATABASE = "englishapp";

    @Test
    @EnabledIfEnvironmentVariable(named = "APP_LOCAL_RESET_MYSQL", matches = "englishapp")
    void resetOnlyVerifiedLocalEnglishAppMySql() throws Exception {
        Properties properties = loadMainProperties();
        resetMySql(properties);
    }

    @Test
    @EnabledIfEnvironmentVariable(named = "APP_LOCAL_RESET_MONGO", matches = "englishapp")
    void resetOnlyVerifiedLocalEnglishAppMongo() throws Exception {
        Properties properties = loadMainProperties();
        resetMongo(properties);
    }

    private Properties loadMainProperties() throws Exception {
        Properties properties = new Properties();
        Path path = Path.of("src", "main", "resources", "application.properties").toAbsolutePath().normalize();
        assertThat(path).isRegularFile();
        try (InputStream input = Files.newInputStream(path)) {
            properties.load(input);
        }
        return properties;
    }

    private void resetMySql(Properties properties) throws Exception {
        String url = properties.getProperty("spring.datasource.url");
        assertThat(url).matches("^jdbc:mysql://(localhost|127\\.0\\.0\\.1)(:3306)?/"
                + DATABASE + "(\\?.*)?$");
        try (var connection = DriverManager.getConnection(
                url,
                properties.getProperty("spring.datasource.username"),
                properties.getProperty("spring.datasource.password"));
             var statement = connection.createStatement()) {
            statement.executeUpdate("DROP DATABASE IF EXISTS `" + DATABASE + "`");
            statement.executeUpdate("CREATE DATABASE `" + DATABASE
                    + "` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
        }
    }

    private void resetMongo(Properties properties) {
        String uri = properties.getProperty("spring.mongodb.uri");
        ConnectionString connectionString = new ConnectionString(uri);
        assertThat(connectionString.getHosts()).isEqualTo(List.of("localhost:27017"));
        assertThat(connectionString.getDatabase()).isEqualTo(DATABASE);
        try (var client = MongoClients.create(connectionString)) {
            client.getDatabase(DATABASE).drop();
        }
    }
}
