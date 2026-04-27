# 🏠 **AllRentr – Peer-to-Peer Rental Marketplace for India**

> **AllRentr** is a modern **P2P rental platform** designed for the Indian market — connecting people who have items to rent with those who need them.
> From gadgets to furniture, vehicles to tools — AllRentr enables users to **earn from their unused items** and **discover affordable rentals nearby**.

Built using **React**, **TypeScript**, and **Supabase**, AllRentr delivers a **fast**, **secure**, and **real-time experience** across web and mobile devices.

---

## 🚀 **Key Features**


| Category                        | Description                                                                                 |
| ------------------------------- | ------------------------------------------------------------------------------------------- |
| 🧳**Listings & Rentals**        | Create, manage, and browse rental listings with photos, prices, and availability schedules. |
| 💬**Real-time Chat**            | WebSocket-powered instant messaging between renters and owners for seamless communication.  |
| 👤**User Profiles**             | Personalized dashboards with profile info, reviews, and rental activity tracking.           |
| 📰**Community Blog**            | Stay updated with announcements, user stories, and platform tips.                           |
| 🏆**Leaderboard**               | Discover the top-performing users based on engagement and rental activity.                  |
| 🔔**Notifications**             | Real-time notifications for messages, bookings, and payment updates.                        |
| 🎟️**Coupons & Rewards**       | Smart discount and promotional offer system for loyal users.                                |
| 💼**Packages & Subscriptions**  | Unlock exclusive features through flexible membership plans.                                |
| 🤝**Influencer Collaborations** | Partner program for creators to promote their listings and grow with the platform.          |
| 📍**Location-based Search**     | Geo-aware discovery system to find rentals closest to you using geohashing.                 |
| 💳**Secure Payments**           | Fully integrated with **Razorpay** for safe and smooth transactions.                       |
| 🔐**Social Authentication**     | Sign up and log in easily using Google and other OAuth providers.                           |

---

## 🛡️ **Admin Dashboard**

AllRentr includes a comprehensive admin panel at `/admin` for platform management:

| Feature                     | Description                                                                          |
| --------------------------- | ------------------------------------------------------------------------------------ |
| 📊 **Dashboard Stats**      | Real-time counts for pending/approved/rejected listings, total users, and revenue.   |
| 👥 **User Management**      | View all users, manage roles, search by email, bulk actions, CSV export.             |
| 📦 **Listing Management**   | View all listings with owner info (name + email), filter/sort/search, approve/reject/deactivate/delete, bulk actions. |
| 📰 **Blog Management**      | Create, edit, and manage blog posts with a rich text editor.                         |
| 🎟️ **Coupon Management**   | Create and manage discount coupons.                                                  |
| 🚀 **Boost Packages**       | Manage listing boost packages for premium visibility.                                |
| 🏆 **Leaderboard Mgmt**     | Configure and manage the user leaderboard.                                           |
| 🤝 **Influencer Partners**  | Manage influencer/partner collaborations.                                            |
| 🔔 **Notifications**        | Send and manage platform-wide notifications.                                         |
| ⚙️ **Feature Toggles**      | Enable/disable platform sections (AI Listing, Blog, Leaderboard, etc.) on the fly.  |
| 📡 **Keep-Alive Monitor**   | Server-side auto-ping (every 4 min) keeps the Render instance alive; logs visible in dashboard. |

---

## 🧱 **Tech Stack Overview**

### 🎨 **Frontend**


| Technology                | Purpose                                           |
| ------------------------- | ------------------------------------------------- |
| **React 18**              | UI framework using hooks and concurrent features  |
| **TypeScript**            | Type-safe development for better scalability      |
| **Vite**                  | Fast development build tool                       |
| **Tailwind CSS**          | Utility-first CSS for custom design systems       |
| **shadcn/ui**             | Reusable, accessible UI components                |
| **React Router**          | Client-side routing for navigation                |
| **Framer Motion**         | Smooth animations and transitions                 |
| **React Query**           | Smart data fetching and caching                   |
| **React Hook Form + Zod** | Optimized forms with validation and schema safety |

