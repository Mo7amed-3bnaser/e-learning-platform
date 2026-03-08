<p align="center">
  <img src="https://img.shields.io/badge/Platform-E--Learning-blue?style=for-the-badge&logo=bookstack&logoColor=white" alt="E-Learning Platform" />
  <img src="https://img.shields.io/badge/Status-Demo%20Project-orange?style=for-the-badge" alt="Demo" />
  <img src="https://img.shields.io/badge/License-ISC-green?style=for-the-badge" alt="License" />
</p>

<h1 align="center">🎓 Masar E-Learning Platform</h1>

<p align="center">
  <strong>A full-stack Arabic-first e-learning platform built with Next.js 16, React 19, Node.js, Express, and MongoDB</strong>
</p>

<p align="center">
  <em>80+ REST API endpoints · 37+ React components · 35+ pages · 11 database models · 4-layer device protection · Dark/Light mode · Full RTL Arabic UI</em>
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
  - Registration: `10 requests / hour`
  - Forgot Password: `3 requests / hour`
  - Order Creation: `5 requests / hour` (admin exempt)
  - Global API: `100 requests / 15 min`
- **Security Headers** via Helmet (X-Frame-Options, X-Content-Type-Options, Referrer-Policy, etc.)
- **NoSQL Injection Prevention** with `express-mongo-sanitize`
- **XSS Sanitization** on all user inputs
- **File Upload Validation** — 5MB limit, jpg/png/webp only

### 🛡️ 4-Layer Device Protection System
A sophisticated anti-piracy mechanism applied to student accounts:

| Layer | Protection | Details |
|-------|-----------|---------|
| 1 | **Device Agreement** | Students must accept terms before first login |
| 2 | **Monthly Device Limit** | Maximum 2 unique devices per month |
| 3 | **Cooldown Period** | 4-hour cooldown between device switches |
| 4 | **Active Session Limit** | Only 1 concurrent session allowed; old sessions auto-deactivated |

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
- **Real-Time Badge** — unread count displayed in the notification bell
- **Mark as Read** — individual and bulk operations
- **Auto-Cleanup** — daily cron job at 2:00 AM deletes notifications older than 30 days
- **Paginated Listing** with filtering support

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
  - Block/unblock instructors
  - Demote instructor to student role
- **Order Management:**
  - View pending orders with payment screenshots
  - Approve/reject with one click
  - Filter by status
- **Course Management:**
  - View all courses across instructors
  - Create new courses from admin panel
  - Full CRUD capabilities (edit, delete, manage videos)
- **Coupon Management:**
  - Create, edit, delete coupons
  - Toggle coupon active/inactive
  - Usage analytics
- **Instructor Application Review:**
  - Review pending applications
  - Approve or reject with feedback
  - Delete applications
- **Device & Session Management:**
  - View device logs per user
  - Reset user device limits
  - Manage active sessions

### 👨‍🏫 Instructor Dashboard
- **Instructor Profile** with specialization, bio, and stats
- **Course Management:**
  - Create new courses with thumbnail upload
  - Edit existing courses
  - Toggle publish/unpublish status
  - View course statistics (enrolled students, revenue, ratings)
- **Video Management:**
  - Add/edit/delete videos per course
  - Set video order and free preview flags
  - Support for YouTube and Bunny.net video providers
- **Dashboard Analytics** — overview of own courses, students, and revenue

