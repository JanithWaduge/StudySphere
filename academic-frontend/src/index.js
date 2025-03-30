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
import LecturerFormPage from './LecturerFormPage';
import CourseFormPage from './CourseFormPage';

import RoleSelector from './RoleSelector';
import AdminLogin from './AdminLogin';
import AdminRegister from './AdminRegister';
import AdminDashboard from './AdminDashboard';
import UserLogin from './UserLogin';
import UserRegister from './UserRegister';
import UserDashboard from './UserDashboard';
import CourseLecturerReport from './CourseLecturerReport';

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
        <Route path="/add-lecturer" element={<LecturerFormPage />} />
        <Route path="/add-course" element={<CourseFormPage />} />

        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/register" element={<AdminRegister />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/user/login" element={<UserLogin />} />
        <Route path="/user/register" element={<UserRegister />} />
        <Route path="/user/dashboard" element={<UserDashboard />} />
        <Route path="/report" element={<CourseLecturerReport />} />

      </Routes>
    </>
  </BrowserRouter>
);

reportWebVitals();
