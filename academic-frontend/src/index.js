import './output.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import "tailwindcss";
import './output.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Courses from './Courses';
import Lecturers from './Lecturers';
import Students from './Students';
import Reports from './Reports';
import LecturerFormPage from './LecturerFormPage';
import CourseFormPage from './CourseFormPage';
import EditExam from './EditExam';

import RoleSelector from './RoleSelector';
import AdminLogin from './AdminLogin';
import AdminRegister from './AdminRegister';
import AdminDashboard from './AdminDashboard';

import UserLogin from './UserLogin';
import UserRegister from './UserRegister';
import UserDashboard from './UserDashboard';

import StudentLogin from './loginStudent';
import StudentRegister from './registerStudent';
import StudentDashboard from './studentDashboard';
import StudentUserProfile from './studentUserProfile';
import StudentUserProfileAdmin from './studentUserProfileAdmin';

import CourseLecturerReport from './CourseLecturerReport';
import AddExam from './addExam';
import ViewAllExams from './viewAllExams';
import AddLectureRoom from './Mayashi/AddLectureRoom';
import ViewRecords from './Mayashi/ViewRecords';
import EditLectureRoom from './Mayashi/EditLectureRoom';
import AddSchedule from './Mayashi/AddSchedule';
import ViewSchedules from './Mayashi/ViewSchedules';
import EditSchedule from './Mayashi/EditSchedule';
import RoomUtilizationReport from './Mayashi/RoomUtilizationReport';



const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <BrowserRouter>
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      <Routes>
        <Route path="/" element={<RoleSelector />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/lecturers" element={<Lecturers />} />
        <Route path="/students" element={<Students />} />
        <Route path='/view-all-exams' element={<ViewAllExams />} />
        <Route path='/add-lecture-room' element={<AddLectureRoom />} />
        <Route path='/view-records' element={<ViewRecords />} />
        <Route path="/edit-lecture-room/:id" element={<EditLectureRoom />} />
        <Route path="/add-schedule" element={<AddSchedule />} />
        <Route path="/view-schedules" element={<ViewSchedules />} />
        <Route path="/edit-schedule/:id" element={<EditSchedule />} />
        <Route path="/room-utilization-report" element={<RoomUtilizationReport />} />

       
        <Route path="/reports" element={<Reports />} />
        <Route path="/add-lecturer" element={<LecturerFormPage />} />
        <Route path="/add-course" element={<CourseFormPage />} />
        <Route path='/add-exam' element={<AddExam />} />
        <Route path="/edit-exam/:id" element={<EditExam />} />


        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/register" element={<AdminRegister />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />

        <Route path="/user/login" element={<UserLogin />} />
        <Route path="/user/register" element={<UserRegister />} />
        <Route path="/user/dashboard" element={<UserDashboard />} />
        
        
        <Route path="/student/login" element={<StudentLogin />} />
        <Route path="/student/register" element={<StudentRegister />} />
        <Route path="/student/dashboard" element={<StudentDashboard />} />
        <Route path="/student/edit/:id" element={<StudentUserProfile />} />
        <Route path="/admin/student/edit/:id" element={<StudentUserProfileAdmin />} />

        <Route path="/courselecreport" element={<CourseLecturerReport />} />


      </Routes>
    </>
  </BrowserRouter>
);

reportWebVitals();
