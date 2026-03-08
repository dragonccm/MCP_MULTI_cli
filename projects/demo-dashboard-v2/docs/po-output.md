MCP issues detected. Run /mcp list for status.I will read the instructions from the specified temporary file.
# 👑 Product Owner Specs: Personal Expense Manager (PEM)

## 1. Tổng quan & Business Objectives
- **Mục tiêu**: Xây dựng ứng dụng web giúp cá nhân quản lý tài chính, ghi chép thu nhập và chi tiêu hàng ngày một cách nhanh chóng và trực quan.
- **Bối cảnh**: Người dùng cần một công cụ đơn giản để biết tiền của mình đã chi vào việc gì, từ đó tối ưu hóa kế hoạch tài chính cá nhân.
- **Vấn đề giải quyết**: Thay thế việc ghi chép thủ công trên giấy hoặc Excel phức tạp, cung cấp biểu đồ trực quan để theo dõi xu hướng chi tiêu.

## 2. Tech Stack Definition (CRITICAL)
- **Frontend**: **React (Vite)** + **TypeScript** + **Tailwind CSS**. Thư viện UI: **ShadcnUI** (hoặc Radix UI), Biểu đồ: **Recharts**. Quản lý state: **React Query** (TanStack Query) & **Zustand**.
- **Backend**: **Node.js** + **Express** + **TypeScript**. Authentication: **JWT** (JSON Web Token).
- **Database**: **PostgreSQL** + **Prisma ORM**.

## 3. Data Models / Database Schema
### Entity: User
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | UUID | Yes | Primary key |
| email | String | Yes | Unique, for login |
| password | String | Yes | Hashed password |
| name | String | Yes | User display name |
| createdAt | DateTime | Yes | Timestamp |

### Entity: Category
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | UUID | Yes | Primary key |
| name | String | Yes | Name of category (e.g., Food, Salary) |
| type | Enum | Yes | INCOME or EXPENSE |
| userId | UUID | Yes | Foreign key to User |

### Entity: Transaction
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | UUID | Yes | Primary key |
| amount | Decimal | Yes | Amount of money |
| description| String | No | Note for the transaction |
| date | DateTime | Yes | When the transaction occurred |
| categoryId | UUID | Yes | Foreign key to Category |
| userId | UUID | Yes | Foreign key to User |

**Relationships:**
- **User** → hasMany → **Category**
- **User** → hasMany → **Transaction**
- **Category** → hasMany → **Transaction**

## 4. API / System Flow Specifications
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Đăng ký người dùng mới | No |
| POST | `/api/auth/login` | Đăng nhập lấy JWT | No |
| GET | `/api/categories` | Lấy danh sách danh mục của User | Yes |
| POST | `/api/categories` | Tạo danh mục mới | Yes |
| GET | `/api/transactions` | Lấy danh sách giao dịch (có query filter) | Yes |
| POST | `/api/transactions` | Tạo giao dịch mới (thu/chi) | Yes |
| PUT | `/api/transactions/:id` | Cập nhật thông tin giao dịch | Yes |
| DELETE | `/api/transactions/:id` | Xóa giao dịch | Yes |
| GET | `/api/stats/summary` | Lấy tổng thu, tổng chi, số dư hiện tại | Yes |
| GET | `/api/stats/chart` | Lấy dữ liệu chi tiêu theo danh mục cho biểu đồ | Yes |

## 5. User Stories & Priority
### Epic: Quản lý tài khoản & Xác thực
#### Story: Đăng ký & Đăng nhập (Priority: P0)
- **As a** user, **I want** to create an account and log in.
- **So that** my financial data is kept private and synced across devices.
- **Acceptance:** Validates email, hashes password, returns JWT on successful login.

### Epic: Quản lý giao dịch
#### Story: Ghi chép thu chi (Priority: P0)
- **As a** user, **I want** to add my daily expenses and income.
- **So that** I don't forget where my money went.
- **Acceptance:** User can select category, amount, date, and add a note.

#### Story: Lịch sử giao dịch (Priority: P0)
- **As a** user, **I want** to see a list of my recent transactions.
- **So that** I can review my spending habits.
- **Acceptance:** Display transactions in chronological order with filtering by month/year.

### Epic: Báo cáo & Thống kê
#### Story: Dashboard tổng quan (Priority: P1)
- **As a** user, **I want** to see a summary of my financial health on a dashboard.
- **So that** I can quickly see my balance and top spending categories.
- **Acceptance:** Shows Total Income, Total Expense, Net Balance, and a Pie Chart of spending by category.

## 6. Dynamic Sub-agent Delegation Plan
Dựa vào kiến trúc bên trên, dự án sẽ được phân chia cho 2 Sub-agents chuyên biệt:

```json
[
  { 
    "id": "backend_api", 
    "name": "Backend API Developer", 
    "focus": "Thiết lập Express server với TypeScript, Prisma ORM kết nối PostgreSQL. Triển khai JWT Auth middleware, các API controllers cho User, Category và Transaction. Đảm bảo validate dữ liệu chặt chẽ."
  },
  { 
    "id": "ui_dev", 
    "name": "Frontend Developer", 
    "focus": "Xây dựng giao diện React bằng Vite và Tailwind CSS. Thiết lập React Query để quản lý server state. Code các màn hình Dashboard (với Recharts), Transaction List, và Form thêm/sửa giao dịch. Đảm bảo UI Responsive."
  }
]
```

## APPROVED ✅