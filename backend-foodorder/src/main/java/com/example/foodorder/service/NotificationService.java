package com.example.foodorder.service;

import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import com.example.foodorder.domain.Notification;
import com.example.foodorder.domain.User;
import com.example.foodorder.repository.NotificationRepository;

import java.util.List;
import java.util.Optional;

@Service
@AllArgsConstructor
public class NotificationService {

    private SimpMessagingTemplate messagingTemplate;

    private NotificationRepository notificationRepository;

    public Notification save(Notification notification) {
        return notificationRepository.save(notification);
    }

    public int countUnreadNotifications(User receiver) {
        return notificationRepository.countByReadAndReceiver(false, receiver);
    }

    @Transactional
    public void sendNotification(Notification notification) {
        notificationRepository.save(notification);
        messagingTemplate.convertAndSendToUser(notification.getReceiver().getUsername(), "/notify",
                notification);
    }

    public List<Notification> getNotificationsOfReceiver(User receiver, Long lastId, int limit) {
        Pageable pageable = PageRequest.of(0, limit, Sort.by("id").descending());
        return notificationRepository.findByReceiverEqualsAndIdLessThan(
                receiver,
                lastId,
                pageable);
    }

    public void deleteNotification(Notification notification) {
        notificationRepository.delete(notification);
    }

    public Notification findById(int id) {
        return notificationRepository.findById(id);
    }

}
