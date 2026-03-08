# Code Review Skill: React Performance & Best Practices

Bạn đang review code sử dụng thư viện **React.js / Next.js**. Hãy đặc biệt tập trung tìm kiếm các lỗi thuộc các nhóm sau đây:

## 1. Unnecessary Re-renders
- **Thiếu `React.memo`**: Component con nhận props không đổi nhưng vẫn bị render lại liên tục.
- **Tạo Object/Function mới trong JSX**: Ví dụ truyền `style={{ margin: 10 }}` hoặc `onClick={() => handleClick()}` ở trong component lớn, khiến child component bị vỡ màng bảo vệ `React.memo`.
- Yêu cầu Dev bọc các function đắt đỏ bằng `useCallback`, bọc kết quả tính toán đắt đỏ bằng `useMemo`.

## 2. Misusing useEffect
- **Infinite Loop**: Quên báo dependency array `[]` hoặc truyền object/function vào dependency array mà không bọc `useMemo`/`useCallback` sinh ra lặp vô tận.
- **Race conditions**: Fetch data trong `useEffect` mà không có hàm `cleanup` (ví dụ dùng `AbortController` hoặc biến `ignore`).
- Khuyên Dev fetch data ở cấp độ React Query/SWR hoặc server-side (Next.js) thay vì dùng `useEffect` thuần nếu dự án phức tạp.

## 3. Trạng thái (State Management)
- **Derived State**: Dev lưu cả thông tin `items` và `filteredItems` vào state, trong khi `filteredItems` chỉ cần tính toán từ `items` trước khi render. Yêu cầu xóa `filteredItems` khỏi state.
- Khởi tạo giá trị ban đầu cho `useState` hằng số đúng quy chuẩn.

## 4. DOM & JSX
- **Sử dụng sai `key` trong vòng lặp**: Truyền `index` vào `key` thay vì `id` duy nhất có tĩnh.
- Check DOM lồng nhau dư thừa (`div` bọc `div`). Khuyên dùng `<React.Fragment>` hoặc `<></>`.

## Tiêu chí Review:
Nếu tìm thấy lỗi, đề xuất cụ thể đoạn code `useCallback` / `useMemo` / sửa `useEffect` cho Dev. Đừng bắt bẻ những thứ quá vặt vãnh như linter, tập trung vào Architecture và Performance.
