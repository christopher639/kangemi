const express = require('express');
const {
  getMembers,
  getMember,
  createMember,
  updateMember,
  deleteMember
} = require('../controllers/memberController');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

router.route('/')
  .get( getMembers)
  .post( createMember);

router.route('/:id')
  .get( getMember)
  .put( updateMember)
  .delete( admin, deleteMember);

module.exports = router;