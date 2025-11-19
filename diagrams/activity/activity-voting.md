# Activity Diagram - Bỏ phiếu Nhóm

> Quy trình bỏ phiếu cho các quyết định quan trọng trong nhóm đồng sở hữu

```mermaid
flowchart TD
    Start([Phát sinh vấn đề<br/>cần quyết định]) --> IssueType{Loại<br/>vấn đề?}
    
    IssueType -->|Thay đổi ownership| OwnershipVote[Điều chỉnh tỷ lệ<br/>sở hữu]
    IssueType -->|Thêm/Xóa thành viên| MemberVote[Thay đổi<br/>thành viên]
    IssueType -->|Quyết định chi phí lớn| CostVote[Chi phí quan trọng:<br/>> 10 triệu VND]
    IssueType -->|Thay đổi quy định| RuleVote[Sửa đổi<br/>quy tắc nhóm]
    IssueType -->|Xung đột booking| BookingVote[Giải quyết<br/>xung đột lịch]
    IssueType -->|Bán/Mua xe| VehicleVote[Quyết định<br/>về xe]
    IssueType -->|Khác| OtherVote[Vấn đề khác]
    
    OwnershipVote --> CreateVote[Tạo đề xuất bỏ phiếu]
    MemberVote --> CreateVote
    CostVote --> CreateVote
    RuleVote --> CreateVote
    BookingVote --> CreateVote
    VehicleVote --> CreateVote
    OtherVote --> CreateVote
    
    CreateVote --> InputTitle[Nhập tiêu đề<br/>& mô tả chi tiết]
    InputTitle --> SetOptions[Thiết lập lựa chọn:<br/>- Đồng ý<br/>- Không đồng ý<br/>- Tùy chỉnh thêm]
    
    SetOptions --> AttachDocuments{Có tài liệu<br/>đính kèm?}
    AttachDocuments -->|Có| UploadDocs[Upload tài liệu:<br/>- Hợp đồng<br/>- Báo giá<br/>- Ảnh]
    UploadDocs --> SetDeadline
    AttachDocuments -->|Không| SetDeadline[Đặt thời hạn<br/>bỏ phiếu]
    
    SetDeadline --> ValidateDeadline{Thời hạn<br/>hợp lệ?}
    ValidateDeadline -->|Không<br/>< 24h| ShowError1[Lỗi: Tối thiểu 24h]
    ShowError1 --> SetDeadline
    
    ValidateDeadline -->|Có<br/>24h - 7 ngày| SaveVote[Lưu GroupVote:<br/>Status = active]
    
    SaveVote --> NotifyMembers[Gửi thông báo<br/>tất cả thành viên:<br/>- Email<br/>- Push<br/>- In-app]
    
    NotifyMembers --> VotingPeriod[Giai đoạn bỏ phiếu<br/>Chờ thành viên vote]
    
    VotingPeriod --> MemberAction{Thành viên<br/>hành động?}
    
    MemberAction -->|Xem đề xuất| ViewDetails[Đọc chi tiết<br/>& tài liệu]
    ViewDetails --> MakeDecision{Quyết định?}
    
    MakeDecision -->|Đồng ý| VoteYes[Bỏ phiếu: Đồng ý]
    MakeDecision -->|Không đồng ý| VoteNo[Bỏ phiếu: Không]
    MakeDecision -->|Chưa quyết định| SkipVote[Bỏ qua<br/>bỏ phiếu lần này]
    
    VoteYes --> AddComment{Thêm<br/>bình luận?}
    VoteNo --> AddComment
    
    AddComment -->|Có| InputComment[Nhập lý do/<br/>ý kiến]
    InputComment --> SaveUserVote
    AddComment -->|Không| SaveUserVote[Lưu UserVote:<br/>- vote_choice<br/>- user_id<br/>- voting_weight]
    
    SaveUserVote --> CalculateWeight[Tính trọng số:<br/>= ownership_ratio]
    CalculateWeight --> UpdateProgress[Cập nhật<br/>tiến độ bỏ phiếu]
    UpdateProgress --> CheckComplete{Tất cả<br/>đã vote?}
    
    CheckComplete -->|Chưa| SendReminder[Gửi nhắc nhở<br/>thành viên chưa vote]
    SendReminder --> VotingPeriod
    
    SkipVote --> VotingPeriod
    
    CheckComplete -->|Rồi| CloseEarly[Đóng bỏ phiếu<br/>sớm]
    CloseEarly --> CalculateResult
    
    MemberAction -->|Timeout| CheckDeadline{Hết<br/>thời hạn?}
    CheckDeadline -->|Chưa| VotingPeriod
    CheckDeadline -->|Rồi| AutoClose[Tự động đóng<br/>bỏ phiếu]
    AutoClose --> CalculateResult[Tính kết quả]
    
    CalculateResult --> CountVotes[Đếm phiếu<br/>theo trọng số]
    CountVotes --> CalcYes[Tổng % Đồng ý = <br/>Σ(ownership_ratio<br/>của người vote Có)]
    CalcYes --> CalcNo[Tổng % Không = <br/>Σ(ownership_ratio<br/>của người vote Không)]
    CalcNo --> CalcAbstain[Tổng % Không vote = <br/>100% - Đồng ý - Không]
    
    CalcAbstain --> DetermineResult{Kết quả?}
    
    DetermineResult -->|Đồng ý >= 60%| Approved[Đề xuất<br/>ĐƯỢC PHÊ DUYỆT]
    DetermineResult -->|Không >= 40%| Rejected[Đề xuất<br/>BỊ TỪ CHỐI]
    DetermineResult -->|Khác| Tied[HÒA/<br/>KHÔNG ĐẠT]
    
    Approved --> UpdateVoteApproved[Cập nhật GroupVote:<br/>Status = approved<br/>result = yes]
    Rejected --> UpdateVoteRejected[Cập nhật GroupVote:<br/>Status = rejected<br/>result = no]
    Tied --> UpdateVoteTied[Cập nhật GroupVote:<br/>Status = tied<br/>result = tie]
    
    UpdateVoteApproved --> ExecuteDecision[Thực hiện<br/>quyết định]
    ExecuteDecision --> ApplyChanges[Áp dụng<br/>thay đổi vào hệ thống]
    ApplyChanges --> NotifyApproval[Thông báo:<br/>Đề xuất được duyệt<br/>& đã thực hiện]
    NotifyApproval --> LogAudit1[Ghi AuditLog]
    LogAudit1 --> End1([Kết thúc])
    
    UpdateVoteRejected --> NotifyReject[Thông báo:<br/>Đề xuất bị từ chối]
    NotifyReject --> ShowReason[Hiển thị<br/>lý do từ chối]
    ShowReason --> SuggestRevise{Đề xuất<br/>sửa đổi?}
    SuggestRevise -->|Có| CreateVote
    SuggestRevise -->|Không| LogAudit2[Ghi AuditLog]
    LogAudit2 --> End2([Kết thúc])
    
    UpdateVoteTied --> NotifyTie[Thông báo:<br/>Kết quả hòa]
    NotifyTie --> ExtendVoting{Gia hạn<br/>bỏ phiếu?}
    ExtendVoting -->|Có| ExtendDeadline[Gia hạn thêm<br/>48h]
    ExtendDeadline --> VotingPeriod
    ExtendVoting -->|Không| EscalateToAdmin[Chuyển Admin<br/>quyết định]
    EscalateToAdmin --> AdminDecision{Admin<br/>phán quyết?}
    AdminDecision -->|Chấp nhận| ExecuteDecision
    AdminDecision -->|Từ chối| NotifyReject
    
    style Start fill:#4CAF50,stroke:#2E7D32,stroke-width:3px,color:#fff
    style End1 fill:#4CAF50,stroke:#2E7D32,stroke-width:3px,color:#fff
    style End2 fill:#FF9800,stroke:#E65100,stroke-width:2px,color:#fff
    style Approved fill:#4CAF50,stroke:#2E7D32,stroke-width:2px,color:#fff
    style Rejected fill:#F44336,stroke:#C62828,stroke-width:2px,color:#fff
    style Tied fill:#FF9800,stroke:#E65100,stroke-width:2px,color:#fff
```

