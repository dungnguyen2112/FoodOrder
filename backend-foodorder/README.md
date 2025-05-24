# Food Order Backend Application

## Giới thiệu
Đây là ứng dụng backend cho hệ thống đặt đồ ăn, được xây dựng bằng Spring Boot. Ứng dụng cung cấp các API để quản lý đơn hàng, người dùng, sản phẩm và tích hợp nhiều tính năng hiện đại.

## Công nghệ sử dụng
- Java 17
- Spring Boot 3.4.2
- Spring Security
- Spring Data JPA
- MySQL
- Redis (Caching & Session Management)
- JWT Authentication
- Spring OAuth2
- OpenAI Integration
- Cloudinary (Image Storage)
- WebSocket
- Thymeleaf
- Lombok

## Tính năng chính
- Xác thực và phân quyền người dùng (JWT + OAuth2)
- Quản lý đơn hàng
- Quản lý sản phẩm
- Tích hợp thanh toán
- Chat bot hỗ trợ (OpenAI)
- Upload và quản lý hình ảnh (Cloudinary)
- Caching với Redis
- Quản lý phiên đăng nhập với Redis
- API Documentation (Swagger/OpenAPI)
- Gửi email
- WebSocket cho real-time notifications

## Cấu hình Redis
Ứng dụng sử dụng Redis cho hai mục đích chính:
1. **Caching**: Lưu trữ dữ liệu tạm thời để tăng hiệu suất
2. **Session Management**: Quản lý phiên đăng nhập người dùng

### Cấu hình Redis trong application.properties
```properties
# Redis Configuration
spring.data.redis.host=localhost
spring.data.redis.port=6379
spring.session.store-type=redis
```

## Yêu cầu hệ thống
- JDK 17
- Maven
- MySQL
- Redis Server

## Cài đặt và chạy
1. Clone repository
2. Cấu hình database trong `application.properties`
3. Cài đặt và chạy Redis server
4. Chạy lệnh:
```bash
mvn clean install
mvn spring-boot:run
```

## API Documentation
Sau khi chạy ứng dụng, truy cập Swagger UI tại:
```
http://localhost:8080/swagger-ui.html
```

## Bảo mật
- JWT Authentication
- OAuth2 Integration
- Spring Security
- Redis Session Management
- Password Encryption

## Liên hệ
Nếu bạn có bất kỳ câu hỏi hoặc góp ý nào, vui lòng tạo issue trong repository.

## 4.7 Các công nghệ khác

### 4.7.1 Chatbot
// ... existing chatbot content ...

### 4.7.2 Redis
#### Tổng quan
Hệ thống sử dụng Redis làm hệ thống lưu trữ dữ liệu tạm thời và quản lý phiên đăng nhập, giúp tối ưu hiệu suất và bảo mật cho ứng dụng.

#### Công nghệ sử dụng
- Redis Server 7.x
- Spring Data Redis
- Jedis Client
- Spring Session

#### Cài đặt và cấu hình
1. Cài đặt Redis Server:
   - Windows: Tải và cài đặt từ https://github.com/microsoftarchive/redis/releases
   - Linux: `sudo apt-get install redis-server`
   - MacOS: `brew install redis`

2. Cấu hình Backend:
   Thêm các thuộc tính sau vào file `application.properties`:
   ```properties
   # Redis Configuration
   spring.data.redis.host=localhost
   spring.data.redis.port=6379
   spring.session.store-type=redis
   spring.session.redis.namespace=spring:session
   spring.session.redis.flush-mode=on_save
   ```

   Thêm dependencies vào file `pom.xml`:
   ```xml
   <dependency>
       <groupId>org.springframework.boot</groupId>
       <artifactId>spring-boot-starter-data-redis</artifactId>
   </dependency>
   <dependency>
       <groupId>redis.clients</groupId>
       <artifactId>jedis</artifactId>
   </dependency>
   ```

#### Tính năng và ứng dụng
1. **Caching**:
   - Lưu trữ dữ liệu tạm thời để giảm tải cho database
   - Cache các thông tin thường xuyên truy cập như:
     - Danh sách sản phẩm
     - Thông tin người dùng
     - Các cài đặt hệ thống

2. **Session Management**:
   - Quản lý phiên đăng nhập người dùng
   - Lưu trữ thông tin xác thực
   - Hỗ trợ đăng xuất từ xa
   - Tự động hết hạn phiên

3. **Rate Limiting**:
   - Giới hạn số lượng request từ một IP
   - Bảo vệ API khỏi tấn công DDoS
   - Quản lý tài nguyên hệ thống

4. **Real-time Features**:
   - Hỗ trợ WebSocket cho thông báo real-time
   - Cập nhật trạng thái đơn hàng
   - Thông báo cho người dùng

#### Bảo mật
- Mã hóa dữ liệu nhạy cảm trước khi lưu vào Redis
- Cấu hình password cho Redis server
- Giới hạn quyền truy cập vào Redis
- Sử dụng SSL/TLS cho kết nối Redis

#### Monitoring và Maintenance
1. **Monitoring**:
   - Sử dụng Redis CLI để kiểm tra trạng thái
   - Theo dõi memory usage
   - Kiểm tra số lượng kết nối

2. **Maintenance**:
   - Backup dữ liệu định kỳ
   - Xóa cache cũ
   - Tối ưu memory usage

#### Giới hạn và lưu ý
- Dữ liệu trong Redis là tạm thời
- Cần có chiến lược backup và recovery
- Quản lý memory usage cẩn thận
- Xử lý lỗi kết nối Redis