### 🌙 UI/UX Features
- **Full Arabic RTL Layout** — `dir="rtl"` with `lang="ar"` throughout
- **Dark/Light Mode** — theme toggle with persistence (Zustand store)
- **Dark Mode Flash Prevention** — inline script in layout prevents FOUC
- **Responsive Design** — mobile-first approach with Tailwind CSS v4
- **Animated Brand Splash Screen** — custom `BrandLoader` with particle effects on initial load
- **Animated SVG Hero Section** — `MasarRoadHero` with M-shaped road, milestone animations, and parallax
- **Smooth Animations** — Framer Motion page transitions, scroll reveals, typing effects
- **Toast Notifications** — react-hot-toast for user feedback (success, error, info, warning, loading)
- **Skeleton Loading** — shimmer placeholders for all data-fetching states (7+ skeleton variants)
- **Breadcrumb Navigation** — contextual path display with dark/light/auto variants
- **Empty States** — 7 illustrated empty state variants (no courses, no orders, no comments, no students, no videos, no enrolled, search no results)
- **Loading Variants** — 10 loading states (spinner, dots, bar, full-page, inline, button, card overlay, pulse, progress bar, skeleton pulse)
- **Scroll to Top** — smooth scroll-to-top floating button
- **Recently Viewed Courses** — client-side tracking hook (max 10 courses)
- **Video Timestamp Bookmarks** — resume video playback from exact timestamp via `useVideoBookmark` hook
- **Custom 404 Page** — branded not-found page
- **Responsive Tables** — desktop table + mobile card layout pattern for admin pages
- **Animated Counters** — `AnimatedCounter` with easeOutExpo easing

### ♿ Accessibility
- **Arabic ARIA Labels** — comprehensive ARIA label system for all interactive elements in Arabic
- **Screen Reader Support** — `ScreenReaderOnly` component and live announcer utility
- **Focus Trap** — keyboard focus management for modals and overlays
- **Keyboard Navigation** — full keyboard support with arrow keys, Enter, Escape handlers
- **Skip to Main Content** — `SkipToMainContent` component for accessibility compliance

### 🛡️ Error Monitoring & Resilience
- **Error Monitoring System** — centralized error capture with optional Sentry integration
- **In-Memory Error Buffer** — last 50 errors stored for debugging (custom `/api/errors` endpoint ready)
- **Global Error Handlers** — unhandled rejection and error event listeners
- **React Error Boundary** — graceful error UI with error reporting integration
- **Axios Retry Logic** — automatic retry with exponential backoff (500ms, 1s) on network/500 errors, max 2 retries
- **Backend Cold-Start Wake-Up** — `AuthInitializer` pings the backend on app init for free-tier hosting cold starts
- **Certificate Auto-Retry** — auto-generate certificates on frontend if not found, with 3 retries and 3s delay

### 🔀 Next.js Edge Middleware
- **Route Protection** — JWT payload decoding in Edge middleware for role-based routing
- **Admin Route Guard** — redirects non-admin users away from `/admin` routes
- **Instructor Route Guard** — restricts `/dashboard/instructor` to instructor/admin roles
- **Auth Route Redirect** — logged-in users redirected from `/login`, `/register` to role-specific dashboards
- **Session Revoke Detection** — automatic redirect to `/login?reason=session_revoked` on session invalidation

### 📄 Static Pages
- **About Page** (`/about`) — platform mission, vision, values, stats, and contact info
- **Privacy Policy** (`/privacy`) — comprehensive privacy policy page
- **Terms of Service** (`/terms`) — detailed terms and conditions page
- **Public Instructor Profiles** (`/instructors/[id]`) — view instructor info and courses

---

## 🛠️ Tech Stack

### Backend
| Technology | Purpose |
|-----------|---------|
| **Node.js** | Runtime environment |
| **Express.js 4.18** | HTTP framework (ES Modules) |
| **MongoDB + Mongoose 8** | Database + ODM |
| **JSON Web Tokens** | Authentication (access + refresh) |
| **bcryptjs** | Password hashing |
| **Cloudinary + Multer** | File upload pipeline (images, certificates) |
| **Brevo (Sendinblue) HTTP API** | Transactional email delivery (no SMTP) |
| **pdf-lib + @pdf-lib/fontkit** | Certificate PDF generation |
| **express-validator** | Input validation |
| **express-rate-limit** | Rate limiting |
| **Helmet** | Security headers |
| **express-mongo-sanitize** | NoSQL injection prevention |
| **xss** | Cross-site scripting protection |
| **ua-parser-js** | Device/browser fingerprinting |
| **node-cron** | Scheduled cleanup tasks |
| **Winston + Morgan** | Logging (file rotation + HTTP) |
| **Jest 30 + Supertest** | Testing |

