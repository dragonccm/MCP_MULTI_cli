Xây dựng Landing Page doanh nghiệp hoàn chỉnh, production-ready cho WTF DEV bằng Next.js.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## 1. THÔNG TIN CÔNG TY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Tên công ty : WTF DEV
Slogan      : "We Turn Fantasy into Dev" — Biến ý tưởng thành sản phẩm công nghệ
Định vị     : Đối tác công nghệ & tự động hoá toàn diện cho doanh nghiệp SME tại Việt Nam
Đối tượng   : Chủ doanh nghiệp, Marketing Manager, Operations Manager muốn tự động hoá
              quy trình, giảm chi phí nhân sự, tăng tốc độ vận hành

Dịch vụ chính (5 dịch vụ):
  1. AUTO MARKETING POST
     Tự động lên lịch và đăng bài đồng thời lên Facebook, Instagram, TikTok, LinkedIn.
     AI viết caption, chọn hashtag, tối ưu giờ đăng theo thuật toán từng nền tảng.
     Tiết kiệm 90% thời gian quản lý content.

  2. N8N WORKFLOW AUTOMATION
     Thiết kế và triển khai luồng tự động hoá nghiệp vụ với n8n — kết nối mọi app,
     mọi API không cần code. CRM, email, Slack, Google Sheets, webhook, database —
     tất cả chạy tự động 24/7 không cần nhân sự giám sát.

  3. AI WEB & UI DESIGN
     Thiết kế website và giao diện ứng dụng bằng AI-assisted workflow.
     Từ wireframe đến bản thiết kế Figma hoàn chỉnh trong 48 giờ.
     Landing page, dashboard, mobile app UI — tốc độ gấp 5 lần quy trình truyền thống.

  4. TEXT TO SPEECH (TTS)
     Chuyển đổi văn bản thành giọng nói tự nhiên, đa ngôn ngữ, đa giọng đọc.
     Phục vụ: video marketing, podcast, e-learning, IVR tổng đài tự động.
     Hỗ trợ tiếng Việt giọng Nam - Bắc, tiếng Anh, và 30+ ngôn ngữ khác.

  5. MULTI-CHANNEL ADS
     Lập chiến lược và chạy quảng cáo đồng thời trên Facebook Ads, Google Ads,
     TikTok Ads, Zalo Ads. Tối ưu ngân sách tự động bằng AI bidding.
     Báo cáo realtime, ROAS minh bạch, không phí ẩn.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## 2. TECH STACK & CẤU TRÚC DỰ ÁN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Framework   : Next.js 14, App Router
Language    : TypeScript
Styling     : Tailwind CSS v3
Animations  : Framer Motion
Icons       : lucide-react
Font        : next/font/google — Inter

Cấu trúc thư mục:
  src/
  ├── app/
  │   ├── layout.tsx          # Root layout — font, metadata, global styles
  │   ├── page.tsx            # Home page — import và sắp xếp các sections
  │   └── globals.css         # Tailwind directives + CSS variables + custom utilities
  ├── components/
  │   ├── layout/
  │   │   ├── Navbar.tsx
  │   │   └── Footer.tsx
  │   └── sections/
  │       ├── Hero.tsx
  │       ├── Services.tsx
  │       ├── Stats.tsx
  │       ├── WhyUs.tsx
  │       ├── HowItWorks.tsx
  │       ├── Testimonials.tsx
  │       └── CTABanner.tsx
  └── lib/
      └── constants.ts        # Data tĩnh: services, stats, testimonials, nav links

Mỗi component là một Server Component trừ khi cần animation
(Framer Motion components đánh dấu 'use client' riêng biệt)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## 3. PHONG CÁCH THIẾT KẾ
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Aesthetic     : Dark Tech — sang trọng, mạnh mẽ, cutting-edge
Cảm giác      : Như trang web của một AI startup tầm Vercel, Linear, hoặc Framer

Màu sắc (định nghĩa trong tailwind.config.ts):
  background  : #0A0A0F
  surface     : #0F0F1A
  card        : #13131F
  purple      : #7C3AED
  cyan        : #06B6D4
  pink        : #EC4899
  text        : #F8FAFC
  muted       : #94A3B8
  border      : rgba(255,255,255,0.08)

Visual Effects:
  - Animated gradient mesh background ở Hero (CSS keyframes trong globals.css)
  - Glassmorphism cards: bg-white/5 backdrop-blur-md border border-white/10
  - Gradient text trên headline: bg-gradient-to-r from-purple to-cyan bg-clip-text
  - Glow button: shadow-[0_0_30px_rgba(124,58,237,0.5)] hover tăng intensity
  - Framer Motion: fade-in + slide-up khi scroll vào viewport (stagger children)
  - Hover card: whileHover={{ y: -4 }} + border glow transition

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## 4. CẤU TRÚC SECTIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### NAVBAR
- Logo: "WTF DEV" — chữ "DEV" màu gradient purple→cyan
- Links: Dịch vụ | Tại sao chúng tôi | Quy trình | Liên hệ (smooth scroll đến section id)
- CTA button: "Nhận tư vấn miễn phí" — filled gradient, glow
- Sticky + backdrop-blur-md khi scroll, border-bottom xuất hiện sau 50px
- Mobile: Sheet menu từ phải, đóng khi click link

### HERO
Headline (gradient text, text-5xl → text-7xl):
  "Tự động hoá doanh nghiệp của bạn
   với sức mạnh của AI"

Subheadline (text-muted, max-w-2xl):
  "WTF DEV giúp bạn loại bỏ công việc thủ công, tăng tốc vận hành
   và bùng nổ doanh thu — bằng công nghệ tự động hoá thực chiến."

