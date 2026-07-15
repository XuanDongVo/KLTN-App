package com.example.englishapp_server.curriculum;

import org.flywaydb.core.Flyway;
import org.junit.jupiter.api.Test;

import java.sql.DriverManager;

import static org.assertj.core.api.Assertions.assertThat;

class FlywayMigrationTests {
    @Test
    void migrationCreatesLearningCoreTables() throws Exception {
        String url = "jdbc:h2:mem:flyway_learning_core;MODE=MySQL;DB_CLOSE_DELAY=-1";
        Flyway.configure().dataSource(url, "sa", "").locations("classpath:db/migration").load().migrate();

        try (var connection = DriverManager.getConnection(url, "sa", "");
             var result = connection.getMetaData().getTables(null, null, "LEARNING_ACTIVITIES", null)) {
            assertThat(result.next()).isTrue();
        }
    }
}
