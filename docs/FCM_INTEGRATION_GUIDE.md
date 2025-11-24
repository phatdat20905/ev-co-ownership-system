# FCM Integration Guide - Backend Services

## Overview
This guide shows how to integrate Firebase Cloud Messaging (FCM) push notifications into backend services using the `notificationHelper` utility.

## Setup

### 1. Import the Helper
```javascript
import { notificationHelper, NOTIFICATION_TYPES } from '@ev-coownership/shared';
```

### 2. Import in Service File
The helper is already exported from `@ev-coownership/shared/utils`, so you can use it in any service.

## Integration Examples

### Booking Service Integration

#### File: `backend/booking-service/src/controllers/bookingController.js`

```javascript
import { notificationHelper, NOTIFICATION_TYPES } from '@ev-coownership/shared';

// After creating a booking
exports.createBooking = async (req, res) => {
  try {
    // ... create booking logic ...
    const booking = await Booking.create(bookingData);
    
    // Send notification to the user
    await notificationHelper.sendBookingNotification(
      NOTIFICATION_TYPES.BOOKING_CREATED,
      {
        id: booking.id,
        vehicleName: vehicle.name,
        startTime: booking.startTime,
        endTime: booking.endTime,
        location: booking.pickupLocation
      },
      req.user.id
    );
    
    res.status(201).json({ success: true, data: booking });
  } catch (error) {
    console.error('Booking creation error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// After canceling a booking
exports.cancelBooking = async (req, res) => {
  try {
    // ... cancel booking logic ...
    await booking.update({ status: 'cancelled' });
    
    // Notify user about cancellation
    await notificationHelper.sendBookingNotification(
      NOTIFICATION_TYPES.BOOKING_CANCELLED,
      {
        id: booking.id,
        vehicleName: vehicle.name,
        startTime: booking.startTime,
        endTime: booking.endTime,
        reason: req.body.reason || 'User cancelled'
      },
      booking.userId
    );
    
    res.json({ success: true, message: 'Booking cancelled' });
  } catch (error) {
    console.error('Booking cancellation error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
```

#### Booking Reminder Cron Job
```javascript
// backend/booking-service/src/jobs/bookingReminder.js
import { notificationHelper, NOTIFICATION_TYPES } from '@ev-coownership/shared';
import { Op } from 'sequelize';

export const sendBookingReminders = async () => {
  try {
    // Find bookings starting in 2 hours
    const upcomingBookings = await Booking.findAll({
      where: {
        startTime: {
          [Op.between]: [
            new Date(),
            new Date(Date.now() + 2 * 60 * 60 * 1000) // 2 hours
          ]
        },
        status: 'confirmed',
        reminderSent: false
      },
      include: [{ model: Vehicle }, { model: User }]
    });
    
    for (const booking of upcomingBookings) {
      await notificationHelper.sendBookingNotification(
        NOTIFICATION_TYPES.BOOKING_REMINDER,
        {
          id: booking.id,
          vehicleName: booking.Vehicle.name,
          startTime: booking.startTime,
          location: booking.pickupLocation
        },
        booking.userId
      );
      
      // Mark reminder as sent
      await booking.update({ reminderSent: true });
    }
    
    console.log(`✅ Sent ${upcomingBookings.length} booking reminders`);
  } catch (error) {
    console.error('Booking reminder job error:', error);
  }
};
```

---

### Cost Service Integration

#### File: `backend/cost-service/src/controllers/costController.js`

```javascript
import { notificationHelper, NOTIFICATION_TYPES } from '@ev-coownership/shared';

// After adding a new cost
exports.createCost = async (req, res) => {
  try {
    // ... create cost logic ...
    const cost = await Cost.create(costData);
    
    // Get all group members
    const group = await Group.findByPk(cost.groupId, {
      include: [{ model: GroupMember, attributes: ['userId'] }]
    });
    const userIds = group.GroupMembers.map(m => m.userId);
    
    // Notify all group members
    await notificationHelper.sendCostNotification(
      NOTIFICATION_TYPES.COST_ADDED,
      {
        id: cost.id,
        amount: cost.amount,
        category: cost.category,
        description: cost.description,
        groupName: group.name
      },
      userIds
    );
    
    res.status(201).json({ success: true, data: cost });
  } catch (error) {
    console.error('Cost creation error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Payment required notification
exports.sendPaymentReminders = async (req, res) => {
  try {
    const { costId } = req.params;
    
    // Find unpaid shares
    const unpaidShares = await CostShare.findAll({
      where: {
        costId,
        status: 'pending'
      },
      include: [{ model: Cost }, { model: User }]
    });
    
    for (const share of unpaidShares) {
      await notificationHelper.sendPaymentNotification(
        NOTIFICATION_TYPES.PAYMENT_REQUIRED,
        {
          amount: share.amount,
          dueDate: share.dueDate,
          description: share.Cost.description
        },
        share.userId
      );
    }
    
    res.json({ success: true, message: 'Payment reminders sent' });
  } catch (error) {
    console.error('Payment reminder error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
```

