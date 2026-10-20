# Blue Hour — cinematic bouquet

Bó hoa 3D trên nền đen toàn màn hình. Không có header, footer, bảng ảnh hoặc thanh công cụ. Bảng xem ảnh chỉ mở khi chọn khung ảnh; hướng dẫn thao tác tự ẩn sau 6.5 giây.

## Chạy

```sh
npm start
```

Mở http://localhost:4173. Không cần build. Thư viện, ảnh và font đều được phục vụ cục bộ.

## Tương tác

- Kéo/vuốt xoay, cuộn/pinch zoom.
- Bấm trực tiếp khung ảnh: camera focus và mở ảnh rõ trong bảng xem.
- Hiển thị 4 ảnh có sẵn trong website; người xem có thể mở và chuyển ảnh.
- Nhấp đúp hoặc Escape: về toàn cảnh.
- Phím mũi tên để xoay, +/− zoom, 1–4 mở ảnh khi vùng 3D được focus.
- Khi mở trang: giấy gói khép lại và nơ hiện dần trong khoảng 4 giây. Bắt đầu thao tác sẽ bỏ qua phần mở đầu.
- Cụm hoa, đầu cánh, lá, giấy và dải nơ có chuyển động gió liên tục; giảm biên độ khi focus ảnh.
- Chạm cẩm tú cầu: rung nhẹ và tăng ánh sáng các hạt lấp lánh.
- Dây đèn đồng liên tục quấn quanh cụm hoa với 56 bóng vàng ấm, quầng sáng có che khuất theo chiều sâu và ánh hắt nhẹ. Đèn sáng dần khi gói hoa hoàn tất; không chặn thao tác chọn ảnh.
- Giảm chuyển động khi hệ điều hành bật prefers-reduced-motion.

## Render

- Sáu cụm cẩm tú cầu, hơn 2.500 cánh 3D dạng mặt cong với UV gân, màu theo từng bông, nhụy riêng.
- Lá cong có gân, hoa cúc và baby, giấy gói có nếp, nơ satin, ngọc, dây charm và bướm.
- PBR/sheen, phản xạ PMREM, ánh sáng chính/viền, PCF shadow, tone mapping ACES, bloom và hạt sáng bằng shader.
- Instancing cho cánh, lá, nhụy và cành; shadow map cập nhật tối đa 20 lần/giây khi có chuyển động.

`dist/bouquet.js`: mô hình và chất liệu. `dist/stage.js`: ánh sáng, camera, hiệu ứng, thao tác 3D. `dist/fairy-lights.js`: dây đồng, bóng đèn và ánh sáng vàng. `dist/app.js`: tải và xem ảnh. `dist/motion.js`: chuyển động GPU, bóng đổ đồng bộ và hiệu ứng gói hoa.

Đây là mô hình procedural có ánh sáng cinematic, không phải photogrammetry hoặc bản quét hoa thật. Ảnh mẫu từ Unsplash. Three.js r170 MIT; DM Sans và Playfair Display theo OFL, license đi kèm.

Phần cành phía dưới được giữ trong cổ giấy lót kín; nơ dùng vân vải mịn để tránh sọc và răng cưa khi zoom.
