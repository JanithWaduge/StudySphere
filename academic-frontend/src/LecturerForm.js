import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Axios from "axios";
import AvailabilityDropdown from "./AvailabilityDropdown"; 

const LecturerForm = ({ existingLecturer }) => {
  const navigate = useNavigate();
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");
  const [assignedCourses, setAssignedCourses] = useState("");
  const [availabilityStatus, setAvailabilityStatus] = useState("");
  const [email, setEmail] = useState("");

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (existingLecturer) {
      setId(existingLecturer.id);
      setName(existingLecturer.name);
      setDepartment(existingLecturer.department);
      setAssignedCourses(existingLecturer.assignedCourses);
      setAvailabilityStatus(existingLecturer.availabilityStatus);
      setEmail(existingLecturer.email);
    }
  }, [existingLecturer]);

  const isValidEmail = (email) => {
    return email.includes("@") && email.includes(".");
  };

  const validateForm = () => {
    let tempErrors = {};
    tempErrors.id = id ? "" : "Lecturer ID is required";
    tempErrors.name = name ? "" : "Lecturer Name is required";
    tempErrors.department = department ? "" : "Department is required";
    tempErrors.assignedCourses = assignedCourses ? "" : "Assigned Courses are required";
    tempErrors.availabilityStatus = availabilityStatus ? "" : "Availability Status is required";
    tempErrors.email = email
      ? isValidEmail(email)
        ? ""
        : "Enter a valid email with '@' and '.'"
      : "Email is required";

    setErrors(tempErrors);
    return Object.values(tempErrors).every((x) => x === "");
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const payload = { id, name, department, assignedCourses, availabilityStatus, email };

    if (existingLecturer) {
      Axios.put("http://localhost:5000/api/updatelecturer", payload)
        .then(() => navigate("/lecturers"))
        .catch((error) => console.error("Update Error:", error));
    } else {
      Axios.post("http://localhost:5000/api/createlecturer", payload)
        .then(() => navigate("/lecturers"))
        .catch((error) => console.error("Create Error:", error));
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 bg-gradient-to-br from-yellow-100 via-yellow-200 to-orange-100 shadow-xl rounded-2xl p-10 border border-orange-300">
      <h2 className="text-4xl font-extrabold text-center text-orange-600 mb-8 tracking-wide">
        {existingLecturer ? "Update Lecturer" : "Add New Lecturer"}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block mb-1 text-orange-800 font-semibold">Lecturer ID</label>
          <input
            type="text"
            value={id}
            onChange={(e) => setId(e.target.value)}
            className={`w-full p-3 rounded-lg border ${errors.id ? 'border-red-500' : 'border-orange-300'} focus:outline-none focus:ring-2 focus:ring-orange-400`}
          />
          {errors.id && <p className="text-red-500 text-sm mt-1">{errors.id}</p>}
        </div>

        <div>
          <label className="block mb-1 text-orange-800 font-semibold">Lecturer Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={`w-full p-3 rounded-lg border ${errors.name ? 'border-red-500' : 'border-orange-300'} focus:outline-none focus:ring-2 focus:ring-orange-400`}
          />
          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
        </div>

        <div>
          <label className="block mb-1 text-orange-800 font-semibold">Department</label>
          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className={`w-full p-3 rounded-lg border ${errors.department ? 'border-red-500' : 'border-orange-300'} focus:outline-none focus:ring-2 focus:ring-orange-400 bg-yellow-100 text-orange-800 font-medium`}
          >
            <option value="">Select Department</option>
            <option value="Computing">Computing</option>
            <option value="Business">Business</option>
            <option value="Engineering">Engineering</option>
          </select>
          {errors.department && <p className="text-red-500 text-sm mt-1">{errors.department}</p>}
        </div>

        <div>
          <label className="block mb-1 text-orange-800 font-semibold">Assigned Courses</label>
          <input
            type="text"
            value={assignedCourses}
            onChange={(e) => setAssignedCourses(e.target.value)}
            className={`w-full p-3 rounded-lg border ${errors.assignedCourses ? 'border-red-500' : 'border-orange-300'} focus:outline-none focus:ring-2 focus:ring-orange-400`}
          />
          {errors.assignedCourses && <p className="text-red-500 text-sm mt-1">{errors.assignedCourses}</p>}
        </div>

        <div className="md:col-span-2">
          <label className="block mb-1 text-orange-800 font-semibold">Availability Status</label>
          <AvailabilityDropdown
            value={availabilityStatus}
            onChange={setAvailabilityStatus}
            error={errors.availabilityStatus}
          />
        </div>

        <div className="md:col-span-2">
          <label className="block mb-1 text-orange-800 font-semibold">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`w-full p-3 rounded-lg border ${errors.email ? 'border-red-500' : 'border-orange-300'} focus:outline-none focus:ring-2 focus:ring-orange-400`}
          />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
        </div>
      </div>

      <div className="flex justify-center gap-6 mt-10">
        <button
          onClick={() => navigate("/lecturers")}
          className="bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold px-6 py-3 rounded-full shadow-lg hover:brightness-110 transition"
        >
          Lecturers
        </button>
        <button
          onClick={handleSubmit}
          className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white font-semibold px-6 py-3 rounded-full shadow-lg hover:brightness-110 transition"
        >
          {existingLecturer ? "Update" : "Add Lecturer"}
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

export default LecturerForm;
