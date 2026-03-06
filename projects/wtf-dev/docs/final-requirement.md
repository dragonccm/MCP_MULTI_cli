I will read the instructions from the specified file to understand the tasks I need to perform.
I will check the existing documentation in the `docs/` folder to see if there are any details about the database or other project requirements that have already been defined.
I'll read `final-requirement.md` to see if the project summary has already been documented.
I'll check the `.env` file to see if there are any details about the database connection or other configurations.
I'll read `docs/prd.md` to see if it provides any more context about the database or other project requirements.
I'll read the `docs/prd.md` file again, ensuring I get the full content to understand the project requirements.
I'll read `docs/ba-output.md` to see if it contains any detailed requirements or business analysis that could inform my summary.
Dựa trên trao đổi, tôi xin tóm tắt lại yêu cầu cuối cùng cho dự án **WTF (Where's The Finance?)** để đội ngũ bắt đầu triển khai:

# 🎯 FINAL REQUIREMENT: WTF (Where's The Finance?)

## 1. Mục tiêu
Xây dựng ứng dụng di động quản lý tài chính cá nhân đa nền tảng (tiền mặt, tiền ảo, cổ phiếu, nợ) với trải nghiệm người dùng hiện đại và giao diện ấn tượng.

## 2. Tính năng chính
- **Quản lý tài sản đa dạng:** Theo dõi số dư tiền mặt, tài sản ảo (crypto), danh mục cổ phiếu và các khoản nợ.
- **Giao diện Refined Light Brutalism:** Thiết kế theo phong cách Brutalism nhẹ nhàng, tinh tế, tạo sự khác biệt và chuyên nghiệp.
- **Tập trung vào Giao diện (UI-First):** Giai đoạn này tập trung hoàn thiện bộ UI/UX, chưa cần tích hợp sâu các cổng thanh toán hay Auto-sync từ OpenClaw.
- **Thông tin thị trường:** Sử dụng các nguồn API miễn phí hoặc tích hợp Web Search để cập nhật tin tức về chứng khoán/tiền ảo cho người dùng.
- **Luồng dữ liệu đơn giản:** Người dùng chủ yếu nhập liệu thủ công để quản lý, AI sẽ đóng vai trò hỗ trợ hiển thị hoặc tư vấn cơ bản (nếu có trong phase sau).

## 3. Tech Stack Require
- **Frontend:** React Native (Expo) - Cần chú ý tương thích phiên bản.
- **Backend:** Node.js (Express).
- **Database:** SQLite (thông qua Prisma) để quản lý dữ liệu local/dev hiệu quả.
- **Design:** Refined Light Brutalism.

[ACTION: PROCEED_TO_PM]