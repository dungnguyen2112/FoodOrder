package com.example.cosmeticsshop.repository;

import org.springframework.data.domain.Limit;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.example.cosmeticsshop.domain.Notification;
import com.example.cosmeticsshop.domain.User;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Integer> {

    Notification findById(int id);

    int countByReadAndReceiver(boolean read, User receiver);

    Page<Notification> findByReceiver(User receiver, Pageable pageable);

    List<Notification> findByReceiverEqualsAndIdLessThan(User receiver, Long idIsLessThan, Pageable pageable);

}
