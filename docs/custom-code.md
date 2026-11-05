# Quản lý mã theo dõi

Mã GTM, Google Analytics, Google Ads và các thẻ tùy chỉnh được quản lý tại
**Cài đặt → Custom Code (Head / Body / Footer)**.

- **Head:** dán mã HTML gốc của GTM/Analytics, giữ nguyên `<script>...</script>`.
- **Body start:** dán phần `<noscript>` của GTM nếu có.
- **Footer:** mã HTML hoặc script cần chèn ở cuối trang.

Không dán React/JSX (`dangerouslySetInnerHTML`) vào các ô này. Sự kiện bấm gọi
điện và Zalo được cấu hình trong GTM bằng trigger liên kết, dựa trên `Click URL`.

Thẻ và công tắc theo dõi trong Thông tin doanh nghiệp đã được bỏ khỏi giao diện.
Website không chèn mã và không gửi chuyển đổi trực tiếp từ cấu hình doanh nghiệp
cũ. Schema của nhóm `tracking` được giữ ẩn để tránh xóa cột/dữ liệu hiện có khi
đồng bộ cơ sở dữ liệu; dữ liệu đó không còn được sử dụng trên website.

Mã ở ô Head chạy bằng `next/script` với `afterInteractive`, thay cho
`lazyOnload` để không đợi trình duyệt rảnh mới tải GTM. Các thay đổi trong source
cần được triển khai; nội dung Custom Code được cập nhật theo cache của website
(thông thường khoảng 60 giây).
