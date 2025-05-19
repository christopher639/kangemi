const express = require('express');
const {
  getContributions,
  getContributionsByMember,
  updateContribution,
  updateMonthContribution,
  getContributionsByYear,
} = require('../controllers/contributionController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/',  getContributions);
router.get('/member/:memberId',  getContributionsByMember);
router.put('/:id', updateContribution);
router.put('/member/:memberId/month/:month', updateMonthContribution);
router.get('/:year',getContributionsByYear);
module.exports = router;