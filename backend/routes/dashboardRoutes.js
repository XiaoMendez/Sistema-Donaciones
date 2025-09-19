const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

// Rutas del dashboard
router.get('/stats', dashboardController.stats);
router.get('/campaignProgress', dashboardController.campaignProgress);
router.get('/donationsByCategory', dashboardController.donationsByCategory);
router.get('/totalDonationsByDate', dashboardController.totalDonationsByDate);

module.exports = router;