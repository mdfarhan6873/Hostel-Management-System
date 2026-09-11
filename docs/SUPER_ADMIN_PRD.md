# Product Requirements Document (PRD)
# Super Admin Dashboard & Institutional Governance Console
**Government Engineering College HMS (राजकीय अभियंत्रण महाविद्यालय, मुंगेर)**

- **Module**: Super Admin Dashboard (`/superadmin`)
- **System**: Modern Hostel Management System (HMS)
- **Target Audience**: Institutional Administrators, Principals, System Engineers
- **Document Version**: 2.2 (Clean Governance Specification)
- **Status**: **APPROVED & ACTIVE**
- **Location**: `/docs/SUPER_ADMIN_PRD.md`

---

## 1. Executive Summary & Vision

The **Super Admin Dashboard** is the centralized, high-level governance portal for the **Government Engineering College Hostel Management System (HMS)** under the Department of Science, Technology and Technical Education, Government of Bihar. 

The system architecture enforces a clean, modular separation of administrative responsibilities. The Super Admin operates strictly at the root institutional level, establishing top-level categories and designating wardens, while completely abstracting out internal hostel mechanics (such as blocks, floors, rooms, and furniture).

### 1.1. Core Architectural Mandate
In strict accordance with institutional governance:
1. **Super Admin Authority (Strict Scope)**:
   - **Hostel Category Management**: Create and maintain top-level accommodation categories (e.g., *Boys Hostel*, *Girls Hostel*, *Co-ed / Staff*).
   - **Warden User Provisioning**: Create new user accounts strictly locked to the **Warden** role.
   - **Hostel Category Assignment**: Directly bind each Warden to their designated Hostel Category.
   - **Warden Reassignment**: Update or shift a Warden's assigned Hostel Category.
   - **Global Telemetry**: Monitor aggregate capacity, active categories, and database health.
2. **Explicit Non-Scope (Completely Decoupled)**:
   - **NO Block Scope / Jurisdiction**: The Super Admin does **NOT** create, assign, or manage blocks, wings, or block jurisdictions. All block definitions, floor structures, rooms, furniture IDs, and student room allotments belong strictly to the **Warden Dashboard** (`/warden`).
   - **NO Non-Warden Role Creation**: Super Admin cannot create other Super Admins or arbitrary roles from the dashboard UI. Role creation in the console is strictly restricted to **Warden**.
   - **NO Student or Billing Operations**: Allotment lists, mess bills, leave deductions, and student registrations are managed solely by Wardens.

---

## 2. User Roles & Permission Matrix (RBAC)

### 2.1. System Scope & Boundary Architecture

```text
+-------------------------------------------------------------------------+
|                        ROOT LEVEL AUTHORITY                             |
|              Super Admin (Institutional Head / Principal)               |
+-------------------------------------------------------------------------+
       |                                                 |
       | 1. Creates Categories                           | 2. Provisions Wardens &
       v                                                 |    Binds to Category
+-----------------------------------+                    v
|         HOSTEL CATEGORIES         | <-------+ +-----------------------------------+
|  - Boys Hostel Category           |         | |           WARDEN USERS            |
|  - Girls Hostel Category          |         +-|  - Role: 'warden' (Strictly)      |
|  - Staff / Co-ed Category         |           |  - Direct Category Binding        |
+-----------------------------------+           +-----------------------------------+
                                                                  |
                                                                  | Logs into /warden
                                                                  v
                                                +-----------------------------------+
                                                |     INTERNAL HOSTEL OPERATIONS    |
                                                |    (Managed ONLY by Wardens)      |
                                                |  - Blocks & Wings                 |
                                                |  - Floors, Rooms & Capacity       |
                                                |  - Unique Furniture IDs           |
                                                |  - Student Allotments & Billing   |
                                                +-----------------------------------+
```

### 2.2. Clean Permission Matrix

| Functional Capability | Super Admin (`/superadmin`) | Warden (`/warden`) | Allotted Student (`/student`) |
|---|---|---|---|
| **Hostel Categories** | **Full CRUD** (Add, Edit, View, Deactivate) | Read-only view of assigned category | Read-only view of hostel name |
| **Warden Accounts** | **Full CRUD** (Create, Bind to Category, Reassign, Status) | None | None |
| **Block / Wing Structure** | *None (Decoupled from Super Admin)* | **Full CRUD** (Create & manage blocks) | None |
| **Rooms & Furniture Inventory** | *None (Decoupled from Super Admin)* | **Full CRUD** (Configure rooms & unique IDs) | Read-only view of assigned room & bed |
| **Student Room Allotment** | High-level occupancy telemetry | **Full Control** (Waiting list, Allot, Evict) | Read-only view of allotment letter |
| **Mess & Fee Billing** | High-level financial analytics | **Full Control** (Generate bills, apply rebates) | **Self-Service** (View & pay bills) |

