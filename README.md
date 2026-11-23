# Ứng dụng Quản lý Tiến độ Học tập Cá nhân — FIT@HCMUS (Khóa tuyển 2025)

Ứng dụng web chạy cục bộ (Local-first & Offline-ready) hỗ trợ sinh viên Khoa Công nghệ Thông tin – Trường Đại học Khoa học Tự nhiên, ĐHQG-HCM (ngành **Khoa học máy tính**, Khóa tuyển 2025 theo Quyết định `2818/QĐ-KHTN` ngày 19/09/2025) theo dõi tiến độ tích lũy tín chỉ, quản lý bảng điểm, tính GPA và kiểm tra điều kiện tốt nghiệp.

---

## 1. Cấu trúc thư mục mã nguồn

```text
page.github.io-main/
├── index.html                  # Màn hình Đăng nhập
├── register.html               # Màn hình Đăng ký tài khoản (ràng buộc MSSV chỉ gồm chữ số)
├── dashboard.html              # Trang tổng quan tiến độ (138 TC, GPA tích lũy, biểu đồ xu hướng)
├── program.html                # Khung chương trình đào tạo K2025 & tra cứu học phần học trước
├── grades.html                 # Quản lý bảng điểm (nhập thủ công, sửa/xóa, nhập/xuất Excel & JSON)
├── goals.html                  # Mục tiêu học tập & mô phỏng điểm giả định (What-If GPA)
├── graduation.html             # Kiểm tra các điều kiện xét tốt nghiệp (138 TC, GDQP-AN, GDTC, Ngoại ngữ, GPA)
├── settings.html               # Quản lý hồ sơ cá nhân, sao lưu/khôi phục JSON, trạng thái Offline
├── module-politics.html        # Chi tiết khối Lý luận chính trị – Pháp luật (14 TC)
├── module-skills.html          # Chi tiết khối Kỹ năng – Xã hội – Tự chọn đại cương (2 TC)
├── module-math.html            # Chi tiết khối Toán – Khoa học tự nhiên (36 TC)
├── module-it.html              # Chi tiết khối Tin học đại cương (4 TC)
├── module-language.html        # Chi tiết khối Ngoại ngữ – GDTC – GDQP-AN (môn điều kiện riêng)
├── module-foundation.html      # Chi tiết khối Cơ sở ngành (38 TC)
├── module-major.html           # Chi tiết khối Chuyên ngành Khoa học máy tính (34 TC)
├── module-graduation.html      # Chi tiết khối Học phần tốt nghiệp (10 TC)
├── style.css                   # Toàn bộ giao diện & Responsive Mobile/Tablet/Desktop
├── script.js                   # Logic nghiệp vụ CTĐT K2025, tính GPA, LocalStorage, biểu đồ
├── auth-guard.js               # Bảo vệ định tuyến các trang yêu cầu đăng nhập
├── course-requirements.js      # Kiểm tra ràng buộc môn tiên quyết / học trước K2025
├── hoc_truoc_K2025.json        # Dữ liệu danh mục học phần đề nghị học trước K2025
├── service-worker.js           # Service Worker lưu cache toàn bộ App Shell chạy 100% Offline
├── favicon.svg                 # Biểu tượng trang web cục bộ
├── vendor/                     # Thư viện bên thứ ba đóng gói cục bộ (KHÔNG phụ thuộc CDN)
│   ├── chart.umd.min.js        # Chart.js v4 (vẽ biểu đồ Donut & Line)
│   ├── xlsx.full.min.js        # SheetJS 0.18.5 (đọc/ghi file Excel .xlsx)
│   ├── html2pdf.bundle.min.js  # html2pdf.js 0.10.1 (xuất báo cáo PDF)
│   ├── fa/                     # Font Awesome 6.4.0 (CSS + Webfonts cục bộ)
│   └── fonts/                  # Google Fonts Montserrat (CSS + WOFF2 tiếng Việt cục bộ)
└── docs/                       # Tài liệu phân tích yêu cầu, kiểm thử, minh chứng AI & lịch sử cập nhật
```

---

## 2. Hướng dẫn khởi chạy ứng dụng

### Cách 1: Chạy qua máy chủ HTTP cục bộ (Khuyến nghị để kích hoạt đầy đủ Service Worker)
Mở Terminal tại thư mục `page.github.io-main` và chạy:

```bash
python3 -m http.server 8080
```

Sau đó mở trình duyệt (Brave / Chrome / Edge / Firefox) truy cập:
- **`http://localhost:8080/index.html`**

