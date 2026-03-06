# Tài liệu Đặc tả Yêu cầu Sản phẩm (PRD) - Hệ thống Quản lý Trường Tiểu học (EduTrack Primary)

## 1. Tổng quan dự án
EduTrack Primary là một ứng dụng quản lý trường học được thiết kế dành riêng cho môi trường tiểu học, tập trung vào việc đơn giản hóa quy trình quản lý của giáo viên, theo dõi sát sao tình hình học tập và chuyên cần của học sinh, đồng thời cung cấp các báo cáo trực quan cho ban giám hiệu.

## 2. Mục tiêu sản phẩm
- Tối ưu hóa quy trình điểm danh hàng ngày.
- Cung cấp cái nhìn tổng quan về tiến độ học tập thông qua Dashboard.
- Đảm bảo tính minh bạch và tức thời trong việc báo cáo số liệu.
- Giao diện thân thiện, dễ sử dụng cho giáo viên và quản trị viên.

## 3. Đối tượng người dùng chính (Personas)
- **Giáo viên chủ nhiệm:** Người trực tiếp sử dụng app hàng ngày để điểm danh, nhập điểm và xem báo cáo lớp học.
- **Ban giám hiệu:** Theo dõi báo cáo tổng quát toàn trường.
- **Học sinh/Phụ huynh (Dashboard):** Xem kết quả học tập và thông tin chuyên cần.

## 4. Các tính năng chính (Functional Requirements)

### 4.1. Hệ thống Đăng nhập & Xác thực (Teacher Login)
- **Mô tả:** Cho phép giáo viên truy cập vào hệ thống an toàn.
- **Chi tiết:**
  - Đăng nhập bằng Email/Số điện thoại và Mật khẩu.
  - Hỗ trợ khôi phục mật khẩu qua email.
  - Phân quyền người dùng (Giáo viên, Admin).

### 4.2. Dashboard học sinh (Student Dashboard)
- **Mô tả:** Trung tâm thông tin cho từng học sinh.
- **Chi tiết:**
  - Hiển thị thông tin cá nhân (Ảnh, họ tên, lớp, mã học sinh).
  - Tóm tắt kết quả học tập (Điểm trung bình các môn).
  - Trạng thái chuyên cần trong tháng/học kỳ.
  - Thời khóa biểu hàng ngày.

### 4.3. Quản lý Điểm danh (Attendance Tracking)
- **Mô tả:** Công cụ cho giáo viên thực hiện điểm danh hàng ngày.
- **Chi tiết:**
  - Danh sách học sinh theo lớp.
  - Trạng thái: Có mặt, Vắng có phép, Vắng không phép, Đi muộn.
  - Ghi chú lý do vắng mặt.
  - Tự động gửi thông báo cho phụ huynh khi học sinh vắng mặt (Tùy chọn).

### 4.4. Hệ thống Báo cáo (Reporting)
- **Mô tả:** Tổng hợp dữ liệu để đưa ra các phân tích định kỳ.
- **Chi tiết:**
  - Báo cáo chuyên cần: Theo tuần, tháng, học kỳ của lớp và cá nhân.
  - Báo cáo học tập: Phân loại học lực học sinh, biểu đồ tăng trưởng điểm số.
  - Xuất báo cáo dưới định dạng PDF hoặc Excel.

## 5. Yêu cầu phi chức năng
- **Bảo mật:** Mã hóa dữ liệu người dùng, đảm bảo an toàn thông tin cá nhân học sinh.
- **Hiệu năng:** Thời gian phản hồi dưới 2 giây cho các tác vụ điểm danh.
- **Tính khả dụng:** Giao diện tối ưu cho cả máy tính để bàn và máy tính bảng.

## 6. Luồng trải nghiệm người dùng (User Flow)
1. Giáo viên đăng nhập -> Màn hình Dashboard tổng quan lớp học.
2. Chọn "Điểm danh" -> Thực hiện tích chọn trạng thái -> Lưu dữ liệu.
3. Chọn "Hồ sơ học sinh" -> Xem Dashboard chi tiết từng em.
4. Chọn "Báo cáo" -> Chọn loại báo cáo & thời gian -> Xem/Xuất báo cáo.

## 7. Kế hoạch triển khai
- **Giai đoạn 1:** Phát triển lõi (Đăng nhập & Quản lý danh sách học sinh).
- **Giai đoạn 2:** Triển khai tính năng Điểm danh & Dashboard.
- **Giai đoạn 3:** Hoàn thiện Hệ thống Báo cáo & Tối ưu hóa UX.

**APPROVED**
