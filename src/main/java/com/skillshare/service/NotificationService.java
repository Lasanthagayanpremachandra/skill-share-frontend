package com.skillshare.service;

import com.skillshare.model.Notification;
import com.skillshare.model.NotificationType;
import com.skillshare.model.User;
import com.skillshare.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;

    @Transactional
    public void createNotification(User user, String message, NotificationType type, String link) {
        Notification notification = new Notification();
        notification.setUser(user);
        notification.setMessage(message);
        notification.setType(type);
        notification.setLink(link);
        notificationRepository.save(notification);
    }

    @Transactional
    public void createLikeNotification(User recipient, User liker, Long postId) {
        String message = String.format("%s liked your post", liker.getName());
        String link = "/posts/" + postId;
        createNotification(recipient, message, NotificationType.LIKE, link);
    }

    @Transactional
    public void createCommentNotification(User recipient, User commenter, Long postId) {
        String message = String.format("%s commented on your post", commenter.getName());
        String link = "/posts/" + postId;
        createNotification(recipient, message, NotificationType.COMMENT, link);
    }

    @Transactional
    public void createFollowNotification(User recipient, User follower) {
        String message = String.format("%s started following you", follower.getName());
        String link = "/users/" + follower.getId();
        createNotification(recipient, message, NotificationType.FOLLOW, link);
    }

    @Transactional
    public void createLearningPlanSharedNotification(User recipient, User sharer, Long planId) {
        String message = String.format("%s shared a learning plan with you", sharer.getName());
        String link = "/learning-plans/" + planId;
        createNotification(recipient, message, NotificationType.LEARNING_PLAN_SHARED, link);
    }
}