### Frontend
| Technology | Purpose |
|-----------|---------|
| **Next.js 16** | React framework (App Router) |
| **React 19** | UI library |
| **TypeScript 5** | Type safety |
| **Tailwind CSS v4** | Utility-first styling |
| **Zustand 5** | Global state management |
| **SWR 2.4** | Data fetching with caching |
| **Axios** | HTTP client with interceptors |
| **Framer Motion 12** | Animations & transitions |
| **react-hot-toast** | Toast notifications |
| **react-icons** | Icon library |
| **clsx + tailwind-merge** | Class utility functions |
| **Jest + Testing Library** | Component testing |

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

# Email (Brevo HTTP API)
BREVO_API_KEY=your_brevo_api_key
EMAIL_FROM_ADDRESS=your_email@domain.com
EMAIL_FROM_NAME=Masar | مسار

# Frontend URL (for CORS & email links)
CLIENT_URL=http://localhost:3000

# Bunny.net (optional — for DRM video hosting)
BUNNY_API_KEY=your_bunny_api_key
BUNNY_LIBRARY_ID=your_library_id
```

> 💡 **Note:** Environment variables are validated at startup via `validateEnv.js`. Missing required vars will cause the server to exit with a descriptive error message.

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
| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:5000/api |
| Health Check | http://localhost:5000/api/health |

---

## 📡 API Reference

The platform exposes **80+ RESTful endpoints** across 16 route modules with full input validation, rate limiting, and role-based access control. Below is a summary:

### Authentication — `/api/auth`
| Method | Endpoint | Description |
|--------|---------|-------------|
| `POST` | `/register` | Register new account + email verification |
| `POST` | `/login` | Login with device protection |
| `POST` | `/logout` | Logout + clear cookies |
| `GET` | `/me` | Get current user profile |
| `PUT` | `/update-profile` | Update name, email, phone, password |
| `PUT` | `/update-avatar` | Upload/update avatar image |
| `GET` | `/verify-email/:token` | Verify email address |
| `POST` | `/resend-verification` | Resend verification email |
| `POST` | `/forgot-password` | Request password reset |
| `PUT` | `/reset-password/:token` | Reset password with token |
| `POST` | `/refresh` | Refresh access token |

### Courses — `/api/courses`
| Method | Endpoint | Description |
|--------|---------|-------------|
| `GET` | `/` | List courses (paginated, filterable, sortable) |
| `GET` | `/:id` | Get course details |
| `GET` | `/my-courses` | Student's enrolled courses |
| `GET` | `/instructor/courses` | Instructor's own courses |
| `GET` | `/instructor/courses/:id/stats` | Course statistics |
| `POST` | `/` | Create course (instructor/admin) |
| `PUT` | `/:id` | Update course |
| `DELETE` | `/:id` | Delete course (cascading) |
| `PATCH` | `/:id/publish` | Toggle publish status |

### Videos — `/api/videos`
| Method | Endpoint | Description |
|--------|---------|-------------|
| `POST` | `/:courseId` | Add video to course |
| `GET` | `/course/:courseId` | Get course videos (enrollment check) |
| `GET` | `/:id` | Get single video |
| `PUT` | `/:id` | Update video |
| `DELETE` | `/:id` | Delete video |

### Orders — `/api/orders`
| Method | Endpoint | Description |
|--------|---------|-------------|
| `POST` | `/` | Create order with payment screenshot |
| `GET` | `/my-orders` | Student's order history |
| `GET` | `/pending` | Pending orders (admin) |
| `GET` | `/all` | All orders (admin) |
| `PUT` | `/:id/approve` | Approve order (admin, atomic) |
| `PUT` | `/:id/reject` | Reject order (admin) |
| `POST` | `/sandbox` | Sandbox payment (dev only) |
| `GET` | `/check-enrollment/:courseId` | Check enrollment status |

### Admin — `/api/admin`
| Method | Endpoint | Description |
|--------|---------|-------------|
| `GET` | `/dashboard` | Dashboard analytics & stats |
| `GET` | `/students` | List students (paginated + searchable) |
| `PUT` | `/students/:id/block` | Block/unblock student |
| `DELETE` | `/students/:id` | Delete student (cascade) |
| `GET` | `/instructors` | List instructors |
| `PUT` | `/instructors/:id/block` | Block/unblock instructor |
| `PUT` | `/instructors/:id/demote` | Demote instructor to student |
| `GET` | `/users/:id/devices` | View user device logs |
| `PUT` | `/users/:id/devices/reset` | Reset user device limits |

### Additional Endpoints
| Module | Base Path | Key Operations |
|--------|----------|----------------|
| **Progress** | `/api/progress` | Mark complete, watch duration, course progress, last watched |
| **Reviews** | `/api/reviews` | CRUD + `canReview` gate (100% completion) |
| **Comments** | `/api/comments` | CRUD on video comments (enrollment check) |
| **Certificates** | `/api/certificates` | Download, generate, public verify |
| **Coupons** | `/api/coupons` | Admin CRUD + toggle + student apply |
| **Notifications** | `/api/notifications` | List, unread count, mark read, mark all read, delete, bulk ops |
| **Sessions** | `/api/sessions` | Active sessions, device history, device limits, revoke, revoke all |
| **Wishlist** | `/api/wishlist` | Get, add, remove, check |
| **Instructor Apps** | `/api/instructor-applications` | Submit, admin review, delete |
| **Uploads** | `/api/upload` | File upload (Cloudinary) |
| **Users** | `/api/users` | Public user profiles (instructor profiles) |

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
│   │   ├── authController.js        # Auth, login, register, tokens, profile
│   │   ├── courseController.js       # Course CRUD & management
│   │   ├── videoController.js        # Video CRUD & provider logic
│   │   ├── orderController.js        # Orders & enrollment
│   │   ├── adminController.js        # Dashboard, student/instructor mgmt, device management
│   │   ├── sandboxController.js      # Dev-only sandbox payments
│   │   ├── certificateController.js  # PDF generation & verification
│   │   ├── couponController.js       # Coupon management & toggle
│   │   ├── reviewController.js       # Review system
│   │   ├── commentController.js      # Video comments
│   │   ├── progressController.js     # Progress tracking & watch duration
│   │   ├── notificationController.js # Notification management & bulk ops
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
│   ├── utils/                       # Helper utilities (7 modules)
│   │   ├── authHelpers.js           # JWT generation, token hashing, cookie options
│   │   ├── certificateGenerator.js  # PDF certificate generation with custom fonts
│   │   ├── constants.js             # Frozen enums (roles, status, error messages)
│   │   ├── enrollmentHelper.js      # Enrollment check & migration helpers
│   │   ├── pagination.js            # Pagination utilities & response formatter
│   │   ├── sendEmail.js             # Brevo HTTP API + 5 branded HTML email templates
│   │   └── validateEnv.js           # Startup environment variable validation
│   ├── scripts/                     # CLI scripts (21 utility scripts)
│   │   ├── createAdmin.js           # Create admin account
│   │   ├── importYouTubePlaylist.js  # Import YouTube playlist as course videos
│   │   ├── clearSessions.js         # Clear active sessions
│   │   ├── migrateProgressSchema.js # Migrate to new progress schema format
│   │   └── ...                      # Data fixes, instructor tools, verification scripts
│   ├── tests/                       # Jest + Supertest test suites
│   │   ├── unit/                    # Unit tests (controllers, middleware, utils)
│   │   ├── integration/             # Integration tests (auth, courses, orders, admin)
│   │   ├── helpers.js               # Test helper utilities
│   │   └── setup.js                 # Test setup configuration
│   └── logs/                        # Winston log files (auto-rotated)
│
├── Front-End/
│   ├── next.config.ts               # Next.js configuration
│   ├── src/
│   │   ├── app/                     # App Router pages (35+ routes)
│   │   │   ├── page.tsx             # Home page (animated hero, stats, features, CTA)
│   │   │   ├── layout.tsx           # Root layout (RTL, theme, auth init)
│   │   │   ├── not-found.tsx        # Custom branded 404 page
│   │   │   ├── login/               # Authentication pages
│   │   │   ├── register/
│   │   │   ├── forgot-password/     # Password recovery
│   │   │   ├── reset-password/      # Password reset with token
│   │   │   ├── verify-email/        # Email verification
│   │   │   ├── courses/             # Course catalog & details
│   │   │   ├── watch/[id]/          # Video player
│   │   │   ├── my-courses/          # Enrolled courses
│   │   │   ├── checkout/            # Payment flow
│   │   │   ├── orders/              # Order history
│   │   │   ├── profile/             # User profile
│   │   │   ├── wishlist/            # Wishlist page
│   │   │   ├── dashboard/           # Student dashboard
│   │   │   │   └── instructor/      # Instructor panel
│   │   │   ├── admin/               # Admin dashboard
│   │   │   │   ├── students/        # Student management
│   │   │   │   ├── instructors/     # Instructor management
│   │   │   │   ├── orders/          # Order management
│   │   │   │   ├── courses/         # Course management (+ new, edit, videos)
│   │   │   │   ├── coupons/         # Coupon management
│   │   │   │   └── instructor-applications/
│   │   │   ├── instructor-application/ # Public instructor signup
│   │   │   ├── instructors/[id]/    # Public instructor profile
│   │   │   ├── about/               # About the platform
│   │   │   ├── privacy/             # Privacy policy
│   │   │   └── terms/               # Terms of service
│   │   ├── components/              # Reusable components (37+)
│   │   │   ├── Header.tsx           # Main navigation + auth + theme toggle
│   │   │   ├── HomeClient.tsx       # Home page client component (781 lines)
│   │   │   ├── MasarRoadHero.tsx    # Animated M-road SVG hero section
│   │   │   ├── BrandLoader.tsx      # Animated splash screen with particles
│   │   │   ├── AuthInitializer.tsx  # Auth hydration + backend wake-up
│   │   │   ├── ProtectedRoute.tsx   # Client-side auth guard
│   │   │   ├── ErrorBoundary.tsx    # React error boundary + error reporting
│   │   │   ├── CourseCard.tsx        # Course display card
│   │   │   ├── CourseFilters.tsx     # Course filtering UI
│   │   │   ├── YouTubePlayer.tsx     # YouTube embed + custom fullscreen + watermark
│   │   │   ├── VideoComments.tsx     # Video comments CRUD (354 lines)
│   │   │   ├── VideoWatermark.tsx    # Anti-piracy watermark overlay
│   │   │   ├── CertificateCard.tsx   # Certificate display/download/print (282 lines)
│   │   │   ├── NotificationBell.tsx  # Notification dropdown + unread badge (318 lines)
│   │   │   ├── ResponsiveTable.tsx   # Desktop table + mobile card layout
│   │   │   ├── ScrollReveal.tsx      # Scroll-triggered animations (7 presets + stagger)
│   │   │   ├── Loading.tsx           # 10 loading variants
│   │   │   ├── Skeleton.tsx          # 7 skeleton variants
│   │   │   ├── EmptyState.tsx        # 7 empty state variants
│   │   │   ├── admin/AdminSidebar.tsx # Admin dashboard sidebar
│   │   │   └── ui/                   # Shared UI primitives + barrel exports
│   │   ├── lib/                     # API client & utilities
│   │   │   ├── api.ts               # Axios instance + 13 API modules (478 lines)
│   │   │   ├── instructorApi.ts     # Instructor application + course CRUD API
│   │   │   ├── notificationsApi.ts  # Notifications API + TypeScript interfaces
│   │   │   ├── toast.ts             # Toast helpers (success, error, info, warning)
│   │   │   ├── errorMonitoring.ts   # Sentry integration + in-memory error buffer (210 lines)
│   │   │   └── accessibility.tsx    # ARIA labels, focus trap, keyboard nav, screen reader (190 lines)
│   │   ├── store/                   # Zustand state stores
│   │   │   ├── authStore.ts         # Auth state, tokens, cookie mirroring
│   │   │   ├── themeStore.ts        # Dark/light mode with localStorage
│   │   │   ├── wishlistStore.ts     # Wishlist state + API integration
│   │   │   └── progressStore.ts     # Video progress + watch duration debouncing (243 lines)
│   │   ├── hooks/                   # Custom React hooks
│   │   │   ├── useRecentlyViewed.ts # Recently viewed courses (max 10)
│   │   │   ├── useSWRApi.ts         # 7 SWR data-fetching hooks with caching
│   │   │   └── useVideoBookmark.ts  # Video timestamp bookmarking
│   │   ├── utils/                   # Client utilities
│   │   │   └── deviceFingerprint.ts # SHA-256 device fingerprint generator
│   │   └── types/                   # TypeScript type definitions
│   ├── proxy.ts                     # Next.js Edge middleware (JWT-based route protection)
│   └── tests/                       # Jest + Testing Library tests
│       ├── components/              # Component tests (5+ test files)
│       ├── store/                   # Store tests
│       └── setup.ts                 # Test setup configuration
│
└── README.md                        # You are here!
```

