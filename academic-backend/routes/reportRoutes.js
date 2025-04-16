const express = require('express');
const router = express.Router();
const Schedule = require('../models/Schedule');
const LectureRoom = require('../models/LectureRoom');
const PDFDocument = require('pdfkit');

router.get('/utilization-report', async (req, res) => {
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

    const resourceUsage = rooms.reduce((acc, room) => {
      room.available_equipments.forEach((equipment) => {
        acc[equipment] = (acc[equipment] || 0) + 1;
      });
      return acc;
    }, {});

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
        doc.fontSize(12).text(`Generated on: ${new Date().toLocaleString()}`);
        doc.moveDown();
        doc.text('1. Room Utilization Summary');
        doc.text(`Total Rooms: ${totalRooms}`);
        doc.text(`Rooms Used: ${usedRooms}`);
        doc.text(`Utilization Rate: ${utilizationRate}%`);
        doc.text(`Most Used Room: ${mostUsedRoom}`);
        doc.text(`Least Used Room: ${leastUsedRoom}`);
        doc.moveDown();
        doc.text('2. Room Usage by Event Type');
        Object.entries(eventTypeUsage).forEach(([type, count]) => doc.text(`${type}: ${count}`));
        doc.moveDown();
        doc.text('3. Resources Utilization');
        Object.entries(resourceUsage).forEach(([resource, count]) =>
          doc.text(`${resource}: ${count}`)
        );
        doc.moveDown();
        doc.text('4. Peak vs Off-Peak Usage (8 AM - 6 PM)');
        doc.text(`Peak Usage: ${peakUsage}`);
        doc.text(`Off-Peak Usage: ${offPeakUsage}`);
        doc.text(`Peak Usage Percentage: ${reportData.peakAnalysis.peakPercentage}%`);
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
          ...Object.entries(resourceUsage).map(([resource, count]) => `${resource},${count}`),
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
});

module.exports = router;