# Product Requirements Document (PRD)
# Modern Hostel Management System (HMS)

- **Architecture**: Full-Stack Next.js 14+ (App Router, Server Route Handlers / Server Actions, TypeScript)
- **Database**: MongoDB (via Mongoose ODM)
- **Styling**: Clean, Modern Custom CSS Design System
- **Document Status**: **LOCKED / APPROVED**
- **Location**: `/docs/PRD.md`

---

## 1. Executive Summary & Vision
The **Hostel Management System (HMS)** is a comprehensive, institutional-grade accommodation and residency lifecycle management platform built as a native Full-Stack Next.js application backed by MongoDB. It streamlines collegiate residential administration:
- Complete physical infrastructure modeling (Hostels $\rightarrow$ Blocks $\rightarrow$ Floors $\rightarrow$ Rooms $\rightarrow$ Furniture Groups: Beds/Tables/Chairs with unique IDs).
- Three dedicated dashboards: **Super Admin**, **Warden**, and **Allotted Student**.
- No public signup; wardens publish admission forms and directly add students as `Waiting` or `Allotted`. Only allotted students can log in.
- Complete visual blueprint for wardens to track room allotments including specific student details (name, branch, session) and assigned furniture IDs.
- **Flexible Billing**: Student payment history, and warden-controlled mess rebates (manual deduction application during bill generation).

---

## 2. User Roles & Permission Matrix

| Role | Access Level | Primary Activities |
|---|---|---|
| **Super Admin** | Full System Control | View global overall analytics and category-specific analytics. Add Hostel categories (Boys or Girls). Create user accounts with the `warden` role and assign them to specific hostel categories. Has access to the **Super Admin Dashboard**. |
| **Warden (Boys / Girls)** | Hostel / Block Control | Full control over their assigned hostel category. Define blocks, floors, rooms, and capacity. Manage unique IDs for all beds, tables, and chairs. Publish admission forms with title, description, and links. Add students manually, manage allocations (Waiting / Allotted), and assign students to specific rooms and furniture groups. View entire block blueprint. Generate bills and apply leave-based rebates. Has access to the **Warden Dashboard**. |
| **Allotted Student** | Self-Service | Login to the **Student Dashboard** (No signup; login strictly restricted to allotted students). View assigned room, bed, table, and chair numbers. Pay new bills and view complete payment history. |

---

## 3. Core Functional Modules

### 3.1. Unified Authentication & Dashboards
- **Dedicated Dashboards**:
  - `superadmin` $\rightarrow$ `/superadmin` (Global oversight & analytics)
  - `warden` $\rightarrow$ `/warden` (Block management & operations)
  - `student` $\rightarrow$ `/student` (Self-service portal)
- **Login Credentials**:
  - Identifier: **Email Address** only.
  - Password: Secure hashed password (bcrypt).
  - **No Signup**: Student accounts are created/added by Wardens or Super Admin. Login is only permitted for students in the `ALLOTTED` state.

### 3.1.1. User & Profile Schemas
- **Super Admin / Warden Profile**:
  - `Name`, `Email`, `Mobile`, `Password` (hashed).
  - `Role`: Explicitly defined as `superadmin` or `warden`.
  - `Assigned Hostel Category`: Conditionally required if the role is `warden` (e.g., Boys Hostel, Girls Hostel).
- **Student Profile**:
  - **Personal Details**: Full Name, Age, Email, Mobile, Password (hashed), Complete Address, Blood Group (optional).
  - **Academic Details**: Roll No, Branch, Session, Registration No (optional).
  - **Hostel & Document Details**: Mess Card No (optional), Document Links (optional).
  - **Parent Details**: Father Name, Mother Name, Parent Mobile No.
  - **Lifecycle Status**:
    - `WAITING`: Pending room assignment.
    - `ALLOTTED`: Room and furniture assigned.
    - `CANCELLED / EVICTED`: Removed from hostel (requires a remark and a notice link).

---

### 3.2. Hostel Infrastructure & Visual Blueprint Hierarchy
- **Hierarchical Structure**:
  - **Hostel Category**: Added by Super Admin (e.g., *Boys Hostel*, *Girls Hostel*).
  - **Block / Wing**: Defined by Warden (e.g., *Block A*, *Block B*, *Block C*).
  - **Floors**: Defined by Warden (e.g., *Ground Floor*, *First Floor*).
  - **Rooms & Capacity**: Configured by Warden (Single, Double, Triple).
  - **Furniture Groups**: Configured by Warden. Every room contains an array of distinct furniture groups named sequentially (e.g., *Furniture Group A*, *Furniture Group B*). The maximum number of groups corresponds exactly to the room's capacity (e.g., a double room will have max 2 groups). Furniture groups can be incomplete (e.g., has a bed and chair, but no table). Wardens can dynamically edit specific furniture groups to add or remove individual beds, tables, or chairs. **Every individual bed, table, and chair has a custom, unique identification number**.
- **Warden Blueprint View**:
  - Interactive block-wise visual matrix.
  - Complete visibility into which room is allotted to whom.
  - Displays the specific table, bed, and chair number assigned to the student.
  - Displays allotted student details: Name, Branch, and Academic Session.

---

