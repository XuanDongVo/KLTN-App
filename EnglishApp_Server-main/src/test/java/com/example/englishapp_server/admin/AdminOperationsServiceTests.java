package com.example.englishapp_server.admin;

import com.example.englishapp_server.common.enums.AccountStatus;
import com.example.englishapp_server.common.enums.UserRole;
import com.example.englishapp_server.entity.User;
import com.example.englishapp_server.repository.jpa.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import static com.example.englishapp_server.admin.AdminOperationsModels.MediaAssetRequest;
import static com.example.englishapp_server.admin.AdminOperationsModels.StatusRequest;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
@Transactional
class AdminOperationsServiceTests {
    @Autowired AdminUserService userService;
    @Autowired AdminMediaService mediaService;
    @Autowired UserRepository userRepository;

    @Test
    void adminCanListInspectAndLockLearnerButNotAdmin() {
        User admin = userRepository.save(user("admin-test", "admin-test@example.com", UserRole.ADMIN));
        User learner = userRepository.save(user("learner-test", "learner-test@example.com", UserRole.USER));

        var page = userService.users("learner-test", AccountStatus.ACTIVE, 0, 20);
        assertThat(page.totalItems()).isEqualTo(1);
        assertThat(page.items().getFirst().email()).isEqualTo("learner-test@example.com");

        var locked = userService.updateStatus(admin.getId(), learner.getId(), new StatusRequest(AccountStatus.LOCKED));
        assertThat(locked.user().status()).isEqualTo(AccountStatus.LOCKED);
        assertThat(userService.dashboard().lockedLearners()).isEqualTo(1);

        assertThatThrownBy(() -> userService.updateStatus(admin.getId(), admin.getId(), new StatusRequest(AccountStatus.LOCKED)))
                .isInstanceOf(SecurityException.class);
    }

    @Test
    void registeredCloudinaryMediaAppearsInLibrary() {
        User admin = userRepository.save(user("media-admin", "media-admin@example.com", UserRole.ADMIN));
        var asset = mediaService.register(admin.getId(), new MediaAssetRequest(
                "english-app/curriculum/test", "https://res.cloudinary.com/test/image/upload/test.jpg",
                "test.jpg", "image/jpeg", 1200, 800, 120_000));

        assertThat(asset.id()).isNotNull();
        assertThat(mediaService.list()).extracting("publicId").contains("english-app/curriculum/test");
        assertThat(userService.dashboard().recentActions()).extracting("action").contains("MEDIA_UPLOAD");
    }

    private User user(String username, String email, UserRole role) {
        return User.builder()
                .username(username)
                .email(email)
                .passwordHash("hash")
                .role(role)
                .accountStatus(AccountStatus.ACTIVE)
                .build();
    }
}
