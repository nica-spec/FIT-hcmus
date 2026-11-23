# HỒ SƠ KỸ THUẬT ĐỒ ÁN: ỨNG DỤNG QUẢN LÝ TIẾN ĐỘ HỌC TẬP CÁ NHÂN (FIT@HCMUS K2025)

Tài liệu này tổng hợp đầy đủ các hạng mục theo quy định trong **Đồ án thực hành NM CNTT_DHThương.pdf** và **Quy định đồ án.pdf** (Mục 3.1, 3.2, 3.5, 3.6).

---

## PHẦN 1 (Mục 3.1): TÀI LIỆU PHÂN TÍCH YÊU CẦU

### 1.1 Danh sách chức năng ứng dụng
| Nhóm chức năng | Mô tả mục đích | Đầu vào (Input) | Đầu ra (Output) & Xử lý |
|---|---|---|---|
| **1. Xác thực & Hồ sơ cá nhân** | Quản lý nhiều hồ sơ sinh viên trên cùng thiết bị | Họ tên, MSSV (chỉ gồm chữ số `0-9`), mật khẩu | Mật khẩu băm SHA-256 lưu vào `localStorage`; bảo vệ các trang nội bộ qua `auth-guard.js` |
| **2. Quản lý Khung CTĐT K2025** | Theo dõi tiến độ từng khối kiến thức trong tổng 138 TC | Danh sách môn học chuẩn K2025 & bảng điểm sinh viên | Phần trăm hoàn thành từng khối (Đại cương 56 TC, Cơ sở ngành 38 TC, Chuyên ngành 34 TC, Tốt nghiệp 10 TC) + Tra cứu môn học trước |
| **3. Quản lý Bảng điểm** | Nhập, sửa, xóa, lọc bảng điểm theo năm học và HK1/HK2/HK3 (kỳ hè) | Điểm thành phần + trọng số (1–5 cột), điểm cộng, hoặc file `.xlsx` / `.json` | Điểm tổng kết làm tròn 1 chữ số thập phân, trạng thái Đạt (`Đ` >= 5.0) / Chưa đạt (`CĐ` < 5.0), GPA hệ 10 & hệ 4 |
| **4. Dashboard Tổng quan** | Thống kê trực quan tiến độ toàn khóa theo thời gian thực | Dữ liệu học phần của `currentUser` | Biểu đồ Donut 138 TC, biểu đồ đường xu hướng GPA qua các học kỳ, xếp loại học lực, xuất báo cáo PDF |
| **5. Mục tiêu & Dự báo (What-If)** | Đặt mục tiêu GPA/tín chỉ và thử nghiệm điểm giả định | GPA mục tiêu, danh sách môn giả định và điểm dự kiến | Điểm trung bình cần đạt ở các tín chỉ còn lại và GPA tích lũy dự kiến sau khi cộng môn giả định |
| **6. Kiểm tra Điều kiện Tốt nghiệp** | Đối chiếu 5 điều kiện bắt buộc để xét tốt nghiệp | Bảng điểm + chứng chỉ ngoại ngữ / đánh dấu hoàn thành | Trạng thái 5 tiêu chí: 138 TC, GPA >= 5.0, GDQP-AN, GDTC (2 học phần), Chuẩn ngoại ngữ |
| **7. Hoạt động Ngoại tuyến (Offline)** | Sử dụng 100% tính năng khi ngắt kết nối Wi-Fi/Internet | Toàn bộ trang HTML, CSS, JS, JSON và thư viện trong `./vendor/` | Service Worker lưu cache cục bộ; không phụ thuộc bất kỳ CDN hay API bên ngoài nào |

