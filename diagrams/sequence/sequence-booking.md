# Sequence Diagram - Đặt lịch Xe

> Quy trình đặt lịch với kiểm tra xung đột và tính toán ưu tiên

```mermaid
sequenceDiagram
    actor User as Người dùng
    participant FE as Frontend
    participant GW as API Gateway
    participant Booking as Booking Service
    participant User_Svc as User Service
    participant Vehicle as Vehicle Service
    participant AI as AI Service
    participant Redis as Redis Cache
    participant RabbitMQ as RabbitMQ
    participant Notif as Notification Service
    participant DB as PostgreSQL

    User->>FE: Chọn xe & thời gian
    FE->>GW: GET /api/bookings/calendar<br/>?vehicleId=...&month=...
    GW->>Booking: Forward request
    
    Booking->>Redis: GET calendar:{vehicleId}:{month}
    
    alt Cache hit
        Redis-->>Booking: Calendar data
    else Cache miss
        Booking->>DB: SELECT * FROM bookings<br/>WHERE vehicle_id AND month
        DB-->>Booking: Booking records
        Booking->>Redis: SET calendar:... <br/>EX 300
    end
    
    Booking-->>GW: Calendar với slots
    GW-->>FE: 200 OK {calendar}
    FE-->>User: Hiển thị lịch<br/>(trống/đã đặt)
    
    User->>FE: Chọn slot & nhập chi tiết
    FE->>FE: Validate thời gian
    
    FE->>GW: POST /api/bookings<br/>{vehicleId, groupId, startTime, endTime, purpose, ...}
    GW->>GW: Verify JWT & check role
    GW->>Booking: Forward request
    
    Booking->>Booking: Validate input
    
    Booking->>User_Svc: GET /api/groups/{groupId}/members/{userId}
    User_Svc->>DB: Kiểm tra membership
    
    alt Không phải thành viên
        User_Svc-->>Booking: 403 Not a member
        Booking-->>GW: Error
        GW-->>FE: Không có quyền đặt lịch
        FE-->>User: Lỗi
    end
    
    User_Svc-->>Booking: {member_data, ownership_ratio}
    
    Booking->>DB: BEGIN TRANSACTION
    
    Booking->>DB: SELECT * FROM bookings<br/>WHERE vehicle_id = ... <br/>AND status NOT IN ('cancelled')<br/>AND timerange overlaps<br/>FOR UPDATE
    
    DB-->>Booking: Conflicting bookings (if any)
    
    alt Có xung đột hoàn toàn
        Booking->>DB: ROLLBACK
        Booking-->>GW: 409 Conflict
        GW-->>FE: Slot đã được đặt
        FE-->>User: Hiển thị xung đột<br/>+ Gợi ý slot khác
    else Xung đột một phần
        Booking->>DB: INSERT INTO booking_conflicts
        DB-->>Booking: Conflict saved
        Booking-->>GW: 409 Partial Conflict
        GW-->>FE: Xung đột một phần
        FE-->>User: Hiển thị xung đột<br/>Tùy chọn: Chọn slot khác<br/>hoặc Gửi yêu cầu thương lượng
    end
    
    Booking->>User_Svc: GET /api/groups/{groupId}/members
    User_Svc-->>Booking: All members with ownership
    
    Booking->>DB: SELECT * FROM bookings<br/>WHERE group_id AND user_id<br/>AND created_at > DATE_SUB(NOW(), 3 months)
    DB-->>Booking: User's booking history
    
    Booking->>Booking: Tính priority_score:<br/>= ownership_ratio × 0.4<br/>+ (1 - usage_ratio) × 0.3<br/>+ advance_booking_bonus × 0.2<br/>+ reliability_score × 0.1
    
    alt Priority score >= ngưỡng (ví dụ: 70)
        Booking->>Booking: status = 'confirmed'<br/>auto_confirmed = true
    else Priority score < ngưỡng
        Booking->>Booking: status = 'pending'
        Booking->>RabbitMQ: Publish event<br/>BOOKING_PENDING_APPROVAL
    end
    
    Booking->>DB: INSERT INTO bookings<br/>(vehicle_id, user_id, group_id, <br/>start_time, end_time, status, <br/>priority_score, ...)
    DB-->>Booking: Booking created
    
    alt Auto-confirmed
        Booking->>Booking: Tạo QR code<br/>cho check-in/check-out
        Booking->>DB: Lưu QR data
        Booking->>RabbitMQ: Publish event<br/>BOOKING_CONFIRMED
    end
    
    Booking->>Redis: DELETE calendar:{vehicleId}:*
    Booking->>DB: COMMIT TRANSACTION
    
    Booking-->>GW: 201 Created<br/>{booking_data, qr_code?}
    GW-->>FE: Success
    
    FE-->>User: Đặt lịch thành công<br/>Status: Confirmed/Pending
    
    Note over RabbitMQ,Notif: Background processing
    
    RabbitMQ->>Notif: Event: BOOKING_CONFIRMED/PENDING
    
    alt Confirmed
        Notif->>DB: SELECT email FROM users WHERE id = user_id
        Notif->>Notif: Tạo email xác nhận<br/>+ QR code
        Notif->>Notif: Send email via SMTP
        Notif->>Notif: Send push notification
    else Pending
        Notif->>User_Svc: GET /api/groups/{groupId}/members
        Notif->>Notif: Gửi thông báo<br/>cho tất cả thành viên:<br/>"Có yêu cầu đặt lịch mới"
        Notif->>Notif: Bắt đầu timer 24h<br/>để auto-approve
    end
    
    opt AI Recommendation (Background)
        RabbitMQ->>AI: Event: BOOKING_CREATED
        AI->>DB: Lấy booking history
        AI->>AI: Phân tích pattern:<br/>- Giờ ưa thích<br/>- Ngày ưa thích<br/>- Mục đích thường dùng
        AI->>DB: UPDATE user_preferences
        AI->>AI: Cập nhật fairness analysis
    end
    
    alt Nếu Pending: Sau 24h không phản đối
        Booking->>DB: UPDATE bookings<br/>SET status = 'confirmed'<br/>WHERE id = ... AND status = 'pending'
        Booking->>Booking: Tạo QR code
        Booking->>RabbitMQ: Publish BOOKING_AUTO_APPROVED
        RabbitMQ->>Notif: Send notifications
    end
```

