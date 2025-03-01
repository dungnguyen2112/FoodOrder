package com.example.foodorder.config.interceptor;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import com.example.foodorder.domain.Notification;
import com.example.foodorder.service.NotificationService;

@Component
@AllArgsConstructor
public class RefererInterceptor implements HandlerInterceptor {

    private final NotificationService notificationService;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler)
            throws Exception {
        String ref = request.getParameter("ref");
        if (ref != null && ref.equals("notif")) {
            int notiId = Integer.parseInt(request.getParameter("notifId"));
            Notification notif = notificationService.findById(notiId);
            notif.setRead(true);
            notificationService.save(notif);
        }
        return true;
    }
}
