import React from 'react';
import { Link } from 'react-router-dom';
import "tailwindcss";
import './output.css';


function RoleSelector() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-indigo-200 to-blue-700 text-black-800 px-4">
      <h2 className="text-3xl font-bold mb-8 text-center drop-shadow-lg">
        StudySphere
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-md text-center mt-9">
        <Link to="/admin/login">
          <button className="w-full bg-white text-blue-600 font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-blue-100 transition duration-200">
            Admin Login
          </button>
        </Link>

        <Link to="/admin/register">
          <button className="w-full bg-white text-blue-600 font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-blue-100 transition duration-200">
            Admin Register
          </button>
        </Link>

        <Link to="/student/login">
          <button className="w-full bg-white text-blue-600 font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-blue-100 transition duration-200">
            Student Login
          </button>
        </Link>

        <Link to="/student/register">
          <button className="w-full bg-white text-blue-600 font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-blue-100 transition duration-200">
            Student Register
          </button>
        </Link>
        
      </div>
    </div>
  );
}

export default RoleSelector;
