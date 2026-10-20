# Bó hoa 3D

Mã nguồn website nằm trong `blue-hour/`. Repository Git được quản lý tại thư mục `flower/`.

## Deploy lên Vercel

1. Push repository lên GitHub và import repository vào Vercel.
2. Chọn **Framework Preset: Other**. **Root Directory** có thể là gốc repository (`./`) hoặc `blue-hour`.
3. Nhấn **Deploy**. Cả hai thư mục đều có `vercel.json`: ở gốc phục vụ `blue-hour/dist`, ở `blue-hour` phục vụ `dist`. Không cần cài dependency hoặc build.

Nếu trang chủ báo 404 nhưng `/dist/index.html` mở được, hãy deploy commit mới nhất có `blue-hour/vercel.json`.

Những lần cập nhật tiếp theo, commit và push lên nhánh đã kết nối để Vercel deploy lại.

## Chạy tại máy

```sh
cd blue-hour
npm start
```

Mở http://localhost:4173. Kiểm tra cú pháp JavaScript bằng `npm run check`.

Xem [hướng dẫn website](blue-hour/README.md) để biết các thao tác tương tác.