---

## 3. High-Level System Architecture & Component Hierarchy

The Super Admin Dashboard is built on **Next.js 16 (App Router)** and styled using a clean institutional design system based on Tailwind CSS and custom tokens.

```text
========================================================================================
                 CLEAN SUPER ADMIN ARCHITECTURAL BLUEPRINT
========================================================================================

[ CLIENT LAYER ]
   |
   +-- Page Route: src/app/superadmin/page.tsx (State Orchestrator)
         |
         +-- <SuperAdminHeader />
         |     +-- Institutional Crest (/logo.webp)
         |     +-- Title (Government Engineering College, Munger)
         |     +-- Super Admin Credentials & Status
         |     +-- Functional Sign Out Action
         |
         +-- <SuperAdminControls />
         |     +-- Primary Navigation (Dashboard / Analytics)
         |     +-- Live Search Bar (Filter by Category Name, Warden Name, Email)
         |     +-- Filter Toolbar (Gender Demographic, Status, Reset)
         |     +-- Action Buttons (+ Add Hostel Category, + Add Warden)
         |     +-- Live System Telemetry (MongoDB Atlas Status, Campus Node)
         |
         +-- <HostelCategoryManager />
         |     +-- Category Cards (Title, Demographic, Prefix Code, Active Badge)
         |     +-- Clean Empty State Container (Zero-state indicator)
         |
         +-- <UserRegistry />
         |     +-- Warden Directory Table (Name, Role: Warden, Assigned Category, Contact)
         |     +-- Status Toggle (ACTIVE / INACTIVE)
         |     +-- Reassign Action Trigger (Opens Reassignment Modal)
         |
         +-- <SuperAdminModals />
               +-- [Modal 1: Add Category] --> Title, Prefix Code, Gender Demographic
               +-- [Modal 2: Add Warden]   --> Name, Email, Mobile, Password, Target Category
               +-- [Modal 3: Reassign]     --> Designated Warden, New Category, Effective Date

[ REST API LAYER ]
   |
   +-- GET/POST/PUT  /api/hostels/categories  -->  Hostel Category CRUD
   +-- GET/POST/PUT  /api/users               -->  Warden User CRUD (Role: 'warden' enforced)
   +-- GET           /api/superadmin/analytics --> Global Capacity Telemetry
   +-- POST          /api/auth/logout          --> Session Invalidation

[ CLEAN DATA PERSISTENCE LAYER ]
   |
   +-- MongoDB Atlas Cluster (via Mongoose ODM)
         +-- [Hostels Collection]  --> Category Name, Code, Type (boys/girls/coed)
         +-- [Users Collection]    --> Warden Profiles, Assigned Category, Hashed Passwords
```

---

## 4. Clean Entity-Relationship Model (Super Admin Scope)

The Super Admin domain strictly maintains a direct relationship between **Hostel Categories** and **Warden Users**. Internal physical assets (blocks, floors, rooms, furniture) are isolated within the Warden domain.

```text
+------------------------------------+               +------------------------------------+
|          HOSTEL_CATEGORY           |               |            USER (WARDEN)           |
+------------------------------------+               +------------------------------------+
| * _id          : ObjectId  <PK>    |               | * _id          : ObjectId  <PK>    |
|   name         : String            | <----------+  |   name         : String            |
|   code         : String (Unique)   |            |  |   email        : String (Unique)   |
|   type         : Enum[boys, girls, |            |  |   mobile       : String            |
|                       coed]        |            |  |   password     : String (Bcrypt)   |
|   description  : String (optional) |            |  |   role         : 'warden' (locked) |
|   createdAt    : Date              |            +--|   assignedCategory : String        |
|   updatedAt    : Date              |               |   designation  : String            |
+------------------------------------+               |   status       : ACTIVE | INACTIVE |
                                                     |   createdAt    : Date              |
                                                     |   updatedAt    : Date              |
                                                     +------------------------------------+
```

### Schema Definitions (Mongoose)

