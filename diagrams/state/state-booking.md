# State Machine Diagram - Trạng thái Booking

> Các trạng thái và chuyển đổi của lịch đặt xe

```mermaid
stateDiagram-v2
    [*] --> Pending: Tạo booking mới<br/>(priority < 70)
    [*] --> Confirmed: Tạo booking mới<br/>(priority >= 70,<br/>auto-confirmed)
    
    Pending --> Confirmed: Auto-approve sau 24h<br/>(không có phản đối)
    Pending --> Confirmed: Bỏ phiếu thông qua<br/>(>= 60% đồng ý)
    Pending --> Cancelled: Bỏ phiếu từ chối<br/>(>= 40% không đồng ý)
    Pending --> Cancelled: Người dùng hủy
    Pending --> Conflict: Phát hiện xung đột<br/>không thể giải quyết
    
    Confirmed --> InProgress: Check-in thành công<br/>(quét QR + chụp ảnh)
    Confirmed --> Cancelled: Hủy lịch<br/>(> 24h trước)
    Confirmed --> Cancelled: Xe bị hỏng<br/>(chuyển bảo dưỡng)
    
    InProgress --> Completed: Check-out thành công<br/>(quét QR + ghi km + ảnh)
    InProgress --> Disputed: Phát hiện hư hỏng<br/>có tranh chấp
    
    Disputed --> Completed: Giải quyết tranh chấp<br/>(thống nhất trách nhiệm)
    Disputed --> Cancelled: Tranh chấp nghiêm trọng<br/>(Admin hủy)
    
    Conflict --> Pending: Thương lượng thành công<br/>(điều chỉnh thời gian)
    Conflict --> Cancelled: Không thương lượng được<br/>(người dùng rút lui)
    
    Completed --> [*]: Kết thúc<br/>(đã tính chi phí)
    Cancelled --> [*]: Kết thúc<br/>(lý do hủy được ghi nhận)
    
    note right of Pending
        priority_score < 70
        Chờ 24h hoặc bỏ phiếu
    end note
    
    note right of Confirmed
        priority_score >= 70
        Có QR code
        Sẵn sàng sử dụng
    end note
    
    note right of InProgress
        Đang sử dụng xe
        Vehicle status = in_use
        Có check-in log
    end note
    
    note right of Completed
        Hoàn thành
        Có check-out log
        Chi phí đã tính
        Vehicle status = available
    end note
    
    note right of Cancelled
        Đã hủy
        Lý do được ghi nhận
        Ảnh hưởng priority score
    end note
```

## Ghi chú

### Trạng thái:

1. **pending** (Chờ phê duyệt)
   - Điều kiện: priority_score < 70
   - Chờ 24h để auto-approve
   - Hoặc bỏ phiếu

2. **confirmed** (Đã xác nhận)
   - Điều kiện: priority_score >= 70 hoặc đã được phê duyệt
   - Có QR code
   - Sẵn sàng check-in

3. **in_progress** (Đang sử dụng)
   - Đã check-in
   - Vehicle status = `in_use`
   - Người dùng đang sử dụng xe

4. **completed** (Hoàn thành)
   - Đã check-out
   - Chi phí đã tính
   - Vehicle status = `available`

5. **cancelled** (Đã hủy)
   - Người dùng hủy hoặc bị từ chối
   - Lý do được ghi nhận
   - Ảnh hưởng đến reliability_score

6. **conflict** (Xung đột)
   - Có xung đột với booking khác
   - Chờ thương lượng

7. **disputed** (Tranh chấp)
   - Phát hiện hư hỏng khi check-out
   - Chờ giải quyết trách nhiệm

### Chuyển đổi:

| Từ | Đến | Điều kiện | Hành động |
|---|---|---|---|
| - | pending | Tạo mới, priority < 70 | Thông báo nhóm |
| - | confirmed | Tạo mới, priority >= 70 | Tạo QR |
| pending | confirmed | 24h không phản đối | Tạo QR, thông báo |
| pending | confirmed | Bỏ phiếu >= 60% | Tạo QR |
| pending | cancelled | Bỏ phiếu >= 40% từ chối | Ghi lý do |
| pending | cancelled | Người dùng hủy | Ghi lý do |
| confirmed | in_progress | Check-in | Cập nhật vehicle |
| confirmed | cancelled | Hủy (>24h trước) | Ghi lý do |
| in_progress | completed | Check-out | Tính chi phí |
| in_progress | disputed | Phát hiện hư hỏng | Mở dispute |
| disputed | completed | Giải quyết | Gán trách nhiệm |
| completed | - | - | Kết thúc |
| cancelled | - | - | Kết thúc |

### Ràng buộc:

- **Hủy booking**: Chỉ được hủy nếu > 24h trước thời gian bắt đầu
- **Check-in**: Chỉ được check-in trong khoảng -15 phút đến +30 phút
- **Check-out**: Phải có check-in trước đó
- **Tranh chấp**: Chỉ phát sinh khi có hư hỏng mới sau sử dụng
