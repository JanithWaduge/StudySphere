import { Box } from "@mui/material";
import {  useLocation } from "react-router-dom";
import CourseForm from "./CourseForm";

const CourseFormPage = () => {
    
    const location = useLocation();
    const courseData = location.state?.course || null;

    return (
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", minHeight: "100vh", backgroundColor: "#eef2f3", paddingTop: 5 }}>
           
            
            <CourseForm existingCourse={courseData} />
        </Box>
    );
};

export default CourseFormPage;