---

## 🔑 Role-Based Access Control

| Feature | Student | Instructor | Admin |
|---------|:-------:|:----------:|:-----:|
| Browse & search courses | ✅ | ✅ | ✅ |
| View instructor profiles | ✅ | ✅ | ✅ |
| Purchase & enroll in courses | ✅ | — | — |
| Watch enrolled course videos | ✅ | ✅ (own) | ✅ |
| Track video progress | ✅ | — | — |
| Resume video from bookmark | ✅ | — | — |
| Earn certificates | ✅ | — | — |
| Leave reviews (100% completion) | ✅ | — | — |
| Comment on videos | ✅ | ✅ | ✅ |
| Wishlist courses | ✅ | ✅ | ✅ |
| Create & manage own courses | — | ✅ | ✅ (all) |
| Manage course videos | — | ✅ (own) | ✅ (all) |
| Approve/reject orders | — | — | ✅ |
| Block/unblock students | — | — | ✅ |
| Block/unblock instructors | — | — | ✅ |
| Demote instructors | — | — | ✅ |
| Manage coupons | — | — | ✅ |
| Review instructor applications | — | — | ✅ |
| Reset user device limits | — | — | ✅ |
| View analytics dashboard | — | ✅ (own) | ✅ (all) |
| Device protection enforced | ✅ | — | — |

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

