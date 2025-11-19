// src/routes/groupsRoutes.js
import express from 'express';

const router = express.Router();

// Temporary placeholder for groups list. In future this should query the groups service or DB.
router.get('/', async (req, res) => {
  try {
    // Return sample data matching frontend expectations
    const groups = [
      {
        id: '77777777-7777-7777-7777-777777777771',
        name: 'Nhóm VF e34',
        cars: 8,
        coOwners: 32,
        utilization: 78,
        status: 'active',
        revenue: 18450000,
      },
      {
        id: '77777777-7777-7777-7777-777777777772',
        name: 'Nhóm VF 8',
        cars: 6,
        coOwners: 18,
        utilization: 65,
        status: 'active',
        revenue: 15680000,
      },
      {
        id: '77777777-7777-7777-7777-777777777773',
        name: 'Nhóm VF 9',
        cars: 4,
        coOwners: 20,
        utilization: 82,
        status: 'active',
        revenue: 21450000,
      }
    ];

    return res.status(200).json({ success: true, message: 'Groups retrieved', data: groups });
  } catch (err) {
    console.error('Failed to get groups', err);
    return res.status(500).json({ success: false, message: 'Failed to get groups' });
  }
});

export default router;
