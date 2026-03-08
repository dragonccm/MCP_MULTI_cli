# 👑 Product Owner Specs: WTFDev Automation Commerce Platform

## 1. Tổng quan & Business Objectives
WTFDev cần 1 hệ thống thống nhất: landing page + bán gói dịch vụ automation + admin vận hành.

Business objectives (MVP 90 ngày):
- Tạo kênh bán trực tiếp dịch vụ automation, giảm phụ thuộc inbox thủ công.
- Chuẩn hóa quy trình báo giá, thanh toán, tạo ticket triển khai sau mua.
- Cho team nội bộ tự quản lý dịch vụ, đơn hàng, nội dung web không cần dev can thiệp hằng ngày.

KPIs:
- CR landing → checkout >= 3.5%.
- Tỷ lệ thanh toán thành công >= 85% đơn tạo.
- 60% đơn mới tạo ticket setup trong 24h.
- Admin cập nhật nội dung/dịch vụ < 10 phút/lần.
- SEO: 10 từ khóa dịch vụ chính vào top 20 trong 4-6 tháng.

Personas:
- Chủ doanh nghiệp SME: muốn tự động hóa marketing/sales nhanh, ít kỹ thuật.
- Luật sư/văn phòng luật: cần chatbot lọc câu hỏi và lead hợp lệ.
- Môi giới/agency BĐS: cần chatbot tư vấn + hẹn lịch + lưu lead.
- Content team/marketer: cần auto đăng FB/TikTok theo lịch/template.
- CTO/Tech lead: cần setup/custom OpenClaw, agentic coding để tăng velocity.

Core features (MVP):
- Landing page giới thiệu dịch vụ + CTA mạnh.
- Catalog dịch vụ dạng gói mua được.
- Cart + checkout + thanh toán online.
- Email xác nhận + tạo ticket hỗ trợ setup sau mua.
- Admin quản trị dịch vụ, đơn hàng, khách hàng, nội dung trang, FAQ.

## 2. Tech Stack Definition (CRITICAL)
- **Frontend**: Next.js 14 (React 18, TypeScript, Tailwind CSS, App Router)
- **Backend**: NestJS 11 (TypeScript, REST API, Prisma ORM, JWT auth)
- **Database**: PostgreSQL 16

Scope kỹ thuật bắt buộc:
- Monorepo: `apps/web` (Next.js), `apps/api` (NestJS), `packages/shared`.
- Thanh toán MVP: VNPay (online) + chuyển khoản thủ công (manual confirm).
- Email: SMTP transactional (order confirmation, ticket notification).

## 3. Data Models / Database Schema
### Entity: users
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | UUID | Yes | Primary key |
| email | VARCHAR(255) UNIQUE | Yes | Login/notification email |
| password_hash | VARCHAR(255) | Yes | Hashed password |
| full_name | VARCHAR(120) | Yes | User name |
| phone | VARCHAR(30) | No | Contact number |
| role | ENUM(admin,customer) | Yes | Access control |
| created_at | TIMESTAMP | Yes | Created time |
| updated_at | TIMESTAMP | Yes | Updated time |

### Entity: service_packages
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | UUID | Yes | Primary key |
| slug | VARCHAR(120) UNIQUE | Yes | SEO URL |
| name | VARCHAR(180) | Yes | Package name |
| short_desc | TEXT | Yes | Short description |
| price_vnd | BIGINT | Yes | Base price |
| billing_type | ENUM(monthly,project) | Yes | Pricing model |
| is_active | BOOLEAN | Yes | Sellable status |
| created_at | TIMESTAMP | Yes | Created time |
| updated_at | TIMESTAMP | Yes | Updated time |

### Entity: orders
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | UUID | Yes | Primary key |
| order_code | VARCHAR(40) UNIQUE | Yes | Human-readable code |
| customer_id | UUID FK(users.id) | Yes | Buyer |
| subtotal_vnd | BIGINT | Yes | Sum item prices |
| tax_vnd | BIGINT | Yes | Tax amount |
| total_vnd | BIGINT | Yes | Final amount |
| status | ENUM(pending,paid,failed,cancelled,completed) | Yes | Order lifecycle |
| payment_method | ENUM(vnpay,bank_transfer) | Yes | Selected method |
| created_at | TIMESTAMP | Yes | Created time |
| updated_at | TIMESTAMP | Yes | Updated time |

### Entity: order_items
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | UUID | Yes | Primary key |
| order_id | UUID FK(orders.id) | Yes | Parent order |
| service_package_id | UUID FK(service_packages.id) | Yes | Purchased package |
| quantity | INT | Yes | Quantity |
| unit_price_vnd | BIGINT | Yes | Snapshot price |
| line_total_vnd | BIGINT | Yes | unit * qty |