Social proof bar (flex, gap, text-sm, text-muted):
  ✦ 200+ dự án đã triển khai  ✦ 50+ doanh nghiệp tin dùng  ✦ Tiết kiệm TB 80% thời gian

2 CTA:
  Primary  : "Bắt đầu ngay hôm nay" — gradient bg-purple, glow shadow
  Secondary: "Xem demo thực tế →"   — variant outline, hover fill

Background: CSS animated gradient mesh + Framer Motion floating shapes

### SERVICES
Section title : "Giải pháp toàn diện cho doanh nghiệp hiện đại"
Section sub   : "Từ marketing đến vận hành — chúng tôi tự động hoá tất cả"

5 service cards (grid-cols-1 md:grid-cols-2 lg:grid-cols-3, card 5 span full trên lg):
  Mỗi card: lucide-react icon + tên dịch vụ + mô tả 2 dòng + badge "AI-Powered" hoặc "24/7"
  Glassmorphism + Framer Motion stagger fade-in + hover glow border

### STATS
4 số liệu trên nền gradient full-width:
  200+  Dự án triển khai
  80%   Tiết kiệm thời gian vận hành
  50+   Doanh nghiệp đang dùng
  24/7  Hệ thống hoạt động liên tục

Framer Motion: số đếm từ 0 lên khi scroll vào (useCountUp hook đơn giản)

### WHY US
Title: "Tại sao doanh nghiệp chọn WTF DEV?"

4 điểm (grid 2x2):
  ⚡ Triển khai nhanh       — Go-live trong 3–7 ngày làm việc
  🤖 AI-Native từ đầu      — AI là lõi, không phải tính năng thêm vào
  📊 Đo lường minh bạch    — Dashboard realtime, báo cáo tự động
  🔧 Hỗ trợ sau triển khai — Support 24/5, SLA cam kết rõ ràng

### HOW IT WORKS
Title: "Bắt đầu chỉ với 3 bước"

Bước 1 — Tư vấn miễn phí (30 phút)
  Phân tích quy trình, xác định điểm đau, đề xuất giải pháp phù hợp — không cam kết

Bước 2 — Thiết kế & Triển khai
  Build solution, test kỹ lưỡng, go-live với đầy đủ tài liệu bàn giao

Bước 3 — Vận hành & Tối ưu
  Hệ thống tự chạy 24/7, WTF DEV theo dõi và tối ưu liên tục theo data thực tế

Layout: Horizontal timeline (hidden connector line dashed) desktop, vertical mobile

### TESTIMONIALS
Title: "Doanh nghiệp nói gì về WTF DEV"

3 testimonial cards (glassmorphism):
  1. "Trước đây team tốn 3 tiếng/ngày chỉ để đăng bài. Sau khi dùng WTF DEV,
     mọi thứ tự động — team tập trung vào chiến lược thay vì thao tác thủ công."
     — Nguyễn Minh Tuấn, Marketing Director

  2. "Workflow n8n kết nối CRM, kế toán và kho hàng. Đơn hàng từ web tự động
     cập nhật vào mọi hệ thống, không nhập tay, không sai sót."
     — Trần Thị Lan, COO

  3. "Chi phí ads giảm 35% trong khi lead tăng gấp đôi sau 2 tháng.
     Họ hiểu data và biết tối ưu thật sự, không chỉ báo cáo đẹp."
     — Lê Văn Đức, CEO

### CTA BANNER
Headline  : "Sẵn sàng tự động hoá doanh nghiệp của bạn?"
Subtext   : "Tư vấn miễn phí 30 phút — không cam kết, không áp lực"
Button    : "Đặt lịch tư vấn ngay"
Contact   : "contact@wtfdev.vn  |  0909 xxx xxx"

### FOOTER
- Logo + tagline
- 3 cột: Dịch vụ | Công ty | Liên hệ
- Social icons (SVG lucide): Facebook, LinkedIn, TikTok, Github
- "© 2026 WTF DEV. All rights reserved."
- "Built with ❤️ and AI in Vietnam 🇻🇳"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## 5. YÊU CẦU KỸ THUẬT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

- tailwind.config.ts phải định nghĩa đầy đủ custom colors, fontFamily, boxShadow
- globals.css: @tailwind directives + CSS variables + .gradient-text utility + keyframes mesh
- Metadata đầy đủ trong layout.tsx: title, description, openGraph, themeColor
- Tất cả data (services, stats, testimonials, navLinks) tập trung trong lib/constants.ts
- Không hardcode string nội dung trực tiếp vào JSX
- Framer Motion chỉ dùng trong 'use client' components, không ảnh hưởng SSR
- Hình ảnh: không dùng ảnh thật — thay bằng div CSS gradient placeholder
- Responsive đầy đủ: 375px / 768px / 1280px / 1536px
- Không có lỗi TypeScript, không dùng any
- Tất cả section có id để smooth scroll từ navbar hoạt động

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## 6. TONE OF VOICE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

- Ngắn gọn, mạnh — mỗi câu phải có giá trị, không vòng vo
- Dùng con số thay tính từ: "80% thời gian" thay vì "rất nhiều thời gian"
- Bám vào pain point: tốn thời gian, thiếu nhân lực, khó scale, chi phí cao
- Không buzzword sáo rỗng: "đẳng cấp", "chuyên nghiệp", "uy tín", "chất lượng"
- CTA rõ hành động: "Đặt lịch", "Xem demo", "Bắt đầu ngay"
- Toàn bộ copy tiếng Việt, không Việt-Anh lẫn lộn (trừ tên thương hiệu và thuật ngữ kỹ thuật)