### 1.2 Cấu trúc dữ liệu học phần (`localStorage`)
```json
{
  "fullname": "Nguyễn Văn A",
  "studentId": "25120001",
  "password": "sha256:...",
  "stats": {
    "credits": 8,
    "totalCredits": 138,
    "gpa": 7.25,
    "gpa4": 2.75,
    "gradesList": [
      {
        "year": "25 - 26",
        "sem": "1",
        "code": "CSC10012",
        "name": "Cơ sở lập trình",
        "tc": 4,
        "score": 8.0,
        "status": "Đ",
        "note": "Học lần đầu",
        "colsCount": 2,
        "scoresList": [{ "weight": 40, "score": 7.5 }, { "weight": 60, "score": 8.3 }]
      }
    ]
  }
}
```

---

## PHẦN 2 (Mục 3.2): PHÁC THẢO GIAO DIỆN (UI/UX) & LUỒNG THAO TÁC

### 2.1 Sơ đồ luồng thao tác người dùng (User Flow)
```text
[register.html: Đăng ký MSSV số] ──► [index.html: Đăng nhập]
                                           │
       ┌───────────────────────────────────┴───────────────────────────────────┐
       ▼                                   ▼                                   ▼
[dashboard.html]                    [program.html]                      [grades.html]
- Biểu đồ Donut 138 TC              - Tiến độ 8 nhóm học phần           - Nhập điểm thủ công (HK1/2/3)
- Biểu đồ xu hướng GPA các kỳ       - Tra cứu môn đề nghị học trước     - Nhập/Xuất Excel (.xlsx) & JSON
- Xuất báo cáo tổng hợp PDF         - Liên kết tới 8 trang module-*     - Lọc năm học, học kỳ, sắp xếp
       │                                                                       │
       └───────────────► [goals.html] ◄────────────────► [graduation.html] ◄───┘
                         - Đặt mục tiêu GPA              - Kiểm tra 5 điều kiện tốt nghiệp
                         - Bảng tính điểm giả định       - Quy đổi chứng chỉ ngoại ngữ
```

### 2.2 Thiết kế Responsive đa thiết bị
- **Desktop (`> 992px`)**: Bố cục Sidebar dọc cố định bên trái (`200px`), vùng nội dung chính chia 2 cột trực quan.
- **Mobile & Tablet (`<= 992px`, kiểm thử chuẩn `375px`)**: Sidebar tự động chuyển thành thanh điều hướng ngang cuộn mượt; các thẻ thống kê, biểu đồ và biểu mẫu tự động co giãn 1 cột (`overflow-x: 0px`), bảng dữ liệu hỗ trợ cuộn ngang mượt trong khung.

---

## PHẦN 3 (Mục 3.5): BÁO CÁO KIỂM THỬ (TESTING REPORT)

| Mã TC | Tình huống kiểm thử (Test Case) | Dữ liệu thử nghiệm | Kết quả thực tế | Đánh giá |
|---|---|---|---|---|
| **TC01** | Kiểm tra ràng buộc MSSV chỉ được nhập số khi đăng ký | Nhập MSSV `"2512ABC"` hoặc `"25120001"` | Từ chối `"2512ABC"` với cảnh báo lỗi; chấp nhận `"25120001"` và băm mật khẩu SHA-256 | **ĐẠT (PASS)** |
| **TC02** | Tính GPA & Tín chỉ tích lũy chuẩn K2025 và loại trừ môn điều kiện | `CSC10012` (4 TC, 8.0), `MTH00021` (4 TC, 6.5), `CSC10004` (4 TC, 4.0 - rớt), `BAA00021` (GDTC 2 TC, 7.0) | Tín chỉ tích lũy: **8/138 TC** (đã loại GDTC). Số môn chuyên môn Đạt: **2**, Chưa đạt: **1**. GPA tích lũy (môn đạt): **7.3**. GPA học kỳ (gồm môn rớt): **6.2** | **ĐẠT (PASS)** |
| **TC03** | Lưu trữ bền vững trong LocalStorage qua F5 và đóng/mở trình duyệt | Nhấn F5 tải lại trang; đóng toàn bộ trình duyệt Brave và mở lại | Toàn bộ 4 môn học, GPA và trạng thái đăng nhập được giữ nguyên 100% | **ĐẠT (PASS)** |
| **TC04** | Hoạt động ngoại tuyến (Offline Mode) không phụ thuộc CDN | Bật chế độ Offline trong DevTools (`setOfflineMode(true)`), điều hướng qua tất cả các trang | Toàn bộ trang HTML, Chart.js, Font Awesome, font Montserrat tải từ `./vendor/` và Service Worker cache; không có bất kỳ request CDN nào | **ĐẠT (PASS)** |
| **TC05** | Hiển thị Responsive trên màn hình điện thoại (375×800) | Mở Dashboard, Bảng điểm, Khung CTĐT, Cài đặt ở viewport `375px` | Chiều rộng trang `scrollWidth === 375px` (không tràn ngang), giao diện rõ ràng | **ĐẠT (PASS)** |

