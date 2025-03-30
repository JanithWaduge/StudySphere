import { useNavigate } from "react-router-dom";
import Axios from "axios";
import { useEffect, useState } from "react";

const Students = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const navigate = useNavigate();

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = () => {
        Axios.get("http://localhost:5000/api/students")
            .then((response) => {
                console.log("Fetched data:", response.data); // Check browser console
                setStudents(response.data || []);
                setLoading(false);
            })
            .catch((error) => {
                console.error("Fetch Error:", error);
                setError("Failed to fetch students");
                setLoading(false);
            });
    };
    

    if (loading) {
        return <div className="text-center mt-5">Loading...</div>;
    }

    if (error) {
        return <div className="text-red-500 text-center mt-5">{error}</div>;
    }

    return (
        <div className="container mx-auto mt-10 px-5">
            <h1 className="text-3xl font-semibold mb-5">All Students</h1>
            <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
                <thead className="bg-gray-200">
                    <tr>
                        <th className="py-2 px-4">Student ID</th>
                        <th className="py-2 px-4">Name</th>
                        <th className="py-2 px-4">Email</th>
                        <th className="py-2 px-4">Phone</th>
                        <th className="py-2 px-4">Address</th>
                        <th className="py-2 px-4">Username</th>
                        <th className="py-2 px-4">Register Date</th>
                    </tr>
                </thead>
                <tbody>
                    {students.length > 0 ? (
                        students.map((student) => (
                            <tr key={student._id} className="border-t text-center">
                                <td className="py-2 px-4">{student.studentId}</td>
                                <td className="py-2 px-4">{student.name}</td>
                                <td className="py-2 px-4">{student.email}</td>
                                <td className="py-2 px-4">{student.phone}</td>
                                <td className="py-2 px-4">{student.address}</td>
                                <td className="py-2 px-4">{student.username}</td>
                                <td className="py-2 px-4">{new Date(student.registerDate).toLocaleDateString()}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="7" className="text-center py-5">
                                No students found.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default Students;