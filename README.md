# 📰 PaperNews Server

REST API backend cho ứng dụng đọc tin tức PaperNews — xây dựng bằng **Express 5**, **MongoDB**, **JWT** và **OTP Email**.

---

## ⚡ Tech Stack

| Layer          | Công nghệ                                      |
| -------------- | ----------------------------------------------- |
| Runtime        | Node.js                                         |
| Framework      | Express 5                                       |
| Database       | MongoDB + Mongoose 9                            |
| Auth           | JWT (Access + Refresh) + OTP qua Email          |
| Validation     | express-validator                               |
| Security       | Helmet, CORS, express-rate-limit                |
| File Upload    | Multer (GridFS / Cloudinary)                    |
| Email          | Nodemailer (SMTP)                               |
| Testing        | Jest (126 unit tests)                           |

---

## 📁 Cấu trúc thư mục

```
PaperNews-Server/
├── server.js                 # Entry point
├── package.json
├── .env                      # Biến môi trường
├── Dockerfile
├── docker-compose.yml
├── src/
│   ├── config/               # Kết nối DB
│   ├── controllers/          # Request handlers
│   ├── middleware/            # Auth, upload, validate
│   ├── models/               # Mongoose schemas
│   │   ├── Article.js
│   │   ├── AuthorRequest.js
│   │   ├── Category.js
│   │   ├── Comment.js
│   │   ├── Notification.js
│   │   ├── Otp.js
│   │   └── User.js
│   ├── routes/               # API routes
│   ├── services/             # Business logic
│   └── utils/                # Helpers
└── tests/
    └── unit/services/        # 14 test suites
```

---

## 🚀 Bắt đầu nhanh

### Yêu cầu

- **Node.js** ≥ 18
- **MongoDB** ≥ 6 (local hoặc Atlas)

### Cài đặt

```bash
git clone <repo-url>
cd PaperNews-Server
npm install
```

### Cấu hình `.env`

```env
# Server
PORT=7000
NODE_ENV=development

# MongoDB
MONGO_URI=mongodb://localhost:27017/papernews

# JWT
JWT_ACCESS_SECRET=your_access_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here
JWT_RESET_SECRET=your_reset_secret_here
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d

# SMTP Email (Gmail App Password)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password_here
SMTP_FROM_NAME=PaperNews
SMTP_FROM_EMAIL=noreply@papernews.com
```

### Chạy

```bash
# Development (hot-reload)
npm run dev

# Production
npm start
```

Server mặc định chạy ở `http://localhost:7000`.

---

## 🐳 Docker

```bash
# Build & chạy cùng MongoDB
docker-compose up -d

# Chỉ build image
docker build -t papernews-server .
```

---

## 🔗 API Endpoints

### Health Check

| Method | Endpoint       | Mô tả            |
| ------ | -------------- | ----------------- |
| GET    | `/api/health`  | Kiểm tra server   |

### Auth (`/api/auth`)

| Method | Endpoint             | Mô tả                    |
| ------ | -------------------- | ------------------------- |
| POST   | `/register`          | Đăng ký tài khoản         |
| POST   | `/verify-otp`        | Xác thực OTP email        |
| POST   | `/resend-otp`        | Gửi lại OTP               |
| POST   | `/login`             | Đăng nhập                 |
| POST   | `/refresh`           | Làm mới access token      |
| POST   | `/forgot-password`   | Quên mật khẩu             |
| POST   | `/verify-reset-otp`  | Xác thực OTP reset        |
| POST   | `/reset-password`    | Đặt lại mật khẩu          |

### Articles (`/api/articles`)

| Method | Endpoint              | Auth       | Mô tả                 |
| ------ | --------------------- | ---------- | ---------------------- |
| GET    | `/`                   | Public     | Danh sách bài viết     |
| GET    | `/:id`                | Public     | Chi tiết bài viết      |
| POST   | `/`                   | Author+    | Tạo bài viết           |
| PUT    | `/:id`                | Author+    | Sửa bài viết           |
| DELETE | `/:id`                | Author+    | Xóa bài viết           |
| PATCH  | `/:id/status`         | Admin      | Duyệt / từ chối        |
| PATCH  | `/:id/featured`       | Admin      | Đánh dấu nổi bật       |

### Users (`/api/users`)

| Method | Endpoint           | Auth   | Mô tả              |
| ------ | ------------------ | ------ | ------------------- |
| GET    | `/me`              | User   | Xem profile         |
| PUT    | `/me`              | User   | Cập nhật profile    |
| PATCH  | `/me/password`     | User   | Đổi mật khẩu        |
| GET    | `/:id/profile`     | Public | Profile công khai   |
| GET    | `/`                | Admin  | Danh sách users     |
| PATCH  | `/:id/ban`         | Admin  | Ban / unban          |

### Other Resources

| Prefix                | Mô tả                  |
| --------------------- | ----------------------- |
| `/api/categories`     | Quản lý danh mục        |
| `/api/comments`       | Bình luận bài viết      |
| `/api/bookmarks`      | Lưu bài viết            |
| `/api/likes`          | Thích bài viết          |
| `/api/follows`        | Theo dõi tác giả        |
| `/api/notifications`  | Thông báo               |
| `/api/author-requests`| Yêu cầu làm tác giả    |
| `/api/stats`          | Thống kê (admin/author) |
| `/api/media`          | Upload media             |

---

## 🧪 Testing

```bash
# Chạy toàn bộ test
npm test

# Kết quả
# Test Suites: 14 passed, 14 total
# Tests:       126 passed, 126 total
```

---

## 📦 Scripts

| Script        | Mô tả                        |
| ------------- | ----------------------------- |
| `npm start`   | Chạy production               |
| `npm run dev` | Chạy dev với nodemon          |
| `npm test`    | Chạy Jest tests               |

---

## 🛡️ Bảo mật

- **Helmet** — HTTP security headers
- **Rate Limiting** — 100 requests / 15 phút cho `/api/`
- **CORS** — Cross-Origin Resource Sharing
- **JWT** — Stateless authentication (access + refresh tokens)
- **OTP** — Email verification & password reset
- **bcryptjs** — Password hashing
- **express-validator** — Input validation & sanitization

---

## 📄 License

ISC
