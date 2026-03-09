ؤ<p align="center">
  <img src="https://img.shields.io/badge/Platform-E--Learning-blue?style=for-the-badge&logo=bookstack&logoColor=white" alt="E-Learning Platform" />
  <img src="https://img.shields.io/badge/Status-Demo%20Project-orange?style=for-the-badge" alt="Demo" />
  <img src="https://img.shields.io/badge/License-ISC-green?style=for-the-badge" alt="License" />
</p>

<h1 align="center">🎓 Masar E-Learning Platform</h1>

<p align="center">
  <strong>A full-stack Arabic-first e-learning platform built with Next.js 16, React 19, Node.js, Express, and MongoDB</strong>
</p>

<p align="center">
  <a href="#-features">Features</a> •
  <a href="#-tech-stack">Tech Stack</a> •
  <a href="#-architecture">Architecture</a> •
  <a href="#-getting-started">Getting Started</a> •
  <a href="#-api-reference">API Reference</a> •
  <a href="#-project-structure">Project Structure</a> •
  <a href="#-team">Team</a>
</p>

<p align="center">
  <a href="https://masar-zsel.onrender.com/" target="_blank">
    <img src="https://img.shields.io/badge/🚀 Live Demo-Visit Now-brightgreen?style=for-the-badge" alt="Live Demo" />
  </a>
</p>

---

## 📋 Overview

**Masar** is a comprehensive, production-ready e-learning platform designed with a full Arabic RTL interface. It supports three user roles — **Student**, **Instructor**, and **Admin** — each with a tailored dashboard and feature set. The platform covers the complete e-learning lifecycle: from course creation and video delivery to payment processing, progress tracking, certificate generation, and more.