---

### Contract Service Integration

#### File: `backend/contract-service/src/controllers/contractController.js`

```javascript
import { notificationHelper, NOTIFICATION_TYPES } from '@ev-coownership/shared';

// After contract signing
exports.signContract = async (req, res) => {
  try {
    // ... sign contract logic ...
    await contract.update({ 
      status: 'signed',
      signedAt: new Date(),
      signatureData: req.body.signature
    });
    
    // Notify user
    await notificationHelper.sendContractNotification(
      NOTIFICATION_TYPES.CONTRACT_SIGNED,
      {
        id: contract.id,
        title: contract.title,
        type: contract.type,
        signedAt: new Date()
      },
      req.user.id
    );
    
    res.json({ success: true, data: contract });
  } catch (error) {
    console.error('Contract signing error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// After admin approval
exports.approveContract = async (req, res) => {
  try {
    // ... approve contract logic ...
    await contract.update({ 
      status: 'approved',
      approvedBy: req.user.id,
      approvedAt: new Date()
    });
    
    // Notify contract owner
    await notificationHelper.sendContractNotification(
      NOTIFICATION_TYPES.CONTRACT_APPROVED,
      {
        id: contract.id,
        title: contract.title,
        approvedBy: req.user.name
      },
      contract.userId
    );
    
    res.json({ success: true, message: 'Contract approved' });
  } catch (error) {
    console.error('Contract approval error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
```

---

### AI Service Integration

#### File: `backend/ai-service/src/controllers/fairnessAnalysisController.js`

```javascript
import { notificationHelper, NOTIFICATION_TYPES } from '@ev-coownership/shared';

// After completing fairness analysis
exports.analyzeFairness = async (req, res) => {
  try {
    const { groupId } = req.params;
    
    // ... perform AI fairness analysis ...
    const analysis = await performFairnessAnalysis(groupId);
    
    // Save analysis results
    const savedAnalysis = await FairnessAnalysis.create(analysis);
    
    // Get all group members
    const group = await Group.findByPk(groupId, {
      include: [{ model: GroupMember, attributes: ['userId'] }]
    });
    const userIds = group.GroupMembers.map(m => m.userId);
    
    // Notify all group members
    await notificationHelper.sendAIFairnessNotification(
      {
        id: savedAnalysis.id,
        groupId: groupId,
        groupName: group.name,
        overallScore: savedAnalysis.overallScore,
        fairnessLevel: savedAnalysis.fairnessLevel,
        issuesFound: savedAnalysis.issuesCount,
        recommendations: savedAnalysis.recommendations
      },
      userIds
    );
    
    res.json({ success: true, data: savedAnalysis });
  } catch (error) {
    console.error('Fairness analysis error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
```

---

### User Service Integration

#### File: `backend/user-service/src/controllers/groupController.js`

```javascript
import { notificationHelper, NOTIFICATION_TYPES } from '@ev-coownership/shared';

// After sending group invitation
exports.inviteToGroup = async (req, res) => {
  try {
    const { groupId, userId } = req.body;
    
    // ... create invitation logic ...
    const invitation = await GroupInvitation.create({
      groupId,
      userId,
      invitedBy: req.user.id,
      status: 'pending'
    });
    
    const group = await Group.findByPk(groupId);
    
    // Notify invited user
    await notificationHelper.sendGroupInvitation(
      userId,
      {
        id: group.id,
        name: group.name,
        description: group.description,
        memberCount: group.memberCount
      }
    );
    
    res.status(201).json({ success: true, data: invitation });
  } catch (error) {
    console.error('Group invitation error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// After user joins group
exports.addMemberToGroup = async (req, res) => {
  try {
    // ... add member logic ...
    await GroupMember.create({ groupId, userId });
    
    // Notify all existing group members
    const existingMembers = await GroupMember.findAll({
      where: { groupId, userId: { [Op.ne]: userId } },
      attributes: ['userId']
    });
    const userIds = existingMembers.map(m => m.userId);
    
    // Send topic notification to all members
    await notificationHelper.sendTopicNotification(
      `group_${groupId}`,
      'Thành viên mới',
      `${newUser.name} đã tham gia nhóm ${group.name}`,
      {
        type: NOTIFICATION_TYPES.GROUP_MEMBER_ADDED,
        groupId: groupId,
        userId: userId,
        userName: newUser.name
      }
    );
    
    res.json({ success: true, message: 'Member added' });
  } catch (error) {
    console.error('Add member error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
```

---

### Admin Service Integration - Dispute Management

#### File: `backend/admin-service/src/controllers/disputeController.js`

