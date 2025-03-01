import {
    FacebookOutlined,
    InstagramOutlined,
    PhoneOutlined,
    MailOutlined,
    EnvironmentOutlined,
    BellOutlined
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
                    <div className="social-icons">
                        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
                            <FacebookOutlined />
                        </a>
                        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                            <InstagramOutlined />
                        </a>
                    </div>
                </div>


            </div>

            {/* Phần bản quyền */}
            <div className="footer-bottom">
                <p>© {new Date().getFullYear()} Nhà Hàng FoodOrder. All Rights Reserved.</p>
            </div>
        </footer>
    );
};

export default Footer;
