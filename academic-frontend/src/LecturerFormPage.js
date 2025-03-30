import { Box } from "@mui/material";
import {  useLocation } from "react-router-dom";
import LecturerForm from "./LecturerForm";

const LecturerFormPage = () => {
    
    const location = useLocation();
    const lecturerData = location.state?.lecturer || null;

    return (
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", minHeight: "100vh", backgroundColor: "#eef2f3", paddingTop: 5 }}>
            
            <LecturerForm existingLecturer={lecturerData} /> 
        </Box>
    );
};

export default LecturerFormPage;