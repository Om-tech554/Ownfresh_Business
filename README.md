# Own Fresh - Project Documentation & Engineering Insights

This README provides a comprehensive overview of the **Own Fresh** full-stack e-commerce and blogging platform, with a special emphasis on the **Advanced Dynamic Content Integration**, **Data Migration Strategies**, and **Unified Search Engine** architectures.

---

## 🚀 Tech Stack Overview

### Frontend Ecosystem
- **Framework:** React 19 + Vite
- **Global State Management:** Redux Toolkit (`@reduxjs/toolkit`, `react-redux`)
- **Routing:** React Router DOM (v6)
- **Styling & UI:** Tailwind CSS (v4), Custom CSS
- **Animations:** Framer Motion, AOS (Animate On Scroll)
- **SEO Optimization:** React-Helmet-Async
- **HTTP Client:** Axios

### Backend Ecosystem
- **Runtime:** Node.js (type: module)
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose ORM
- **Authentication:** JSON Web Tokens (JWT) + Bcrypt.js
- **File Storage:** Multer & Cloudinary
- **Content Management System (CMS):** Hybrid (Local MongoDB + WordPress Legacy Integration)

---

## 📦 Data Migration & Catalog Management ("The How")

One of the highlights of this project is the successful migration of 32+ products and 100+ blog articles from a legacy WordPress site to a modern Mongoose/MongoDB stack.

### 1. Automated Product Seeding (`migrateProducts.js`)
To handle the large volume of inventory (32 unique product variations across different sizes/combos), we developed a custom migration script:
- **Batch Insertion:** Utilized `insertMany()` for high-performance database population.
- **Data Integrity:** Mapped WordPress image URLs and descriptions into strict Mongoose models.
- **Consistency:** Ensured all pricing and rating data matched the live production values perfectly.

### 2. WordPress Content Ingestion (`migrateWp.js`)
Instead of manual copy-pasting, we automated the blog migration using the WordPress REST API:
- **Embedded Ingestion:** Used `?_embed` to fetch featured media URLs directly from the WordPress database.
- **HTML Persistence:** Mapped `content.rendered` (raw HTML) to the MongoDB `description` field, preserving rich text formatting, links, and styling.
- **Date Retention:** Explicitly overrode the `createdAt` timestamp to maintain the original publishing history of every article.

---

## 🧠 Core Engineering Features

### 1. Unified Search Engine (Three-Tier Concurrency)
The platform features a global Navbar Search Bar that queries **three separate sources concurrently**:
- **Source A:** Local MongoDB Products database.
- **Source B:** Node.js Backend Blogs.
- **Source C:** Legacy WordPress REST API.
- **Debouncing:** Implemented a 300ms debounce hook to optimize performance and prevent rapid-fire API calls during typing.

### 2. SEO & Open Graph Tags
Utilized `react-helmet-async` to inject dynamic meta tags. Even though it's a SPA (Single Page Application), every blog post has its own unique SEO title and description, ensuring perfect link previews on social media (WhatsApp/Twitter/FB).

---

## 🎓 Ultimate Interview Q&A Guide

Prepare for technical interviews by understanding these deep-dive questions specific to this project:

### 1. "How do you handle fetching data from multiple sources like WordPress and MongoDB simultaneously?"
**Answer:** I utilize asynchronous `Promise.all()` or concurrent `useEffect` calls. In this project, I mapped the different object structures (WP JSON vs. Mongoose Objects) into a **Unified Schema**. This allowed me to treat a blog post from WordPress and a blog post from my backend as identical entities in my UI components.

### 2. "Why did you use `dangerouslySetInnerHTML` and how did you secure it?"
**Answer:** WordPress content is returned as pre-formatted HTML. To render it accurately while maintaining security, I would ideally use a library like `DOMPurify` to sanitize the string. In the current iteration, I ensured that only trusted data from the official WordPress API is used to minimize XSS risks.

### 3. "How did you manage a global sticky Navbar without covering page content?"
**Answer:** I used `sticky top-0` in Tailwind. Unlike `fixed`, which removes elements from the document flow and requires manual padding on the body, `sticky` keeps the element in its relative position until it hits the threshold. This ensures a smooth layout transition without overlapping hero sections.

### 4. "How did you handle 100+ blogs without slowing down the frontend?"
**Answer:** I implemented **Server-Side Pagination**. I only fetch 10 posts at a time using WordPress query parameters (`?per_page=10`). I also extracted total page counts from the `x-wp-totalpages` response header to dynamically build the pagination navigation.

### 5. "What was the biggest challenge in your migration scripts?"
**Answer:** The primary challenge was **Category Normalization**. Since WordPress categories are represented by IDs rather than names in the basic response, I had to implement mapping logic to ensure that "Other" or "Uncategorized" posts were correctly labeled in the new system's UI.

### 6. "How does Redux Toolkit improve your state management here?"
**Answer:** It provides a centralized "Source of Truth." For authentication, I store the `userData` and `isAdmin` status in a global slice. This allows the `Navbar` (login display) and `AdminRoute` (security wrapper) to react instantly to user state changes without prop-drilling.

---

## 🛠️ Local Development & Setup Instructions

### 1. Environment Variables
Create a `.env` file in the `backend/` directory:
```env
MONGODB_URL=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 2. Migration Commands
If you need to re-seed the database:
```bash
node backend/migrateProducts.js
node backend/migrateWp.js
```

### 3. Start the Platform
```bash
# Terminal 1: Backend
cd backend && npm run start

# Terminal 2: Frontend
cd frontend && npm run dev
```

---
*Architected for speed, documented for clarity, and optimized for high-conversion e-commerce.*