```javascript
import { notificationHelper, NOTIFICATION_TYPES } from '@ev-coownership/shared';

// After dispute status update
exports.updateDispute = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, resolution } = req.body;
    
    // ... update dispute logic ...
    const dispute = await Dispute.update({ status, resolution }, {
      where: { id },
      returning: true
    });
    
    // Notify dispute creator
    await notificationHelper.sendDisputeNotification(
      NOTIFICATION_TYPES.DISPUTE_UPDATED,
      {
        id: dispute.id,
        subject: dispute.subject,
        status: status,
        resolution: resolution
      },
      dispute.createdBy
    );
    
    res.json({ success: true, data: dispute });
  } catch (error) {
    console.error('Dispute update error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
```

---

## Topic-Based Notifications

### Subscribe Users to Group Topics

```javascript
// When user joins a group
import axios from 'axios';

const subscribeToGroupTopic = async (userId, groupId) => {
  try {
    // Get user's FCM tokens
    const tokensResponse = await axios.get(
      `${process.env.NOTIFICATION_SERVICE_URL}/notifications/tokens/${userId}`
    );
    const tokens = tokensResponse.data.data.map(t => t.token);
    
    if (tokens.length > 0) {
      // Subscribe to group topic
      await axios.post(
        `${process.env.NOTIFICATION_SERVICE_URL}/notifications/topic/subscribe`,
        {
          tokens: tokens,
          topic: `group_${groupId}`
        }
      );
      
      console.log(`✅ User ${userId} subscribed to group_${groupId} topic`);
    }
  } catch (error) {
    console.error('Topic subscription error:', error);
  }
};
```

### Broadcast to Group

```javascript
// Announce to all group members
await notificationHelper.sendTopicNotification(
  `group_${groupId}`,
  'Important Announcement',
  'Group meeting scheduled for tomorrow at 10 AM',
  {
    type: 'announcement',
    groupId: groupId,
    url: `/groups/${groupId}/announcements`
  }
);
```

---

## Notification Types Reference

```javascript
// Available notification types from NOTIFICATION_TYPES
BOOKING_CREATED
BOOKING_CANCELLED
BOOKING_COMPLETED
BOOKING_REMINDER

COST_ADDED
COST_UPDATED
PAYMENT_REQUIRED
PAYMENT_RECEIVED
PAYMENT_REMINDER

CONTRACT_SIGNED
CONTRACT_APPROVED
CONTRACT_REJECTED
CONTRACT_EXPIRING

VOTE_CREATED
VOTE_CLOSED
VOTE_RESULT

AI_FAIRNESS_ANALYSIS

DISPUTE_CREATED
DISPUTE_UPDATED
DISPUTE_RESOLVED

GROUP_INVITATION
GROUP_MEMBER_ADDED
GROUP_MEMBER_REMOVED

SYSTEM
ANNOUNCEMENT
```

---

## Best Practices

1. **Always use try-catch**: Notification failures should not break main flow
2. **Use async/await**: Don't wait for notification responses
3. **Log errors**: Monitor notification failures for debugging
4. **Template variables**: Use descriptive variable names matching templates
5. **User IDs vs Arrays**: Single user = `userId`, multiple = `userIds`
6. **Topics for broadcasts**: Use topics for group-wide notifications
7. **Include data payload**: Add relevant data for deep linking

---

## Environment Variables

Add to each service's environment:

```env
NOTIFICATION_SERVICE_URL=http://notification-service-dev:3008
```

---

## Testing Notifications

### Test Script Example
```javascript
// test-notification.js
import { notificationHelper, NOTIFICATION_TYPES } from '@ev-coownership/shared';

const testBookingNotification = async () => {
  await notificationHelper.sendBookingNotification(
    NOTIFICATION_TYPES.BOOKING_CREATED,
    {
      vehicleName: 'Tesla Model 3',
      startTime: '2024-01-15 09:00',
      endTime: '2024-01-15 17:00',
      location: 'Downtown Parking'
    },
    'user-id-here'
  );
  console.log('✅ Test notification sent');
};

testBookingNotification();
```

---

## Troubleshooting

### Notifications not being sent?
1. Check notification-service is running
2. Verify `NOTIFICATION_SERVICE_URL` environment variable
3. Check user has registered FCM token
4. Check backend logs for errors

### User not receiving notifications?
1. Verify FCM token is registered: `GET /notifications/tokens/:userId`
2. Check browser notification permission granted
3. Verify service worker is active
4. Check Firebase console for delivery status

---

## Next Steps

1. Integrate into booking-service ✅ (High Priority)
2. Integrate into cost-service ✅ (High Priority)
3. Integrate into ai-service ✅ (High Priority)
4. Integrate into contract-service (Medium Priority)
5. Integrate into user-service (Medium Priority)
6. Integrate into admin-service (Low Priority)

---

For more information, see:
- `backend/shared/utils/notificationHelper.js` - Helper implementation
- `backend/notification-service/src/utils/notificationTypes.js` - Type definitions
- `backend/notification-service/README.md` - Service documentation
