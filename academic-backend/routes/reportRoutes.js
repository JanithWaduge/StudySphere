const express = require('express');
const router = express.Router();
const { getUtilizationReport, generatePdfWithCharts } = require('../controllers/reportController');

// Generate utilization report
router.get('/utilization-report', getUtilizationReport);

// Generate PDF with charts
router.post('/utilization-report-pdf-with-charts', generatePdfWithCharts);

module.exports = router;