## Ghi chú

### Các loại bỏ phiếu:

1. **Thay đổi ownership**: Điều chỉnh tỷ lệ sở hữu giữa các thành viên
2. **Thêm/Xóa thành viên**: Mời người mới hoặc loại thành viên
3. **Chi phí lớn**: Quyết định chi > 10 triệu VND (bảo dưỡng lớn, sửa chữa...)
4. **Thay đổi quy định**: Sửa đổi quy tắc nhóm (giờ sử dụng, ưu tiên...)
5. **Xung đột booking**: Giải quyết tranh chấp lịch đặt
6. **Quyết định về xe**: Mua xe mới, bán xe cũ, thay thế

### Trọng số bỏ phiếu:

**Theo tỷ lệ sở hữu** (ownership_ratio):
```
Người A: 40% ownership → Vote của A = 40%
Người B: 35% ownership → Vote của B = 35%
Người C: 25% ownership → Vote của C = 25%
```

### Ngưỡng quyết định:

- **Phê duyệt**: >= 60% đồng ý (tính theo ownership)
- **Từ chối**: >= 40% không đồng ý
- **Hòa/Không đạt**: Giữa 40-60%

### Thời gian:

- **Tối thiểu**: 24 giờ
- **Khuyến nghị**: 48-72 giờ
- **Tối đa**: 7 ngày
- **Gia hạn**: +48 giờ nếu hòa

### Quy trình:

1. **Tạo đề xuất**: Tiêu đề, mô tả, lựa chọn, thời hạn
2. **Thông báo**: Gửi cho tất cả thành viên
3. **Bỏ phiếu**: Thành viên vote + comment (tùy chọn)
4. **Tính kết quả**: Theo trọng số ownership
5. **Thông báo kết quả**: Gửi cho tất cả
6. **Thực hiện**: Nếu được duyệt → Áp dụng thay đổi

### Xử lý đặc biệt:

**Nếu hòa**:
- Gia hạn thêm 48h
- Hoặc chuyển Admin phán quyết

**Nếu không đủ người vote**:
- Gửi nhắc nhở
- Tự động đóng khi hết hạn
- Tính kết quả dựa trên số phiếu hiện có

**Thay đổi đề xuất**:
- Chỉ cho phép trước khi có người vote
- Sau đó phải tạo đề xuất mới

### Ghi log:

Tất cả bỏ phiếu được ghi vào AuditLog:
- Người tạo
- Nội dung
- Kết quả
- Người vote (Có/Không)
- Thời gian