---

### ⚙️ **Backend & Database**


| Technology                   | Purpose                                  |
| ---------------------------- | ---------------------------------------- |
| **Supabase (PostgreSQL)**    | Database with real-time subscriptions    |
| **RLS (Row Level Security)** | Fine-grained access control and policies |
| **Supabase Auth**            | Authentication and authorization layer   |
| **Supabase Storage**         | File uploads and CDN for media assets    |
| **Supabase RPCs**            | Server-side functions for admin operations (e.g., `admin_get_all_users`) |

---

### ⚡ **Real-time & Caching**


| Service                      | Role                                                             |
| ---------------------------- | ---------------------------------------------------------------- |
| **Node.js WebSocket Server** | Live chat, typing indicators, online status, and instant updates |
| **Upstash Redis**            | Manages caching, sessions, and message queues                    |

---

### 📡 **Keep-Alive System**

The chat server includes a built-in **keep-alive mechanism** to prevent Render's free-tier instances from sleeping:

- The server pings its own URL every **4 minutes** via `setInterval`
- Ping results (status, response time, errors) are logged to the `keep_alive_logs` Supabase table
- The admin dashboard displays a **Keep-Alive Monitor** with live status and ping history
- **Runs 24/7** server-side — no browser or admin login required

---

### 🧰 **Development Tools**


| Tool                       | Description                                    |
| -------------------------- | ---------------------------------------------- |
| **ESLint**                 | Code linting and formatting                    |
| **PostCSS + Autoprefixer** | Modern CSS compilation                         |
| **TypeScript ESLint**      | Type-aware linting for consistent code quality |

---

## 🧩 **Prerequisites**

Before starting, make sure you have:

* **Node.js v18+**
* **npm or yarn**
* **Git**

---

## ⚙️ **Getting Started**

### 💻 Frontend Setup

1. **Clone the repository**

   ```bash
   git clone <YOUR_GIT_URL>
   cd AllrentR
   ```
2. **Install dependencies**

   ```bash
   npm install
   ```
3. **Setup environment variables**
   Create a `.env` file in the project root:

   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_WS_URL=ws://localhost:8080
   VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
   ```
4. **Run the development server**

   ```bash
   npm run dev
   ```

   App runs at → [http://localhost:5173](http://localhost:5173/)

---

### 🔌 Chat Server Setup

1. **Navigate to the server directory**

   ```bash
   cd server
   ```
2. **Install server dependencies**

   ```bash
   npm install
   ```
3. **Add environment variables**
   Create `.env` in `server/`:

   ```env
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   WS_PORT=8080
   KEEP_ALIVE_URL=https://your-render-url.onrender.com   # Optional: defaults to allrentr-1egs.onrender.com
   ```
4. **Run the chat server**

   ```bash
   npm start
   ```

   or in dev mode:

   ```bash
   npm run dev
   ```

---

### 🗄️ Supabase Tables (Optional)

For the keep-alive monitor to log results, create this table in your **Supabase SQL Editor**:

```sql
CREATE TABLE IF NOT EXISTS keep_alive_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  url text NOT NULL,
  status_code int,
  response_time_ms int,
  success boolean DEFAULT false,
  error_message text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE keep_alive_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for keep_alive_logs"
  ON keep_alive_logs FOR ALL
  USING (true) WITH CHECK (true);
