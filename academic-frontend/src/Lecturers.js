
import LecturersTable from "./LecturersTable";
import { useNavigate } from "react-router-dom";
import Axios from "axios";
import { useEffect, useState } from "react";

const Lecturers = () => {
  const [lecturers, setLecturers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchLecturers();
  }, []);

  const fetchLecturers = () => {
    Axios.get("http://localhost:5000/api/lecturers")
      .then((response) => setLecturers(response.data?.response || []))
      .catch((error) => console.error("Fetch Error:", error));
  };

  //delete lectures
  const deleteLecturer = (lecturer) => {
    if (window.confirm("Are you sure you want to delete this lecturer?")) {
      Axios.delete("http://localhost:5000/api/deletelecturer", { data: { id: lecturer.id } })
        .then(() => fetchLecturers())
        .catch((error) => console.error("Delete Error:", error));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-100 via-yellow-200 to-orange-100 py-10 px-6">
      <div className="max-w-6xl mx-auto bg-white bg-opacity-90 shadow-xl rounded-xl p-8 border border-orange-500">
        <h1 className="text-4xl font-extrabold text-orange-600 text-center mb-10">Lecturers</h1>

        <div className="mb-6 flex justify-center gap-4">
          <button
            onClick={() => navigate("/add-lecturer")}
            className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white font-semibold px-6 py-3 rounded-full shadow-lg hover:brightness-110 transition hover:text-black"
          >
            Add Lecturer
          </button>
          <button
            onClick={() => navigate("/admin/dashboard")}
            className="bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold px-6 py-3 rounded-full shadow-lg hover:brightness-110 transition hover:text-black"
          >
            Dashboard
          </button>
          <button
            onClick={() => navigate("/report")}
            className="bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold px-6 py-3 rounded-full shadow-lg hover:brightness-110 transition hover:text-black"
          >
           Course vise Lecturer Report
          </button>
        </div>

        <LecturersTable
          rows={lecturers}
          onEdit={(lecturer) => navigate("/add-lecturer", { state: { lecturer } })}
          onDelete={deleteLecturer}
        />
      </div>
    </div>
  );
};

export default Lecturers;
