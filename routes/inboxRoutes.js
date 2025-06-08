const express = require('express');
const router = express.Router();
const { checkEmailStatus } = require('../controllers/inboxController');

router.get('/check', checkEmailStatus);

module.exports = router;
