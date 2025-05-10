package com.example.cosmeticsshop.controller;

import com.example.cosmeticsshop.dto.ReviewDTO;
import com.example.cosmeticsshop.service.ReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@CrossOrigin(origins = "*")
public class ReviewController {

    private final ReviewService reviewService;

    @Autowired
    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    /**
     * Lấy tất cả các đánh giá đã được duyệt (public API)
     */
    @GetMapping("/public")
    public ResponseEntity<List<ReviewDTO>> getAllPublishedReviews() {
        return ResponseEntity.ok(reviewService.getAllPublishedReviews());
    }

    /**
     * Gửi đánh giá mới (public API)
     */
    @PostMapping("/submit")
    public ResponseEntity<ReviewDTO> submitReview(@Valid @RequestBody ReviewDTO reviewDTO) {
        ReviewDTO savedReview = reviewService.saveReview(reviewDTO);
        return new ResponseEntity<>(savedReview, HttpStatus.CREATED);
    }

    /**
     * Lấy tất cả các đánh giá (chỉ dành cho admin)
     */
    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ReviewDTO>> getAllReviews() {
        return ResponseEntity.ok(reviewService.getAllReviews());
    }

    /**
     * Cập nhật trạng thái hiển thị của đánh giá (chỉ dành cho admin)
     */
    @PutMapping("/admin/{id}/publish")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ReviewDTO> updateReviewPublishStatus(
            @PathVariable Long id,
            @RequestParam boolean published) {

        return reviewService.updateReviewPublishedStatus(id, published)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Xóa đánh giá (chỉ dành cho admin)
     */
    @DeleteMapping("/admin/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteReview(@PathVariable Long id) {
        reviewService.deleteReview(id);
        return ResponseEntity.noContent().build();
    }
}