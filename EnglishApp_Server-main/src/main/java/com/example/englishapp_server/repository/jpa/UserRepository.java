package com.example.englishapp_server.repository.jpa;

import com.example.englishapp_server.common.enums.AccountStatus;
import com.example.englishapp_server.common.enums.UserRole;
import com.example.englishapp_server.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.UUID;


@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    User findByUsername(String username);
    User findByEmail(String email);

    User findByUsernameAndPasswordHash(String username, String passwordHash);
    User findByEmailAndPasswordHash(String email, String passwordHash);
    User findUserById(UUID id);

    long countByRole(UserRole role);
    long countByRoleAndAccountStatus(UserRole role, AccountStatus status);
    long countByRoleAndLastLoginAtAfter(UserRole role, LocalDateTime threshold);

    @Query("""
            select u from User u
            where u.role = :role
              and (:status is null or u.accountStatus = :status)
              and (:search = '' or lower(u.username) like lower(concat('%', :search, '%'))
                   or lower(u.email) like lower(concat('%', :search, '%')))
            order by u.createdAt desc, u.username asc
            """)
    Page<User> searchLearners(
            @Param("role") UserRole role,
            @Param("status") AccountStatus status,
            @Param("search") String search,
            Pageable pageable
    );
}