> **⚠️ Demo Project Notice**
>
> This is a **demonstration/portfolio project**. While the platform is fully functional and production-grade in architecture, two aspects are intentionally simplified for demo purposes:
>
> - **Video Hosting:** Videos are served via **YouTube embeds** instead of a paid DRM-protected CDN. In a production environment, we would integrate a **DRM platform** such as [Bunny.net](https://bunny.net), [Vdocipher](https://www.vdocipher.com/), or similar services. The codebase already includes a **dual video provider system** (YouTube + Bunny.net) with the `videoProvider` field on the Video model, ready for DRM integration.
> - **Payment Processing:** The payment system uses a **sandbox/manual approval** flow (screenshot-based payment verification) rather than a live payment gateway. In production, we would integrate gateways like **Stripe**, **PayPal**, **Paymob**, or **Fawry**. The order architecture already supports this transition seamlessly.

---

## ✨ Features

### 🔐 Authentication & Security

- **JWT Authentication** with HttpOnly cookie-based token storage (access + refresh tokens)
- **Email Verification** flow with tokenized verification links
- **Password Recovery** with secure reset tokens sent via email
- **Account Lockout** after 5 failed login attempts (30-minute cooldown)
- **Refresh Token Rotation** — refresh tokens are hashed in the database and rotated on use
- **Role-Based Access Control (RBAC)** — Student, Instructor, Admin with granular permissions
- **Rate Limiting** — 5 distinct rate limiters:
  - Login: `5 requests / 15 min`
  - Registration: `3 requests / hour`
  - Forgot Password: `3 requests / hour`
  - Order Creation: `5 requests / hour`
  - Global API: `300 requests / 15 min` (per-user key; falls back to IP for guests)
- **Security Headers** via Helmet (X-Frame-Options, X-Content-Type-Options, Referrer-Policy, etc.)
- **NoSQL Injection Prevention** with `express-mongo-sanitize`
- **XSS Sanitization** on all user inputs
- **File Upload Validation** — 5MB limit, jpg/png/webp only

### 🛡️ 4-Layer Device Protection System

A sophisticated anti-piracy mechanism applied to student accounts:

| Layer | Protection               | Details                                                          |
| ----- | ------------------------ | ---------------------------------------------------------------- |
| 1     | **Device Agreement**     | Students must accept terms before first login                    |
| 2     | **Monthly Device Limit** | Maximum 2 unique devices per month                               |
| 3     | **Cooldown Period**      | 4-hour cooldown between device switches                          |
| 4     | **Active Session Limit** | Only 1 concurrent session allowed; old sessions auto-deactivated |

- Device fingerprinting uses SHA-256 hash of User-Agent + client fingerprint
- Admin and Instructor accounts are **exempt** from device restrictions
- Frontend sends `X-Device-Fingerprint` header on every authenticated request
- `validateActiveSession` middleware validates session on video playback endpoints

### 📚 Course Management

- **Full CRUD** for courses by instructors and admins
- **Course Categories:** Programming, Design, Business, Marketing, Language, Science, Other
- **Course Levels:** Beginner, Intermediate, Advanced
- **Thumbnail Upload** via Cloudinary
- **Course Publishing** — toggle publish/unpublish status
- **Enrollment Counter** — automatic student count tracking
- **Course Statistics** for instructors (enrolled students, revenue, ratings)
- **Text Search Index** for efficient course discovery
- **Pagination, Filtering & Sorting** on course listings
- **Optional Authentication** — unauthenticated users can browse; enrolled students see full content

### 🎬 Video System

- **Dual Video Provider Support:**
  - **YouTube** (primary for demo) — embeds with `youtubeVideoId`
  - **Bunny.net** (secondary, production-ready) — streaming via `bunnyVideoId`
- **Video Ordering** — drag-and-drop reorderable video sequences
- **Free Preview Videos** — mark individual videos as free previews for unenrolled users
- **Video ID Protection** — YouTube/Bunny IDs are **stripped from API responses** for non-enrolled, non-preview requests
- **Video CRUD** by course instructors and admins
- **Video Watermark** component on the frontend to deter screen recording

### 💰 Payment & Order System

- **Manual Payment Flow (Production Mode):**
  1. Student selects a course and uploads a payment screenshot (Vodafone Cash / InstaPay / Bank Transfer)
  2. Admin reviews the screenshot in the admin dashboard
  3. Atomic order approval (`findOneAndUpdate`) prevents race conditions
  4. Student is auto-enrolled upon approval
  5. Notification + confirmation email sent
- **Sandbox Mode (Development):**
  - Instant order approval without payment — **blocked in production** (`NODE_ENV !== 'production'`)
  - Supports coupon application in sandbox
- **Enrollment Verification** — `check-enrollment` endpoint for frontend gating
- **Order History** for students with status tracking (pending/approved/rejected)
- **Rejection Reasons** — admin can provide rejection reason sent to the student

### 🎟️ Coupon System

- **Discount Types:** Percentage-based or Fixed amount
- **Usage Limits** — per-coupon cap with atomic `usedCount` increment
- **Per-User Tracking** — prevents reuse by the same user
- **Course-Specific Coupons** — restrict to specific courses or apply globally
- **Date Ranges** — start and expiry date validation
- **Minimum Order Amount** — optional threshold for coupon activation
- **Maximum Discount Cap** — cap on percentage-based discounts
- **Admin CRUD** — full management interface with usage analytics
- **Student Application** — `applyCoupon` endpoint with real-time discount calculation

### 📊 Progress Tracking

- **Video Completion Tracking** — mark videos as complete/incomplete
- **Watch Duration Tracking** — `updateWatchDuration` for analytics
- **Course Progress Percentage** — calculated from completed vs. total videos
- **Last Watched Video** — resume from where the student left off
- **Progress stored per-enrollment** in the User model for atomic updates

### 📝 Reviews & Ratings

- **Star Rating System** (1-5) with text reviews
- **Completion Gate** — only students who completed 100% of a course can leave a review
- **One Review Per User Per Course** — enforced at model level
- **Course Rating Aggregation** — `averageRating` and `ratingsCount` auto-calculated
- **Full CRUD** — students can edit/delete their own reviews
- **Review Notifications** — instructors notified of new reviews

### 💬 Comments System

- **Video-Level Comments** — students can discuss individual videos
- **Enrollment Check** — only enrolled students (or instructors/admins) can comment
- **Comment CRUD** — users can edit/delete their own comments
- **Paginated Display** with newest-first sorting

### 🏆 Certificate System

- **Auto-Generation** at 100% course completion
- **PDF Certificates** built with `pdf-lib` and custom Arabic fonts via `@pdf-lib/fontkit`
- **Unique Certificate ID** — each certificate has a verifiable UUID
- **Cloudinary Storage** — persistent PDF hosting
- **Public Verification** — `GET /api/certificates/verify/:certificateId` for employers/third parties
- **Download Endpoint** — students can download their certificates anytime
- **Notification + Email** sent on certificate issuance

### 🔔 Notification System

- **9 Notification Types:**
  - `order_approved`, `order_rejected`
  - `course_enrolled`, `course_published`
  - `certificate_issued`
  - `comment_reply`
  - `instructor_approved`, `instructor_rejected`
  - `new_review`
- **Real-Time Badge** — unread count polled every 30 seconds and displayed in the notification bell
- **Notification Bell Dropdown** — quick-view of latest 10 notifications with per-item mark-as-read & delete
- **Dedicated Notifications Page** (`/notifications`) — full-featured page with:
  - Filter tabs: All / Unread / Read
  - Paginated list (15 per page) with staggered entrance animations
  - Mark all as read in one click
  - Delete all read notifications
  - Hover-reveal delete button per notification
  - Distinct empty states per filter type
- **Mark as Read** — individual and bulk operations
- **Auto-Cleanup** — daily cron job at 2:00 AM deletes notifications older than 30 days

### ❤️ Wishlist

- **Add/Remove Courses** with toggle functionality
- **Enrollment Check** — removes wishlisted courses automatically after enrollment
- **Persisted Per-User** in the database
- **Quick Check Endpoint** — `GET /api/wishlist/check/:courseId`

### 👨‍🏫 Instructor Application Flow

1. **Public Application Form** — no authentication required
2. **Duplicate Detection** — checks for existing user or pending application
3. **Admin Review Dashboard** — view, approve, or reject applications
4. **Auto Account Creation** — on approval, an instructor account is created with a pre-hashed password
5. **Rejection with Reason** — admin can specify rejection reason
6. **Email Notifications** at each stage

### 🛠️ Admin Dashboard

- **Analytics Dashboard:**
  - Total revenue with period aggregation
  - Enrolled students count
  - Active courses count
  - Pending orders count
  - Revenue charts and trends
- **Student Management:**
  - View all students (paginated + searchable)
  - Block/unblock students
  - Delete student accounts (cascading cleanup)
- **Instructor Management:**
  - View all instructors with course counts
  - Demote instructor to student role
- **Order Management:**
  - View pending orders with payment screenshots
  - Approve/reject with one click
  - Filter by status
- **Course Management:**
  - View all courses across instructors
  - Full CRUD capabilities
- **Coupon Management:**
  - Create, edit, delete coupons
  - Usage analytics
- **Instructor Application Review:**
  - Review pending applications
  - Approve or reject with feedback
- **Device & Session Management:**
  - View device logs per user
  - Manage active sessions

### 🌙 UI/UX Features

- **Full Arabic RTL Layout** — `dir="rtl"` with `lang="ar"` throughout
- **Dark/Light Mode** — theme toggle with persistence (Zustand store)
- **Dark Mode Flash Prevention** — inline script in layout prevents FOUC
- **Responsive Design** — mobile-first approach with Tailwind CSS v4
- **Smooth Animations** — Framer Motion page transitions + custom CSS keyframe library:
  - `page-enter` wrapper for full-page rise-in
  - `animate-fadeInUp`, `animate-scale-in`, `animate-slide-in-right`, `animate-pop-in`
  - Staggered row helpers `.stagger-1` … `.stagger-8`
  - `animate-float` for idle icons, `animate-ping-once` for badge attention
- **Enhanced CourseCard Hover** — deeper lift (`-translate-y-2`), richer colored shadows, button press feedback
- **Toast Notifications** — react-hot-toast for user feedback
- **Skeleton Loading** — shimmer placeholders for all data-fetching states
- **Breadcrumb Navigation** — contextual path display
- **Empty States** — illustrated empty state components
- **Scroll to Top** — smooth scroll-to-top button
- **Recently Viewed Courses** — client-side tracking hook
- **Global Footer** — site-wide footer with quick links, categories, and social links
- **Contact Page** (`/contact`) — contact form with client-side validation
- **Sitemap** — auto-generated `sitemap.xml` for SEO crawlers
- **Dynamic Page Metadata** — `generateMetadata` server functions on course detail, checkout, and watch pages for accurate browser tab titles and Open Graph tags

---

## 🛠️ Tech Stack

### Backend

| Technology                     | Purpose                                     |
| ------------------------------ | ------------------------------------------- |
| **Node.js**                    | Runtime environment                         |
| **Express.js 4.18**            | HTTP framework (ES Modules)                 |
| **MongoDB + Mongoose 8**       | Database + ODM                              |
| **JSON Web Tokens**            | Authentication (access + refresh)           |
| **bcryptjs**                   | Password hashing                            |
| **Cloudinary + Multer**        | File upload pipeline (images, certificates) |
| **Nodemailer**                 | SMTP email delivery (pooled transporter)    |
| **pdf-lib + @pdf-lib/fontkit** | Certificate PDF generation                  |
| **express-validator**          | Input validation                            |
| **express-rate-limit**         | Rate limiting                               |
| **Helmet**                     | Security headers                            |
| **express-mongo-sanitize**     | NoSQL injection prevention                  |
| **xss**                        | Cross-site scripting protection             |
| **ua-parser-js**               | Device/browser fingerprinting               |
| **node-cron**                  | Scheduled cleanup tasks                     |
| **Winston + Morgan**           | Logging (file rotation + HTTP)              |
| **Jest 30 + Supertest**        | Testing                                     |

### Frontend

| Technology                 | Purpose                       |
| -------------------------- | ----------------------------- |
| **Next.js 16**             | React framework (App Router)  |
| **React 19**               | UI library                    |
| **TypeScript 5**           | Type safety                   |
| **Tailwind CSS v4**        | Utility-first styling         |
| **Zustand 5**              | Global state management       |
| **SWR 2.4**                | Data fetching with caching    |
| **Axios**                  | HTTP client with interceptors |
| **Framer Motion 12**       | Animations & transitions      |
| **react-hot-toast**        | Toast notifications           |
| **react-icons**            | Icon library                  |
| **clsx + tailwind-merge**  | Class utility functions       |
| **Jest + Testing Library** | Component testing             |

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                          │
│              Next.js 16 + React 19 + TypeScript                  │
│        Zustand Stores │ SWR Cache │ Axios Interceptors           │
└────────────────────────────┬─────────────────────────────────────┘
                             │ HTTPS (REST API)
                             │ HttpOnly Cookies + Bearer Token
                             │ X-Device-Fingerprint Header
                             ▼
┌──────────────────────────────────────────────────────────────────┐
│                      API GATEWAY (Express.js)                    │
│  ┌─────────┐ ┌────────┐ ┌──────────┐ ┌────────┐ ┌───────────┐  │
│  │  CORS   │ │ Helmet │ │Rate Limit│ │ Morgan │ │  Sanitize │  │
│  └────┬────┘ └───┬────┘ └────┬─────┘ └───┬────┘ └─────┬─────┘  │
│       └──────────┴───────────┴────────────┴────────────┘        │
│                              │                                   │
│  ┌───────────────────────────┴───────────────────────────────┐  │
│  │                    ROUTE HANDLERS (16 modules)             │  │
│  │  auth │ courses │ videos │ orders │ admin │ reviews │ ...  │  │
│  └───────────────────────────┬───────────────────────────────┘  │
│                              │                                   │
│  ┌──────────────┐  ┌────────┴──────────┐  ┌──────────────────┐  │
│  │   Auth MW    │  │   Controllers     │  │ Device Protection│  │
│  │ JWT Verify   │  │ Business Logic    │  │ 4-Layer System   │  │
│  │ Role Check   │  │                   │  │ Fingerprinting   │  │
│  └──────────────┘  └────────┬──────────┘  └──────────────────┘  │
└──────────────────────────────┼───────────────────────────────────┘
                               │
          ┌────────────────────┼────────────────────┐
          ▼                    ▼                     ▼
┌──────────────────┐ ┌─────────────────┐ ┌──────────────────────┐
│    MongoDB       │ │   Cloudinary    │ │    SMTP (Email)      │
│  (Mongoose 8)    │ │  (File Storage) │ │   (Nodemailer)       │
│                  │ │                 │ │                      │
│ • Users          │ │ • Avatars       │ │ • Verification       │
│ • Courses        │ │ • Thumbnails    │ │ • Password Reset     │
│ • Videos         │ │ • Screenshots   │ │ • Order Updates      │
│ • Orders         │ │ • Certificates  │ │ • Certificate Issued │
│ • Reviews        │ │                 │ │                      │
│ • Comments       │ └─────────────────┘ └──────────────────────┘
│ • Notifications  │
│ • Coupons        │ ┌─────────────────────────────────────────┐
│ • Sessions       │ │         Video Providers                 │
│ • DeviceLogs     │ │  ┌───────────┐  ┌────────────────────┐  │
│ • Applications   │ │  │  YouTube  │  │   Bunny.net (DRM)  │  │
└──────────────────┘ │  │  (Demo)   │  │   (Production)     │  │
                     │  └───────────┘  └────────────────────┘  │
                     └─────────────────────────────────────────┘
```

### Database Relationships

```
User ──────────┬── enrolledCourses[] ──────► Course
               ├── wishlist[] ─────────────► Course
               ├── videoProgress[] ────────► Video
               └── deviceAgreement

Course ────────┬── instructor ─────────────► User
               └── videos (virtual) ───────► Video[]

Video ─────────── courseId ────────────────► Course

Order ─────────┬── userId ─────────────────► User
               ├── courseId ───────────────► Course
               └── approvedBy ─────────────► User (Admin)

Review ────────┬── userId ─────────────────► User
               └── courseId ───────────────► Course

Comment ───────┬── userId ─────────────────► User
               └── videoId ────────────────► Video

Notification ──── user ────────────────────► User

Coupon ────────┬── applicableCourses[] ────► Course[]
               ├── usedBy[] ───────────────► User[]
               └── createdBy ──────────────► User

InstructorApplication ──── (standalone, converts to User on approval)

ActiveSession ─── userId ──────────────────► User (TTL: 7 days)

DeviceLog ─────── userId ──────────────────► User (unique: userId + fingerprint)
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18+
- **MongoDB** (local or [MongoDB Atlas](https://www.mongodb.com/atlas))
- **Cloudinary** account ([Sign up](https://cloudinary.com/))
- **SMTP Email** service (Gmail, SendGrid, etc.)

### 1. Clone the Repository

```bash
git clone https://github.com/Mo7amed-3bnaser/e-learning-platform.git
cd e-learning-platform
```

### 2. Backend Setup

```bash
cd Back-End
npm install
```

Create a `.env` file in the `Back-End/` directory:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/e-learning

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_REFRESH_SECRET=your_refresh_secret_key
JWT_EXPIRE=1h
JWT_REFRESH_EXPIRE=7d

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email (SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM=your_email@gmail.com

# Frontend URL (for CORS & email links)
FRONTEND_URL=http://localhost:3000
ALLOWED_ORIGINS=http://localhost:3000

# Bunny.net (optional - for DRM video hosting)
BUNNY_API_KEY=your_bunny_api_key
BUNNY_LIBRARY_ID=your_library_id
```

Start the backend:

```bash
# Development
npm run dev

# Production
npm start
```

### 3. Create Admin Account

```bash
npm run create-admin
```

### 4. Frontend Setup

```bash
cd ../Front-End
npm install
```

Create a `.env.local` file in the `Front-End/` directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

Start the frontend:

```bash
# Development
npm run dev

# Production
npm run build
npm start
```

### 5. Access the Platform

| Service      | URL                              |
| ------------ | -------------------------------- |
| Frontend     | http://localhost:3000            |
| Backend API  | http://localhost:5000/api        |
| Health Check | http://localhost:5000/api/health |

---

## 📡 API Reference

The platform exposes **80+ RESTful endpoints** across 16 route modules. Below is a summary:

### Authentication — `/api/auth`

| Method | Endpoint                 | Description                               |
| ------ | ------------------------ | ----------------------------------------- |
| `POST` | `/register`              | Register new account + email verification |
| `POST` | `/login`                 | Login with device protection              |
| `POST` | `/logout`                | Logout + clear cookies                    |
| `GET`  | `/me`                    | Get current user profile                  |
| `PUT`  | `/update-profile`        | Update name, email, phone, password       |
| `PUT`  | `/update-avatar`         | Upload/update avatar image                |
| `GET`  | `/verify-email/:token`   | Verify email address                      |
| `POST` | `/resend-verification`   | Resend verification email                 |
| `POST` | `/forgot-password`       | Request password reset                    |
| `PUT`  | `/reset-password/:token` | Reset password with token                 |
| `POST` | `/refresh`               | Refresh access token                      |

### Courses — `/api/courses`

| Method   | Endpoint                        | Description                                    |
| -------- | ------------------------------- | ---------------------------------------------- |
| `GET`    | `/`                             | List courses (paginated, filterable, sortable) |
| `GET`    | `/:id`                          | Get course details                             |
| `GET`    | `/my-courses`                   | Student's enrolled courses                     |
| `GET`    | `/instructor/courses`           | Instructor's own courses                       |
| `GET`    | `/instructor/courses/:id/stats` | Course statistics                              |
| `POST`   | `/`                             | Create course (instructor/admin)               |
| `PUT`    | `/:id`                          | Update course                                  |
| `DELETE` | `/:id`                          | Delete course (cascading)                      |
| `PATCH`  | `/:id/publish`                  | Toggle publish status                          |

### Videos — `/api/videos`

| Method   | Endpoint            | Description                          |
| -------- | ------------------- | ------------------------------------ |
| `POST`   | `/:courseId`        | Add video to course                  |
| `GET`    | `/course/:courseId` | Get course videos (enrollment check) |
| `GET`    | `/:id`              | Get single video                     |
| `PUT`    | `/:id`              | Update video                         |
| `DELETE` | `/:id`              | Delete video                         |

### Orders — `/api/orders`

| Method | Endpoint                      | Description                          |
| ------ | ----------------------------- | ------------------------------------ |
| `POST` | `/`                           | Create order with payment screenshot |
| `GET`  | `/my-orders`                  | Student's order history              |
| `GET`  | `/pending`                    | Pending orders (admin)               |
| `GET`  | `/all`                        | All orders (admin)                   |
| `PUT`  | `/:id/approve`                | Approve order (admin, atomic)        |
| `PUT`  | `/:id/reject`                 | Reject order (admin)                 |
| `POST` | `/sandbox`                    | Sandbox payment (dev only)           |
| `GET`  | `/check-enrollment/:courseId` | Check enrollment status              |

### Admin — `/api/admin`

| Method   | Endpoint                  | Description                 |
| -------- | ------------------------- | --------------------------- |
| `GET`    | `/dashboard`              | Dashboard analytics & stats |
| `GET`    | `/students`               | List students (paginated)   |
| `PUT`    | `/students/:id/block`     | Block/unblock student       |
| `DELETE` | `/students/:id`           | Delete student (cascade)    |
| `GET`    | `/instructors`            | List instructors            |
| `PUT`    | `/instructors/:id/demote` | Demote instructor           |

### Additional Endpoints

| Module              | Base Path                      | Key Operations                                               |
| ------------------- | ------------------------------ | ------------------------------------------------------------ |
| **Progress**        | `/api/progress`                | Mark complete, watch duration, course progress, last watched |
| **Reviews**         | `/api/reviews`                 | CRUD + `canReview` gate (100% completion)                    |
| **Comments**        | `/api/comments`                | CRUD on video comments (enrollment check)                    |
| **Certificates**    | `/api/certificates`            | Download, public verify                                      |
| **Coupons**         | `/api/coupons`                 | Admin CRUD + student apply                                   |
| **Notifications**   | `/api/notifications`           | List, unread count, mark read, bulk ops                      |
| **Sessions**        | `/api/sessions`                | Active sessions, device history, revoke                      |
| **Wishlist**        | `/api/wishlist`                | Get, add, remove, check                                      |
| **Instructor Apps** | `/api/instructor-applications` | Submit, admin review                                         |
| **Uploads**         | `/api/upload`                  | File upload (Cloudinary)                                     |

> 📄 For detailed API documentation with request/response examples, see [`Back-End/API_DOCS.md`](Back-End/API_DOCS.md)

---

## 📁 Project Structure

```
e-learning-platform/
├── Back-End/
│   ├── server.js                    # Express app entry point
│   ├── config/
│   │   ├── database.js              # MongoDB connection
│   │   ├── cloudinary.js            # Cloudinary configuration
│   │   └── logger.js                # Winston logger setup
│   ├── controllers/                 # Business logic (15 controllers)
│   │   ├── authController.js        # Auth, login, register, tokens
│   │   ├── courseController.js       # Course CRUD & management
│   │   ├── videoController.js        # Video CRUD & provider logic
│   │   ├── orderController.js        # Orders & enrollment
│   │   ├── adminController.js        # Dashboard, student/instructor mgmt
│   │   ├── sandboxController.js      # Dev-only sandbox payments
│   │   ├── certificateController.js  # PDF generation & verification
│   │   ├── couponController.js       # Coupon management
│   │   ├── reviewController.js       # Review system
│   │   ├── commentController.js      # Video comments
│   │   ├── progressController.js     # Progress tracking
│   │   ├── notificationController.js # Notification management
│   │   ├── sessionController.js      # Session & device management
│   │   ├── wishlistController.js     # Wishlist operations
│   │   └── instructorApplicationController.js
│   ├── models/                      # Mongoose schemas (11 models)
│   │   ├── User.js                  # User with roles & enrollment
│   │   ├── Course.js                # Course with categories & ratings
│   │   ├── Video.js                 # Dual provider video model
│   │   ├── Order.js                 # Payment & enrollment orders
│   │   ├── Review.js                # Star ratings & reviews
│   │   ├── Comment.js               # Video comments
│   │   ├── Coupon.js                # Discount coupons
│   │   ├── Notification.js          # User notifications
│   │   ├── ActiveSession.js         # Session tracking (TTL: 7 days)
│   │   ├── DeviceLog.js             # Device fingerprint logs
│   │   └── InstructorApplication.js # Instructor applications
│   ├── middleware/                   # Express middleware
│   │   ├── authMiddleware.js        # JWT verification & role checks
│   │   ├── deviceProtection.js      # 4-layer device protection
│   │   ├── instructorAuth.js        # Instructor course ownership
│   │   ├── optionalAuth.js          # Optional authentication
│   │   ├── rateLimiter.js           # Rate limiting (5 limiters)
│   │   ├── validation.js            # Input validation rules
│   │   ├── errorMiddleware.js       # Global error handler
│   │   └── httpLogger.js            # Morgan HTTP logging
│   ├── routes/                      # Express route definitions (16 modules)
│   ├── utils/                       # Helper utilities
│   ├── scripts/                     # CLI scripts (admin creation, data fixes)
│   ├── tests/                       # Jest + Supertest test suites
│   └── logs/                        # Winston log files
│
├── Front-End/
│   ├── next.config.ts               # Next.js configuration
│   ├── src/
│   │   ├── app/                     # App Router pages (23+ routes)
│   │   │   ├── page.tsx             # Home page
│   │   │   ├── login/               # Authentication pages
│   │   │   ├── register/
│   │   │   ├── courses/             # Course catalog & details
│   │   │   ├── watch/[id]/          # Video player
│   │   │   ├── my-courses/          # Enrolled courses
│   │   │   ├── checkout/            # Payment flow
│   │   │   ├── orders/              # Order history
│   │   │   ├── notifications/       # Notifications page (full-featured)
│   │   │   ├── profile/             # User profile
│   │   │   ├── wishlist/            # Wishlist page
│   │   │   ├── contact/             # Contact page
│   │   │   ├── sitemap.ts           # Dynamic sitemap.xml
│   │   │   ├── dashboard/           # Student dashboard
│   │   │   │   └── instructor/      # Instructor panel
│   │   │   ├── admin/               # Admin dashboard
│   │   │   │   ├── students/        # Student management
│   │   │   │   ├── orders/          # Order management
│   │   │   │   ├── courses/         # Course management
│   │   │   │   ├── coupons/         # Coupon management
│   │   │   │   └── instructor-applications/
│   │   │   └── instructor-application/ # Public instructor signup
│   │   ├── components/              # Reusable components (35+)
│   │   │   ├── course/              # CourseCard, Filters, Progress
│   │   │   ├── video/               # YouTubePlayer, Comments, Watermark
│   │   │   ├── reviews/             # ReviewForm, ReviewsList, StarRating
│   │   │   ├── certificates/        # CertificateCard
│   │   │   ├── notifications/       # NotificationBell (dropdown + badge)
│   │   │   ├── admin/               # AdminSidebar
│   │   │   ├── Footer.tsx           # Global site footer
│   │   │   └── ui/                  # Shared UI primitives
│   │   ├── lib/                     # API client, utilities
│   │   ├── stores/                  # Zustand state stores
│   │   │   ├── authStore.ts         # Auth state & tokens
│   │   │   ├── themeStore.ts        # Dark/light mode
│   │   │   ├── wishlistStore.ts     # Wishlist state
│   │   │   └── progressStore.ts     # Video progress
│   │   ├── hooks/                   # Custom React hooks
│   │   └── types/                   # TypeScript type definitions
│   └── tests/                       # Jest + Testing Library tests
│
└── README.md                        # You are here!
```

---

## 🔑 Role-Based Access Control

| Feature                         | Student | Instructor |  Admin   |
| ------------------------------- | :-----: | :--------: | :------: |
| Browse & search courses         |   ✅    |     ✅     |    ✅    |
| Purchase & enroll in courses    |   ✅    |     —      |    —     |
| Watch enrolled course videos    |   ✅    |  ✅ (own)  |    ✅    |
| Track video progress            |   ✅    |     —      |    —     |
| Earn certificates               |   ✅    |     —      |    —     |
| Leave reviews (100% completion) |   ✅    |     —      |    —     |
| Comment on videos               |   ✅    |     ✅     |    ✅    |
| Wishlist courses                |   ✅    |     ✅     |    ✅    |
| Create & manage courses         |    —    |  ✅ (own)  | ✅ (all) |
| Manage course videos            |    —    |  ✅ (own)  | ✅ (all) |
| Approve/reject orders           |    —    |     —      |    ✅    |
| Manage students & instructors   |    —    |     —      |    ✅    |
| Manage coupons                  |    —    |     —      |    ✅    |
| Review instructor applications  |    —    |     —      |    ✅    |
| View analytics dashboard        |    —    |  ✅ (own)  | ✅ (all) |
| Device protection enforced      |   ✅    |     —      |    —     |

---

## 🎥 Video Hosting & DRM Strategy

### Current Implementation (Demo)

Videos are served via **YouTube embeds** for this demonstration project. This approach is cost-free and allows the platform to be fully functional without paid video infrastructure.

### Production-Ready Architecture

The codebase is **architecturally prepared** for DRM-protected video delivery:

```javascript
// Video model supports dual providers
{
  videoProvider: 'youtube' | 'bunny',  // Extensible to other providers
  youtubeVideoId: String,              // YouTube embed ID
  bunnyVideoId: String,                // Bunny.net stream ID
}
```

For a production deployment, we would integrate with enterprise DRM platforms such as:

- **[Bunny.net Stream](https://bunny.net/stream/)** — Built-in DRM, token authentication, adaptive bitrate
- **[Vdocipher](https://www.vdocipher.com/)** — Hollywood-grade DRM (Widevine + FairPlay)
- **[Mux](https://www.mux.com/)** — Streaming infrastructure with analytics
- **[Cloudflare Stream](https://www.cloudflare.com/products/cloudflare-stream/)** — Edge delivery with access control

The dual-provider architecture ensures switching to a DRM solution requires **minimal code changes** — primarily updating the `videoProvider` field and the corresponding frontend player component.

---

## 💳 Payment Strategy

### Current Implementation (Demo)

The payment system uses a **manual screenshot-based verification** flow:

1. Student uploads a payment screenshot (supports Vodafone Cash, InstaPay, Bank Transfer)
2. Admin reviews and approves/rejects in the dashboard
3. A **sandbox mode** is available for development/testing (auto-approves without payment)

### Production Integration Path

The order architecture is designed to seamlessly integrate with payment gateways:

- **[Stripe](https://stripe.com/)** — International card payments
- **[PayPal](https://www.paypal.com/)** — Global payment processing
- **[Paymob](https://paymob.com/)** — Egyptian market (cards, wallets, installments)
- **[Fawry](https://fawry.com/)** — Egyptian market (cash, wallets, reference codes)

The `Order` model already supports multiple payment methods and status tracking, making gateway integration straightforward.

---

## 🧪 Testing

```bash
# Backend tests
cd Back-End
npm test

# Frontend tests
cd Front-End
npm test
```

The project includes unit and integration tests using:

- **Backend:** Jest 30 + Supertest for API endpoint testing
- **Frontend:** Jest + React Testing Library for component testing

---

## 📧 Email System

The platform sends transactional emails via **Nodemailer** with SMTP (pooled transporter for performance):

- **Email Verification** — tokenized verification links on registration
- **Password Reset** — secure reset links with expiry
- **Order Approved/Rejected** — payment status notifications
- **Certificate Issued** — certificate download link
- **Instructor Application Updates** — approval/rejection notifications

---

## 📝 Logging & Monitoring

- **Winston Logger** — dual transport (file + console) with rotation (5MB, 5 files max)
  - `error.log` — error-level events
  - `combined.log` — all log levels
- **Morgan HTTP Logger** — request/response logging piped to Winston
- **Health Check Endpoint** — `GET /api/health` for uptime monitoring
- **Graceful Shutdown** — SIGTERM/SIGINT handlers for clean database disconnection

---

## ⚙️ Environment Variables

### Backend (`Back-End/.env`)

| Variable                | Required | Description                       |
| ----------------------- | :------: | --------------------------------- |
| `PORT`                  |    ✅    | Server port (default: 5000)       |
| `NODE_ENV`              |    ✅    | `development` or `production`     |
| `MONGODB_URI`           |    ✅    | MongoDB connection string         |
| `JWT_SECRET`            |    ✅    | Access token signing secret       |
| `JWT_REFRESH_SECRET`    |    ✅    | Refresh token signing secret      |
| `JWT_EXPIRE`            |    ✅    | Access token expiry (e.g., `1h`)  |
| `JWT_REFRESH_EXPIRE`    |    ✅    | Refresh token expiry (e.g., `7d`) |
| `CLOUDINARY_CLOUD_NAME` |    ✅    | Cloudinary cloud name             |
| `CLOUDINARY_API_KEY`    |    ✅    | Cloudinary API key                |
| `CLOUDINARY_API_SECRET` |    ✅    | Cloudinary API secret             |
| `EMAIL_HOST`            |    ✅    | SMTP host                         |
| `EMAIL_PORT`            |    ✅    | SMTP port                         |
| `EMAIL_USER`            |    ✅    | SMTP username                     |
| `EMAIL_PASS`            |    ✅    | SMTP password                     |
| `EMAIL_FROM`            |    ✅    | Sender email address              |
| `FRONTEND_URL`          |    ✅    | Frontend URL (CORS + emails)      |
| `ALLOWED_ORIGINS`       |    ✅    | Comma-separated allowed origins   |
| `BUNNY_API_KEY`         |    ❌    | Bunny.net API key                 |
| `BUNNY_LIBRARY_ID`      |    ❌    | Bunny.net library ID              |

### Frontend (`Front-End/.env.local`)

| Variable              | Required | Description     |
| --------------------- | :------: | --------------- |
| `NEXT_PUBLIC_API_URL` |    ✅    | Backend API URL |

---

## � Changelog

### March 2026 — Feature & Polish Update

| Area                      | Change                                                                                                                                                                                                             |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Notifications Page**    | New `/notifications` page: filter tabs (all / unread / read), paginated list (15/page), mark-all-read, delete-all-read, staggered entrance animations, empty states per filter                                     |
| **Header Navigation**     | Added "الإشعارات" link to the desktop user dropdown and the mobile hamburger menu                                                                                                                                  |
| **Dynamic Metadata**      | `generateMetadata` server functions on `/courses/[id]`, `/checkout/[id]`, and `/watch/[id]` — accurate browser tab titles + Open Graph tags                                                                        |
| **Global Footer**         | Site-wide `Footer` component added to the root layout                                                                                                                                                              |
| **Contact Page**          | New `/contact` page with client-side validation                                                                                                                                                                    |
| **Sitemap**               | Auto-generated `sitemap.xml` for SEO crawlers (`sitemap.ts`)                                                                                                                                                       |
| **Rate Limiting**         | Global API limiter raised 100 → 300 req/15 min; key is now per-user (falls back to IP for guests)                                                                                                                  |
| **Progress Store Cache**  | `fetchCourseProgress` skips redundant API calls if data was fetched within the last 5 minutes — eliminates 429 bursts on the watch page                                                                            |
| **CSS Animation Library** | New keyframes & utility classes in `globals.css`: `fadeInUp`, `scaleIn`, `slideInRight`, `popIn`, `float`, `pingOnce`; stagger helpers `.stagger-1`–`.stagger-8`; `page-enter` wrapper; `transition-smooth` preset |
| **CourseCard Hover**      | Deeper lift (`-translate-y-2`), stronger colored shadows, button press/active scale feedback, category badge scales on card hover                                                                                  |

---

## �👥 Team

This project was designed, developed, and brought to life by:

<table>
  <tr>
    <td align="center">
      <strong>Yasa Jaber</strong>
      <br />
      Full-Stack Developer
    </td>
    <td align="center">
      <strong>Mohamed Abelnaser</strong>
      <br />
      Full-Stack Developer
    </td>
  </tr>
</table>

---

## 📄 License

This project is licensed under the **ISC License** — see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  <strong>Built  by Yasa Jaber & Mohamed Abelnaser</strong>
</p>
