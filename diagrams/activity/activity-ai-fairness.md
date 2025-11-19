# Activity Diagram - AI Đề xuất Lịch Công bằng

> Quy trình AI phân tích và đề xuất lịch sử dụng xe công bằng dựa trên tỷ lệ sở hữu và lịch sử

```mermaid
flowchart TD
    Start([Người dùng yêu cầu<br/>đề xuất lịch]) --> CheckAuth{Đã đăng nhập<br/>& thuộc nhóm?}
    CheckAuth -->|Không| ShowError[Lỗi: Cần đăng nhập<br/>& tham gia nhóm]
    ShowError --> End1([Kết thúc])
    
    CheckAuth -->|Có| SelectPeriod[Chọn khoảng thời gian<br/>cần đề xuất:<br/>1 tuần / 1 tháng]
    
    SelectPeriod --> CollectData[Thu thập dữ liệu]
    
    CollectData --> GetGroupInfo[Lấy thông tin nhóm:<br/>- Thành viên<br/>- Ownership ratio<br/>- Xe trong nhóm]
    
    GetGroupInfo --> GetHistoricalData[Lấy dữ liệu lịch sử:<br/>- Bookings 3 tháng qua<br/>- Tổng km mỗi người<br/>- Tổng giờ sử dụng<br/>- Tần suất hủy lịch]
    
    GetHistoricalData --> GetUserPreferences[Lấy sở thích người dùng:<br/>- Giờ ưa thích<br/>- Ngày ưa thích<br/>- Mục đích thường xuyên]
    
    GetUserPreferences --> GetConstraints[Lấy ràng buộc:<br/>- Lịch bảo dưỡng<br/>- Ngày nghỉ lễ<br/>- Booking đã confirmed]
    
    GetConstraints --> CalculateUsage[Tính toán mức sử dụng<br/>thực tế]
    
    CalculateUsage --> CalcActualUsage[Với mỗi thành viên:<br/>actual_usage% = <br/>total_hours_used / <br/>total_group_hours]
    
    CalcActualUsage --> CompareRatio[So sánh:<br/>actual_usage%<br/>vs<br/>ownership_ratio%]
    
    CompareRatio --> IdentifyUnderUsed[Xác định thành viên<br/>sử dụng dưới mức]
    IdentifyUnderUsed --> IdentifyOverUsed[Xác định thành viên<br/>sử dụng vượt mức]
    
    IdentifyOverUsed --> CalculateFairness[Tính chỉ số công bằng:<br/>fairness_score = <br/>1 - Σ|actual% - ownership%|]
    
    CalculateFairness --> CheckFairness{Công bằng<br/>hiện tại?}
    
    CheckFairness -->|Đã công bằng<br/>score > 0.9| ShowCurrentStatus[Hiển thị:<br/>Lịch hiện tại<br/>đã công bằng]
    ShowCurrentStatus --> SuggestMaintain[Đề xuất:<br/>Duy trì hiện trạng]
    SuggestMaintain --> End2([Kết thúc])
    
    CheckFairness -->|Chưa công bằng<br/>score <= 0.9| GenerateSlots[Tạo time slots<br/>cho kỳ tới]
    
    GenerateSlots --> DivideTimeSlots[Chia thời gian<br/>thành các slot:<br/>- Buổi sáng 6-12h<br/>- Buổi chiều 12-18h<br/>- Buổi tối 18-23h]
    
    DivideTimeSlots --> AssignPriority[Gán ưu tiên<br/>cho từng thành viên]
    
    AssignPriority --> PriorityLoop[Với mỗi thành viên]
    
    PriorityLoop --> CalcMemberPriority[Tính priority_score:<br/>= (ownership% - actual%)<br/>+ bonus_factors]
    
    CalcMemberPriority --> ApplyBonusFactors[Áp dụng hệ số thưởng:<br/>- Chưa dùng lần nào: +0.2<br/>- Không hủy lịch: +0.1<br/>- Booking sớm: +0.05]
    
    ApplyBonusFactors --> RankMembers[Xếp hạng thành viên<br/>theo priority_score]
    
    RankMembers --> AllocateSlots[Phân bổ slot<br/>theo ưu tiên]
    
    AllocateSlots --> HighPriorityFirst[Thành viên priority cao<br/>được chọn trước]
    
    HighPriorityFirst --> MatchPreferences[Khớp với sở thích:<br/>- Giờ ưa thích<br/>- Ngày ưa thích]
    
    MatchPreferences --> CheckConflict{Có xung đột<br/>với constraint?}
    
    CheckConflict -->|Có| FindAlternative[Tìm slot<br/>thay thế gần nhất]
    FindAlternative --> AssignSlot
    
    CheckConflict -->|Không| AssignSlot[Gán slot<br/>cho thành viên]
    
    AssignSlot --> MoreMembers{Còn<br/>thành viên?}
    MoreMembers -->|Có| AllocateSlots
    MoreMembers -->|Không| ValidateSchedule[Kiểm tra lịch<br/>đề xuất]
    
    ValidateSchedule --> CheckCoverage{Tất cả thành viên<br/>được phân slot?}
    CheckCoverage -->|Không| AdjustAllocation[Điều chỉnh<br/>phân bổ]
    AdjustAllocation --> AllocateSlots
    
    CheckCoverage -->|Có| SimulateFairness[Mô phỏng fairness<br/>sau khi áp dụng]
    
    SimulateFairness --> CalcNewFairness[Tính fairness_score<br/>mới]
    CalcNewFairness --> CheckImprovement{Cải thiện<br/>đáng kể?}
    
    CheckImprovement -->|Không<br/>< 10% improvement| ShowNoImprovement[Thông báo:<br/>Không thể cải thiện<br/>đáng kể]
    ShowNoImprovement --> SuggestManual[Đề xuất:<br/>Điều chỉnh thủ công<br/>hoặc bỏ phiếu]
    SuggestManual --> End3([Kết thúc])
    
    CheckImprovement -->|Có<br/>>= 10% improvement| GenerateRecommendations[Tạo đề xuất]
    
    GenerateRecommendations --> CreateSuggestions[Với mỗi thành viên:<br/>Tạo danh sách<br/>slot đề xuất]
    
    CreateSuggestions --> AddExplanation[Thêm giải thích:<br/>- Tại sao được ưu tiên<br/>- Tỷ lệ usage hiện tại<br/>- Mục tiêu fairness]
    
    AddExplanation --> GenerateVisual[Tạo biểu đồ:<br/>- So sánh ownership vs usage<br/>- Timeline đề xuất<br/>- Fairness score]
    
    GenerateVisual --> SaveRecommendation[Lưu Recommendation:<br/>- group_id<br/>- period<br/>- suggestions (JSON)<br/>- fairness_before<br/>- fairness_after]
    
    SaveRecommendation --> NotifyMembers[Gửi thông báo<br/>đề xuất cho thành viên]
    
    NotifyMembers --> ShowToUser[Hiển thị đề xuất<br/>cho người dùng]
    
    ShowToUser --> UserAction{Hành động<br/>người dùng?}
    
    UserAction -->|Chấp nhận| AcceptSuggestion[Chấp nhận đề xuất]
    AcceptSuggestion --> AutoBook[Tự động tạo<br/>booking theo đề xuất]
    AutoBook --> UpdateRecommendation[Cập nhật:<br/>status = accepted<br/>applied_at = now]
    UpdateRecommendation --> TrackSuccess[Theo dõi<br/>kết quả áp dụng]
    TrackSuccess --> End4([Kết thúc])
    
    UserAction -->|Chỉnh sửa| ModifySuggestion[Điều chỉnh slot<br/>theo ý muốn]
    ModifySuggestion --> ValidateModification{Còn<br/>công bằng?}
    ValidateModification -->|Có| SaveModified[Lưu phiên bản<br/>đã chỉnh sửa]
    SaveModified --> AutoBook
    ValidateModification -->|Không| WarnUnfair[Cảnh báo:<br/>Mất công bằng]
    WarnUnfair --> ConfirmUnfair{Vẫn áp dụng?}
    ConfirmUnfair -->|Có| SaveModified
    ConfirmUnfair -->|Không| ShowToUser
    
    UserAction -->|Từ chối| RejectSuggestion[Từ chối đề xuất]
    RejectSuggestion --> CollectFeedback[Thu thập phản hồi:<br/>Lý do từ chối?]
    CollectFeedback --> UpdateRecommendation2[Cập nhật:<br/>status = rejected<br/>feedback]
    UpdateRecommendation2 --> ImproveModel[Cải thiện<br/>model AI]
    ImproveModel --> End5([Kết thúc])
    
    UserAction -->|Bỏ qua| Ignore[Không hành động]
    Ignore --> End6([Kết thúc])
    
    style Start fill:#4CAF50,stroke:#2E7D32,stroke-width:3px,color:#fff
    style End1 fill:#F44336,stroke:#C62828,stroke-width:2px,color:#fff
    style End2 fill:#2196F3,stroke:#1565C0,stroke-width:2px,color:#fff
    style End3 fill:#FF9800,stroke:#E65100,stroke-width:2px,color:#fff
    style End4 fill:#4CAF50,stroke:#2E7D32,stroke-width:3px,color:#fff
    style End5 fill:#FF9800,stroke:#E65100,stroke-width:2px,color:#fff
    style End6 fill:#9E9E9E,stroke:#616161,stroke-width:2px,color:#fff
    style GenerateRecommendations fill:#2196F3,stroke:#1565C0,stroke-width:2px,color:#fff
```

