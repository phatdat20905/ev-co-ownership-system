# Activity Diagram - Đăng ký & Xác thực KYC

> Quy trình đăng ký tài khoản và xác thực danh tính

```mermaid
flowchart TD
    Start([Bắt đầu đăng ký]) --> InputInfo[Nhập thông tin:<br/>Email, SĐT, Mật khẩu]
    InputInfo --> ValidateInput{Thông tin<br/>hợp lệ?}
    
    ValidateInput -->|Không| ShowError1[Hiển thị lỗi<br/>validation]
    ShowError1 --> InputInfo
    
    ValidateInput -->|Có| CheckDuplicate{Email/SĐT<br/>đã tồn tại?}
    CheckDuplicate -->|Có| ShowError2[Thông báo:<br/>Tài khoản đã tồn tại]
    ShowError2 --> InputInfo
    
    CheckDuplicate -->|Không| CreateAccount[Tạo tài khoản<br/>Role: co_owner<br/>Status: unverified]
    CreateAccount --> SendEmailVerification[Gửi email<br/>xác thực]
    SendEmailVerification --> ShowSuccess[Hiển thị:<br/>Vui lòng kiểm tra email]
    
    ShowSuccess --> WaitEmail{Người dùng<br/>click link?}
    WaitEmail -->|Timeout 24h| ExpireLink[Link hết hạn]
    ExpireLink --> ResendEmail{Gửi lại<br/>email?}
    ResendEmail -->|Có| SendEmailVerification
    ResendEmail -->|Không| End1([Kết thúc])
    
    WaitEmail -->|Có| VerifyEmail[Xác thực email<br/>thành công]
    VerifyEmail --> Login[Đăng nhập<br/>vào hệ thống]
    
    Login --> CheckKYC{Đã có<br/>KYC?}
    CheckKYC -->|Có| AccessSystem[Truy cập<br/>hệ thống đầy đủ]
    AccessSystem --> End2([Kết thúc])
    
    CheckKYC -->|Chưa| ShowKYCPrompt[Thông báo:<br/>Cần xác thực KYC<br/>để sử dụng đầy đủ]
    ShowKYCPrompt --> StartKYC{Bắt đầu<br/>KYC ngay?}
    
    StartKYC -->|Không| LimitedAccess[Truy cập hạn chế:<br/>Chỉ xem, không booking]
    LimitedAccess --> End3([Kết thúc])
    
    StartKYC -->|Có| SelectDocType[Chọn loại giấy tờ:<br/>CCCD hoặc GPLX]
    
    SelectDocType --> UploadCCCD[Upload ảnh CCCD<br/>Mặt trước + Mặt sau]
    UploadCCCD --> UploadGPLX[Upload ảnh GPLX<br/>Mặt trước + Mặt sau]
    UploadGPLX --> UploadSelfie[Chụp ảnh selfie<br/>với giấy tờ]
    
    UploadSelfie --> ValidateImages{Ảnh rõ ràng<br/>& đúng định dạng?}
    ValidateImages -->|Không| ShowError3[Yêu cầu chụp lại]
    ShowError3 --> SelectDocType
    
    ValidateImages -->|Có| SubmitKYC[Gửi yêu cầu KYC<br/>Status: pending]
    SubmitKYC --> NotifyStaff[Thông báo Staff<br/>có yêu cầu mới]
    
    NotifyStaff --> WaitApproval[Chờ Staff<br/>xem xét]
    
    WaitApproval --> StaffReview{Staff<br/>phê duyệt?}
    
    StaffReview -->|Từ chối| RejectKYC[Gửi thông báo<br/>từ chối + lý do]
    RejectKYC --> RequestResubmit{Gửi lại<br/>yêu cầu?}
    RequestResubmit -->|Có| SelectDocType
    RequestResubmit -->|Không| End4([Kết thúc])
    
    StaffReview -->|Yêu cầu bổ sung| RequestMore[Yêu cầu<br/>tài liệu thêm]
    RequestMore --> UploadMore[Upload<br/>tài liệu bổ sung]
    UploadMore --> WaitApproval
    
    StaffReview -->|Phê duyệt| ApproveKYC[Cập nhật:<br/>KYC approved<br/>isVerified = true]
    ApproveKYC --> SendApprovalNotif[Gửi thông báo<br/>xác thực thành công]
    SendApprovalNotif --> FullAccess[Mở khóa<br/>toàn bộ chức năng]
    FullAccess --> End5([Kết thúc])
    
    style Start fill:#4CAF50,stroke:#2E7D32,stroke-width:3px,color:#fff
    style End1 fill:#F44336,stroke:#C62828,stroke-width:2px,color:#fff
    style End2 fill:#4CAF50,stroke:#2E7D32,stroke-width:3px,color:#fff
    style End3 fill:#FF9800,stroke:#E65100,stroke-width:2px,color:#fff
    style End4 fill:#F44336,stroke:#C62828,stroke-width:2px,color:#fff
    style End5 fill:#4CAF50,stroke:#2E7D32,stroke-width:3px,color:#fff
    style FullAccess fill:#4CAF50,stroke:#2E7D32,stroke-width:2px,color:#fff
    style ApproveKYC fill:#4CAF50,stroke:#2E7D32,stroke-width:2px,color:#fff
```

## Ghi chú

### Giai đoạn 1: Đăng ký tài khoản
1. Người dùng nhập email, số điện thoại, mật khẩu
2. Hệ thống validate thông tin
3. Kiểm tra trùng lặp email/SĐT
4. Tạo tài khoản với role = `co_owner`, status = `unverified`
5. Gửi email xác thực (có hiệu lực 24h)

### Giai đoạn 2: Xác thực Email
1. Người dùng click link trong email
2. Hệ thống xác thực token
3. Cập nhật email_verified = true
4. Cho phép đăng nhập

### Giai đoạn 3: Xác thực KYC (Tùy chọn nhưng bắt buộc để booking)
1. **Upload giấy tờ**:
   - CCCD: Mặt trước + Mặt sau
   - GPLX: Mặt trước + Mặt sau (bắt buộc để lái xe)
2. **Chụp Selfie**: Với CCCD/GPLX để xác thực khuôn mặt
3. **Gửi yêu cầu**: Status = `pending`
4. **Staff xem xét**:
   - Phê duyệt → is_verified = true → Mở khóa toàn bộ
   - Từ chối → Gửi lý do → Cho phép gửi lại
   - Yêu cầu bổ sung → Upload thêm tài liệu

### Trạng thái tài khoản:
- **Chưa verify email**: Không thể đăng nhập
- **Đã verify email, chưa KYC**: Chỉ xem thông tin, không đặt lịch
- **Đã KYC approved**: Sử dụng đầy đủ chức năng

### Thời gian xử lý:
- Email verification: 24 giờ
- KYC review: 1-3 ngày làm việc (tùy staff)
