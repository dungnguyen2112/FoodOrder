import {
    FacebookOutlined,
    InstagramOutlined,
    PhoneOutlined,
    MailOutlined,
    EnvironmentOutlined,
    BellOutlined,
    ClockCircleOutlined,
    CreditCardOutlined
} from '@ant-design/icons';
import './footer.scss';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-container">
                {/* Thông tin nhà hàng */}
                <div className="footer-section">
                    <h3>Nhà Hàng FoodOrder</h3>
                    <p>Trải nghiệm ẩm thực tuyệt vời với những món ăn tinh tế, đậm đà hương vị!</p>
                    <p>Chúng tôi cam kết mang đến cho bạn những trải nghiệm ẩm thực độc đáo với nguyên liệu tươi ngon và chất lượng cao.</p>
                </div>

                {/* Giờ hoạt động */}
                <div className="footer-section">
                    <h3>Giờ Hoạt Động</h3>
                    <p><ClockCircleOutlined /> Thứ Hai - Thứ Sáu: 10:00 - 22:00</p>
                    <p><ClockCircleOutlined /> Thứ Bảy - Chủ Nhật: 09:00 - 23:00</p>
                    <p><CreditCardOutlined /> Chấp nhận thanh toán: Tiền mặt</p>
                </div>

                {/* Liên hệ */}
                <div className="footer-section">
                    <h3>Liên Hệ</h3>
                    <p><EnvironmentOutlined /> 123 Đường Ẩm Thực, Quận 1, TP.HCM</p>
                    <p><PhoneOutlined /> 0909 123 456</p>
                    <p><MailOutlined /> contact@foodorder.vn</p>
                </div>

                {/* Mạng xã hội */}
                <div className="footer-section">
                    <h3>Theo Dõi Chúng Tôi</h3>
                    <p>Đăng ký nhận thông báo về khuyến mãi và món ăn mới!</p>
                    <div className="social-icons">
                        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" title="Facebook">
                            <FacebookOutlined />
                        </a>
                        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" title="Instagram">
                            <InstagramOutlined />
                        </a>
                    </div>
                    <div className="newsletter">
                        <input type="email" placeholder="Email của bạn" />
                        <button><BellOutlined /> Đăng ký</button>
                    </div>
                </div>
            </div>

            {/* Phần bản quyền */}
            <div className="footer-bottom">
                <p>© {new Date().getFullYear()} Nhà Hàng FoodOrder. All Rights Reserved.</p>
                <div className="footer-links">
                    <a href="/terms">Điều khoản sử dụng</a>
                    <a href="/privacy">Chính sách bảo mật</a>
                    <a href="/faq">FAQ</a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;