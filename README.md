# Bó hoa 3D

Mã nguồn website nằm trong `blue-hour/`. Repository Git được quản lý tại thư mục `flower/`.

## Deploy lên Vercel

1. Push repository lên GitHub và import repository vào Vercel.
2. Giữ **Root Directory** ở gốc repository (`./`), chọn **Framework Preset: Other**.
3. Nhấn **Deploy**. File `vercel.json` đã cấu hình phục vụ `blue-hour/dist`, không cần cài dependency hoặc build.

Những lần cập nhật tiếp theo, commit và push lên nhánh đã kết nối để Vercel deploy lại.

## Chạy tại máy

```sh
cd blue-hour
npm start
```

Mở http://localhost:4173. Kiểm tra cú pháp JavaScript bằng `npm run check`.

Xem [hướng dẫn website](blue-hour/README.md) để biết các thao tác tương tác.