## Ghi chú

### Mục tiêu:
Đảm bảo mọi thành viên sử dụng xe **công bằng** tương ứng với **tỷ lệ sở hữu** của họ.

### Chỉ số công bằng (Fairness Score):
```
fairness_score = 1 - Σ|actual_usage% - ownership%|
```

**Ví dụ**:
```
Người A: ownership 40%, actual_usage 50% → Chênh lệch 10%
Người B: ownership 35%, actual_usage 25% → Chênh lệch 10%
Người C: ownership 25%, actual_usage 25% → Chênh lệch 0%

fairness_score = 1 - (0.10 + 0.10 + 0.00) = 0.80 (80%)
```

**Đánh giá**:
- **> 0.9**: Rất công bằng
- **0.7 - 0.9**: Khá công bằng
- **< 0.7**: Chưa công bằng → Cần điều chỉnh

### Thuật toán phân bổ:

#### 1. Thu thập dữ liệu:
- Ownership ratio của từng người
- Lịch sử sử dụng 3 tháng
- Sở thích (giờ, ngày)
- Ràng buộc (bảo dưỡng, booking confirmed)

#### 2. Tính priority score:
```
priority_score = (ownership% - actual_usage%) + bonus_factors

Bonus factors:
- Chưa dùng lần nào trong kỳ: +0.2
- Không hủy lịch trong 3 tháng: +0.1
- Booking trước >= 3 ngày: +0.05
- Thành viên mới: +0.15
```