The project includes comprehensive unit and integration tests:

```bash
# Backend tests
cd Back-End
npm test                # Run all tests
npm run test:unit       # Unit tests only
npm run test:integration # Integration tests only
npm run test:coverage   # Tests with coverage report

# Frontend tests
cd Front-End
npm test                # Run all component tests
npm run test:coverage   # Tests with coverage report
```

### Backend Test Coverage
| Category | Tests |
|----------|-------|
| **Unit — Controllers** | Auth, Course, Order, Admin, Video |
| **Unit — Middleware** | Auth middleware, Validation rules |
| **Unit — Utils** | Auth helpers, Pagination |
| **Integration** | Auth flow, Courses API, Orders API, Admin API |

### Frontend Test Coverage
| Category | Tests |
|----------|-------|
| **Components** | CourseProgressBar, EmptyState, Loading, LoadingButton, StarRating |
| **Stores** | Auth store state management |

Testing stack:
- **Backend:** Jest 30 + Supertest + ES Modules (`--experimental-vm-modules`)
- **Frontend:** Jest 30 + React Testing Library + ts-jest

---

## 📧 Email System

The platform sends transactional emails via **Brevo (Sendinblue) HTTP API** — no domain verification or SMTP configuration needed, works reliably on all cloud platforms including Render:

