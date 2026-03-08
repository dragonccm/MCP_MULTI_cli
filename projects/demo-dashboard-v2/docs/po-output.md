MCP issues detected. Run /mcp list for status.I will read the instructions from the specified file to understand the tasks I need to perform.
# 👑 Product Owner Specs: Personal Expense Manager (PEM)

## 1. Tổng quan & Business Objectives
Dự án PEM nhằm giải quyết vấn đề quản lý tài chính cá nhân không hiệu quả, giúp người dùng theo dõi thu nhập/chi tiêu hàng ngày, thiết lập ngân sách và xem báo cáo trực quan để tối ưu hóa thói quen tiêu dùng.

## 2. Tech Stack Definition (CRITICAL)
- **Frontend**: **React Native (Expo)**, TypeScript, Nativewind (Styling), React Navigation, Axios, TanStack Query.
- **Backend**: **Node.js (Express JS)**, TypeScript, Prisma ORM, JWT Authentication.
- **Database**: **PostgreSQL (Neon DB)**.

## 3. Data Models / Database Schema
### Entity: User
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | UUID | Yes | Primary key |
| email | String | Yes | Unique email |
| password | String | Yes | Hashed password |
| name | String | Yes | Display name |

### Entity: Category
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | UUID | Yes | Primary key |
| name | String | Yes | Category name (e.g., Food, Salary) |
| type | Enum | Yes | INCOME / EXPENSE |
| icon | String | No | Icon identifier |
| userId | UUID | Yes | Relation to User |

### Entity: Transaction
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | UUID | Yes | Primary key |
| amount | Decimal| Yes | Amount of money |
| note | String | No | Description |
| date | DateTime| Yes | Transaction date |
| categoryId| UUID | Yes | Relation to Category |
| userId | UUID | Yes | Relation to User |

**Relationships:**
- **User** → hasMany → **Category**
- **User** → hasMany → **Transaction**
- **Category** → hasMany → **Transaction**

## 4. API / System Flow Specifications
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /api/auth/register | Đăng ký người dùng | No |
| POST | /api/auth/login | Đăng nhập nhận JWT | No |
| GET | /api/categories | Lấy danh sách danh mục | Yes |
| POST | /api/categories | Tạo danh mục mới | Yes |
| GET | /api/transactions | Lấy lịch sử giao dịch (có filter) | Yes |
| POST | /api/transactions | Thêm giao dịch mới | Yes |
| GET | /api/dashboard/stats| Thống kê tổng quan thu/chi | Yes |

## 5. Kiến Trúc & Folder Structure (BẮT BUỘC)
**Architectural Pattern:** **Controller-Service-Repository** cho Backend để đảm bảo tách biệt logic nghiệp vụ và truy vấn DB. Frontend sử dụng **Feature-based structure**.

**Cấu trúc thư mục cốt lõi (Core Folder Structure):**
```text
/pem-backend
  /src
    /controllers    # Xử lý Request/Response
    /services       # Business Logic
    /repositories   # Database interactions (Prisma)
    /routes         # API routes definition
    /middlewares    # Auth, Validation
    /utils
/pem-mobile
  /src
    /api            # Axios instances & services
    /components     # Common UI components
    /features       # Modules (Auth, Transactions, Dashboard)
    /hooks          # Custom hooks
    /navigation     # React Navigation config
    /store          # State management (Zustand/Redux)
```

## 6. User Stories & Priority
### Epic: Quản lý Giao dịch
#### Story: Thêm giao dịch (Priority: P0)
- **As a** user, **I want** to log a new expense or income
- **So that** I can keep track of my spending history.
- **Acceptance:** Phải chọn được danh mục, nhập số tiền > 0, và lưu vào database chính xác theo userId.

### Epic: Thống kê & Báo cáo
#### Story: Xem Dashboard (Priority: P1)
- **As a** user, **I want** to see total income and total expense of the month.
- **So that** I can quickly understand my financial status.
- **Acceptance:** Hiển thị số dư hiện tại, biểu đồ thu chi cơ bản.

## 7. Dynamic Sub-agent Delegation Plan
```json
[
  { 
    "id": "backend_api", 
    "name": "Backend API Developer", 
    "focus": "Xây dựng Express server với TypeScript, thiết lập Prisma với Neon PostgreSQL, triển khai JWT Auth và các API CRUD Giao dịch/Danh mục."
  },
  { 
    "id": "mobile_ui", 
    "name": "Mobile App Developer", 
    "focus": "Phát triển giao diện React Native Expo, thiết lập Navigation, tích hợp API, quản lý State và xử lý logic hiển thị Dashboard/Lịch sử."
  }
]
```

## APPROVED ✅