### Cách 2: Mở trực tiếp tệp HTML (`file://`)
Do toàn bộ thư viện (`Chart.js`, `Font Awesome`, `Montserrat`, `SheetJS`, `html2pdf.js`) đã được nhúng cục bộ trong thư mục `./vendor/`, ứng dụng vẫn hiển thị đầy đủ giao diện, biểu đồ, icon và font chữ ngay cả khi mở trực tiếp file `index.html` mà **không cần kết nối Internet**.

---

## 3. Cơ chế lưu trữ dữ liệu cục bộ (LocalStorage) & Bảo mật

Ứng dụng lưu trữ toàn bộ dữ liệu trực tiếp trên trình duyệt của thiết bị thông qua `window.localStorage`:
- **`users`**: Mảng JSON chứa danh sách các tài khoản sinh viên đã đăng ký trên thiết bị.
  - Mật khẩu người dùng được **băm một chiều bằng thuật toán SHA-256 kèm salt** (`sha256:...`) trước khi lưu vào `localStorage`, tuyệt đối không lưu mật khẩu dạng văn bản thuần (plain-text).
  - Mã số sinh viên (MSSV) được kiểm tra ràng buộc chặt chẽ chỉ gồm các chữ số (`0-9`).
- **`currentUser`**: Đối tượng JSON của phiên đăng nhập hiện tại, đồng bộ tức thời với `users` mỗi khi thêm/sửa/xóa điểm, cập nhật mục tiêu hoặc điều kiện tốt nghiệp.
- **Sao lưu & Khôi phục**: Người dùng có thể xuất toàn bộ hồ sơ ra file `.json` hoặc xuất bảng điểm ra `.xlsx` / `.json` để sao lưu dự phòng trước khi xóa dữ liệu trình duyệt.

---

## 4. Quy tắc tính toán theo Chương trình Đào tạo K2025 (138 Tín chỉ)

1. **Cơ cấu 138 tín chỉ tích lũy chuyên môn**:
   - **Kiến thức giáo dục đại cương (56 TC)**: Lý luận chính trị & Pháp luật (14 TC) + Kỹ năng/Xã hội (2 TC) + Toán & KHTN (36 TC) + Tin học đại cương (4 TC).
   - **Kiến thức cơ sở ngành (38 TC)**: Bắt buộc toàn bộ 10 học phần cơ sở ngành.
   - **Kiến thức chuyên ngành (34 TC)**: Tối thiểu 16 TC cốt lõi + tối thiểu 8 TC tự chọn chuyên ngành + tự chọn tự do để đủ 34 TC.
   - **Tốt nghiệp (10 TC)**: Chọn 1 trong 3 phương án theo quy định CTĐT K2025.
2. **Học phần điều kiện riêng (Ngoại ngữ, GDTC, GDQP-AN)**:
   - Các mã học phần `ADD00031`–`ADD00034` (Anh văn 1–4), `BAA00021`–`BAA00022` (Thể dục 1–2), `BAA00030` (GDQP-AN) là **điều kiện xét tốt nghiệp bắt buộc** (theo dõi tại trang `graduation.html` và `module-language.html`).
   - Theo đúng quy chế đào tạo, nhóm môn điều kiện này **không cộng vào 138 tín chỉ tích lũy chuyên môn** và **không tính vào điểm trung bình tích lũy (GPA)** cũng như bộ đếm số môn chuyên môn Đạt/Chưa đạt trên Dashboard.
3. **Quy tắc tính GPA (Hệ 10 và Hệ 4)**:
   - Điểm tổng kết học phần làm tròn đến **1 chữ số thập phân**; đạt (`Đ`) khi `>= 5.0`, chưa đạt (`CĐ`) khi `< 5.0`.
   - Khi một học phần được học lại hoặc học cải thiện, hệ thống lấy kết quả của lần học mới nhất cho mã học phần đó.
   - **GPA tích lũy** (hiển thị trên Dashboard, Khung CTĐT, Mục tiêu, Xét tốt nghiệp): Chỉ tính trên các học phần chuyên môn **đã Đạt (`>= 5.0`)**.
   - **GPA toàn bộ học phần đã học** (hiển thị tại trang Bảng điểm và biểu đồ GPA từng học kỳ): Tính trên tất cả học phần chuyên môn đã có điểm trong kỳ (bao gồm cả môn chưa đạt `< 5.0`) để phản ánh chính xác kết quả học tập thực tế của học kỳ đó.
