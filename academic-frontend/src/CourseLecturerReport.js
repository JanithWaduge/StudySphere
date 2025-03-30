import React, { useEffect, useRef, useState } from "react";
import Axios from "axios";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale } from "chart.js";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";

ChartJS.register(BarElement, CategoryScale, LinearScale);

const CourseLecturerReport = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [unassignedOnly, setUnassignedOnly] = useState(false);
  const [selectedSemester] = useState("");
  const chartRef = useRef(); // 🆕 Chart reference

  useEffect(() => {
    Axios.get("http://localhost:5000/api/courses")
      .then((res) => setCourses(res.data?.response || []))
      .catch((err) => console.error("Fetch error:", err));
  }, []);

  const filteredCourses = courses.filter((course) => {
    const deptMatch = selectedDepartment === "" || course.department === selectedDepartment;
    const unassignedMatch = !unassignedOnly || !course.assignedlecturer;
    const semesterMatch = selectedSemester === "" || course.semester === selectedSemester;
    return deptMatch && unassignedMatch && semesterMatch;
  });

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.setTextColor("#ea580c");
    doc.text("Course-wise Lecturer Allocation Report", 14, 20);

    const chartCanvas = chartRef.current?.querySelector("canvas");

    if (chartCanvas) {
      const chartImg = chartCanvas.toDataURL("image/png", 1.0);
      doc.addImage(chartImg, "PNG", 30, 30, 150, 70); // X, Y, width, height
    }

    const tableY = chartCanvas ? 110 : 30;

    const tableRows = filteredCourses.map((course) => [
      course.code,
      course.name,
      course.credithours,
      course.department,
      course.assignedlecturer || "❌ Not Assigned",
    ]);

    autoTable(doc, {
      head: [["Course Code", "Name", "Credit Hours", "Department", "Lecturer"]],
      body: tableRows,
      startY: tableY,
      styles: {
        fontSize: 10,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [251, 191, 36], // yellow-400
        textColor: 255,
        halign: "center",
      },
      bodyStyles: {
        halign: "center",
      },
      alternateRowStyles: {
        fillColor: [255, 250, 235],
      },
    });

    doc.save("Course-Lecturer-Report.pdf");
  };

  const exportToCSV = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredCourses);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Courses");
    XLSX.writeFile(workbook, "Course-Lecturer-Report.csv");
  };

  const printTable = () => {
    window.print();
  };

  const chartData = {
    labels: filteredCourses.map((course) => course.code),
    datasets: [
      {
        label: "Credit Hours",
        data: filteredCourses.map((course) => course.credithours),
        backgroundColor: "#f59e0b", // orange-400
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-100 via-yellow-200 to-orange-100 py-12 px-6">
      <div className="max-w-6xl mx-auto bg-white shadow-xl rounded-xl p-8 border border-orange-300">
        <h2 className="text-3xl font-bold text-orange-600 mb-6 text-center">
          Course-wise Lecturer Allocation Report
        </h2>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="px-4 py-2 border border-orange-400 rounded focus:outline-none"
          >
            <option value="">All Departments</option>
            <option value="Computing">Computing</option>
            <option value="Business">Business</option>
            <option value="Engineering">Engineering</option>
          </select>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={unassignedOnly}
              onChange={() => setUnassignedOnly(!unassignedOnly)}
              className="mr-2"
            />
            <span>Show only unassigned</span>
          </label>

          <div className="col-span-2 flex flex-wrap justify-center gap-2">
            <button
              onClick={generatePDF}
              className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
            >
              📄 PDF
            </button>
            <button
              onClick={exportToCSV}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              📁 CSV
            </button>
            <button
              onClick={printTable}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              🖨️ Print
            </button>
            <button
              onClick={() => navigate("/admin/dashboard")}
              className="bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold px-6 py-2 rounded-full shadow-md hover:brightness-110"
            >
              Dashboard
            </button>
          </div>
        </div>

        {/* Chart */}
        <div className="mb-10">
          <div ref={chartRef}>
            <Bar data={chartData} height={120} />
          </div>
        </div>

        {/* Table */}
        <table className="w-full table-auto border border-orange-300">
          <thead>
            <tr className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white">
              <th className="px-4 py-2">Course Code</th>
              <th className="px-4 py-2">Course Name</th>
              <th className="px-4 py-2">Credit Hours</th>
              <th className="px-4 py-2">Department</th>
              <th className="px-4 py-2">Lecturer</th>
            </tr>
          </thead>
          <tbody>
            {filteredCourses.map((course, idx) => (
              <tr
                key={idx}
                className={`text-center border-t ${
                  !course.assignedlecturer ? "bg-red-50 text-red-700 font-semibold" : ""
                }`}
              >
                <td className="px-4 py-2">{course.code}</td>
                <td className="px-4 py-2">{course.name}</td>
                <td className="px-4 py-2">{course.credithours}</td>
                <td className="px-4 py-2">{course.department}</td>
                <td className="px-4 py-2">{course.assignedlecturer || "❌ Not Assigned"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CourseLecturerReport;
