package com.example.englishapp_server.service;

import com.example.englishapp_server.common.enums.ContributorRequestStatus;
import com.example.englishapp_server.common.enums.UserRole;
import com.example.englishapp_server.dto.request.admin.ReviewContributorRequest;
import com.example.englishapp_server.dto.request.contributor.CreateContributorRequest;
import com.example.englishapp_server.dto.response.contributor.ContributorRequestResponse;
import com.example.englishapp_server.entity.ContributorRequest;
import com.example.englishapp_server.entity.User;
import com.example.englishapp_server.repository.jpa.ContributorRequestRepository;
import com.example.englishapp_server.repository.jpa.UserRepository;
import com.example.englishapp_server.notification.NotificationService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ContributorRequestService {

    private final ContributorRequestRepository requestRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public ContributorRequestService(ContributorRequestRepository requestRepository, 
                                     UserRepository userRepository,
                                     NotificationService notificationService) {
        this.requestRepository = requestRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    public ContributorRequestResponse submitRequest(UUID userId, CreateContributorRequest request) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        if (user.getRole() == UserRole.CONTRIBUTOR || user.getRole() == UserRole.ADMIN) {
            throw new RuntimeException("User is already a contributor or admin");
        }

        // Check if there is already a pending request
        Optional<ContributorRequest> lastRequest = requestRepository.findFirstByUserIdOrderByCreatedAtDesc(userId);
        if (lastRequest.isPresent() && lastRequest.get().getStatus() == ContributorRequestStatus.PENDING) {
            throw new RuntimeException("You already have a pending request.");
        }

        ContributorRequest contributorRequest = ContributorRequest.builder()
                .userId(userId)
                .certificateUrl(request.certificateUrl())
                .note(request.note())
                .status(ContributorRequestStatus.PENDING)
                .build();

        contributorRequest = requestRepository.save(contributorRequest);
        
        // Notify all admins
        List<User> admins = userRepository.findByRole(UserRole.ADMIN);
        for (User admin : admins) {
            notificationService.sendAndSaveNotification(admin,
                    "Yêu cầu Contributor mới",
                    "Người dùng " + user.getUsername() + " vừa gửi yêu cầu làm Contributor.",
                    java.util.Map.of("type", "CONTRIBUTOR_APPLICATION", "requestId", contributorRequest.getId().toString()));
        }

        return mapToResponse(contributorRequest, user);
    }

    public List<ContributorRequestResponse> getAllRequests() {
        return requestRepository.findAll().stream().map(req -> {
            User user = userRepository.findById(req.getUserId()).orElse(null);
            return mapToResponse(req, user);
        }).collect(Collectors.toList());
    }

    public Optional<ContributorRequestResponse> getCurrentRequest(UUID userId) {
        return requestRepository.findFirstByUserIdOrderByCreatedAtDesc(userId).map(req -> {
            User user = userRepository.findById(userId).orElse(null);
            return mapToResponse(req, user);
        });
    }

    public List<ContributorRequestResponse> getUserRequests(UUID userId) {
        User user = userRepository.findById(userId).orElse(null);
        return requestRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(req -> mapToResponse(req, user))
                .collect(Collectors.toList());
    }

    public ContributorRequestResponse reviewRequest(Long requestId, ReviewContributorRequest review) {
        ContributorRequest request = requestRepository.findById(requestId).orElseThrow(() -> new RuntimeException("Request not found"));
        if (request.getStatus() != ContributorRequestStatus.PENDING) {
            throw new RuntimeException("Request is already processed.");
        }

        User user = userRepository.findById(request.getUserId()).orElseThrow(() -> new RuntimeException("User not found"));

        if (review.approve()) {
            request.setStatus(ContributorRequestStatus.APPROVED);
            user.setRole(UserRole.CONTRIBUTOR);
            userRepository.save(user);
            
            notificationService.sendAndSaveNotification(user, 
                "Yêu cầu đã được duyệt!", 
                "Chúc mừng! Bạn đã trở thành Contributor.", 
                java.util.Map.of("type", "CONTRIBUTOR_APPROVED"));
        } else {
            request.setStatus(ContributorRequestStatus.REJECTED);
            request.setAdminFeedback(review.feedback());
            
            notificationService.sendAndSaveNotification(user, 
                "Yêu cầu bị từ chối", 
                "Yêu cầu làm Contributor của bạn đã bị từ chối.", 
                java.util.Map.of("type", "CONTRIBUTOR_REJECTED"));
        }

        request = requestRepository.save(request);
        return mapToResponse(request, user);
    }

    private ContributorRequestResponse mapToResponse(ContributorRequest request, User user) {
        return ContributorRequestResponse.builder()
                .id(request.getId())
                .userId(request.getUserId())
                .username(user != null ? user.getUsername() : "Unknown")
                .email(user != null ? user.getEmail() : "Unknown")
                .certificateUrl(request.getCertificateUrl())
                .note(request.getNote())
                .status(request.getStatus())
                .adminFeedback(request.getAdminFeedback())
                .createdAt(request.getCreatedAt())
                .updatedAt(request.getUpdatedAt())
                .build();
    }
}
