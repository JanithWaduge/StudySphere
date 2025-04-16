import { useEffect, useState } from "react";
import Axios from "axios";
import { useNavigate } from "react-router-dom";

const Students = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    Axios.get("http://localhost:5000/api/students")
      .then((res) => {
        console.log("✅ API response:", res.data);
        if (res.data.allStudents) {
          setStudents(res.data.allStudents);
        } else {
          setError("Invalid response structure");
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("❌ Fetch Error:", err);
        setError("Failed to fetch students");
        setLoading(false);
      });
  }, []);

  // Optional Edit/Delete handlers
  const handleEdit = (student) => {
    console.log("Edit clicked for:", student);
    // Implement edit logic here
  };

  const handleDelete = (student) => {
    console.log("Delete clicked for:", student);
    // Implement delete logic here
  };

  if (loading) return <div className="text-center mt-5">Loading...</div>;
  if (error) return <div className="text-red-500 text-center mt-5">{error}</div>;

  return (
    <div className="overflow-x-auto shadow-lg rounded-lg bg-white mt-10 mx-auto max-w-6xl">
        
      <h1 className="text-3xl font-semibold text-center my-6">All Students</h1>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-yellow-400 text-black">
          <tr>
            <th className="px-6 py-3 text-left text-sm font-semibold tracking-wider">Student ID</th>
            <th className="px-6 py-3 text-left text-sm font-semibold tracking-wider">Name</th>
            <th className="px-6 py-3 text-left text-sm font-semibold tracking-wider">Email</th>
            <th className="px-6 py-3 text-left text-sm font-semibold tracking-wider">Phone</th>
            <th className="px-6 py-3 text-left text-sm font-semibold tracking-wider">Address</th>
            <th className="px-6 py-3 text-left text-sm font-semibold tracking-wider">Username</th>
            <th className="px-6 py-3 text-left text-sm font-semibold tracking-wider">Register Date</th>
            
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {students.length > 0 ? (
            students.map((student, index) => (
              <tr key={index} className="hover:bg-gray-50 transition-all duration-200">
                <td className="px-6 py-4 text-sm text-gray-800">{student.studentId}</td>
                <td className="px-6 py-4 text-sm text-gray-800">{student.name}</td>
                <td className="px-6 py-4 text-sm text-gray-800">{student.email}</td>
                <td className="px-6 py-4 text-sm text-gray-800">{student.phone}</td>
                <td className="px-6 py-4 text-sm text-gray-800">{student.address}</td>
                <td className="px-6 py-4 text-sm text-gray-800">{student.username}</td>
                <td className="px-6 py-4 text-sm text-gray-800">
                  {student.registerDate
                    ? new Date(student.registerDate).toLocaleDateString()
                    : "N/A"}
                </td>
               
                
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="8" className="px-6 py-6 text-center text-gray-500 text-sm">
                No Students Found
              </td>
            </tr>
          )}
        </tbody>
      </table>
      <button
            onClick={() => navigate("/admin/dashboard")}
            className="bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold px-6 py-3 rounded-full shadow-lg hover:brightness-110 transition"
          >
            Dashboard
          </button>
    </div>
    
  );
};

export default Students;
