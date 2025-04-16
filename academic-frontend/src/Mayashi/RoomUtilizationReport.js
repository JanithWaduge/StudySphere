import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Pie, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

const RoomUtilizationReport = () => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Custom colors
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
      console.log('Report data received:', response.data);
      setReportData(response.data);
      setError(null);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Unknown error';
      console.error('Fetch error details:', {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message,
      });
      setError(`Failed to fetch report data: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };
  
  const downloadReport = async (format) => {
    try {
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
    } catch (err) {
      console.error(`Download error (${format}):`, err);
      setError(`Failed to download report in ${format} format: ${err.message}`);
    }
  };
  
  // Pie Chart Data for Room Usage by Event Type
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

  // Bar Chart Data for Resources Utilization
  const barChartData = reportData ? {
    labels: Object.keys(reportData.resourceUsage),
    datasets: [{
      label: 'Resource Count',
      data: Object.values(reportData.resourceUsage),
      backgroundColor: colors['cool-teal'],
      borderColor: colors['deep-charcoal'],
      borderWidth: 1,
    }],
  } : null;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', labels: { color: colors['deep-charcoal'] } },
      tooltip: { backgroundColor: colors['deep-charcoal'], titleColor: colors['gold'], bodyColor: colors['soft-cloud-gray'] },
    },
  };

  const barOptions = {
    ...chartOptions,
    scales: {
      y: { beginAtZero: true, ticks: { color: colors['deep-charcoal'] } },
      x: { ticks: { color: colors['deep-charcoal'] } },
    },
  };

  if (loading) return <div className="text-center py-10 text-[color:#34495E]">Loading report...</div>;
  if (error) return <div className="text-[color:#EF5350] text-center py-10">{error}</div>;
  if (!reportData) return null;

  return (
    <div className="min-h-screen bg-[color:#F5F5F5] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto bg-white shadow-2xl rounded-xl p-8 border border-[color:#34495E]/10">
      <h1 className="text-4xl font-bold mb-6 text-center tracking-tight 
               bg-gradient-to-r from-orange-500 to-orange-700 
               bg-clip-text text-transparent">
              Room Utilization Summary Report
      </h1>
        <p className="text-sm text-[color:#34495E] mb-8 text-center">
          Generated on: {new Date().toLocaleString()}
        </p>

        {/* Section 1: Room Utilization Summary */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-[color:#34495E] mb-4 border-b border-[color:#FFB300] pb-2">
            1. Room Utilization Summary
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { label: 'Total Rooms Available', value: reportData.summary.totalRooms },
              { label: 'Total Rooms Used', value: reportData.summary.usedRooms },
              { label: 'Utilization Rate', value: `${reportData.summary.utilizationRate}%` },
              { label: 'Most Frequently Used Room', value: reportData.summary.mostUsedRoom },
              { label: 'Least Used Room', value: reportData.summary.leastUsedRoom },
            ].map((item, index) => (
              <div key={index} className="bg-[color:#F5F5F5] p-5 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <p className="text-[color:#34495E] text-sm">{item.label}:</p>
                <p className="text-[color:#003A61] text-lg font-medium mt-1">{item.value}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Section 2: Room Usage by Event Type (Pie Chart) */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-[color:#34495E] mb-4 border-b border-[color:#FFB300] pb-2">
            2. Room Usage by Event Type
          </h2>
          <div className="bg-[color:#F5F5F5] p-6 rounded-lg shadow-md">
            <div className="h-80">
              <Pie data={pieChartData} options={chartOptions} />
            </div>
          </div>
        </section>

        {/* Section 3: Resources Utilization (Bar Graph) */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-deep-charcoal mb-4 border-b border-golden-amber pb-2">
            3. Resources Utilization
          </h2>
          <div className="bg-soft-cloud-gray p-6 rounded-lg shadow-md">
            <div className="h-80">
              <Bar data={barChartData} options={barOptions} />
            </div>
          </div>
        </section>

        {/* Section 4: Peak vs Off-Peak Usage */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-deep-charcoal mb-4 border-b border-[color:#FFB300] pb-2">
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

        {/* Download Buttons */}
        <div className="flex justify-center space-x-6">
          <button
            onClick={() => downloadReport('pdf')}
            className="bg-golden-amber text-deep-charcoal px-6 py-2 rounded-lg hover:bg-dark-yellow transition-colors shadow-md font-bold"
          >
            Download PDF
          </button>
          <button
            onClick={() => downloadReport('csv')}
            className="bg-golden-amber text-deep-charcoal px-6 py-2 rounded-lg hover:bg-dark-yellow transition-colors shadow-md font-bold"
          >
            Download CSV
          </button>
          <button
            onClick={() => downloadReport('json')}
            className="bg-golden-amber text-deep-charcoal px-6 py-2 rounded-lg hover:bg-dark-yellow transition-colors shadow-md font-bold"
          >
            Download JSON
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoomUtilizationReport;