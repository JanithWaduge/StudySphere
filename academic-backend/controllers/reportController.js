const Schedule = require('../models/Schedule');
const LectureRoom = require('../models/LectureRoom');
const PDFDocument = require('pdfkit');
const { Buffer } = require('buffer');

// Generate utilization report
const getUtilizationReport = async (req, res) => {
  try {
    const rooms = await LectureRoom.find();
    const schedules = await Schedule.find();

    const totalRooms = rooms.length;
    const usedRooms = new Set(schedules.map((s) => s.roomName)).size;
    const utilizationRate = totalRooms > 0 ? ((usedRooms / totalRooms) * 100).toFixed(2) : '0.00';

    const roomUsageCount = schedules.reduce((acc, curr) => {
      acc[curr.roomName] = (acc[curr.roomName] || 0) + 1;
      return acc;
    }, {});
    const mostUsedRoom = Object.entries(roomUsageCount).reduce(
      (a, b) => (a[1] > b[1] ? a : b),
      ['None', 0]
    )[0];
    const leastUsedRoom = Object.entries(roomUsageCount).reduce(
      (a, b) => (a[1] < b[1] ? a : b),
      ['None', Infinity]
    )[0];

    const eventTypeUsage = schedules.reduce((acc, curr) => {
      acc[curr.eventType] = (acc[curr.eventType] || 0) + 1;
      return acc;
    }, {});

    const resourceUsage = {
      Projectors: 0,
      Whiteboard: 0,
      Smartboard: 0,
      Computers: 0,
      Podium: 0,
      'Audio System': 0,
    };

    rooms.forEach((room) => {
      if (room.quantity) {
        resourceUsage.Projectors += Math.max(0, Math.floor(room.quantity.Projectors || 0));
        resourceUsage.Whiteboard += Math.max(0, Math.floor(room.quantity.Whiteboard || 0));
        resourceUsage.Smartboard += Math.max(0, Math.floor(room.quantity.Smartboard || 0));
        resourceUsage.Computers += Math.max(0, Math.floor(room.quantity.Computers || 0));
        resourceUsage.Podium += Math.max(0, Math.floor(room.quantity.Podium || 0));
      }
      if (room.available_equipments && room.available_equipments.includes('Audio System')) {
        resourceUsage['Audio System'] += 1;
      }
    });

    const peakStart = 8 * 60;
    const peakEnd = 18 * 60;
    let peakUsage = 0;
    let offPeakUsage = 0;

    schedules.forEach((schedule) => {
      const [startHour, startMinute] = schedule.startTime.split(':').map(Number);
      const startInMinutes = startHour * 60 + startMinute;
      const endInMinutes = startInMinutes + schedule.duration;
      if (startInMinutes >= peakStart && endInMinutes <= peakEnd) {
        peakUsage++;
      } else {
        offPeakUsage++;
      }
    });

    const reportData = {
      summary: { totalRooms, usedRooms, utilizationRate, mostUsedRoom, leastUsedRoom },
      eventTypeUsage,
      resourceUsage,
      peakAnalysis: {
        peakUsage,
        offPeakUsage,
        peakPercentage:
          schedules.length > 0 ? ((peakUsage / schedules.length) * 100).toFixed(2) : '0.00',
      },
    };

    const format = req.query.format || 'json';
    switch (format.toLowerCase()) {
      case 'pdf':
        const doc = new PDFDocument();
        let buffers = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
          const pdfData = Buffer.concat(buffers);
          res.setHeader('Content-Type', 'application/pdf');
          res.setHeader('Content-Disposition', 'attachment; filename="utilization-report.pdf"');
          res.send(pdfData);
        });
        doc.fontSize(16).text('Room Utilization Summary Report', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(`Generated on: ${new Date().toLocaleString()}`, { align: 'center' });
        doc.moveDown();
        doc.fontSize(14).text('1. Room Utilization Summary', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(12)
          .text(`Total Rooms: ${totalRooms}`)
          .text(`Rooms Used: ${usedRooms}`)
          .text(`Utilization Rate: ${utilizationRate}%`)
          .text(`Most Used Room: ${mostUsedRoom}`)
          .text(`Least Used Room: ${leastUsedRoom}`);
        doc.moveDown();
        doc.fontSize(14).text('2. Room Usage by Event Type', { underline: true });
        doc.moveDown(0.5);
        Object.entries(eventTypeUsage).forEach(([type, count]) =>
          doc.fontSize(12).text(`${type}: ${count}`)
        );
        doc.moveDown();
        doc.fontSize(14).text('3. Resources Utilization', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(12).text('Total quantities of resources across all rooms:');
        doc.moveDown(0.5);
        Object.entries(resourceUsage).forEach(([resource, count]) =>
          doc.fontSize(12).text(`Total quantity of ${resource}: ${count}`)
        );
        doc.moveDown();
        doc.fontSize(14).text('4. Peak vs Off-Peak Usage (8 AM - 6 PM)', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(12)
          .text(`Peak Usage: ${peakUsage}`)
          .text(`Off-Peak Usage: ${offPeakUsage}`)
          .text(`Peak Usage Percentage: ${reportData.peakAnalysis.peakPercentage}%`);
        doc.end();
        break;
      case 'csv':
        const csvContent = [
          'Room Utilization Summary',
          `Total Rooms,${totalRooms}`,
          `Rooms Used,${usedRooms}`,
          `Utilization Rate,${utilizationRate}%`,
          `Most Used Room,${mostUsedRoom}`,
          `Least Used Room,${leastUsedRoom}`,
          '',
          'Room Usage by Event Type',
          ...Object.entries(eventTypeUsage).map(([type, count]) => `${type},${count}`),
          '',
          'Resources Utilization',
          ...Object.entries(resourceUsage).map(([resource, count]) => `Total quantity of ${resource},${count}`),
          '',
          'Peak vs Off-Peak Usage (8 AM - 6 PM)',
          `Peak Usage,${peakUsage}`,
          `Off-Peak Usage,${offPeakUsage}`,
          `Peak Usage Percentage,${reportData.peakAnalysis.peakPercentage}%`,
        ].join('\n');
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="utilization-report.csv"');
        res.send(csvContent);
        break;
      default:
        res.status(200).json(reportData);
    }
  } catch (error) {
    console.error('Error generating utilization report:', error);
    res.status(500).json({ message: 'Error generating report', error: error.message });
  }
};

// Generate PDF with charts
const generatePdfWithCharts = async (req, res) => {
  console.log('Received POST request to /utilization-report-pdf-with-charts');
  try {
    console.log('Request body:', JSON.stringify(req.body, null, 2));

    const { reportData, charts } = req.body;

    // Validate payload
    if (!reportData || !charts || !charts.pieChart || !charts.barChart) {
      console.error('Invalid payload: Missing reportData or charts');
      return res.status(400).json({ message: 'Invalid payload: Missing reportData or charts' });
    }

    console.log('Payload validated successfully');

    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    let buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {
      console.log('PDF generation completed');
      const pdfData = Buffer.concat(buffers);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="utilization-report-with-charts.pdf"');
      res.send(pdfData);
    });

    // Title
    doc.fontSize(16).text('Room Utilization Summary Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Generated on: ${new Date().toLocaleString()}`, { align: 'center' });
    doc.moveDown();

    // Section 1: Room Utilization Summary
    console.log('Adding Section 1');
    doc.fontSize(14).text('1. Room Utilization Summary', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(12)
      .text(`Total Rooms: ${reportData.summary.totalRooms}`)
      .text(`Rooms Used: ${reportData.summary.usedRooms}`)
      .text(`Utilization Rate: ${reportData.summary.utilizationRate}%`)
      .text(`Most Used Room: ${reportData.summary.mostUsedRoom}`)
      .text(`Least Used Room: ${reportData.summary.leastUsedRoom}`);
    doc.moveDown();

    // Section 2: Room Usage by Event Type (Pie Chart)
    console.log('Adding Section 2 - Pie Chart');
    doc.addPage();
    doc.fontSize(14).text('2. Room Usage by Event Type', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(12).text('Distribution of room usage across different event types');
    doc.moveDown(0.5);
    try {
      const pieImageBuffer = Buffer.from(charts.pieChart.split(',')[1], 'base64');
      doc.image(pieImageBuffer, { width: 400, align: 'center' });
    } catch (imgError) {
      console.error('Error adding Pie Chart:', imgError);
      throw imgError;
    }
    doc.moveDown();

    // Section 3: Resources Utilization (Bar Chart)
    console.log('Adding Section 3 - Bar Chart');
    doc.addPage();
    doc.fontSize(14).text('3. Resources Utilization', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(12).text('Total quantities of resources across all rooms');
    doc.moveDown(0.5);
    try {
      const barImageBuffer = Buffer.from(charts.barChart.split(',')[1], 'base64');
      doc.image(barImageBuffer, { width: 400, align: 'center' });
    } catch (imgError) {
      console.error('Error adding Bar Chart:', imgError);
      throw imgError;
    }
    doc.moveDown();

    // Section 4: Peak vs Off-Peak Usage
    console.log('Adding Section 4');
    doc.addPage();
    doc.fontSize(14).text('4. Peak vs Off-Peak Usage (8 AM - 6 PM)', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(12)
      .text(`Peak Usage: ${reportData.peakAnalysis.peakUsage}`)
      .text(`Off-Peak Usage: ${reportData.peakAnalysis.offPeakUsage}`)
      .text(`Peak Usage Percentage: ${reportData.peakAnalysis.peakPercentage}%`);

    doc.end();
    console.log('PDF document ended');
  } catch (error) {
    console.error('Error generating PDF with charts:', error.stack);
    res.status(500).json({ message: 'Error generating PDF with charts', error: error.message });
  }
};

module.exports = {
  getUtilizationReport,
  generatePdfWithCharts,
};