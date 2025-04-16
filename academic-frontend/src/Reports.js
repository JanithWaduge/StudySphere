import CourseLecturerReport from "./CourseLecturerReport";
import { useNavigate } from "react-router-dom";

const Reports = () => {
    const navigate = useNavigate();


    return (
        <div>
            <button
            onClick={() => navigate("/courselecreport")}
            className="bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold px-6 py-3 rounded-full shadow-lg hover:brightness-110 transition"
          >
            Course vise Lecturer Report
          </button>
          <button
            onClick={() => navigate("/studentreport")}
            className="bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold px-6 py-3 rounded-full shadow-lg hover:brightness-110 transition"
          >
            Student vise Lecture and Exam Report
          </button>
        </div>
        
    )

    
}


export default  Reports;