import React, { useState, useEffect } from 'react';
import Header from './Header';
import Footer from './Footer';
import Calendar from './calandar';
import Axios from 'axios';
import dashboardBackground from './assets/bbb.png';
import AnimatedObjects from './AnimatedObjects';
import { useNavigate } from 'react-router-dom';

function AdminDashboard() {
  const [searchQuery, setSearchQuery] = useState('');
  const [courses, setCourses] = useState([]);
  const [lecturers, setLecturers] = useState([]);
  const [courseResults, setCourseResults] = useState([]);
  const [lecturerResults, setLecturerResults] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    Axios.get('http://localhost:5000/api/courses')
      .then((res) => setCourses(res.data?.response || []))
      .catch((err) => console.error('Courses API error:', err));

    Axios.get('http://localhost:5000/api/lecturers')
      .then((res) => setLecturers(res.data?.response || []))
      .catch((err) => console.error('Lecturers API error:', err));
  }, []);

  const handleSearch = () => {
    const query = searchQuery.toLowerCase();

    setCourseResults(
      courses.filter(
        (course) =>
          course.code.toLowerCase().includes(query) ||
          course.name.toLowerCase().includes(query) ||
          (course.assignedlecturer && course.assignedlecturer.toLowerCase().includes(query))
      )
    );

    setLecturerResults(
      lecturers.filter(
        (lect) =>
          lect.name.toLowerCase().includes(query) ||
          lect.id.toLowerCase().includes(query)
      )
    );
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main
        className="relative w-full min-h-screen bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${dashboardBackground})`,
          imageRendering: 'crisp-edges',
          WebkitImageRendering: 'auto',
        }}
      >
        <div className="pt-20 max-w-6xl mx-auto px-4">
          {/* Search Bar */}
          <div className="flex justify-center items-center mb-6">
            <input
              type="text"
              placeholder="Search by course code, name, lecturer name or ID"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full max-w-xl px-4 py-2 border border-orange-500 rounded-l-md focus:outline-none focus:ring-2 focus:ring-orange-600"
            />
            <button
              onClick={handleSearch}
              className="bg-orange-500 text-white px-5 py-2 rounded-r-md font-semibold hover:bg-orange-600 transition"
            >
              Search
            </button>
         

          </div>
                       {/* Course Results */}
                       {courseResults.length > 0 && (
            <div className="w-1/2 p-4 bg-transparent">
              <h3 className="text-xl font-bold text-black-600 p-4">Course Results</h3>
              <table className="w-full table-auto text-left">
                <thead>
                  <tr className="bg-gradient-to-r from-yellow-400 to-orange-400 text-black text-sm uppercase font-bold">
                    <th className="px-4 py-2 ">Course Code</th>
                    <th className="px-4 py-2">Course Name</th>
                    <th className="px-4 py-2">Credit Hours</th>
                    <th className="px-4 py-2">Department</th>
                    <th className="px-4 py-2">Lecturer</th>
                  </tr>
                </thead>
                <tbody>
                  {courseResults.map((course, idx) => (
                    <tr key={idx} className="border-t">
                      <td className="px-4 py-2">{course.code}</td>
                      <td className="px-4 py-2">{course.name}</td>
                      <td className="px-4 py-2">{course.credithours}</td>
                      <td className="px-4 py-2">{course.department}</td>
                      <td className="px-4 py-2">
                        {course.assignedlecturer || 'Not Assigned'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Lecturer Results (same as above, omitted here for brevity, reuse your provided table) */}

          <AnimatedObjects />

          {/* Summary Cards */}
          <div className="grid grid-cols-4 gap-4 mb-10">
            <div
              className="bg-gradient-to-r from-orange-500 to-yellow-100 text-black p-4 rounded shadow-lg text-center cursor-pointer"
              onClick={() => navigate('/courses')}
            >
              <h4>Total Courses</h4>
              <p className="text-2xl font-bold">{courses.length}</p>
            </div>
            <div
              className="bg-gradient-to-r from-orange-100 to-yellow-500 text-black p-4 rounded shadow-lg text-center cursor-pointer"
              onClick={() => navigate('/lecturers')}
            >
              <h4>Total Lecturers</h4>
              <p className="text-2xl font-bold">{lecturers.length}</p>
            </div>
            <div className="bg-gradient-to-r from-orange-500 to-yellow-100 text-black p-4 rounded shadow-lg text-center">
              <h4>Assigned Courses</h4>
              <p className="text-2xl font-bold">
                {courses.filter((c) => c.assignedlecturer).length}
              </p>
            </div>
            <div className="bg-gradient-to-r from-orange-100 to-yellow-500 text-black p-4 rounded shadow-lg text-center">
              <h4>Departments</h4>
              <p className="text-2xl font-bold">
                {new Set(courses.map((c) => c.department)).size}
              </p>
            </div>
          </div>

          {/* Quick Actions (Transparent background as requested) */}
          <div className="flex gap-6 mb-10">
            <div className="w-1/2 p-4 bg-transparent">
              <h3 className="text-black-600 font-semibold mb-4 hover:text-black">Quick Actions</h3>
              <a
                href="/add-lecturer"
                className="bg-orange-500 text-white py-2 px-4 rounded shadow hover:bg-orange-600 hover:text-black"
              >
                Add Lecturer
              </a>
              <a
                href="/add-course"
                className="bg-yellow-500 text-white py-2 px-4 rounded shadow hover:bg-yellow-600 ml-2 hover:text-black"
              >
                Add Course
              </a>
              <a
                href="/report"
                className="bg-orange-400 text-white py-2 px-4 rounded shadow hover:bg-orange-500 ml-2 hover:text-black"
              >
                Reports
              </a>
            </div>

           
          </div>


          <div className="fixed bottom-6 right-6 z-50">
            <div className="bg-white bg-opacity-90 p-4 rounded-lg shadow-lg">
              <Calendar />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default AdminDashboard;
