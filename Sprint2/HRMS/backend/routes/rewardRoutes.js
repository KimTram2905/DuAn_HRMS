const express = require('express');
const router = express.Router();
const rewardController = require('../controllers/rewardController');
const { auth, checkRole } = require('../middleware/auth');

router.get('/', auth, checkRole('Manager', 'Admin'), rewardController.getRewards);
router.post('/', auth, checkRole('Manager', 'Admin'), rewardController.createReward);
router.put('/:id', auth, checkRole('Manager', 'Admin'), rewardController.updateReward);
router.delete('/:id', auth, checkRole('Manager', 'Admin'), rewardController.deleteReward);

module.exports = router;