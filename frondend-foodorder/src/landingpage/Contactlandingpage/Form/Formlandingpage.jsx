import React, { useState } from "react";
import axios from "axios";
import "./form.scss";

const Form = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitMessage, setSubmitMessage] = useState('');
    const [submitError, setSubmitError] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitError(false);
        setSubmitMessage('');

        try {
            // Gửi dữ liệu đến API
            await axios.post('http://localhost:8080/api/contact/submit', formData);

            // Xử lý thành công
            setSubmitMessage('Cảm ơn bạn đã gửi phản hồi! Ý kiến của bạn rất quan trọng đối với chúng tôi.');
            setFormData({
                name: '',
                email: '',
                subject: '',
                message: ''
            });
        } catch (error) {
            console.error('Error submitting contact form:', error);
            setSubmitError(true);
            setSubmitMessage('Đã xảy ra lỗi khi gửi phản hồi. Vui lòng thử lại sau.');
        } finally {
            setIsSubmitting(false);

            // Xóa thông báo sau 5 giây
            setTimeout(() => {
                setSubmitMessage('');
            }, 5000);
        }
    };

    return (
        <form className="contactForm" onSubmit={handleSubmit}>
            <h2 className="form-title">Gửi phản hồi về dịch vụ</h2>

            <input
                type="text"
                name="name"
                placeholder="Họ tên của bạn"
                value={formData.name}
                onChange={handleChange}
                required
            />

            <input
                type="email"
                name="email"
                placeholder="Email liên hệ"
                value={formData.email}
                onChange={handleChange}
                required
            />

            <input
                type="text"
                name="subject"
                placeholder="Tiêu đề phản hồi"
                value={formData.subject}
                onChange={handleChange}
                required
            />

            <textarea
                name="message"
                placeholder="Nội dung phản hồi của bạn về dịch vụ của chúng tôi"
                value={formData.message}
                onChange={handleChange}
                required
            />

            {submitMessage && (
                <div style={{
                    padding: '10px',
                    backgroundColor: submitError ? 'rgba(255, 77, 79, 0.2)' : 'rgba(89, 204, 202, 0.2)',
                    borderRadius: '8px',
                    marginBottom: '20px',
                    textAlign: 'center',
                    fontSize: '16px',
                    color: submitError ? '#f5222d' : '#138496'
                }}>
                    {submitMessage}
                </div>
            )}

            <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Đang gửi...' : 'Gửi phản hồi'}
            </button>
        </form>
    );
};

export default Form;