#### 4.1. Hostel Category Schema (`Hostel.ts`)
```typescript
interface IHostelCategory {
  _id: string;
  name: string;              // e.g., "Post Graduate Boys Hostel"
  code: string;              // e.g., "PGBH-MUNGER"
  type: "boys" | "girls" | "coed";
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

#### 4.2. Warden User Schema (`User.ts`)
```typescript
interface IWardenUser {
  _id: string;
  name: string;              // e.g., "Prof. Rajesh Sharma"
  email: string;             // Institutional email, unique
  mobile: string;            // Contact number
  password: string;          // Hashed with bcryptjs
  role: "warden";            // Strictly locked to "warden" in UI
  assignedCategory: string;  // Bound to Hostel Category name
  designation: string;       // e.g., "Hostel Warden"
  status: "ACTIVE" | "INACTIVE";
  createdAt: Date;
  updatedAt: Date;
}
```

---

## 5. Functional Specifications & User Flows

### 5.1. Hostel Category Management (Module 1)

#### 5.1.1. Description
Super Admins establish top-level residential categories to reflect the institution's housing allocations.

#### 5.1.2. Category Creation Lifecycle

```text
SUPER ADMIN                     SUPER ADMIN UI                  BACKEND API                     MONGODB ATLAS
(Browser)                  (SuperAdminModals.tsx)         (/api/hostels/categories)             (Database)
   |                                 |                                 |                             |
   |--- 1. Clicks "+ Add Category" ->|                                 |                             |
   |<-- 2. Displays Add Modal -------|                                 |                             |
   |                                 |                                 |                             |
   |--- 3. Enters Title, Code, Type->|                                 |                             |
   |--- 4. Clicks "Save Category" -->|                                 |                             |
   |                                 |--- 5. POST /api/hostels/cat --->|                             |
   |                                 |    {name, code, type}           |--- 6. Verify Super Admin ---|
   |                                 |                                 |--- 7. Hostel.create(...) -->|
   |                                 |                                 |<-- 8. Document Saved -------|
   |                                 |<-- 9. HTTP 201 Created ---------|                             |
   |<-- 10. Closes Modal & Toasts ---|                                 |                             |
   |                                 |--- 11. Refresh Category List -->|                             |
   |<-- 12. Displays New Category ---|                                 |                             |
```

#### 5.1.3. Form Field Rules
- **Category Title**: Required string (English & Hindi allowed, e.g., *Boys Hostel Category / बालक छात्रावास*).
- **Prefix Code**: Required uppercase string (e.g., `BH-GEC-MGR`).
- **Gender Demographic**: Required select dropdown (`boys` | `girls` | `coed`).

---

### 5.2. Warden Credential Provisioning & Category Binding (Module 2)

#### 5.2.1. Description
Super Admins onboard faculty members as Wardens and directly assign them to an existing Hostel Category.

> [!IMPORTANT]
> - User role is **permanently locked to Warden**.
> - The Super Admin assigns the Warden to a **Hostel Category only**. There are no block fields or jurisdiction selectors.

#### 5.2.2. Warden Onboarding Flow

```text
SUPER ADMIN                     SUPER ADMIN UI                  BACKEND API                     MONGODB ATLAS
(Browser)                     (Add Warden Modal)                (/api/users)                     (Database)
   |                                 |                                 |                             |
   |--- 1. Clicks "+ Add Warden" --->|                                 |                             |
   |<-- 2. Displays Add Warden Modal-|                                 |                             |
   |    (Role locked to "Warden")    |                                 |                             |
   |                                 |                                 |                             |
   |--- 3. Enters Name, Email, Mobile|                                 |                             |
   |       Password & Selects        |                                 |                             |
   |       Target Category           |                                 |                             |
   |--- 4. Clicks "Create Warden" -->|                                 |                             |
   |                                 |--- 5. POST /api/users --------->|                             |
   |                                 |    {name, email, password,      |--- 6. Verify Super Admin ---|
   |                                 |     role: 'warden', category}   |--- 7. Check Unique Email ---|
   |                                 |                                 |--- 8. Hash Password (bcrypt)|
   |                                 |                                 |--- 9. User.create(...) ---->|
   |                                 |                                 |<-- 10. User Saved ----------|
   |                                 |<-- 11. HTTP 201 Created --------|                             |
   |<-- 12. Closes Modal & Toasts ---|                                 |                             |
   |                                 |--- 13. Refresh Users Registry ->|                             |
   |<-- 14. Updates Warden Table ----|                                 |                             |
