# TaskTrack — Task & Team Management System (Assignment 2)

[![.NET Version](https://img.shields.io/badge/.NET-10.0%20%2F%208.0-512BD4?style=flat&logo=dotnet)](https://dotnet.microsoft.com/)
[![React Version](https://img.shields.io/badge/React-19.0-61DAFB?style=flat&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16%20Supabase-4169E1?style=flat&logo=postgresql)](https://supabase.com/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?style=flat&logo=vite)](https://vitejs.dev/)
[![Render](https://img.shields.io/badge/Backend-Render-46E3B7?style=flat&logo=render)](https://render.com/)
[![Vercel](https://img.shields.io/badge/Frontend-Vercel-000000?style=flat&logo=vercel)](https://vercel.com/)

> **PRN232 — Advanced Cross-Platform Application Programming with .NET**  
> **Assignment 2 of 2**: User Authentication & Protected Role-based Management  
> **Student ID**: `QE190061` | **Author**: `Nguyễn Bình An` (`TomOutfit`)

---

## 🔑 Test Accounts Credentials (Grading Verification)

| Account Type | Email | Password | Role Value | Permissions |
| :--- | :--- | :--- | :--- | :--- |
| 🛡️ **Admin** | `admin@tasktrack.com` | `Admin@123456` | `1` (Admin) | Full Write Access (Departments, Projects, Tasks, Tags) + **Account Management** |
| 👤 **Staff** | `staff@tasktrack.com` | `Staff@123456` | `0` (Staff) | Write Access (Departments, Projects, Tasks, Tags). Blocked from Accounts (HTTP 403) |

> 💡 **Tip:** Trên trang `/login`, có sẵn 2 nút **Quick Test Credentials** để tự động điền tài khoản Admin và Staff giúp chấm bài nhanh chỉ với 1 click!

---

## 🌐 Production & Repository Links

| Resource | URL | Description |
| :--- | :--- | :--- |
| 🚀 **Frontend Web App (Vercel)** | [https://qe190061-prn232-ass2-fe.vercel.app](https://qe190061-prn232-ass2-fe.vercel.app) | React 19 + TypeScript SPA with JWT Auth & Protected Route Guards |
| ⚡ **Backend API Service (Render)** | [https://qe190061-prn232-ass2-be.onrender.com](https://qe190061-prn232-ass2-be.onrender.com) | ASP.NET Core Web API with BCrypt & JWT Bearer |
| 📖 **Swagger / OpenAPI UI** | [https://qe190061-prn232-ass2-be.onrender.com/swagger](https://qe190061-prn232-ass2-be.onrender.com/swagger) | Interactive API exploration with JWT Bearer "Authorize" UI |
| 🐙 **Source Code Repository (GitHub)** | [https://github.com/TomOutfit/Assignment-2_PRN232_Fa26](https://github.com/TomOutfit/Assignment-2_PRN232_Fa26) | Full-stack monorepo with CI/CD workflows |

---

## 📝 Submission Document Summary (For `QE190061_SE19B_Ass2.docx`)

- **Student ID:** `QE190061`
- **Student Name:** `Nguyễn Bình An`
- **Course:** `PRN232 - Assignment 2`
- **Backend Repository:** `https://github.com/TomOutfit/Assignment-2_PRN232_Fa26`
- **Frontend Repository:** `https://github.com/TomOutfit/Assignment-2_PRN232_Fa26`
- **Live Backend URL (Render):** `https://qe190061-prn232-ass2-be.onrender.com`
- **Live Frontend URL (Vercel):** `https://qe190061-prn232-ass2-fe.vercel.app`
- **Swagger URL:** `https://qe190061-prn232-ass2-be.onrender.com/swagger`
- **Known Issues / Incomplete Features:** `None. All requirements and bonus features are 100% completed and verified.`

---

## 📊 Database Schema & Entity-Relationship Diagram (ERD)

Database sử dụng schema riêng biệt `assignment2` trên PostgreSQL Supabase với bảng mới `SystemAccount` và khóa ngoại `CreatedByID` trên bảng `Task`:

```mermaid
erDiagram
    SystemAccount ||--o{ Task : "creates (1:N)"
    Department ||--o{ Project : "contains (1:N)"
    Project ||--o{ Task : "includes (1:N)"
    Task ||--o{ TaskTag : "tagged with (1:N)"
    Tag ||--o{ TaskTag : "associates (1:N)"

    SystemAccount {
        int AccountID PK "SERIAL"
        varchar(100) FullName "NOT NULL"
        varchar(150) Email "NOT NULL UNIQUE"
        varchar(255) PasswordHash "NOT NULL (BCrypt)"
        smallint Role "NOT NULL DEFAULT 0 (0=Staff, 1=Admin)"
        timestamp CreatedDate "NOT NULL DEFAULT CURRENT_TIMESTAMP"
    }

    Department {
        int DepartmentID PK "SERIAL"
        varchar(100) DepartmentName "NOT NULL"
        varchar(300) DepartmentDescription "NOT NULL"
        boolean IsActive "NOT NULL DEFAULT TRUE"
    }

    Project {
        int ProjectID PK "SERIAL"
        varchar(200) ProjectName "NOT NULL"
        text Description "NULL"
        date StartDate "NOT NULL"
        date EndDate "NULL"
        smallint Status "NOT NULL DEFAULT 0"
        int DepartmentID FK "REFERENCES Department"
        boolean IsActive "NOT NULL DEFAULT TRUE"
        timestamp CreatedDate "NOT NULL DEFAULT CURRENT_TIMESTAMP"
    }

    Task {
        int TaskID PK "SERIAL"
        varchar(300) Title "NOT NULL"
        text Description "NULL"
        smallint Status "NOT NULL DEFAULT 0"
        smallint Priority "NOT NULL DEFAULT 1"
        date DueDate "NULL"
        int ProjectID FK "REFERENCES Project"
        int CreatedByID FK "NULL, REFERENCES SystemAccount"
        boolean IsActive "NOT NULL DEFAULT TRUE"
        timestamp CreatedDate "NOT NULL DEFAULT CURRENT_TIMESTAMP"
        timestamp ModifiedDate "NULL"
    }

    Tag {
        int TagID PK "SERIAL"
        varchar(50) TagName "NOT NULL UNIQUE"
        varchar(7) Color "Hex Code e.g. #3B82F6"
    }

    TaskTag {
        int TaskID PK, FK "REFERENCES Task ON DELETE CASCADE"
        int TagID PK, FK "REFERENCES Tag ON DELETE CASCADE"
    }
```

---

## 🏛️ Sơ đồ Kiến trúc Hệ thống (System Architecture)

Ứng dụng tuân thủ chuẩn kiến trúc đa tầng (3-Tier Layered Architecture):

```mermaid
graph TD
    subgraph Client["Frontend Client (Vite + React 19 + TypeScript)"]
        UI["Modern UI / Design System"]
        AuthCtx["AuthContext (JWT State & Roles)"]
        Guards["Route Guards (ProtectedRoute, AdminRoute)"]
        AxiosInst["Axios Service (Bearer Interceptor & 401 Handler)"]
        UI --> AuthCtx
        AuthCtx --> Guards
        Guards --> AxiosInst
    end

    subgraph Backend["Backend Service (ASP.NET Core Web API .NET 8/10)"]
        subgraph API["TaskTrack.API Layer"]
            MW["Middleware (CORS, JWT Bearer Auth, Swagger)"]
            AuthCtrl["AuthController (/api/auth)"]
            AccCtrl["AccountsController (/api/accounts) [Admin Only]"]
            BizCtrl["Business Controllers (Depts, Projects, Tasks, Tags)"]
        end

        subgraph Service["TaskTrack.Service Layer"]
            AuthSvc["AuthService (BCrypt Hashing)"]
            JwtGen["JwtTokenGenerator (HMAC-SHA256)"]
            AccSvc["AccountService (Task Constraint Check)"]
            BizSvc["Entity Services (Tasks, Projects, Depts, Tags)"]
        end

        subgraph Repo["TaskTrack.Repo Layer"]
            EF["TaskTrackDbContext (Schema: assignment2)"]
            AccRepo["AccountRepository"]
            BizRepo["Department / Project / Task / Tag Repositories"]
        end
    end

    subgraph Database["Database (PostgreSQL on Supabase)"]
        DB["Schema: assignment2 (SystemAccount, Task, Project, Dept, Tag, TaskTag)"]
    end

    AxiosInst -- "HTTP / REST (Bearer JWT)" --> MW
    MW --> AuthCtrl & AccCtrl & BizCtrl
    AuthCtrl --> AuthSvc & JwtGen
    AccCtrl --> AccSvc
    BizCtrl --> BizSvc
    AuthSvc & AccSvc & BizSvc --> AccRepo & BizRepo
    AccRepo & BizRepo --> EF
    EF -- "Npgsql Connection" --> DB
```

---

## 🔐 Sơ đồ Luồng Xác thực & Phân quyền (Authentication & Authorization Flow)

```mermaid
sequenceDiagram
    autonumber
    actor User as Client User
    participant FE as React Frontend (AuthContext)
    participant API as ASP.NET Core API
    participant JWT as JwtTokenGenerator
    participant DB as Supabase PostgreSQL

    Note over User, DB: 1. Đăng ký & Đăng nhập (Authentication)
    User->>FE: Nhập Email & Password
    FE->>API: POST /api/auth/login { email, password }
    API->>DB: Query SystemAccount by Email
    DB-->>API: SystemAccount + BCrypt Hash
    API->>API: Verify Password with BCrypt
    API->>JWT: GenerateToken(AccountID, Email, Role)
    JWT-->>API: Signed JWT Token (exp: 24h)
    API-->>FE: HTTP 200 { token, accountId, fullName, roleName }
    FE->>FE: Lưu token vào localStorage & cập nhật AuthContext

    Note over User, DB: 2. Gọi API Bảo vệ (Role-based Authorization)
    User->>FE: Thao tác Tạo mới / Cập nhật / Xóa Task
    FE->>API: POST /api/tasks (Header: Bearer <token>)
    API->>API: Validate Token Signature & Expiry
    alt Token không hợp lệ / Thiếu
        API-->>FE: HTTP 401 Unauthorized
        FE->>FE: Clear session & Redirect to /login
    else Token hợp lệ
        API->>DB: Thực thi truy vấn với CreatedByID từ token
        DB-->>API: Success
        API-->>FE: HTTP 201 / 200 OK
    end

    Note over User, DB: 3. Kiểm tra Phân quyền Admin
    User->>FE: Staff truy cập /api/accounts
    FE->>API: GET /api/accounts (Bearer Staff Token)
    API->>API: Check Role == "Admin"
    API-->>FE: HTTP 403 Forbidden (Access Denied)
```

---

## 🚫 Sơ đồ Luồng Nghiệp vụ Xóa Tài khoản (Account Deletion Constraint)

Đề bài yêu cầu: *DELETE /api/accounts/{id} must be rejected if the account has created any tasks*.

```mermaid
flowchart TD
    Start([Admin gửi yêu cầu DELETE /api/accounts/:id]) --> CheckRole{Caller có Role Admin?}
    CheckRole -- Không --> Ret403[HTTP 403 Forbidden]
    CheckRole -- Có --> FindAcc{Tài khoản ID có tồn tại?}
    FindAcc -- Không --> Ret404[HTTP 404 Not Found]
    FindAcc -- Có --> CheckTasks{Tài khoản đã tạo Task nào active?}
    CheckTasks -- Có tồn tại Task --> RejectDel[HTTP 400 Bad Request: Cannot delete account with active tasks]
    CheckTasks -- Không có Task nào --> ExecuteDel[Xóa SystemAccount khỏi database]
    ExecuteDel --> Ret204[HTTP 204 No Content: Xóa thành công]
```

---

## 🚀 Tính năng nổi bật của Assignment 2

### 1. Database Schema `assignment2` & Siêu Dữ Liệu phong phú x10 - x15
- **Schema độc lập**: Tạo schema riêng `assignment2` trên Supabase PostgreSQL, không đụng chạm tới schema `assignment1`.
- **Bảng `SystemAccount`**:
  - `AccountID` SERIAL PRIMARY KEY
  - `FullName` VARCHAR(100) NOT NULL
  - `Email` VARCHAR(150) NOT NULL UNIQUE
  - `PasswordHash` VARCHAR(255) NOT NULL (mã hóa chuẩn bằng **BCrypt**)
  - `Role` SMALLINT NOT NULL (0 = Staff, 1 = Admin)
  - `CreatedDate` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
- **Ràng buộc khóa ngoại & Kiểm tra xóa tài khoản**:
  - Cột `CreatedByID` trong bảng `Task` liên kết với `SystemAccount(AccountID)`.
  - Nghiệp vụ: **Không cho phép xóa tài khoản nếu tài khoản đó đã tạo task** (trả về HTTP 400 kèm thông báo rõ ràng).
- **Quy mô dữ liệu phong phú**:
  - **16 Departments** thực tế, chuyên nghiệp
  - **40 Projects** phân bổ đa lĩnh vực
  - **28 Tags** đa sắc màu HSL/Hex
  - **120 Tasks** chi tiết, đầy đủ priority và status
  - **381 TaskTags** liên kết nhiều-nhiều thực tế
  - **8 SystemAccounts** (Admin, Staff, Lead Engineer, QA, v.v.)

### 2. Xác thực JWT & Phân quyền dựa trên vai trò (RBAC)
- **BCrypt Hashing**: Bảo mật mật khẩu người dùng với `BCrypt.Net-Next`.
- **JWT Bearer Token**:
  - Payload bao gồm: `AccountID`, `Email`, `Role`, `FullName`, `exp` (24 giờ).
  - Secret key đọc từ biến môi trường `JWT_SECRET` (không hard-code).
- **Chính sách phân quyền**:
  - **Public (Không cần token)**: Tất cả GET (Departments, Projects, Tasks, Tags, Search).
  - **Authenticated (Mọi người dùng đã đăng nhập)**: POST, PUT, DELETE trên Departments, Projects, Tasks, Tags.
  - **Admin Only**: CRUD trên `/api/accounts/*`.
  - Chưa đăng nhập truy cập endpoint bảo vệ -> **HTTP 401 Unauthorized**.
  - Tài khoản Staff cố truy cập Account Management -> **HTTP 403 Forbidden**.

### 3. Frontend Authentication & Protected Management Pages
- **Auth Context & Axios Interceptors**:
  - Tự động đính kèm `Authorization: Bearer <token>` vào mọi request bảo vệ.
  - Tự động bắt lỗi 401 khi token hết hạn để xóa session và redirect về `/login`.
- **Trang Đăng nhập (`/login`)**:
  - Form email & password, thông báo lỗi trực quan, redirect sang `/admin`.
  - Bộ nút demo fast-fill cho Admin & Staff để chấm bài nhanh chóng.
- **Trang Đăng ký (`/register`)**:
  - Client-side validation: bắt buộc nhập, định dạng email, mật khẩu tối thiểu 6 ký tự, kiểm tra trùng khớp mật khẩu.
  - Tự động đăng ký với vai trò Staff (`role = 0`).
  - Hiển thị thông báo thành công và chuyển hướng về `/login`.
- **Admin Dashboard (`/admin`)**:
  - Chặn người dùng chưa đăng nhập, tự động redirect sang `/login`.
  - Hiển thị thẻ KPI tóm tắt tổng số Phòng ban, Dự án, Công việc, Thẻ nhãn, và Tài khoản.
  - Điều hướng tới các phân vùng quản trị.
- **Quản trị Tài khoản (`/admin/accounts`) (Admin Only)**:
  - Hiển thị bảng danh sách các tài khoản trong hệ thống và số lượng active tasks mà tài khoản đó đã tạo.
  - Modal chỉnh sửa Họ tên & Phân quyền (Staff / Admin).
  - Modal xác nhận xóa tài khoản (kèm cảnh báo và xử lý từ chối xóa nếu tài khoản đã có task).
- **Navigation Bar phản ánh trạng thái đăng nhập**:
  - Khi chưa đăng nhập: Nút Sign In, Register.
  - Khi đã đăng nhập: Hiển thị tên người dùng, Role Badge (Admin / Staff), nút Admin Hub, và nút Sign Out.

---

## 🛠️ Cấu trúc Thư mục Dự án

```
Assignment 2 - Official/
├── TaskManagementDB_assignment2.sql     # Script SQL tạo schema assignment2 & seed dữ liệu x10-15
├── QE190061_PRN232_Ass2_BE/             # Backend Solution (.NET 8/10 Web API)
│   ├── QE190061_PRN232_Ass2_BE.sln
│   ├── TaskTrack.API/                  # Controllers (Auth, Accounts, Depts, Projs, Tasks, Tags)
│   ├── TaskTrack.Service/              # Business logic, BCrypt & JWT Token Generator
│   ├── TaskTrack.Repo/                 # EF Core DbContext (Schema assignment2) & Repositories
│   └── .env                            # Supabase Connection String & JWT_SECRET
└── QE190061_PRN232_Ass2_FE/             # Frontend Application (Vite + React 19 + TypeScript)
    ├── src/
    │   ├── context/AuthContext.tsx     # Quản lý authentication state & token
    │   ├── components/ProtectedRoute.tsx # Route guard cho /admin và Admin role
    │   ├── pages/Login.tsx             # Form đăng nhập + demo fast fill
    │   ├── pages/Register.tsx          # Form đăng ký Staff + validation
    │   ├── pages/AdminDashboard.tsx    # Dashboard thống kê tổng quan
    │   ├── pages/AccountList.tsx       # Quản trị tài khoản (Admin Only)
    │   └── services/api.ts             # Axios instance với JWT Bearer interceptor
    └── package.json
```

---

## 🧪 Hướng dẫn Chạy Thử Tại Local

### 1. Backend API
```bash
cd QE190061_PRN232_Ass2_BE
dotnet restore
dotnet run --project TaskTrack.API
```
- Swagger UI sẽ khả dụng tại: `http://localhost:5000/swagger`
- Bạn có thể bấm nút **Authorize** ở góc phải trên Swagger và dán token dạng: `Bearer <token>` để kiểm thử trực tiếp!

### 2. Frontend Web App
```bash
cd QE190061_PRN232_Ass2_FE
npm install
npm run dev
```
- Truy cập trình duyệt: `http://localhost:5173/`