### 5 Branded HTML Email Templates
All emails feature the **Masar** brand identity with hosted logo support (dark/light variants):

| Template | Trigger | Content |
|----------|---------|--------|
| **Email Verification** | User registration | Tokenized verification link with expiry |
| **Password Reset** | Forgot password request | Secure reset link with expiry |
| **Order Approved** | Admin approves payment | Enrollment confirmation + course link |
| **Order Rejected** | Admin rejects payment | Rejection reason + support info |
| **Certificate Issued** | 100% course completion | Certificate download link + congratulations |

- **Fire-and-forget delivery** — emails sent in background to prevent timeout on cloud platforms
- **Instructor Application** notifications sent at each review stage

---

## 📝 Logging & Monitoring

- **Winston Logger** — dual transport (file + console) with rotation (5MB, 5 files max)
  - `error.log` — error-level events
  - `combined.log` — all log levels
- **Morgan HTTP Logger** — request/response logging with custom tokens (user-id, user-role) piped to Winston
- **Health Check Endpoint** — `GET /api/health` with database connection status, uptime, and environment info
- **Environment Validation** — 12 required env vars validated at startup with descriptive error messages
- **Graceful Shutdown** — SIGTERM/SIGINT handlers for clean HTTP server and database disconnection
- **Cron Jobs:**
  - Daily at 2:00 AM — auto-delete read notifications older than 30 days
