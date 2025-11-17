# MiniGGMeet (MVP)

Một ứng dụng web kết hợp phong cách Google Meet và Discord: tạo server, mở phòng họp (tối đa 150 người), chat, gọi video P2P (mesh), giơ tay, chia sẻ màn hình, xem YouTube cùng nhau.

## Luồng sử dụng:
1) Đăng nhập nhanh (username + tên hiển thị)
2) Tạo/Tham gia Máy chủ (giống Discord) bằng mã mời 6 ký tự
3) Tạo phòng họp từ Máy chủ và chia sẻ mã 8 ký tự cho mọi người

Xem thêm trong mã nguồn và ghi chú giới hạn.
# MiniGGMeet (MVP)

Một ứng dụng web kết hợp phong cách Google Meet và Discord: tạo server, mở phòng họp (tối đa 150 người), chat, gọi video P2P (mesh), giơ tay, chia sẻ màn hình, xem YouTube cùng nhau.

## Công nghệ
- Node.js + Express 5, EJS
- MongoDB + Mongoose
- Socket.IO (realtime)
- WebRTC (mesh đơn giản)

## Cấu hình
Tạo file `.env` (đã có mẫu):
```
PORT=3000
MONGO_URL=mongodb://127.0.0.1:27017/miniggmeet
SESSION_SECRET=change-this-secret
```

## Chạy
1. Cài dependencies
2. Chạy server

```powershell
npm install
npm run dev
```

Mở http://localhost:3000