### Entity: payments
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | UUID | Yes | Primary key |
| order_id | UUID FK(orders.id) | Yes | Related order |
| provider | ENUM(vnpay,bank_transfer) | Yes | Gateway |
| provider_txn_id | VARCHAR(120) | No | Gateway transaction id |
| amount_vnd | BIGINT | Yes | Paid amount |
| status | ENUM(init,success,failed,pending_verify) | Yes | Payment status |
| paid_at | TIMESTAMP | No | Payment timestamp |
| raw_payload | JSONB | No | Callback/audit data |

### Entity: support_tickets
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | UUID | Yes | Primary key |
| order_id | UUID FK(orders.id) | Yes | Trigger source |
| customer_id | UUID FK(users.id) | Yes | Ticket owner |
| subject | VARCHAR(200) | Yes | Ticket title |
| description | TEXT | Yes | Need/setup request |
| status | ENUM(open,in_progress,resolved,closed) | Yes | Ticket state |
| created_at | TIMESTAMP | Yes | Created time |

### Entity: content_blocks
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | UUID | Yes | Primary key |
| key | VARCHAR(100) UNIQUE | Yes | e.g. homepage.hero |
| title | VARCHAR(200) | No | Block title |
| body | TEXT | No | Block content |
| metadata | JSONB | No | media/cta config |
| updated_by | UUID FK(users.id) | Yes | Admin editor |
| updated_at | TIMESTAMP | Yes | Last updated |

**Relationships:**
- users → hasMany → orders
- orders → hasMany → order_items
- service_packages → hasMany → order_items
- orders → hasMany → payments
- orders → hasOne → support_tickets (MVP rule: 1 ticket auto-create/order)
- users(admin) → hasMany → content_blocks (updated_by)

ERD (text):
```text
users (1) ---- (N) orders (1) ---- (N) order_items (N) ---- (1) service_packages
                    |
                    +---- (N) payments
                    |
                    +---- (1) support_tickets
users (1) ---- (N) content_blocks
```

## 4. API / System Flow Specifications
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /api/v1/auth/register | Customer register | No |
| POST | /api/v1/auth/login | Login (admin/customer) | No |
| GET | /api/v1/services | List active service packages | No |
| GET | /api/v1/services/:slug | Service package detail | No |
| POST | /api/v1/cart/preview | Validate items + pricing | No |
| POST | /api/v1/checkout | Create order from cart | No |
| POST | /api/v1/payments/vnpay/create-url | Generate VNPay payment URL | Yes (customer) |
| GET | /api/v1/payments/vnpay/callback | VNPay return URL handler | No (gateway) |
| POST | /api/v1/payments/webhook/vnpay | Verify async callback, update payment | No (gateway signature) |
| GET | /api/v1/orders/me | Customer order history | Yes (customer) |
| GET | /api/v1/orders/:id | Order detail | Yes (owner/admin) |
| POST | /api/v1/tickets/auto-create | Auto-create setup ticket after paid | Internal |
| GET | /api/v1/admin/orders | Admin list/filter orders | Yes (admin) |
| PATCH | /api/v1/admin/orders/:id/status | Update order status | Yes (admin) |
| CRUD | /api/v1/admin/services | Manage service packages | Yes (admin) |
| CRUD | /api/v1/admin/content-blocks | Manage landing content | Yes (admin) |
| GET | /api/v1/admin/customers | List customers + purchase history | Yes (admin) |
| GET | /api/v1/admin/dashboard/kpis | Revenue, conversion, payment stats | Yes (admin) |

Core flow:
1. User vào landing page -> xem dịch vụ -> thêm giỏ.
2. Checkout tạo `order` + `order_items` trạng thái `pending`.
3. User thanh toán VNPay -> callback/webhook xác thực -> `payments.status=success`, `orders.status=paid`.
4. Hệ thống gửi email xác nhận + tự tạo `support_ticket`.
5. Admin xử lý ticket và cập nhật trạng thái đơn tới `completed`.

## 5. Kiến Trúc & Folder Structure (BẮT BUỘC)
**Architectural Pattern:** Clean Architecture + Modular Monolith (Controller-Service-Repository)  
Luồng tầng: `Controller (HTTP)` -> `Application Service (use-case)` -> `Domain/Repository Interface` -> `Prisma Repository`.  
Frontend dùng feature-based modules, gọi API qua typed client, tránh logic business nằm trong UI component.

**Cấu trúc thư mục cốt lõi (Core Folder Structure):**
```text
/apps
  /web
    /src
      /app
        /(public)
        /admin
        /checkout
      /features
        /landing
        /services
        /cart
        /checkout
        /admin
      /components
      /lib
      /styles
  /api
    /src
      /modules
        /auth
        /services
        /cart
        /checkout
        /payments
        /orders
        /tickets
        /admin
        /content
      /common
      /config
      /prisma
/packages
  /shared
    /types
    /constants
/docs
  /adr
  /api
```