## Ghi chú

### Quy trình chính:

#### 1. Xem lịch
- Lấy từ Redis cache (TTL 5 phút)
- Nếu miss → Query DB → Cache lại
- Hiển thị slot trống/đã đặt/bảo dưỡng

#### 2. Tạo booking
1. **Validate**: Thời gian, quyền thành viên
2. **Kiểm tra xung đột**:
   - **Full overlap**: Từ chối ngay
   - **Partial overlap**: Lưu conflict, cho phép thương lượng
   - **No overlap**: Tiếp tục
3. **Tính priority_score**:
   ```
   = ownership_ratio × 40%
   + (1 - usage_ratio) × 30%
   + advance_booking_bonus × 20%
   + reliability_score × 10%
   ```
4. **Quyết định status**:
   - `priority_score >= 70` → `confirmed` (tự động)
   - `priority_score < 70` → `pending` (chờ 24h)

#### 3. Tạo QR code (nếu confirmed)
- QR chứa: `booking_id`, `vehicle_id`, `user_id`, `signature`
- Dùng để check-in/check-out
- Lưu vào DB

#### 4. Thông báo
- **Confirmed**: Gửi email + push cho người đặt
- **Pending**: Gửi cho tất cả thành viên (24h để phản đối)

#### 5. Background tasks
- **AI Service**: Phân tích pattern, cập nhật preferences
- **Auto-approve**: Sau 24h không phản đối → Confirm

### Xử lý xung đột:

**Full Overlap** (A ⊃ B hoặc B ⊃ A):
```
Booking A: 8:00 - 12:00
Booking B: 9:00 - 11:00 ❌ Từ chối
```

**Partial Overlap**:
```
Booking A: 8:00 - 12:00
Booking B: 10:00 - 14:00 ⚠️ Xung đột một phần
→ Lưu conflict, cho phép thương lượng
```

**No Overlap**:
```
Booking A: 8:00 - 12:00
Booking B: 13:00 - 17:00 ✅ OK
```

### Tính priority_score:

**Công thức**:
```javascript
const usage_ratio = user_bookings_hours / total_group_hours;
const advance_days = days_between(now, start_time);
const cancellation_rate = cancelled_bookings / total_bookings;

priority_score = 
  ownership_ratio * 40 +
  (1 - usage_ratio) * 30 +
  (advance_days >= 3 ? 20 : advance_days * 6.67) +
  ((1 - cancellation_rate) * 10);
```

**Ví dụ**:
```
User A:
- Ownership: 40%
- Usage: 30% (dưới mức)
- Đặt trước 5 ngày
- Chưa hủy lần nào

priority_score = 40*0.4 + (1-0.3)*0.3 + 20 + 10 = 16 + 21 + 20 + 10 = 67
→ Status: pending (< 70)
```

### Redis Cache:

**Key**: `calendar:{vehicleId}:{YYYY-MM}`
**Value**: 
```json
{
  "vehicle_id": "uuid",
  "month": "2025-12",
  "bookings": [
    {"date": "2025-12-01", "slots": [...]},
    {"date": "2025-12-02", "slots": [...]}
  ]
}
```
**TTL**: 300 seconds (5 phút)

### Events:

- `BOOKING_CREATED`: Booking mới tạo
- `BOOKING_CONFIRMED`: Đã xác nhận (auto hoặc manual)
- `BOOKING_PENDING_APPROVAL`: Chờ phê duyệt
- `BOOKING_AUTO_APPROVED`: Tự động phê duyệt sau 24h
- `BOOKING_CONFLICT_DETECTED`: Phát hiện xung đột

### Database Transaction:

Sử dụng `FOR UPDATE` để lock row khi kiểm tra xung đột:
```sql
SELECT * FROM bookings 
WHERE vehicle_id = ? 
  AND status NOT IN ('cancelled')
  AND (start_time, end_time) OVERLAPS (?, ?)
FOR UPDATE;
```

→ Đảm bảo không có race condition
