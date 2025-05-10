import axios from 'axios';

const API_URL = 'http://localhost:8080/api/reviews';

/**
 * Lấy danh sách đánh giá đã được phê duyệt hiển thị công khai
 */
export const getPublishedReviews = async () => {
    try {
        const response = await axios.get(`${API_URL}/public`);
        return response.data;
    } catch (error) {
        console.error('Error fetching reviews:', error);
        throw error;
    }
};

/**
 * Gửi đánh giá mới
 */
export const submitReview = async (reviewData) => {
    try {
        const response = await axios.post(`${API_URL}/submit`, reviewData);
        return response.data;
    } catch (error) {
        console.error('Error submitting review:', error);
        throw error;
    }
};

// Export tất cả các hàm
const reviewService = {
    getPublishedReviews,
    submitReview
};

export default reviewService; 