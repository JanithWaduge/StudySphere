// CourseForm.js
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Axios from "axios";
import DepartmentDropdown from "./DepartmentDropdown"; // Make sure this file exists
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const CourseForm = ({ existingCourse }) => {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [credithours, setCredithours] = useState("");
  const [department, setDepartment] = useState("");
  const [assignedlecturer, setAssignedlecturer] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (existingCourse) {
      setCode(existingCourse.code);
      setName(existingCourse.name);
      setCredithours(existingCourse.credithours);
      setDepartment(existingCourse.department);
      setAssignedlecturer(existingCourse.assignedlecturer);
    }
  }, [existingCourse]);

  const validateForm = () => {
    let tempErrors = {};
    tempErrors.code = code ? "" : "Course Code is required";
    tempErrors.name = name ? "" : "Course Name is required";
    tempErrors.credithours = credithours ? "" : "Credit Hours are required";
    tempErrors.department = department ? "" : "Department is required";
    setErrors(tempErrors);
    return Object.values(tempErrors).every((x) => x === "");
  };

  const handleSubmit = () => {
    if (!validateForm()) return;
    const payload = { code, name, credithours, department, assignedlecturer };

    if (existingCourse) {
      Axios.put("http://localhost:5000/api/updatecourse", payload)
        .then(() => navigate("/courses"))
        .catch((error) => {
          console.error("Update Error:", error);
          toast.error("Error updating course");
        });
    } else {
      Axios.post("http://localhost:5000/api/createcourse", payload)
        .then((res) => {
          const lecturer = res?.data?.course?.assignedlecturer;
          if (!assignedlecturer && lecturer) {
            toast.success(`Lecturer "${lecturer}" auto-assigned`, { position: "top-right" });
          }
          navigate("/courses");
        })
        .catch((error) => {
          console.error("Create Error:", error);
          toast.error("Error creating course");
        });
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 bg-gradient-to-br from-yellow-100 via-yellow-200 to-orange-100 shadow-xl rounded-2xl p-10 border border-orange-300">
      <h2 className="text-4xl font-extrabold text-center text-orange-600 mb-8 tracking-wide">
        {existingCourse ? "Update Course" : "Add New Course"}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block mb-1 text-orange-800 font-semibold">Course Code</label>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className={`w-full p-3 rounded-lg border ${errors.code ? 'border-red-500' : 'border-orange-300'} focus:outline-none focus:ring-2 focus:ring-orange-400`}
          />
          {errors.code && <p className="text-red-500 text-sm mt-1">{errors.code}</p>}
        </div>

        <div>
          <label className="block mb-1 text-orange-800 font-semibold">Course Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={`w-full p-3 rounded-lg border ${errors.name ? 'border-red-500' : 'border-orange-300'} focus:outline-none focus:ring-2 focus:ring-orange-400`}
          />
          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
        </div>

        <div>
          <label className="block mb-1 text-orange-800 font-semibold">Credit Hours</label>
          <input
            type="text"
            value={credithours}
            onChange={(e) => setCredithours(e.target.value)}
            className={`w-full p-3 rounded-lg border ${errors.credithours ? 'border-red-500' : 'border-orange-300'} focus:outline-none focus:ring-2 focus:ring-orange-400`}
          />
          {errors.credithours && <p className="text-red-500 text-sm mt-1">{errors.credithours}</p>}
        </div>

        <div>
          <label className="block mb-1 text-orange-800 font-semibold">Department</label>
          <DepartmentDropdown value={department} onChange={setDepartment} error={errors.department} />
        </div>

        <div className="md:col-span-2">
          <label className="block mb-1 text-orange-800 font-semibold">Assigned Lecturer (optional)</label>
          <input
            type="text"
            value={assignedlecturer}
            onChange={(e) => setAssignedlecturer(e.target.value)}
            placeholder="Leave blank to auto-assign"
            className="w-full p-3 rounded-lg border border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>
      </div>

      <div className="flex justify-center gap-6 mt-10">
        <button
          onClick={() => navigate("/courses")}
          className="bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold px-6 py-3 rounded-full shadow-lg hover:brightness-110 transition"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white font-semibold px-6 py-3 rounded-full shadow-lg hover:brightness-110 transition"
        >
          {existingCourse ? "Update" : "Add Course"}
        </button>
        <button
            onClick={() => navigate("/admin/dashboard")}
            className="bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold px-6 py-3 rounded-full shadow-lg hover:brightness-110 transition"
          >
            Dashboard
          </button>
      </div>
    </div>
  );
};

export default CourseForm;
