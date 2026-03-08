# giúp tôi viết content cho website landingpage + bán hàng cho côgn ty wtfdev có cung cấp các dịch vụ automation như n8n các flow chat bot tư vấn luật, tư vấn bất động sản, tự động upload bài viết lên facebook, tự động upload bài viết lên tiktok, cung cấp dịch vụ setup openclaw và custom openclaw,  marketing tự động, cung cấp agentic coding agent và trang web phải cung cấp luôn khả năng mua trực tiếp trên web có trang admin luôn giúp tôi viết một yêu cầu làm web

Dưới đây là một bản **yêu cầu chi tiết để thuê làm web landing page + bán hàng cho công ty WTFDev**, bạn có thể gửi thẳng cho dev hoặc agency.

***

### YÊU CẦU PHÁT TRIỂN WEBSITE LANDINGPAGE + BÁN HÀNG CHO WTFDEV

#### 1. Tổng quan dự án

- **Mục tiêu website**:
    - Trang landing page giới thiệu công ty **WTFDev** và các dịch vụ automation.
    - Cho phép **khách hàng mua trực tiếp** các gói dịch vụ trên website (checkout, thanh toán online).
    - Có **trang admin quản trị** để quản lý: sản phẩm, đơn hàng, khách hàng, nội dung trang web.
- **Công nghệ gợi ý** (có thể thay đổi):
    - Frontend: React / Next.js hoặc Vue với UI hiện đại, responsive.
    - Backend + admin: NestJS, Supabase hoặc Laravel, kèm dashboard admin (hoặc dùng nền tảng như Directus, Strapi nếu client muốn đơn giản).
    - Thanh toán: Tích hợp VNPay, Momo, Stripe (tùy thị trường).

***

#### 2. Yêu cầu về chức năng website

**1. Trang chủ (Landing page)**

- Giảm thiệu ngắn về WTFDev:
    - Là công ty chuyên về **automation, AI và workflow**.
    - Khách hàng: doanh nghiệp, luật sư, môi giới bất động sản, nhà sáng tạo nội dung, marketer.
- Hiển thị rõ:
    - Ảnh/Video banner chuyên nghiệp.
    - Call‑to‑action (CTA) rõ ràng: “Dùng thử / Báo giá / Liên hệ tư vấn”.

**2. Giới thiệu dịch vụ (Các gói / sản phẩm)**
Các dịch vụ chính của WTFDev cần hiển thị dưới dạng **gói sản phẩm có thể mua trực tiếp**:

- **Tư vấn luật bằng chatbot automation**
    - Dùng n8n / workflow tự động trả lời câu hỏi luật cơ bản, phân loại yêu cầu, gửi form cho luật sư.
- **Tư vấn bất động sản bằng chatbot**
    - Chatbot tự động gợi ý sản phẩm, so sánh, hẹn lịch xem nhà, lưu lead.
- **Tự động upload bài viết lên Facebook / TikTok**
    - Quản lý nội dung, lịch đăng, tự động đăng bài theo template.
- **Setup OpenClaw và custom OpenClaw**
    - Cài đặt, cấu hình OpenClaw cho doanh nghiệp, tùy chỉnh workflow theo nhu cầu.
- **Marketing tự động (automation marketing)**
    - Gửi email, SMS, Zalo, chatbot theo hành vi khách hàng.
- **Agentic coding agent**
    - Agent hỗ trợ lập trình, tự động hóa phần việc lặp lại trong dev (generate code, bug fix, review…).

Mỗi dịch vụ cần:

- Mô tả ngắn gọn, rõ lợi ích cho khách hàng.
- Bảng giá (hoặc nút “Yêu cầu báo giá”).
- Nút **“Mua ngay / Thêm vào giỏ hàng”** nếu là gói đã cố định.

**3. Chức năng bán hàng \& giỏ hàng**

- Hiển thị **gói dịch vụ** (có thể theo tháng / theo dự án).
- Giỏ hàng:
    - Thêm/xóa gói dịch vụ.
    - Hiển thị tổng giá, thuế (nếu có).
- Thanh toán:
    - Form thông tin khách hàng (tên, email, phone, doanh nghiệp).
    - Chọn phương thức thanh toán (VNPay, Momo, chuyển khoản, Stripe…).
    - Xử lý thanh toán online, hiển thị **trạng thái thanh toán** (thành công / thất bại).
- Sau khi mua:
    - Gửi email xác nhận đơn hàng.
    - Có thể tạo **ticket / yêu cầu hỗ trợ setup** tự động.

**4. Trang admin / Backend**
Trang admin cần hỗ trợ:

- Quản lý sản phẩm/dịch vụ:
    - Thêm, sửa, xóa gói dịch vụ.
    - Đặt giá, mô tả, thời gian, điều kiện sử dụng.
- Quản lý đơn hàng:
    - Xem danh sách đơn hàng, trạng thái (chờ thanh toán, đã thanh toán, hoàn thành, hủy).
    - Xem chi tiết từng đơn (khách hàng, dịch vụ, giá, thời gian).
- Quản lý khách hàng:
    - Danh sách khách hàng, lịch sử mua hàng.
- Quản lý nội dung trang web:
    - Sửa nội dung banner, giới thiệu, dịch vụ, FAQ…
    - (Tùy chọn) Có thể thêm blog / case study.

**5. Tính năng phụ trợ**

- FAQ / Hỏi đáp:
    - “Automation là gì?”, “Có cần kiến thức kỹ thuật không?”, “Cam kết hỗ trợ sau mua?”.
- Liên hệ:
    - Form liên hệ, Zalo, Telegram, email.
- Embed chatbot hỗ trợ (có thể là chatbot tự động hỏi nhu cầu khách hàng).
- Tối ưu SEO cơ bản: meta title, meta description, heading cấu trúc rõ ràng.

***

#### 3. Thiết kế \& trải nghiệm người dùng (UX/UI)

- Thiết kế hiện đại, tối giản, phù hợp với đối tượng **doanh nghiệp / startup / freelancer**.
- Responsive: hiển thị tốt trên di động, tablet, desktop.
- Tốc độ tải trang nhanh, tối ưu hình ảnh.
- Màu sắc gợi ý: xanh công nghệ, đen trắng, kèm accent màu nổi bật (ví dụ: xanh dương hoặc cam).

***

#### 4. Yêu cầu khác

- Website **hoàn chỉnh trong 1 hệ thống**:
    - Landing page + giỏ hàng + thanh toán + admin panel.
- Git / hệ thống quản lý mã nguồn rõ ràng (GitHub / GitLab).
- Tài liệu hướng dẫn:
    - Cách thêm gói dịch vụ mới.
    - Cách xem đơn hàng, quản lý khách hàng.
- Hỗ trợ cơ bản sau khi bàn giao (ví dụ 1–2 tuần bug fix).

***

Bạn có thể gửi thêm yêu cầu cụ thể như:

> “Tôi muốn giao website dùng Next.js + Supabase, thanh toán VNPay, và admin dùng React + Tailwind.”

***

Nếu bạn muốn, mình có thể **viết luôn nội dung (copy) cho từng phần trang landing page** (banner, giới thiệu dịch vụ, call‑to‑action, FAQ) bằng tiếng Việt, phù hợp với tone hiện đại cho startup tech. Bạn muốn nội dung website theo tone **chuyên nghiệp, dân dã, hay “hơi quậy” đúng với chữ “WTFDev”**?