```

#### 5.2.3. Form Field Rules
- **Full Name & Designation**: Required string (e.g., *Prof. Rajesh Sharma*).
- **Institutional Email**: Required unique email (e.g., *rajesh@gecmunger.ac.in*).
- **Mobile Number**: Required 10-digit phone format.
- **Initial Password**: Required (minimum 6 characters, hashed securely via bcrypt).
- **Role**: Locked system badge: `Warden (Category Bound)`.
- **Target Category**: Required select dropdown populated from active Hostel Categories.

---

### 5.3. Warden Reassignment (Module 3)

#### 5.3.1. Description
When faculty responsibilities change, the Super Admin can reassign a Warden to a different Hostel Category.

```text
   +-------------------------------------------------------------+
   |                      ACTIVE WARDEN                          |
   |       Assigned to: Category A (e.g., Boys Hostel)           |
   +-------------------------------------------------------------+
                                 |
                                 | Super Admin clicks:
                                 | "Reassign Category"
                                 v
   +-------------------------------------------------------------+
   |                 REASSIGNMENT MODAL WORKFLOW                 |
   |                                                             |
   |   1. Target Hostel Category (Select from active categories) |
   |   2. Handover Effective Date                                |
   |   3. Inventory Audit Clearance Status                       |
   +-------------------------------------------------------------+
                                 |
                                 | Clicks "Update Assignment"
                                 v
   +-------------------------------------------------------------+
   |                  CREDENTIAL SCOPE UPDATED                   |
   |                                                             |
   |   - Warden's `assignedCategory` updated in database         |
   |   - Operational access immediately bound to new Category    |
   |   - System audit log recorded with timestamp                |
   +-------------------------------------------------------------+
```

---

## 6. User Interface & Clean State Standards

### 6.1. Visual & Institutional Aesthetics
- **Branding**: Official Government Engineering College emblem (`/logo.webp`), English & Hindi title, and *Govt. of Bihar* badge.
- **Color Tokens**: Crisp white backgrounds (`bg-white`), neutral slate borders (`border-slate-300`), deep slate primary accents (`bg-slate-900`), and emerald live indicators (`text-emerald-700`).
- **Interactive Elements**: `.sketch-pill` buttons, clean scrollbars, and focused input styling.

### 6.2. Clean State & Zero Fake Mock Policy
- **Empty State Containers**: If no categories or wardens exist in the database, clear dashed empty-state placeholders are rendered with action triggers.
- **No Mock Arrays**: Fallback mock arrays are strictly removed. The dashboard renders live data from MongoDB.

---

## 7. Clean API Route Specifications

### 7.1. Category Endpoints (`/api/hostels/categories`)

#### `GET /api/hostels/categories`
- **Auth**: Super Admin session required.
- **Response**:
```json
{
  "success": true,
  "categories": [
    {
      "_id": "64f1a2b3c4d5e6f7a8b9c0d1",
      "name": "Boys Hostel Category",
      "code": "BH-GEC-MGR",
      "type": "boys",
      "createdAt": "2026-08-01T00:00:00.000Z"
    }
  ]
}
```

#### `POST /api/hostels/categories`
- **Auth**: Super Admin session required.
- **Payload**:
```json
{
  "name": "Girls Hostel Category",
  "code": "GH-GEC-MGR",
  "type": "girls",
  "description": "Female student residential campus"
}
```

---

### 7.2. Warden Endpoints (`/api/users`)

#### `GET /api/users`
- **Auth**: Super Admin session required.
- **Response**: Returns all users with passwords excluded, showing assigned category and active status.

#### `POST /api/users`
- **Auth**: Super Admin session required.
- **Payload**:
```json
{
  "name": "Dr. Rameshwar Singh",
  "email": "rameshwar@gecmunger.ac.in",
  "mobile": "+91 94312 00000",
  "password": "SecurePassword123",
  "role": "warden",
  "assignedCategory": "Boys Hostel Category",
  "designation": "Hostel Warden"
}
```

#### `PUT /api/users`
- **Auth**: Super Admin session required.
- **Payload**:
```json
{
  "id": "64f1a2b3c4d5e6f7a8b9c0d2",
  "assignedCategory": "Girls Hostel Category",
  "status": "ACTIVE"
}
```

---

## 8. Verification & Acceptance Criteria

| Feature | Acceptance Criteria | Status |
|---|---|---|
| **Branding & Header** | Displays GEC Munger crest (`/logo.webp`), institution name, Government of Bihar badge, and functional Sign Out. | **Verified** |
| **Category Creation** | Super Admin can add a Category with Title, Code, and Gender Demographic (Boys/Girls/Co-ed). | **Verified** |
| **Warden Creation** | Super Admin can create accounts locked strictly to the **Warden** role with direct category binding. | **Verified** |
| **Warden Reassignment** | Super Admin can reassign an existing Warden directly to any active category with an effective date. | **Verified** |
| **Clean Decoupling** | Super Admin domain has **zero** block jurisdiction fields or block configuration dependencies. | **Verified** |
| **Clean State** | Zero mock data fallbacks. Clean empty states rendered when MongoDB returns no records. | **Verified** |
| **Live Search & Filters** | Search input filters categories and wardens in real-time. Dropdown filters by demographic and status. | **Verified** |

---
*Document maintained by HMS Core Engineering Team • Government Engineering College, Munger*