#### 3. Phân bổ slot:
- Xếp hạng theo priority_score
- Priority cao → Chọn trước
- Khớp với sở thích (giờ/ngày ưa thích)
- Tránh xung đột với constraint

#### 4. Kiểm tra & tối ưu:
- Đảm bảo tất cả được phân slot
- Tính fairness_score mới
- Nếu cải thiện < 10% → Không đề xuất
- Nếu >= 10% → Tạo đề xuất

### Đầu ra:

#### Đề xuất cho mỗi thành viên:
```json
{
  "user_id": "uuid",
  "suggested_slots": [
    {
      "date": "2025-12-01",
      "time_slot": "morning",
      "start_time": "08:00",
      "end_time": "12:00",
      "reason": "Bạn đang sử dụng dưới mức sở hữu 10%"
    }
  ],
  "current_usage": "25%",
  "ownership": "35%",
  "target_usage": "35%",
  "fairness_improvement": "+15%"
}
```

#### Biểu đồ:
- Bar chart: Ownership vs Usage (hiện tại & mục tiêu)
- Timeline: Lịch đề xuất cho tuần/tháng
- Pie chart: Phân bổ thời gian giữa các thành viên

### Hành động người dùng:

1. **Chấp nhận**: Tự động tạo booking theo đề xuất
2. **Chỉnh sửa**: Điều chỉnh slot (vẫn kiểm tra fairness)
3. **Từ chối**: Thu thập feedback → Cải thiện model
4. **Bỏ qua**: Không hành động

### Học máy (Machine Learning):

AI Service sử dụng:
- **Historical Data**: Phân tích pattern sử dụng
- **User Preferences**: Học sở thích người dùng
- **Feedback Loop**: Cải thiện từ reject/accept
- **Optimization**: Tối ưu fairness với constraint

### Theo dõi:

Sau khi áp dụng đề xuất:
- Theo dõi fairness_score thực tế
- So sánh với dự đoán
- Điều chỉnh model nếu sai lệch > 10%
