# CampusHMS — Intelligent Hostel Management System

A full-stack modern campus accommodation management platform built with **Next.js 14 (App Router)**, **TypeScript**, and **MongoDB Atlas** (Mongoose).

---

## 📁 Repository Structure

```
Hostel-Management-System/
├── docs/
│   └── PRD.md                       # Comprehensive Product Requirements Document & Diagrams
└── hms/                             # Full-Stack Next.js 14 Web Application
    ├── app/
    │   ├── (auth)/login/            # Multi-identifier sign in (Roll No / Email / Phone)
    │   ├── apply/                   # Public admission application portal & PDF slip generator
    │   ├── (dashboard)/admin/       # Admin capacity matrix, 1-click room allot, billing & leaves
    │   ├── (dashboard)/student/     # Student portal, nightly selfie roll-call & fee payment
    │   ├── (dashboard)/viewer/      # Read-only warden & emergency medical registry
    │   └── api/                     # MongoDB Route Handlers (Hostels, Billing, Leaves, etc.)
    ├── components/                  # Room cards, modals, attendance camera & printable slips
    ├── context/                     # Auth context & session management
    ├── lib/                         # MongoDB connection manager & Mongoose schemas
    ├── scripts/seed.mjs             # Database seeder script
    └── package.json
```

---

## 🚀 Key Features

1. **Hostel Structure & Capacity Hierarchy**: Visual modeling from Hostel $\rightarrow$ Block $\rightarrow$ Floor $\rightarrow$ Single/Double/Triple Rooms with live occupancy metrics.
2. **Interactive 1-Click Bed Allotment**: Direct allotment from room card or application review queue.
3. **Public Admission Application (`/apply`)**: Prospective students apply publicly without needing an account upfront; admission window selector with live countdown and official Fee Structure & Rules PDF links.
4. **Printable / Save-as-PDF Application Slip**: Automatic generation of an official application acknowledgement slip containing student credentials (including chosen password) so students never lose their details.
5. **Eligibility-Gated Student Login**: In accordance with residency rules, student accounts remain locked with a `PENDING` review notice until the administration approves and marks them `ELIGIBLE`.
6. **Flexible Billing & Mess Fee Leave Rebates**: Customizable itemized charges (Hostel Rent, Caution Deposit, Mess Fee, Fines) with automatic deduction for approved student leave days (e.g. 70% rebate).
7. **Admin UPI & QR Code Management**: Admin configures institutional UPI IDs and QR codes; assigned QR codes appear directly on student bills for instant UPI payment, UTR submission, and printable receipt generation.
8. **Nightly 7:00 PM – 8:00 PM Room Selfie Roll-Call**: Camera-based attendance stamping live room number, student name, and timestamp directly onto canvas.
9. **Monthly Attendance Calendar Grid**: Green (Present), Blue (Approved Leave), Red (Missed) calendar matrix with disciplinary resolution tools.
10. **Handwritten Leave Verification & Parent Phone Logger**: Students upload scanned handwritten leave letters; admins log parent phone call confirmation notes before approving.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router, Server Components & Route Handlers)
- **Language**: TypeScript
- **Database**: MongoDB Atlas via Mongoose ODM
- **Authentication**: JWT with secure HTTP-only cookies and multi-identifier lookup (Roll Number, Email, Phone)
- **Design System**: Responsive Dark Slate CSS design system (Vanilla CSS with CSS variables)

---

## 🏁 Getting Started

### 1. Prerequisites
- Node.js 18+
- MongoDB Atlas Cluster or local MongoDB instance

### 2. Setup
```bash
# Navigate to application directory
cd hms

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env.local
# Edit .env.local and set your MONGODB_URI and JWT_SECRET

# Seed demo data (optional)
node scripts/seed.mjs

# Run development server
npm run dev
```

The portal will be live at `http://localhost:3002` (or `http://localhost:3000`).