- **Frontend Error Monitoring:**
  - Optional Sentry integration (set `NEXT_PUBLIC_SENTRY_DSN`)
  - In-memory error buffer (last 50 errors)
  - Global unhandled error/rejection listeners
  - React Error Boundary with error reporting

---

## ⚙️ Environment Variables

### Backend (`Back-End/.env`)
| Variable | Required | Description |
|----------|:--------:|-------------|
| `PORT` | ✅ | Server port (default: 5000) |
| `NODE_ENV` | ✅ | `development` or `production` |
| `MONGODB_URI` | ✅ | MongoDB connection string |
| `JWT_SECRET` | ✅ | Access token signing secret (min 32 chars recommended) |
| `JWT_REFRESH_SECRET` | ✅ | Refresh token signing secret |
| `JWT_EXPIRE` | ✅ | Access token expiry (e.g., `1h`) |
| `JWT_REFRESH_EXPIRE` | ✅ | Refresh token expiry (e.g., `7d`) |
| `CLOUDINARY_CLOUD_NAME` | ✅ | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | ✅ | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | ✅ | Cloudinary API secret |
| `BREVO_API_KEY` | ✅ | Brevo (Sendinblue) API key for email delivery |
| `EMAIL_FROM_ADDRESS` | ✅ | Sender email address |
| `EMAIL_FROM_NAME` | ❌ | Sender display name (default: `Masar \| مسار`) |
| `EMAIL_LOGO_DARK` | ❌ | Email logo URL (dark variant) |
| `EMAIL_LOGO_LIGHT` | ❌ | Email logo URL (light variant) |
| `CLIENT_URL` | ✅ | Frontend URL (for CORS & email links) |
| `CLIENT_URL_PROD` | ❌ | Production frontend URL |
| `BUNNY_API_KEY` | ❌ | Bunny.net API key (for DRM video hosting) |
| `BUNNY_LIBRARY_ID` | ❌ | Bunny.net library ID |

### Frontend (`Front-End/.env.local`)
| Variable | Required | Description |
|----------|:--------:|-------------|
| `NEXT_PUBLIC_API_URL` | ✅ | Backend API URL |

---

## 👥 Team

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

## 🚀 Project Highlights

<table>
<tr>
<td>

**Backend**
- 80+ REST API endpoints
- 16 route modules
- 15 controllers
- 11 Mongoose models
- 8 middleware layers
- 7 utility modules
- 21 CLI scripts
- 15+ test files (unit + integration)

</td>
<td>

**Frontend**
- 35+ pages/routes
- 37+ React components
- 4 Zustand stores
- 3 custom hooks
- 13 API service modules
- 7 SWR data-fetching hooks
- Edge middleware route protection
- Full TypeScript coverage

</td>
<td>

**Security**
- JWT with HttpOnly cookies
- 4-layer device protection
- 5 rate limiters
- NoSQL injection prevention
- XSS sanitization
- Helmet security headers
- Account lockout system
- Refresh token rotation

</td>
</tr>
</table>

---

<p align="center">
  <strong>Built with ❤️ by Yasa Jaber & Mohamed Abelnaser</strong>
</p>