### Hạn chế còn tồn tại & Hướng phát triển
- Dữ liệu hiện lưu cục bộ trong `localStorage` của từng trình duyệt nên không tự động đồng bộ đám mây giữa điện thoại và máy tính (người dùng cần sử dụng tính năng **Xuất file sao lưu JSON / Khôi phục** tại trang Cài đặt để chuyển thiết bị).
- Ứng dụng hiện tập trung chi tiết cho CTĐT ngành **Khoa học máy tính K2025**; trong tương lai có thể mở rộng thêm danh mục môn chuyên ngành cho 4 ngành còn lại (CNTT, KTPM, HTTT, TTNT).

---

## PHẦN 4 (Mục 3.6): MINH CHỨNG SỬ DỤNG AI

1. **Prompt 1 – Phân tích quy chế & chuẩn hóa dữ liệu CTĐT K2025**:
   - *Nội dung prompt*: *"Dựa trên Chương trình đào tạo ngành Khoa học máy tính khóa tuyển 2025 (138 tín chỉ), hãy xây dựng cấu trúc dữ liệu học phần chia theo các khối Đại cương (56 TC), Cơ sở ngành (38 TC), Chuyên ngành (34 TC), Tốt nghiệp (10 TC) và tách riêng nhóm môn điều kiện Ngoại ngữ, GDTC, GDQP-AN không tính vào GPA."*
   - *Tinh chỉnh của nhóm*: Rà soát lại mã môn mới của K2025 (`BAA00003`, `BAA00004`, `CSC14003`), bổ sung ánh xạ tương thích mã cũ (`CTDT_LEGACY_CODES`) và danh sách môn đề nghị học trước (`hoc_truoc_K2025.json`).
2. **Prompt 2 – Xử lý tính toán GPA và kiểm tra dữ liệu nhập**:
   - *Nội dung prompt*: *"Viết hàm tính GPA hệ 10, hệ 4 và tín chỉ tích lũy trong JavaScript. Xử lý trường hợp sinh viên học cải thiện/học lại (chỉ lấy lần học mới nhất) và làm tròn điểm tổng kết 1 chữ số thập phân trước khi xét Đạt >= 5.0."*
   - *Tinh chỉnh của nhóm*: Sửa lỗi sai lệch giữa điểm hiển thị `5.0` (do làm tròn từ `4.96`) với trạng thái `CĐ` bằng hàm `roundFinalScore()`, đồng thời đồng bộ bộ đếm số môn Đạt trên Dashboard không đếm nhầm môn GDTC/GDQP.
3. **Prompt 3 – Đóng gói Offline 100% & Thiết kế Responsive Mobile**:
   - *Nội dung prompt*: *"Loại bỏ toàn bộ phụ thuộc CDN bên ngoài bằng cách nhúng cục bộ Chart.js, SheetJS, html2pdf, Font Awesome, Google Fonts vào thư mục vendor/, cập nhật Service Worker cache-first và tối ưu CSS Responsive cho màn hình điện thoại 375px."*
   - *Tinh chỉnh của nhóm*: Kiểm thử thực tế trên trình duyệt Brave ở chế độ Offline và viewport 375px, bổ sung băm mật khẩu SHA-256 và ràng buộc MSSV chỉ nhận chữ số.