### 3.3. Admission Forms & Student Onboarding
- **Form Publishing**: Wardens can publish admission forms to a common HMS website.
- **Form Configuration**: Includes Title, Description, and official document links (Fee structure, Rules).
- **Student Addition**: Wardens can manually add students to the system.
- **Initial Status**: When adding a student, the warden can mark them as `WAITING` (if no rooms are currently available) or proceed to assign them as `ALLOTTED`.

---

### 3.4. Allotment Lifecycle & State Machine
1. `WAITING`: Student added by Warden but pending room assignment.
2. `ALLOTTED`: Warden chooses a Floor, Room, and specifically assigns a Furniture Group (Bed, Table, Chair) within that room to the student. Wardens can also reassign an allotted student to a different room/furniture group if needed. Student is now authorized to log in.
3. `CANCELLED / EVICTED`: Disciplinary or manual removal with eviction remark and notice link.

---

### 3.5. Advanced Flexible Billing & Mess Rebates
- **Warden Bill Generation**: Wardens generate bills for mess charges, room rent, fines, etc.
- **Leave-Based Mess Rebate**:
  - Wardens can apply rebates to mess bills based on approved leave days.
  - e.g., Deduct a specific amount for 5 days of approved leave.
- **Student Billing Dashboard**:
  - Students can view all new bills generated for them.
  - Students have access to their complete history of paid bills and receipts.

---

## 4. Comprehensive Architecture & Flow Diagrams

### 4.1. System Overview Architecture

```text
+-----------------------------------------------------------+
|           Frontend (Next.js 14+ App Router)               |
|                                                           |
|  [Unified Login]       [Super Admin Dashboard]            |
|  (No Signup)           [Warden Dashboard]                 |
|                        [Allotted Student Dashboard]       |
+-----------------------------------------------------------+
                              |
                              v
+-----------------------------------------------------------+
|      API - Next.js Server Route Handlers (/app/api)       |
|                                                           |
|  /api/auth/           /api/hostels/                       |
|  /api/infrastructure/ /api/students/                      |
|  /api/billing/        /api/attendance/                    |
|  /api/leaves/         (+ Rebate Engine)                   |
+-----------------------------------------------------------+
                              |
                              v
+-----------------------------------------------------------+
|           Database - MongoDB (Mongoose ODM)               |
|                                                           |
|  (Users)        (Hostels, Blocks, Floors, Rooms)          |
|  (Students)     (Furniture: Beds, Tables, Chairs)         |
|  (Bills)        (Attendance)      (Leaves)                |
+-----------------------------------------------------------+
```

---

### 4.2. Hostel Infrastructure & Data Hierarchy

```text
[ HOSTEL ]  ---------------------------+
- name                                 |
- type (Boys/Girls)                    | contains (1:N)
                                       v
[ BLOCK ]  ----------------------------+
- name (e.g., Block A)                 |
- wardenId                             | has (1:N)
                                       v
[ FLOOR ]  ----------------------------+
- name (e.g., Ground Floor)            |
                                       | has (1:N)
                                       v
[ ROOM ]  -----------------------------+
- roomNumber                           |
- capacity                             | contains array of (1:N)
                                       v
[ FURNITURE_GROUP ]
- groupName (e.g., Group A)
- uniqueBedId (optional)
- uniqueTableId (optional)
- uniqueChairId (optional)

[ USER_ADMIN ]
- name, email, mobile, password
- role (superadmin / warden)
- assignedCategory (if warden)

[ STUDENT ]
- fullName, email, mobile, password
- age, address, bloodGroup, docLinks
- rollNo, registrationNo, branch, session
- messCardNo
- parents (father, mother, mobile)
- status (WAITING / ALLOTTED / CANCELLED)
- assignedRoom
- assignedFurnitureGroup
```

---

### 4.3. Warden Onboarding & Blueprint Flow

```text
[ Warden Dashboard ]
         |
         +---> [ Publish Admission Form ] (Title, Desc, Links)
         |
         +---> [ View Block Blueprint ]
         |         |
         |         +---> [ Room Details ]
         |                   |--> [ Assigned Student ] (Name, Branch, Session)
         |                   |--> [ Specific Bed, Table, Chair IDs ]
         |
         +---> [ Manually Add Student ]
                   |
                   v
             < Room Available? >
             /                 \
          (NO)                (YES)
           |                    |
           v                    v
  [ Mark as WAITING ]    [ Mark as ALLOTTED ]
                         (Assign Room + Bed/Table/Chair IDs)
```

---

### 4.4. Mess Fee Leave Rebate & Billing Workflow

```text
[ Warden Generates Bill ]
           |
           v
[ Check Approved Leave Days ]
           |
           v
    < Leave Days > 0? >
     /               \
   (NO)             (YES)
    |                 |
    |                 v
    |        [ Apply Mess Rebate ]
    |        (Reduce amount for days)
    v                 |
[ Issue Standard ]    |
[      Bill      ]    v
    |            [ Issue Discounted ]
    |            [       Bill       ]
    \                 /
     \               /
      v             v
[ Student Dashboard: New Bills ]
           |
           v
[ Student Pays Bill ]
           |
           v
[ Student Dashboard: Bill History & Receipts ]
```