## 6. User Stories & Priority
### Epic: Landing & Lead Conversion
#### Story: Homepage CTA chuyển đổi (Priority: P0)
- **As a** khách hàng mới, **I want** hiểu nhanh WTFDev làm gì và click CTA rõ ràng
- **So that** tôi quyết định dùng thử/mua nhanh
- **Acceptance:** hero có value prop trong 5 giây đọc; có CTA “Mua ngay” và “Yêu cầu báo giá”; Lighthouse mobile >= 80

#### Story: Trang dịch vụ chi tiết (Priority: P0)
- **As a** khách hàng, **I want** xem mô tả + giá + phạm vi triển khai từng gói
- **So that** tôi chọn đúng gói
- **Acceptance:** mỗi gói có lợi ích, deliverables, SLA cơ bản, giá theo tháng/dự án, nút thêm giỏ

### Epic: Commerce & Payment
#### Story: Giỏ hàng và checkout (Priority: P0)
- **As a** khách hàng, **I want** thêm/xóa gói và thanh toán online
- **So that** tôi mua dịch vụ trực tiếp không cần nhắn tin
- **Acceptance:** giỏ cập nhật real-time; tổng tiền chính xác; checkout lưu order pending; lỗi thanh toán hiển thị rõ

#### Story: Xử lý thanh toán VNPay (Priority: P0)
- **As a** hệ thống, **I want** xác thực callback/webhook VNPay
- **So that** trạng thái đơn hàng chính xác và chống gian lận
- **Acceptance:** verify chữ ký; giao dịch success mới chuyển paid; idempotent callback

#### Story: Hậu mua hàng tự động (Priority: P1)
- **As a** khách đã trả tiền, **I want** nhận email và ticket setup tự động
- **So that** biết bước tiếp theo để triển khai dịch vụ
- **Acceptance:** email gửi < 5 phút sau paid; ticket tạo tự động với thông tin order

### Epic: Admin Operations
#### Story: Quản trị dịch vụ (Priority: P0)
- **As a** admin, **I want** CRUD gói dịch vụ
- **So that** cập nhật catalog mà không cần sửa code
- **Acceptance:** create/update/publish/unpublish; validation giá và slug; lưu lịch sử cập nhật

#### Story: Quản trị đơn hàng và khách hàng (Priority: P0)
- **As a** admin, **I want** lọc đơn theo trạng thái và xem lịch sử mua của khách
- **So that** vận hành và chăm sóc sau bán hiệu quả
- **Acceptance:** filter theo date/status/payment; xem chi tiết order + payment + ticket; export CSV cơ bản

#### Story: Quản trị nội dung landing (Priority: P1)
- **As a** admin marketing, **I want** sửa hero/services/FAQ
- **So that** test thông điệp nhanh theo chiến dịch
- **Acceptance:** cập nhật nội dung không redeploy; preview trước publish

## 7. Dynamic Sub-agent Delegation Plan
```json
[
  {
    "id": "ui_web_dev",
    "name": "UI Web Developer",
    "focus": "Xây dựng Next.js landing page, trang dịch vụ, cart, checkout UI responsive + SEO metadata."
  },
  {
    "id": "backend_api_dev",
    "name": "Backend API Developer",
    "focus": "Phát triển NestJS modules: auth, services, orders, admin content, validation, RBAC, Swagger."
  },
  {
    "id": "payment_integration_dev",
    "name": "Payment Integration Developer",
    "focus": "Tích hợp VNPay create-url/callback/webhook, idempotency, đồng bộ trạng thái order/payment."
  },
  {
    "id": "db_schema_dev",
    "name": "Database Developer",
    "focus": "Thiết kế Prisma schema + migration PostgreSQL, index tối ưu truy vấn order/payment/admin list."
  },
  {
    "id": "admin_portal_dev",
    "name": "Admin Portal Developer",
    "focus": "Xây dashboard admin: quản lý dịch vụ, đơn hàng, khách hàng, content blocks, KPI widgets."
  },
  {
    "id": "qa_release_dev",
    "name": "QA & Release Developer",
    "focus": "Viết test API critical flow checkout-payment, smoke test UI, chuẩn bị CI/CD và checklist release."
  }
]
```

Unresolved questions:
- Chốt chính xác cổng thanh toán MVP: chỉ VNPay hay thêm Momo ngay phase 1?
- Có xuất hóa đơn VAT tự động không?
- Cần đa ngôn ngữ (VI/EN) từ MVP hay phase 2?
- Mức SLA hỗ trợ sau mua cho từng gói (giờ phản hồi, số lần chỉnh sửa) là bao nhiêu?

## APPROVED ✅
APPROVED