
# 🍽️ **Food Ordering System** 🚀  

> **A powerful, modern, and scalable system for managing restaurant orders, customers, and payments.**  

---

## 📌 **Overview**  

The **Food Ordering System** is a complete digital solution designed to **streamline the restaurant ordering process**, enhance customer experience, and **optimize business operations**.  

- 🔹 **Customers** can browse menus, place orders, and make payments seamlessly.  

- 🔹 **Restaurant Owners** can manage menus, track orders, and monitor revenue efficiently.  

- 🔹 **Admins** have full control over users, roles, and system management.  

---

## 🎯 **Key Features**  

### 👤 **User Management**  

✅ **Secure Authentication** (JWT & OAuth2-based login & registration).  

✅ **Profile Management** (Update user info, upload avatar, change password).  

✅ **Role-Based Access Control** (Spring Security).  

✅ **Order History & Tracking** (Users can view past orders).  

### 🍕 **Food & Category Management**  

✅ **Food Listings** (Customers can browse food items with images & descriptions).  

✅ **Admin CRUD Controls** (Create, update, delete food items).  

✅ **Category Organization** (Classify food into categories).  

✅ **Image Upload Support** (For better UI/UX experience).  

### 🛒 **Order & Payment Processing**  

✅ **Order Placement** (Smooth checkout & real-time order tracking).  

✅ **Order Management** (Update, cancel, or change order status).  

✅ **Secure Payments** (Monitor payment status & history).  

### 📍 **Table Management**  

✅ **Table Reservations** (Manage restaurant seating and availability).  

✅ **Status Updates** (Toggle between **available** and **occupied**).  

### 📊 **Dashboard & Analytics**  

✅ **Real-time Sales Reports** (Track revenue, orders, and customers).  

✅ **Performance Metrics** (Identify best-selling items & trends).  

---

## 🛠 **Tech Stack**  

| **Technology**       | **Description**  |
|----------------------|----------------|
| **Backend**         | Spring Boot, Spring Security, Spring Data JPA, Spring Mail, Maven  |
| **Frontend**        | React 18, React Router 6, Redux Tookit, Vite |
| **Database**        | MySQL |
| **Authentication**  | JWT, OAuth2 |
| **API**            | RESTful API |
| **Security**        | Spring Security (Role-based Access Control) |

---

## 🚀 **Why Choose This System?**  

✔ **User-Friendly:** Simple, fast, and responsive UI.  

✔ **Optimized Order Processing:** Reduces waiting times & automates workflows.  

✔ **Scalable & Secure:** Built with best security practices.  

✔ **Comprehensive Features:** From order tracking to analytics.  

---

## 📸 **Screenshots** *(Add your own screenshots here)*  

