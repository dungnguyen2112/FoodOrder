package com.example.cosmeticsshop.service;

import com.example.cosmeticsshop.domain.Review;
import com.example.cosmeticsshop.dto.ReviewDTO;
import com.example.cosmeticsshop.repository.ReviewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;

    @Autowired
    public ReviewService(ReviewRepository reviewRepository) {
        this.reviewRepository = reviewRepository;
    }

    /**
     * Lấy tất cả các đánh giá được phép hiển thị
     */
    @Transactional(readOnly = true)
    public List<ReviewDTO> getAllPublishedReviews() {
        return reviewRepository.findAllByPublishedTrue().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Lấy tất cả các đánh giá (cho admin)
     */
    @Transactional(readOnly = true)
    public List<ReviewDTO> getAllReviews() {
        return reviewRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Lưu đánh giá mới
     */
    @Transactional
    public ReviewDTO saveReview(ReviewDTO reviewDTO) {
        Review review = new Review();
        review.setName(reviewDTO.getName());
        review.setText(reviewDTO.getText());
        review.setEmail(reviewDTO.getEmail());
        review.setRating(reviewDTO.getRating());
        // Đánh giá mới sẽ được kiểm duyệt trước khi hiển thị
        review.setPublished(false);

        Review savedReview = reviewRepository.save(review);
        return convertToDTO(savedReview);
    }

    /**
     * Cập nhật trạng thái hiển thị của đánh giá
     */
    @Transactional
    public Optional<ReviewDTO> updateReviewPublishedStatus(Long id, boolean published) {
        return reviewRepository.findById(id)
                .map(review -> {
                    review.setPublished(published);
                    return convertToDTO(reviewRepository.save(review));
                });
    }

    /**
     * Xóa đánh giá
     */
    @Transactional
    public void deleteReview(Long id) {
        reviewRepository.deleteById(id);
    }

    /**
     * Chuyển đổi Entity thành DTO
     */
    private ReviewDTO convertToDTO(Review review) {
        ReviewDTO dto = new ReviewDTO();
        dto.setId(review.getId());
        dto.setName(review.getName());
        dto.setText(review.getText());
        dto.setEmail(review.getEmail());
        dto.setRating(review.getRating());
        return dto;
    }
}