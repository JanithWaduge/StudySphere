import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const StudentRegister = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!name.trim()) newErrors.name = "Name is required";
    if (!email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = "Invalid email";
    if (!phone.trim()) newErrors.phone = "Phone is required";
    else if (!/^\d{10}$/.test(phone)) newErrors.phone = "Invalid phone number";
    if (!address.trim()) newErrors.address = "Address is required";
    if (!username.trim()) newErrors.username = "Username is required";
    if (!password.trim()) newErrors.password = "Password is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const sendData = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const newStudent = { name, email, phone, address, username, password };

    axios
      .post("http://localhost:5000/student/register", newStudent)
      .then(() => {
        alert("Student Registered Successfully!");
        navigate("/");
      })
      .catch((err) => {
        alert("Error: " + err.response?.data?.message || "Registration failed");
      });
  };

  const fillDummyData = () => {
    setName("Rashmi Fernando");
    setEmail("rashmi123@example.com");
    setPhone("0712345678");
    setAddress("123, Orange Street, Colombo");
    setUsername("rashmi1");
    setPassword("1234");
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-orange-500 to-orange-300 p-6">
      <h2 className="text-white text-3xl font-bold mb-4">Student Registration</h2>

      <div className="w-full max-w-md">
        <div className="flex justify-end mb-3">
          <button
            type="button"
            onClick={fillDummyData}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded shadow font-medium transition duration-200"
          >
            Fill Dummy Data
          </button>
        </div>

        <form onSubmit={sendData} className="bg-white rounded-xl shadow-lg p-6 space-y-5 ">
          {[
            { label: "Name", value: name, setter: setName, key: "name" },
            { label: "Email", value: email, setter: setEmail, key: "email" },
            { label: "Phone", value: phone, setter: setPhone, key: "phone" },
            { label: "Address", value: address, setter: setAddress, key: "address" },
            { label: "Username", value: username, setter: setUsername, key: "username" },
            { label: "Password", value: password, setter: setPassword, key: "password", type: "password" },
          ].map(({ label, value, setter, key, type = "text" }) => (
            <div key={key}>
              <label className="block font-semibold text-gray-700 mb-1">{label}</label>
              <input
                type={type}
                value={value}
                onChange={(e) => setter(e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${errors[key] ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-orange-500"
                  }`}
              />
              {errors[key] && <p className="text-sm text-red-500 mt-1">{errors[key]}</p>}
            </div>
          ))}

          <button
            type="submit"
            className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2 px-3 rounded-md text-base font-semibold transition duration-200"
          >
            Register
          </button>


        </form>
      </div>
    </div>
  );
};

export default StudentRegister;