```

---

## 🧾 **Available Scripts**

### 🖥️ Frontend


| Command             | Description              |
| ------------------- | ------------------------ |
| `npm run dev`       | Start development server |
| `npm run build`     | Build for production     |
| `npm run build:dev` | Build for development    |
| `npm run preview`   | Preview production build |
| `npm run lint`      | Run ESLint checks        |

### ⚙️ Server


| Command       | Description                       |
| ------------- | --------------------------------- |
| `npm start`   | Start production WebSocket server |
| `npm run dev` | Start dev server with nodemon     |

---

## 📁 **Project Structure**

```
AllrentR/
├── public/                     # Static assets
├── server/
│   ├── chat-server.js          # WebSocket server + keep-alive ping
│   └── package.json
├── src/
│   ├── components/             # Reusable UI components (Navbar, ChatWindow, etc.)
│   ├── contexts/               # React contexts (AuthContext)
│   ├── hooks/                  # Custom hooks
│   │   ├── useChat.ts          # WebSocket chat with exponential backoff reconnect
│   │   ├── useKeepAlive.ts     # Keep-alive monitor (reads server ping logs)
│   │   ├── useAdminStats.ts    # Admin dashboard statistics
│   │   ├── useListings.ts      # Listing CRUD operations
│   │   └── ...
│   ├── integrations/
│   │   └── supabase/           # Supabase client & generated types
│   ├── pages/
│   │   ├── AdminDashboard.tsx  # Admin panel with stats, feature toggles, keep-alive monitor
│   │   ├── UserManagement.tsx  # Admin user management
│   │   ├── ListingManagement.tsx # Admin listing management (all listings + controls)
│   │   ├── Landing.tsx         # Homepage
│   │   ├── Listings.tsx        # Browse listings
│   │   ├── ListingDetail.tsx   # Individual listing page
│   │   ├── Inbox.tsx           # Chat inbox
│   │   ├── Profile.tsx         # User profile
│   │   └── ...
│   ├── App.tsx                 # Root component with routing
│   └── main.tsx                # Entry point
├── .env                        # Environment variables
├── vite.config.ts
├── tailwind.config.ts
├── vercel.json                 # Vercel deployment config
└── package.json
```

---

## ☁️ **Deployment**

### 🌍 Frontend (Vercel)

1. Connect your GitHub repo to **Vercel**
2. Set the following **Environment Variables** in Vercel:
   ```env
   VITE_SUPABASE_URL
   VITE_SUPABASE_ANON_KEY
   VITE_WS_URL
   VITE_RAZORPAY_KEY_ID
   ```
3. Deploy — automatic builds trigger on every `main` branch push.

---

### 🧠 Chat Server (Render)

The WebSocket chat server is deployed on **Render**:

1. Connect the `server/` directory to a **Render Web Service**
2. Set environment variables:
   ```env
   SUPABASE_URL
   SUPABASE_SERVICE_ROLE_KEY
   KEEP_ALIVE_URL    # Your Render service URL
   ```
3. The server automatically starts pinging itself every 4 minutes to stay alive on Render's free tier.

> **Note:** Free Render instances spin down after inactivity. The built-in keep-alive ping prevents this by hitting the server's health endpoint every 4 minutes.

---

## 🧩 **Configuration Guide**

### 🔧 Supabase Setup

1. Create a new Supabase project
2. Run migration scripts from `/supabase/migrations`
3. Enable Google or OAuth providers under **Auth → Providers**
4. Create storage buckets for images and thumbnails
5. Define Row Level Security (RLS) policies for user isolation
6. *(Optional)* Create the `keep_alive_logs` table for the keep-alive monitor

---

### 🌿 **Environment Variables Overview**

#### Frontend `.env`

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_WS_URL=wss://your-chat-server.com
VITE_RAZORPAY_KEY_ID=rzp_test_...
```

#### Server `.env`

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
WS_PORT=8080
KEEP_ALIVE_URL=https://your-render-url.onrender.com
```

---

## 🤝 **Contributing**

1. Fork the repository
2. Create a new branch
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. Commit your changes
   ```bash
   git commit -m "Add amazing feature"
   ```
4. Push and open a Pull Request
   ```bash
   git push origin feature/amazing-feature
   ```

---

## 📜 **License**

This project is **private and proprietary** — © AllRentr.

---

## 💬 **Support**

Need help? Reach us at: 📧 **[allrentr15@gmail.com](mailto:allrentr15@gmail.com)** or join our **Discord community** *(link coming soon)*

---

## 🔗 **Useful Links**


| Resource                | Link                                          |
| ----------------------- | --------------------------------------------- |
| 🌐**Website**           | [https://allrentr.com](https://allrentr.com/) |
| 📘**API Documentation** | Available in Supabase 