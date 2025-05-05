import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const validate = () => {
    const newErrors = {};
    if (!username.trim()) newErrors.username = "Username is required";
    if (!password.trim()) newErrors.password = "Password is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      const res = await axios.post("http://localhost:5000/student/login", {
        username,
        password,
      });

      localStorage.setItem("token", res.data.token);
      alert("Login successful");
      navigate("/student-dashboard");
    } catch (err) {
      alert(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-500 to-orange-300 flex items-center justify-center px-4">
      <form
        onSubmit={handleLogin}
        className="bg-white w-full max-w-md p-8 rounded-xl shadow-2xl"
      >
        <h2 className="text-3xl font-extrabold text-center text-orange-600 mb-6">
          Student Login
        </h2>

        <div className="mb-4">
          <label htmlFor="username" className="block font-semibold text-gray-700 mb-1">
            Username
          </label>
          <input
            type="text"
            id="username"
            name="username"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
              errors.username ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-orange-500"
            }`}
          />
          {errors.username && <p className="text-sm text-red-500 mt-1">{errors.username}</p>}
        </div>

        <div className="mb-6">
          <label htmlFor="password" className="block font-semibold text-gray-700 mb-1">
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
              errors.password ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-orange-500"
            }`}
          />
          {errors.password && <p className="text-sm text-red-500 mt-1">{errors.password}</p>}
        </div>

        <button
          type="submit"
          className="w-full py-2 bg-orange-600 text-white rounded-lg font-semibold text-lg hover:bg-orange-700 transition duration-200"
        >
          Login
        </button>
      </form>
    </div>
  );
};

export default Login;
