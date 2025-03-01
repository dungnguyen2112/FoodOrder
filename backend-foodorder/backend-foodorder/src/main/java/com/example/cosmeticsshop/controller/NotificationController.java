package com.example.cosmeticsshop.controller;

import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import com.example.cosmeticsshop.domain.Notification;
import com.example.cosmeticsshop.repository.UserRepository;
import com.example.cosmeticsshop.service.NotificationService;
import com.example.cosmeticsshop.service.UserService;

import java.util.List;

@Controller
@AllArgsConstructor
public class NotificationController {

    private final UserRepository userRepository;
    private final UserService userService;

    private NotificationService notificationService;

    @GetMapping("/notifications/{userId}/unread")
    public ResponseEntity<Integer> getUnreadNotifications(@PathVariable Long userId) {
        return ResponseEntity.ok(notificationService.countUnreadNotifications(
                userRepository.findById(userId).get()));
    }

    @GetMapping("/notifications/{userId}/{lastId}/{limit}")
    @ResponseBody
    public List<Notification> getNotifications(@PathVariable Long userId,
            @PathVariable Long lastId,
            @PathVariable int limit) {
        return notificationService.getNotificationsOfReceiver(
                userRepository.findById(userId).get(),
                lastId,
                limit);
    }

    @PostMapping("/notifications/{notiId}/markAsRead")
    @ResponseBody
    public void markAsRead(@PathVariable int notiId) {
        Notification noti = notificationService.findById(notiId);
        noti.setRead(true);
        notificationService.save(noti);
    }

    @DeleteMapping("/notifications/{notiId}/delete")
    @ResponseBody
    public void deleteNotification(@PathVariable int notiId) {
        Notification noti = notificationService.findById(notiId);
        notificationService.deleteNotification(noti);
    }

}
