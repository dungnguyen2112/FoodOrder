package com.example.cosmeticsshop.repository;

import com.example.cosmeticsshop.domain.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    List<Review> findAllByPublishedTrue();

    List<Review> findAllByOrderByCreatedAtDesc();
}