import CoursesTable from "./CoursesTable";
import { useNavigate } from "react-router-dom";
import Axios from "axios";
import { useEffect, useState } from "react";

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = () => {
    Axios.get("http://localhost:5000/api/courses")
      .then((response) => {
        setCourses(response.data?.response || []);
      })
      .catch((error) => console.error("Fetch Error:", error));
  };

  const deleteCourse = (course) => {
    if (window.confirm("Are you sure you want to delete this course?")) {
      Axios.delete("http://localhost:5000/api/deletecourse", { data: { code: course.code } })
        .then(() => fetchCourses())
        .catch((error) => console.error("Delete Error:", error));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-100 via-yellow-200 to-orange-100 py-10 px-6">
      <div className="max-w-6xl mx-auto bg-white bg-opacity-90 shadow-xl rounded-xl p-8 border border-orange-300">
        <h1 className="text-4xl font-extrabold text-orange-600 text-center mb-10">Courses</h1>

        <div className="mb-6 flex justify-center gap-4">
          <button
            onClick={() => navigate("/add-course")}
            className="bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold px-6 py-3 rounded-full shadow-lg hover:brightness-110 transition"
          >
            Add Course
          </button>
          <button
            onClick={() => navigate("/admin/dashboard")}
            className="bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold px-6 py-3 rounded-full shadow-lg hover:brightness-110 transition"
          >
            Dashboard
          </button>
          <button
            onClick={() => navigate("/report")}
            className="bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold px-6 py-3 rounded-full shadow-lg hover:brightness-110 transition"
          >
            Course vise Lecturer Report
          </button>
        </div>

        <CoursesTable
          rows={courses}
          onEdit={(course) => navigate("/add-course", { state: { course } })}
          onDelete={deleteCourse}
        />
      </div>
    </div>
  );
};

export default Courses;
