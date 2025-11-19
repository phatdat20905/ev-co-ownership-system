# State Machine Diagram - Trạng thái Xe

> Các trạng thái và chuyển đổi của xe trong hệ thống

```mermaid
stateDiagram-v2
    [*] --> Available: Thêm xe mới<br/>vào hệ thống
    
    Available --> InUse: Check-in thành công<br/>(có booking confirmed)
    Available --> Maintenance: Lên lịch bảo dưỡng<br/>(định kỳ hoặc đột xuất)
    Available --> Unavailable: Tạm ngưng sử dụng<br/>(Staff/Admin)
    
    InUse --> Available: Check-out thành công<br/>(không có vấn đề)
    InUse --> Maintenance: Phát hiện vấn đề<br/>(cần sửa chữa ngay)
    InUse --> Unavailable: Sự cố nghiêm trọng<br/>(tai nạn, hỏng nặng)
    
    Maintenance --> Available: Hoàn thành bảo dưỡng<br/>(kiểm tra OK)
    Maintenance --> Unavailable: Cần sửa chữa lớn<br/>(vượt ngân sách)
    Maintenance --> Retired: Không thể sửa<br/>(hư hỏng không phục hồi)
    
    Unavailable --> Available: Khôi phục<br/>(sửa chữa xong)
    Unavailable --> Maintenance: Chuyển bảo dưỡng<br/>(có kế hoạch sửa)
    Unavailable --> Retired: Quyết định ngừng sử dụng<br/>(bỏ phiếu nhóm)
    
    Retired --> [*]: Bán/Thanh lý xe<br/>(kết thúc vòng đời)
    
    note right of Available
        Trạng thái: Sẵn sàng
        - Có thể booking
        - Đã kiểm tra kỹ thuật
        - Bảo hiểm còn hạn
    end note
    
    note right of InUse
        Trạng thái: Đang sử dụng
        - Có booking in_progress
        - Không thể booking mới
        - Theo dõi real-time
    end note
    
    note right of Maintenance
        Trạng thái: Bảo dưỡng
        - Hủy booking trong kỳ
        - Ghi nhận chi phí
        - Cập nhật lịch sử
    end note
    
    note right of Unavailable
        Trạng thái: Tạm ngưng
        - Không thể booking
        - Lý do: Sự cố/Quyết định
        - Chờ xử lý
    end note
    
    note right of Retired
        Trạng thái: Ngừng sử dụng
        - Không còn trong hệ thống
        - Lịch sử được lưu
        - Thanh toán cuối cùng
    end note
```

## Ghi chú

### Trạng thái:

1. **available** (Sẵn sàng)
   - Xe có thể được đặt lịch
   - Đã qua kiểm tra kỹ thuật
   - Bảo hiểm còn hiệu lực
   - Không có vấn đề kỹ thuật

2. **in_use** (Đang sử dụng)
   - Có booking đang ở trạng thái `in_progress`
   - Không thể booking mới
   - Theo dõi vị trí (nếu có GPS)
   - Người dùng đang sử dụng

3. **maintenance** (Bảo dưỡng)
   - Đang trong quá trình bảo dưỡng/sửa chữa
   - Tất cả booking trong kỳ bị hủy
   - Ghi nhận chi phí bảo dưỡng
   - Cập nhật lịch sử bảo dưỡng

4. **unavailable** (Tạm ngưng)
   - Tạm thời không sử dụng được
   - Lý do: Sự cố, quyết định nhóm, chờ sửa chữa
   - Không thể booking
   - Chờ xử lý

5. **retired** (Ngừng sử dụng)
   - Xe ngừng hoạt động vĩnh viễn
   - Lý do: Bán, thanh lý, hỏng không sửa được
   - Lịch sử được lưu trữ
   - Thanh toán cuối cùng cho thành viên

### Chuyển đổi:

| Từ | Đến | Kích hoạt | Người thực hiện |
|---|---|---|---|
| - | available | Thêm xe mới | Staff/Admin |
| available | in_use | Check-in | Co-owner |
| available | maintenance | Lên lịch bảo dưỡng | Staff |
| available | unavailable | Tạm ngưng | Staff/Admin |
| in_use | available | Check-out OK | Co-owner |
| in_use | maintenance | Phát hiện vấn đề | Staff |
| in_use | unavailable | Sự cố nghiêm trọng | Staff/Admin |
| maintenance | available | Hoàn thành | Staff |
| maintenance | unavailable | Cần sửa lớn | Staff |
| maintenance | retired | Không sửa được | Admin |
| unavailable | available | Khôi phục | Staff |
| unavailable | maintenance | Chuyển sửa | Staff |
| unavailable | retired | Quyết định ngừng | Admin + Bỏ phiếu |
| retired | - | Thanh lý | Admin |

### Ràng buộc:

**Chuyển sang maintenance**:
- Hủy tất cả booking trong thời gian bảo dưỡng
- Thông báo cho người dùng có booking
- Gợi ý xe thay thế (nếu có)

**Chuyển sang unavailable**:
- Ghi rõ lý do
- Ước tính thời gian khôi phục
- Thông báo nhóm

**Chuyển sang retired**:
- Cần bỏ phiếu nhóm (nếu bán)
- Thanh toán cuối cùng theo ownership
- Lưu trữ lịch sử đầy đủ

### Điều kiện kiểm tra:

**Trước khi available**:
- [ ] Kiểm tra kỹ thuật OK
- [ ] Bảo hiểm còn hiệu lực >= 30 ngày
- [ ] Đăng kiểm còn hạn
- [ ] Không có cảnh báo kỹ thuật

**Trong maintenance**:
- Ghi nhận: Ngày bắt đầu, dự kiến hoàn thành, chi phí
- Cập nhật: Tiến độ, vấn đề phát hiện thêm
- Hoàn thành: Kiểm tra lại toàn bộ trước khi available

### Events phát sinh:

- `VEHICLE_STATUS_CHANGED`: Mỗi khi status thay đổi
- `VEHICLE_AVAILABLE`: Xe sẵn sàng sử dụng
- `VEHICLE_MAINTENANCE_SCHEDULED`: Lên lịch bảo dưỡng
- `VEHICLE_UNAVAILABLE`: Xe không khả dụng
- `VEHICLE_RETIRED`: Xe ngừng sử dụng