![React Test Fresher FoodOrder - Google Chrome 2_24_2025 3_16_36 PM](https://github.com/user-attachments/assets/1fc1e888-1598-4d91-a024-b48bb4282acb)
![React Test Fresher FoodOrder - Google Chrome 2_24_2025 3_16_48 PM](https://github.com/user-attachments/assets/e3336e9c-26e1-48d2-b971-10400c48f55c)
![React Test Fresher FoodOrder - Google Chrome 2_24_2025 3_17_24 PM](https://github.com/user-attachments/assets/437062bd-c602-4c08-b4a7-910588ec8fe7)
![React Test Fresher FoodOrder - Google Chrome 2_24_2025 3_17_54 PM](https://github.com/user-attachments/assets/f879a38b-4b43-405f-98b0-7bb6b3c93001)
![React Test Fresher FoodOrder - Google Chrome 2_23_2025 11_10_00 PM](https://github.com/user-attachments/assets/50068f12-f0b4-4ee9-b710-8bac7f3226f9)
![React Test Fresher FoodOrder - Google Chrome 2_24_2025 3_18_27 PM](https://github.com/user-attachments/assets/39184bcf-d792-4e45-90d8-b53f94c32f2d)
![React Test Fresher FoodOrder - Google Chrome 2_24_2025 3_18_34 PM](https://github.com/user-attachments/assets/62e0d340-9ed5-495a-a6d8-1f64e38e497d)
![React Test Fresher FoodOrder - Google Chrome 2_24_2025 3_18_40 PM](https://github.com/user-attachments/assets/25ebdff0-4053-46a6-8af5-55ddbc104fea)
![React Test Fresher FoodOrder - Google Chrome 2_24_2025 3_18_44 PM](https://github.com/user-attachments/assets/846c8484-e2d5-43d8-bf65-155877bd5466)
![React Test Fresher FoodOrder - Google Chrome 2_24_2025 3_18_48 PM](https://github.com/user-attachments/assets/f0dcc44d-d3c7-4de1-8eb8-8cfb3ab712aa)
![React Test Fresher FoodOrder - Google Chrome 2_24_2025 3_18_52 PM](https://github.com/user-attachments/assets/03632b29-252a-40bd-96bb-5e6943c6990a)
![React Test Fresher FoodOrder - Google Chrome 2_24_2025 3_18_59 PM](https://github.com/user-attachments/assets/551c323b-cd9c-4951-9f0b-6fd25275a85c)

---

## 🔧 **Installation & Setup**  

### **1️⃣ Clone the Repository**  

```sh
git clone https://github.com/dungnguyen2112/FoodOrder.git
cd FoodOrder
```

### **2️⃣ Backend Setup (Spring Boot)**  

#### 📌 **Update application.properties**  

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/food_ordering  
spring.datasource.username=root  
spring.datasource.password=yourpassword  
spring.jpa.hibernate.ddl-auto=update  
jwt.secret=your_secret_key  
```

#### 📌 **Build & Run Backend**  

```sh
cd backend  
mvn clean install  
mvn spring-boot:run  
```

### **3️⃣ Frontend Setup (ReactJS)**  

```sh
cd frontend  
npm i --legacy-peer-deps  
npm run dev  
```

---

## 📜 **API Endpoints**  

<details>  
  <summary>🔹 Authentication</summary>  

  - **Register User** ➜ `POST /api/v1/auth/register`  

  - **Login** ➜ `POST /api/v1/auth/login`  

  - **OAuth2 Login** ➜ `GET /api/v1/auth/oauth2`  

  - **Fetch User Account** ➜ `GET /api/v1/auth/account`  

</details>  

<details>  
  <summary>🔹 User Management</summary>  

  - **Get Users** ➜ `GET /api/v1/users`  

  - **Create User** ➜ `POST /api/v1/users/create`  

  - **Update User** ➜ `PUT /api/v1/users/update`  

  - **Delete User** ➜ `DELETE /api/v1/users/{id}`  

</details>  

<details>  
  <summary>🔹 Food & Categories</summary>  

  - **Get Food List** ➜ `GET /api/v1/products`  

  - **Create Food** ➜ `POST /api/v1/products`  

  - **Update Food** ➜ `PUT /api/v1/products/{id}`  

  - **Delete Food** ➜ `DELETE /api/v1/products/{id}`  

  - **Get Categories** ➜ `GET /api/v1/categories`  

</details>  

<details>  
  <summary>🔹 Order & Payments</summary>  

  - **Place Order** ➜ `POST /api/v1/orders`  

  - **Get Orders** ➜ `GET /api/v1/orders`  

  - **Update Order** ➜ `PUT /api/v1/orders/{id}`  

  - **Delete Order** ➜ `DELETE /api/v1/orders/{id}`  

  - **Update Payment** ➜ `PUT /api/v1/orders/pay/{id}`  

</details>  

<details>  
  <summary>🔹 Table Management</summary>  

  - **Get Tables** ➜ `GET /api/v1/tables`  

  - **Create Table** ➜ `POST /api/v1/tables`  

  - **Update Table Status** ➜ `PUT /api/v1/tables/{id}`  

  - **Delete Table** ➜ `DELETE /api/v1/tables/{id}`  

</details>  

---

## 🛠 **Contributing**  

We welcome contributions! Follow these steps to contribute:  

1️⃣ **Fork the Project**  

2️⃣ **Create a Feature Branch** (`git checkout -b feature-name`)  

3️⃣ **Commit Changes** (`git commit -m "Add new feature"`)  

4️⃣ **Push to Branch** (`git push origin feature-name`)  

5️⃣ **Open a Pull Request**  

---

## 📞 **Contact & Support**  

📧 Email: nguyentridung20044@gmail.com

📌 GitHub: [github.com/dungnguyen2112](https://github.com/dungnguyen2112)  

---

## ⭐ **Support the Project**  

If you find this project useful, please consider giving it a ⭐ on GitHub!  

👉 **[Star the Repository](https://github.com/dungnguyen2112/FoodOrder)** 🚀✨  

---

🔥 **Transform your restaurant with our smart Food Ordering System!** 🍕🍔🥤  
