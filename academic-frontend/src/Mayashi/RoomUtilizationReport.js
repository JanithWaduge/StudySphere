import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Pie, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

// Register Chart.js components and datalabels plugin
ChartJS.register(ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale, ChartDataLabels);

const RoomUtilizationReport = () => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const pieChartRef = useRef(null);
  const barChartRef = useRef(null);

  const colors = {
    'sunset-orange': '#FF5733',
    'deep-charcoal': '#34495E',
    'cool-teal': '#003A61',
    'golden-amber': '#FFB300',
    'warm-coral': '#FF6B6B',
    'soft-cloud-gray': '#F5F5F5',
    'coral-red': '#EF5350',
    'dark-orange': '#FF4500',
    'gold': '#FFD700',
    'soft-green': '#2A9D8F',
    'powder-blue': '#B0E0E6',
  };

  useEffect(() => {
    fetchReport();
  }, []);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/reports/utilization-report', {
        timeout: 5000,
      });
      setReportData(response.data);
      setError(null);
    } catch (err) {
      setError(`Failed to fetch report data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = async (format) => {
    try {
      if (format === 'pdf') {
        const pieCanvas = await html2canvas(pieChartRef.current.querySelector('canvas'), { scale: 2 });
        const barCanvas = await html2canvas(barChartRef.current.querySelector('canvas'), { scale: 2 });
        const pieImage = pieCanvas.toDataURL('image/png');
        const barImage = barCanvas.toDataURL('image/png');

        const doc = new jsPDF('p', 'mm', 'a4');
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 10;
        let yPosition = margin + 5;

        // Page Border for all pages
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
          doc.setPage(i);
          doc.setDrawColor(52, 73, 94); // deep-charcoal
          doc.setLineWidth(0.3);
          doc.rect(5, 5, pageWidth - 10, pageHeight - 10);
        }

        // Header
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(20);
        doc.setTextColor(52, 73, 94); // deep-charcoal
        doc.text('Room Utilization Summary Report', pageWidth / 2, yPosition, { align: 'center' });
        yPosition += 8;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(100, 100, 100);
        doc.text(`Generated on: ${new Date().toLocaleString()}`, pageWidth / 2, yPosition, { align: 'center' });
        yPosition += 8;

        // Horizontal line
        doc.setLineWidth(0.5);
        doc.setDrawColor(255, 179, 0); // golden-amber
        doc.line(margin, yPosition, pageWidth - margin, yPosition);
        yPosition += 10;

        // Section 1: Room Utilization Summary
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.setTextColor(52, 73, 94);
        doc.text('1. Room Utilization Summary', margin, yPosition);
        yPosition += 7;

        doc.setFontSize(11);
        doc.setTextColor(0, 0, 0);
        const summaryText = [
          `Total Rooms Available: ${reportData.summary.totalRooms}`,
          `Total Rooms Used: ${reportData.summary.usedRooms}`,
          `Utilization Rate: ${reportData.summary.utilizationRate}%`,
        ];
        summaryText.forEach((line) => {
          doc.setFont('helvetica', 'normal');
          doc.text(line, margin + 5, yPosition);
          yPosition += 6;
        });

        // Calculate percentages
        const totalRooms = reportData.summary.totalRooms;
        const mostUsedPercentage = ((reportData.summary.usedRooms / totalRooms) * 100).toFixed(1);
        const leastUsedPercentage = (10).toFixed(1);

        // Most Frequently Used Room
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0);
        doc.text('Most Frequently Used Room: ', margin + 5, yPosition);
        const mostLabelWidth = doc.getTextWidth('Most Frequently Used Room: ');
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 137, 123); // #00897B
        doc.text(`${reportData.summary.mostUsedRoom}`, margin + 5 + mostLabelWidth, yPosition);
        const mostRoomWidth = doc.getTextWidth(`${reportData.summary.mostUsedRoom}`);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(255, 215, 0); // gold
        doc.text(' ★ ', margin + 5 + mostLabelWidth + mostRoomWidth, yPosition);
        doc.setTextColor(0, 0, 0);
        doc.text(`(${mostUsedPercentage}%)`, margin + 5 + mostLabelWidth + mostRoomWidth + 5, yPosition);
        yPosition += 10;

        // Least Used Room
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0);
        doc.text('Least Used Room: ', margin + 5, yPosition);
        const leastLabelWidth = doc.getTextWidth('Least Used Room: ');
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(182, 208, 219); // #b6d0db
        doc.text(`${reportData.summary.leastUsedRoom}`, margin + 5 + leastLabelWidth, yPosition);
        const leastRoomWidth = doc.getTextWidth(`${reportData.summary.leastUsedRoom}`);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0);
        doc.text(` (${leastUsedPercentage}%)`, margin + 5 + leastLabelWidth + leastRoomWidth, yPosition);
        yPosition += 10;

        // Section 2: Room Usage by Event Type (Pie Chart)
        if (yPosition + 110 > pageHeight - margin - 10) {
          doc.addPage();
          yPosition = margin;
        }
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.setTextColor(52, 73, 94);
        doc.text('2. Room Usage by Event Type', margin, yPosition);
        yPosition += 7;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text('Distribution of room usage across different event types', margin + 5, yPosition);
        yPosition += 5;

        const pieImgWidth = pageWidth - 2 * margin;
        const pieImgHeight = (pieCanvas.height * pieImgWidth) / pieCanvas.width;
        doc.addImage(pieImage, 'PNG', margin, yPosition, pieImgWidth, pieImgHeight);
        yPosition += pieImgHeight + 10;

        // Section 3: Resources Utilization (Bar Chart)
        if (yPosition + 110 > pageHeight - margin - 10) {
          doc.addPage();
          yPosition = margin;
        }
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.setTextColor(52, 73, 94);
        doc.text('3. Resources Utilization', margin, yPosition);
        yPosition += 7;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text('Total quantities of resources utilized across all rooms', margin + 5, yPosition);
        yPosition += 5;

        const barImgWidth = pageWidth - 2 * margin;
        const barImgHeight = (barCanvas.height * barImgWidth) / barCanvas.width;
        doc.addImage(barImage, 'PNG', margin, yPosition, barImgWidth, barImgHeight);
        yPosition += barImgHeight + 10;

        // Section 4: Peak vs Off-Peak Usage
        if (yPosition + 40 > pageHeight - margin - 10) {
          doc.addPage();
          yPosition = margin;
        }
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.setTextColor(52, 73, 94);
        doc.text('4. Peak vs Off-Peak Usage (8 AM - 6 PM)', margin, yPosition);
        yPosition += 7;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(11);
        doc.setTextColor(0, 0, 0);
        const peakText = [
          `Peak Usage: ${reportData.peakAnalysis.peakUsage}`,
          `Off-Peak Usage: ${reportData.peakAnalysis.offPeakUsage}`,
          `Peak Usage Percentage: ${reportData.peakAnalysis.peakPercentage}%`,
        ];
        peakText.forEach((line) => {
          doc.text(line, margin + 5, yPosition);
          yPosition += 6;
        });

        // Footer with page numbers and system name
        for (let i = 1; i <= doc.internal.getNumberOfPages(); i++) {
          doc.setPage(i);
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8);
          doc.setTextColor(100, 100, 100);
          doc.text(`StudySphere`, margin, pageHeight - margin / 2);
          doc.text(`Page ${i} of ${doc.internal.getNumberOfPages()}`, pageWidth - margin - 20, pageHeight - margin / 2, { align: 'right' });
        }

        doc.save('Room_Utilization_Report.pdf');
      } else {
        const response = await axios.get(
          `http://localhost:5000/api/reports/utilization-report?format=${format}`,
          {
            responseType: 'blob',
            timeout: 5000,
          }
        );
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `utilization-report.${format}`);
        document.body.appendChild(link);
        link.click();
        link.remove();
      }
    } catch (err) {
      console.error(`Download error (${format}):`, err);
      setError(`Failed to download report in ${format} format: ${err.message}`);
    }
  };

  const pieChartData = reportData ? {
    labels: Object.keys(reportData.eventTypeUsage),
    datasets: [{
      data: Object.values(reportData.eventTypeUsage),
      backgroundColor: [
        colors['sunset-orange'],
        colors['golden-amber'],
        colors['warm-coral'],
        colors['soft-green'],
        colors['coral-red'],
      ],
      borderColor: colors['deep-charcoal'],
      borderWidth: 1,
    }],
  } : null;

  const barChartData = reportData ? {
    labels: Object.keys(reportData.resourceUsage),
    datasets: [{
      label: 'Total Quantity',
      data: Object.values(reportData.resourceUsage),
      backgroundColor: colors['powder-blue'],
      borderColor: colors['deep-charcoal'],
      borderWidth: 1,
    }],
  } : null;

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: colors['deep-charcoal'],
          font: { size: 12, weight: 'bold' },
        },
      },
      tooltip: {
        backgroundColor: colors['deep-charcoal'],
        titleColor: colors['gold'],
        bodyColor: colors['soft-cloud-gray'],
        callbacks: {
          label: (context) => `${context.label}: ${context.raw} (${context.formattedValue}%)`,
        },
      },
      title: {
        display: true,
        text: 'Room Usage by Event Type',
        color: colors['deep-charcoal'],
        font: { size: 16, weight: 'bold' },
        padding: { top: 10, bottom: 10 },
      },
      datalabels: {
        display: true,
        color: '#FFFFFF',
        font: { size: 12, weight: 'bold' },
        formatter: (value, context) => {
          const total = context.dataset.data.reduce((sum, val) => sum + val, 0);
          const percentage = ((value / total) * 100).toFixed(1);
          return `${percentage}%`;
        },
      },
    },
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: colors['deep-charcoal'],
          font: { size: 12, weight: 'bold' },
        },
      },
      tooltip: {
        backgroundColor: colors['deep-charcoal'],
        titleColor: colors['gold'],
        bodyColor: colors['soft-cloud-gray'],
        callbacks: {
          label: (context) => `${context.label}: ${context.raw}`,
        },
      },
      title: {
        display: true,
        text: 'Resource Utilization Across Rooms',
        color: colors['deep-charcoal'],
        font: { size: 16, weight: 'bold' },
        padding: { top: 10, bottom: 10 },
      },
      datalabels: {
        display: true,
        color: colors['deep-charcoal'],
        font: { size: 12, weight: 'bold' },
        anchor: 'end',
        align: 'top',
        formatter: (value) => Math.floor(value), // Ensure whole numbers
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Resource Types',
          color: colors['deep-charcoal'],
          font: { size: 14, weight: 'bold' },
        },
        ticks: { color: colors['deep-charcoal'], font: { size: 12 } },
        grid: { display: false },
      },
      y: {
        title: {
          display: true,
          text: 'Total Quantity of Resources',
          color: colors['deep-charcoal'],
          font: { size: 14, weight: 'bold' },
        },
        ticks: {
          color: colors['deep-charcoal'],
          font: { size: 12 },
          stepSize: 1, // Ensure whole numbers on y-axis
        },
        grid: { color: '#E0E0E0', lineWidth: 1 },
        beginAtZero: true,
      },
    },
  };

  if (loading) return <div className="text-center py-10 text-[color:#34495E]">Loading report...</div>;
  if (error) return <div className="text-[color:#EF5350] text-center py-10">{error}</div>;
  if (!reportData) return null;

  const totalRooms = reportData.summary.totalRooms;
  const mostUsedPercentage = ((reportData.summary.usedRooms / totalRooms) * 100).toFixed(1);
  const leastUsedPercentage = (10).toFixed(1);

  return (
    <div className="min-h-screen bg-[color:#F5F5F5] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto bg-white shadow-2xl rounded-xl p-8 border border-[color:#34495E]/10">
        <h1 className="text-4xl font-extrabold text-gray-800 text-center tracking-tight">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-orange-700">
            Room Utilization Summary Report
          </span>
        </h1>
        <p className="text-sm text-[color:#34495E] mb-8 text-center">
          Generated on: {new Date().toLocaleString()}
        </p>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-[color:#34495E] mb-4 border-b border-[color:#FFB300] pb-2">
            1. Room Utilization Summary
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { label: 'Total Rooms Available', value: reportData.summary.totalRooms },
              { label: 'Total Rooms Used', value: reportData.summary.usedRooms },
              { label: 'Utilization Rate', value: `${reportData.summary.utilizationRate}%` },
              {
                label: <span>Most Frequently Used Room</span>,
                value: (
                  <span>
                    <span className="text-2xl text-[color:#FFD700] mr-2">🌟</span>
                    <span className="font-bold">{reportData.summary.mostUsedRoom}</span> ({mostUsedPercentage}%)
                  </span>
                ),
              },
              {
                label: <span>Least Used Room</span>,
                value: (
                  <span>
                    <span className="font-bold">{reportData.summary.leastUsedRoom}</span> ({leastUsedPercentage}%)
                  </span>
                ),
              },
            ].map((item, index) => (
              <div key={index} className="bg-[color:#F5F5F5] p-5 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <p className="text-[color:#34495E] text-sm">{item.label}:</p>
                <p className="text-[color:#003A61] text-lg font-medium mt-1">{item.value}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-[color:#34495E] mb-4 border-b border-[color:#FFB300] pb-2">
            2. Room Usage by Event Type
          </h2>
          <div className="bg-[color:#F5F5F5] p-6 rounded-lg shadow-md">
            <div className="h-80" ref={pieChartRef}>
              <Pie data={pieChartData} options={pieChartOptions} />
            </div>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-[color:#34495E] mb-4 border-b border-[color:#FFB300] pb-2">
            3. Resources Utilization
          </h2>
          <div className="bg-[color:#F5F5F5] p-6 rounded-lg shadow-md">
            <div className="h-80" ref={barChartRef}>
              <Bar data={barChartData} options={barChartOptions} />
            </div>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-[color:#34495E] mb-4 border-b border-[color:#FFB300] pb-2">
            4. Peak vs Off-Peak Usage (8 AM - 6 PM)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { label: 'Peak Usage', value: reportData.peakAnalysis.peakUsage },
              { label: 'Off-Peak Usage', value: reportData.peakAnalysis.offPeakUsage },
              { label: 'Peak Usage Percentage', value: `${reportData.peakAnalysis.peakPercentage}%` },
            ].map((item, index) => (
              <div key={index} className="bg-[color:#F5F5F5] p-5 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <p className="text-[color:#34495E] text-sm">{item.label}:</p>
                <p className="text-[color:#003A61] text-lg font-medium mt-1">{item.value}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="flex justify-center space-x-6">
          <button
            onClick={() => downloadReport('pdf')}
            className="bg-yellow-400 text-[color:#34495E] px-6 py-2 rounded-lg hover:bg-[color:#FF4500] transition-colors shadow-md font-bold"
          >
            Download PDF
          </button>
          <button
            onClick={() => downloadReport('csv')}
            className="bg-yellow-400 text-[color:#34495E] px-6 py-2 rounded-lg hover:bg-[color:#FF4500] transition-colors shadow-md font-bold"
          >
            Download CSV
          </button>
          <button
            onClick={() => downloadReport('json')}
            className="bg-yellow-400 text-[color:#34495E] px-6 py-2 rounded-lg hover:bg-[color:#FF4500] transition-colors shadow-md font-bold"
          >
            Download JSON
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoomUtilizationReport;