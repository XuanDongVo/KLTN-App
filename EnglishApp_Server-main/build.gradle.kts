plugins {
    java
    id("java-library")  // To used library catalog
    id("org.springframework.boot") version "4.0.5"
    id("io.spring.dependency-management") version "1.1.7"
}

group = "com.example"
version = "0.0.1-SNAPSHOT"
description = "EnglishApp_Server"

java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(21)
    }
}

configurations {
    compileOnly {
        extendsFrom(configurations.annotationProcessor.get())
    }
}

repositories {
    mavenCentral()
}

dependencies {
    implementation(libs.spring.boot.starter.web)
    runtimeOnly("com.mysql:mysql-connector-j")
    implementation(libs.spring.boot.starter.data.jpa)
    implementation(libs.spring.boot.starter.data.mongodb)
    implementation(libs.spring.boot.starter.mail)
    implementation(libs.spring.boot.starter.thymeleaf)
    implementation("io.jsonwebtoken:jjwt-api:0.11.5")
    implementation(libs.spring.boot.starter.validation)
//    implementation("org.jspecify:jspecify:1.0.0")
    implementation("com.fasterxml.jackson.core:jackson-databind:2.17.2")
    api(libs.jsoup)
    api(libs.org.mindrot.jbcrypt)
    runtimeOnly("io.jsonwebtoken:jjwt-impl:0.11.5")
    runtimeOnly("io.jsonwebtoken:jjwt-jackson:0.11.5")
    implementation (libs.cloudinary)
    implementation (libs.cloudinary.http5)
    implementation("io.github.cdimascio:dotenv-java:3.0.0")
    api(libs.com.google.code.gson.gson)
    compileOnly("org.projectlombok:lombok")
    annotationProcessor("org.projectlombok:lombok")
    testImplementation("org.springframework.boot:spring-boot-starter-test")
    testRuntimeOnly("org.junit.platform:junit-platform-launcher")
}

tasks.withType<Test> {
    useJUnitPlatform()
}
