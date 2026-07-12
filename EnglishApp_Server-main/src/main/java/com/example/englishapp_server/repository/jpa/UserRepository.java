package com.example.englishapp_server.repository.jpa;

import com.example.englishapp_server.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;


@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    User findByUsername(String username);
    User findByEmail(String email);

    User findByUsernameAndPasswordHash(String username, String passwordHash);
    User findByEmailAndPasswordHash(String email, String passwordHash);
    User findUserById(UUID id);
}
