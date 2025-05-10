import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

function EditSchedule() {
  const navigate = useNavigate();
  const { id } = useParams(); // Get the schedule ID from the URL

  // State for form fields
  const [formData, setFormData] = useState({
    roomName: '',
    eventType: '',
    customEventType: '',
    eventName: '',
    faculty: '',
    department: '',
    date: '',
    startTime: '',
    duration: '',
    endTime: '',
    recurrence: 'No',
    recurrenceFrequency: '',
    priorityLevel: '',
    status: '',
    createdBy: '',
    email: '',
  });

  // State for rooms fetched from backend
  const [rooms, setRooms] = useState([]);
  const [alert, setAlert] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationDetails, setConfirmationDetails] = useState(null);
  const [errors, setErrors] = useState({}); // State for field-specific errors

  // Fetch rooms and schedule data on component mount
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/lecture-rooms');
        setRooms(response.data);
      } catch (error) {
        setAlert({ message: 'Failed to fetch rooms', type: 'error' });
      }
    };

    const fetchSchedule = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/schedules/${id}`);
        const schedule = response.data;

        // Format date to YYYY-MM-DD for the input field
        const formattedDate = new Date(schedule.date).toISOString().split('T')[0];

        // Set the form data with the fetched schedule
        setFormData({
          roomName: schedule.roomName || '',
          eventType: schedule.eventType || '',
          customEventType: schedule.customEventType || '',
          eventName: schedule.eventName || '',
          faculty: schedule.faculty || '',
          department: schedule.department || '',
          date: formattedDate || '',
          startTime: schedule.startTime || '',
          duration: schedule.duration ? schedule.duration.toString() : '',
          endTime: schedule.endTime || '',
          recurrence: schedule.recurrence || 'No',
          recurrenceFrequency: schedule.recurrenceFrequency || '',
          priorityLevel: schedule.priorityLevel || '',
          status: schedule.status || '',
          createdBy: schedule.createdBy || '',
          email: schedule.email || '',
        });
      } catch (error) {
        setAlert({ message: 'Failed to fetch schedule', type: 'error' });
      }
    };

    fetchRooms();
    fetchSchedule();
  }, [id]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Update form data
    let updatedFormData = { ...formData, [name]: value };
    let updatedErrors = { ...errors };

    // Update status when roomName changes
    if (name === 'roomName') {
      const selectedRoom = rooms.find((room) => room.roomName === value);
      if (selectedRoom) {
        updatedFormData.status = selectedRoom.condition === 'Needs to Repair' ? 'Under Maintenance' : 'Available';
      } else {
        updatedFormData.status = '';
      }
    }

    // Calculate endTime when startTime or duration changes
    if (name === 'startTime' || name === 'duration') {
      const { startTime, duration } = { ...updatedFormData, [name]: value };
      if (startTime && duration) {
        const [hours, minutes] = startTime.split(':').map(Number);
        const startDate = new Date();
        startDate.setHours(hours, minutes, 0, 0);

        const durationInMinutes = parseInt(duration, 10);
        const endDate = new Date(startDate.getTime() + durationInMinutes * 60000);

        const endHours = String(endDate.getHours()).padStart(2, '0');
        const endMinutes = String(endDate.getMinutes()).padStart(2, '0');
        updatedFormData.endTime = `${endHours}:${endMinutes}`;
      } else {
        updatedFormData.endTime = '';
      }
    }

    // Update status when date or startTime changes
    if (name === 'date' || name === 'startTime') {
      const selectedRoom = rooms.find((room) => room.roomName === updatedFormData.roomName);
      if (selectedRoom) {
        updatedFormData.status = selectedRoom.condition === 'Needs to Repair' ? 'Under Maintenance' : 'Available';
      }
    }

    // Clear error for the field being edited
    if (updatedErrors[name]) {
      updatedErrors[name] = '';
    }

    setFormData(updatedFormData);
    setErrors(updatedErrors);
  };

  // Validate individual field on blur
  const validateField = (name, value) => {
    let error = '';
    let updatedFormData = { ...formData };

    switch (name) {
      case 'roomName':
        if (!value) {
          error = 'Room name is required';
          updatedFormData.roomName = '';
        } else {
          const selectedRoom = rooms.find((room) => room.roomName === value);
          if (!selectedRoom) {
            error = 'Please select a valid room';
            updatedFormData.roomName = '';
          } else if (!/^[A-Z][0-9]{3}$/.test(value)) {
            error = 'Room name must be in the format A000 (e.g., A401)';
            updatedFormData.roomName = '';
          }
        }
        break;

      case 'eventType':
        if (!value) {
          error = 'Event type is required';
          updatedFormData.eventType = '';
        }
        break;

      case 'customEventType':
        if (formData.eventType === 'Other') {
          if (!value || value.trim() === '') {
            error = 'Custom event type is required';
            updatedFormData.customEventType = '';
          } else if (value.length > 20) {
            error = 'Must not exceed 20 characters';
            updatedFormData.customEventType = '';
          }
        }
        break;

      case 'eventName':
        if (!value) {
          error = 'Event name is required';
          updatedFormData.eventName = '';
        } else if (!/^[a-zA-Z0-9\s]+$/.test(value)) {
          error = 'Only letters, numbers, and spaces allowed';
          updatedFormData.eventName = '';
        } else if (value.length > 20) {
          error = 'Must not exceed 20 characters';
          updatedFormData.eventName = '';
        }
        break;

      case 'faculty':
        if (!value) {
          error = 'Faculty is required';
          updatedFormData.faculty = '';
        }
        break;

      case 'department':
        if (!value) {
          error = 'Department is required';
          updatedFormData.department = '';
        }
        break;

      case 'date':
        if (!value) {
          error = 'Date is required';
          updatedFormData.date = '';
        } else {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const selectedDate = new Date(value);
          if (selectedDate < today) {
            error = 'Date cannot be in the past';
            updatedFormData.date = '';
          }
        }
        break;

      case 'startTime':
        if (!value) {
          error = 'Start time is required';
          updatedFormData.startTime = '';
        } else if (!/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(value)) {
          error = 'Must be in HH:MM format (e.g., 09:00)';
          updatedFormData.startTime = '';
        }
        break;

      case 'duration':
        if (!value) {
          error = 'Duration is required';
          updatedFormData.duration = '';
        } else {
          const durationNum = parseInt(value, 10);
          if (isNaN(durationNum) || durationNum < 1) {
            error = 'Must be a positive number';
            updatedFormData.duration = '';
          }
        }
        break;

      case 'recurrence':
        if (!value) {
          error = 'Recurrence is required';
          updatedFormData.recurrence = 'No';
        }
        break;

      case 'recurrenceFrequency':
        if (formData.recurrence === 'Yes' && !value) {
          error = 'Recurrence frequency is required';
          updatedFormData.recurrenceFrequency = '';
        }
        break;

      case 'priorityLevel':
        if (!value) {
          error = 'Priority level is required';
          updatedFormData.priorityLevel = '';
        }
        break;

      case 'createdBy':
        if (!value) {
          error = 'Created by is required';
          updatedFormData.createdBy = '';
        } else if (value.length > 20) {
          error = 'Must not exceed 20 characters';
          updatedFormData.createdBy = '';
        }
        break;

      case 'email':
        if (!value) {
          error = 'Email is required';
          updatedFormData.email = '';
        } else if (!/^\S+@\S+\.\S+$/.test(value)) {
          error = 'Please enter a valid email';
          updatedFormData.email = '';
        } else if (value.length > 50) {
          error = 'Must not exceed 50 characters';
          updatedFormData.email = '';
        }
        break;

      default:
        break;
    }

    setFormData(updatedFormData);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate all fields before submission
    const fieldsToValidate = [
      'roomName',
      'eventType',
      'customEventType',
      'eventName',
      'faculty',
      'department',
      'date',
      'startTime',
      'duration',
      'recurrence',
      'recurrenceFrequency',
      'priorityLevel',
      'createdBy',
      'email',
    ];

    let hasErrors = false;
    fieldsToValidate.forEach((field) => {
      validateField(field, formData[field]);
      if (errors[field] || (field !== 'customEventType' && field !== 'recurrenceFrequency' && !formData[field])) {
        hasErrors = true;
      }
    });

    if (hasErrors) return;

    // Check room availability
    if (formData.status === 'Under Maintenance') {
      setErrors((prev) => ({
        ...prev,
        roomName: `This room (${formData.roomName}) is under maintenance. Please select another room.`,
      }));
      setFormData((prev) => ({ ...prev, roomName: '' }));
      return;
    }

    // Prepare confirmation details
    const details = {
      roomName: formData.roomName,
      eventType: formData.eventType === 'Other' ? formData.customEventType : formData.eventType,
      eventName: formData.eventName,
      faculty: formData.faculty,
      department: formData.department,
      date: formData.date,
      startTime: formData.startTime,
      duration: formData.duration,
      endTime: formData.endTime,
      recurrence: formData.recurrence,
      recurrenceFrequency: formData.recurrence === 'Yes' ? formData.recurrenceFrequency : 'N/A',
      priorityLevel: formData.priorityLevel,
      status: 'Occupied',
      createdBy: formData.createdBy,
      email: formData.email,
      updatedAt: new Date().toISOString(),
    };

    setConfirmationDetails(details);
    setShowConfirmation(true);
  };

  // Handle confirmation
  const handleConfirm = async () => {
    try {
      const scheduleData = {
        roomName: formData.roomName,
        eventType: formData.eventType,
        customEventType: formData.eventType === 'Other' ? formData.customEventType : undefined,
        eventName: formData.eventName,
        faculty: formData.faculty,
        department: formData.department,
        date: formData.date,
        startTime: formData.startTime,
        duration: parseInt(formData.duration, 10),
        recurrence: formData.recurrence,
        recurrenceFrequency: formData.recurrence === 'Yes' ? formData.recurrenceFrequency : undefined,
        priorityLevel: formData.priorityLevel,
        createdBy: formData.createdBy,
        email: formData.email,
      };

      await axios.put(`http://localhost:5000/api/schedules/${id}`, scheduleData);
      setShowConfirmation(false);
      setAlert({ message: 'Schedule updated successfully!', type: 'success' });
      setTimeout(() => navigate('/view-schedules'), 2000);
    } catch (error) {
      setShowConfirmation(false);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Failed to update schedule';
      setAlert({ message: errorMessage, type: 'error' });
    }
  };

  const handleCancel = () => {
    setShowConfirmation(false);
    setConfirmationDetails(null);
  };

  // Determine status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'Available':
        return 'text-green-600';
      case 'Occupied':
        return 'text-red-600';
      case 'Under Maintenance':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div
      className="min-h-screen py-16 px-4 sm:px-6 lg:px-8 bg-cover bg-center"
      style={{
        backgroundImage: `url('https://img.freepik.com/free-vector/university-people-banner-set_1284-7046.jpg')`,
      }}
    >
      {/* Alert */}
      {alert && (
        <div className="fixed top-4 right-4 z-50">
          <div
            className={`p-4 rounded-lg shadow-lg text-white ${
              alert.type === 'success' ? 'bg-green-600' : 'bg-red-600'
            }`}
          >
            <p>{alert.message}</p>
            <button onClick={() => setAlert(null)} className="ml-4 text-white font-bold">
              ×
            </button>
          </div>
        </div>
      )}

{/* Confirmation Popup */}
{showConfirmation && confirmationDetails && (
  <div className="modal-overlay">
    <div className="modal-box" role="dialog" aria-label="Confirm updated schedule">
      <h2 className="modal-title">Confirm Updated Schedule Details</h2>
      <div className="modal-details">
        <p><strong>Room Name:</strong> {confirmationDetails.roomName}</p>
        <p><strong>Event Type:</strong> {confirmationDetails.eventType}</p>
        <p><strong>Event Name:</strong> {confirmationDetails.eventName}</p>
        <p><strong>Faculty:</strong> {confirmationDetails.faculty}</p>
        <p><strong>Department:</strong> {confirmationDetails.department}</p>
        <p><strong>Date:</strong> {confirmationDetails.date}</p>
        <p><strong>Start Time:</strong> {confirmationDetails.startTime}</p>
        <p><strong>Duration:</strong> {confirmationDetails.duration} minutes</p>
        <p><strong>End Time:</strong> {confirmationDetails.endTime}</p>
        <p><strong>Recurrence:</strong> {confirmationDetails.recurrence}</p>
        <p><strong>Recurrence Frequency:</strong> {confirmationDetails.recurrenceFrequency}</p>
        <p><strong>Priority Level:</strong> {confirmationDetails.priorityLevel}</p>
        <p><strong>Status:</strong> {confirmationDetails.status}</p>
        <p><strong>Created By:</strong> {confirmationDetails.createdBy}</p>
        <p><strong>Email:</strong> {confirmationDetails.email}</p>
        <p><strong>Updated At:</strong> {new Date(confirmationDetails.updatedAt).toLocaleString()}</p>
      </div>
      <p className="modal-confirm-text">Confirm the updated details?</p>
      <div className="modal-actions">
        <button onClick={handleCancel} className="btn btn-cancel">No</button>
        <button onClick={handleConfirm} className="btn btn-confirm">Yes</button>
      </div>
    </div>
  </div>
)}


      {/* Form */}
      <div className="container mx-auto max-w-2xl bg-white bg-opacity-90 p-8 rounded-2xl shadow-lg">
        <h1 className="text-3xl font-bold text-orange-600 text-center mb-8">Edit Schedule</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Room Name */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">Room Name</label>
            <select
              name="roomName"
              value={formData.roomName}
              onChange={handleChange}
              onBlur={(e) => validateField(e.target.name, e.target.value)}
              className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                errors.roomName ? 'border-red-500' : 'border-gray-200'
              }`}
            >
              <option value="">Select Room</option>
              {rooms.map((room) => (
                <option key={room._id} value={room.roomName}>
                  {room.roomName}
                </option>
              ))}
            </select>
            {errors.roomName && (
              <p className="text-red-500 text-sm mt-1">{errors.roomName}</p>
            )}
          </div>

          {/* Event Type */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">Event Type</label>
            <select
              name="eventType"
              value={formData.eventType}
              onChange={handleChange}
              onBlur={(e) => validateField(e.target.name, e.target.value)}
              className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                errors.eventType ? 'border-red-500' : 'border-gray-200'
              }`}
            >
              <option value="">Select Event Type</option>
              <option value="Lecture">Lecture</option>
              <option value="Exam">Exam</option>
              <option value="Meeting">Meeting</option>
              <option value="Seminar/Workshop">Seminar/Workshop</option>
              <option value="Other">Other</option>
            </select>
            {errors.eventType && (
              <p className="text-red-500 text-sm mt-1">{errors.eventType}</p>
            )}
            {formData.eventType === 'Other' && (
              <div className="mt-2">
                <input
                  type="text"
                  name="customEventType"
                  value={formData.customEventType}
                  onChange={handleChange}
                  onBlur={(e) => validateField(e.target.name, e.target.value)}
                  placeholder="Enter custom event type"
                  className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                    errors.customEventType ? 'border-red-500' : 'border-gray-200'
                  }`}
                />
                {errors.customEventType && (
                  <p className="text-red-500 text-sm mt-1">{errors.customEventType}</p>
                )}
              </div>
            )}
          </div>

          {/* Event Name */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">Event Name</label>
            <input
              type="text"
              name="eventName"
              value={formData.eventName}
              onChange={handleChange}
              onBlur={(e) => validateField(e.target.name, e.target.value)}
              className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                errors.eventName ? 'border-red-500' : 'border-gray-200'
              }`}
              placeholder="Enter event name"
            />
            {errors.eventName && (
              <p className="text-red-500 text-sm mt-1">{errors.eventName}</p>
            )}
          </div>

          {/* Faculty */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">Faculty</label>
            <select
              name="faculty"
              value={formData.faculty}
              onChange={handleChange}
              onBlur={(e) => validateField(e.target.name, e.target.value)}
              className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                errors.faculty ? 'border-red-500' : 'border-gray-200'
              }`}
            >
              <option value="">Select Faculty</option>
              <option value="Computing">Computing</option>
              <option value="Engineering">Engineering</option>
              <option value="Architecture">Architecture</option>
              <option value="Science">Science</option>
              <option value="Hospitality">Hospitality</option>
              <option value="Business">Business</option>
              <option value="Arts">Arts</option>
            </select>
            {errors.faculty && (
              <p className="text-red-500 text-sm mt-1">{errors.faculty}</p>
            )}
          </div>

          {/* Department */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">Department</label>
            <select
              name="department"
              value={formData.department}
              onChange={handleChange}
              onBlur={(e) => validateField(e.target.name, e.target.value)}
              className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                errors.department ? 'border-red-500' : 'border-gray-200'
              }`}
            >
              <option value="">Select Department</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Information Technology">Information Technology</option>
              <option value="Software Engineering">Software Engineering</option>
              <option value="Cyber Security">Cyber Security</option>
              <option value="Data Science">Data Science</option>
              <option value="Interactive Media">Interactive Media</option>
              <option value="Network Engineering">Network Engineering</option>
              <option value="Civil Engineering">Civil Engineering</option>
              <option value="Mechanical Engineering">Mechanical Engineering</option>
              <option value="Electrical Engineering">Electrical Engineering</option>
              <option value="Electronic Engineering">Electronic Engineering</option>
              <option value="Chemical Engineering">Chemical Engineering</option>
              <option value="Mechatronics Engineering">Mechatronics Engineering</option>
              <option value="Bio Medical Engineering">Bio Medical Engineering</option>
              <option value="Mathematics">Mathematics</option>
              <option value="Physics">Physics</option>
              <option value="Chemistry">Chemistry</option>
              <option value="Biology">Biology</option>
              <option value="Microbiology">Microbiology</option>
              <option value="Statistics">Statistics</option>
              <option value="Accounting">Accounting</option>
              <option value="Finance">Finance</option>
              <option value="Marketing">Marketing</option>
              <option value="Human Resource Management">Human Resource Management</option>
              <option value="Management / Business Management">Management / Business Management</option>
              <option value="Economics">Economics</option>
              <option value="Creative & Performing Arts">Creative & Performing Arts</option>
              <option value="Humanities & Social Sciences">Humanities & Social Sciences</option>
              <option value="Languages & Literature">Languages & Literature</option>
              <option value="Communication & Culture">Communication & Culture</option>
              <option value="Other">Other</option>
            </select>
            {errors.department && (
              <p className="text-red-500 text-sm mt-1">{errors.department}</p>
            )}
          </div>

          {/* Date */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">Date</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              onBlur={(e) => validateField(e.target.name, e.target.value)}
              className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                errors.date ? 'border-red-500' : 'border-gray-200'
              }`}
            />
            {errors.date && (
              <p className="text-red-500 text-sm mt-1">{errors.date}</p>
            )}
          </div>

          {/* Start Time */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">Start Time (HH:MM)</label>
            <input
              type="time"
              name="startTime"
              value={formData.startTime}
              onChange={handleChange}
              onBlur={(e) => validateField(e.target.name, e.target.value)}
              className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                errors.startTime ? 'border-red-500' : 'border-gray-200'
              }`}
            />
            {errors.startTime && (
              <p className="text-red-500 text-sm mt-1">{errors.startTime}</p>
            )}
          </div>

          {/* Duration */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">Duration (minutes)</label>
            <select
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              onBlur={(e) => validateField(e.target.name, e.target.value)}
              className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                errors.duration ? 'border-red-500' : 'border-gray-200'
              }`}
            >
              <option value="">Select Duration</option>
              <option value="30">30 minutes</option>
              <option value="60">1 hour</option>
              <option value="90">1.5 hours</option>
              <option value="120">2 hours</option>
              <option value="180">3 hours</option>
            </select>
            {errors.duration && (
              <p className="text-red-500 text-sm mt-1">{errors.duration}</p>
            )}
          </div>

          {/* End Time (Read-only) */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">End Time</label>
            <input
              type="text"
              value={formData.endTime}
              readOnly
              className="w-full p-3 border border-gray-200 rounded-lg bg-gray-100"
            />
          </div>

          {/* Recurrence */}
          <div>
            <label className="block text-gray-7
            00 font-medium mb-2">Recurrence</label>
            <select
              name="recurrence"
              value={formData.recurrence}
              onChange={handleChange}
              onBlur={(e) => validateField(e.target.name, e.target.value)}
              className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                errors.recurrence ? 'border-red-500' : 'border-gray-200'
              }`}
            >
              <option value="No">No</option>
              <option value="Yes">Yes</option>
            </select>
            {errors.recurrence && (
              <p className="text-red-500 text-sm mt-1">{errors.recurrence}</p>
            )}
            {formData.recurrence === 'Yes' && (
              <div className="mt-2">
                <select
                  name="recurrenceFrequency"
                  value={formData.recurrenceFrequency}
                  onChange={handleChange}
                  onBlur={(e) => validateField(e.target.name, e.target.value)}
                  className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                    errors.recurrenceFrequency ? 'border-red-500' : 'border-gray-200'
                  }`}
                >
                  <option value="">Select Recurrence Frequency</option>
                  <option value="Daily">Daily</option>
                  <option value="Weekly">Weekly</option>
                  <option value="Monthly">Monthly</option>
                </select>
                {errors.recurrenceFrequency && (
                  <p className="text-red-500 text-sm mt-1">{errors.recurrenceFrequency}</p>
                )}
              </div>
            )}
          </div>

          {/* Priority Level */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">Priority Level</label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="priorityLevel"
                  value="High"
                  checked={formData.priorityLevel === 'High'}
                  onChange={handleChange}
                  onBlur={(e) => validateField(e.target.name, formData.priorityLevel)}
                  className="mr-2"
                />
                <span className="text-red-600 font-bold">High</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="priorityLevel"
                  value="Medium"
                  checked={formData.priorityLevel === 'Medium'}
                  onChange={handleChange}
                  onBlur={(e) => validateField(e.target.name, formData.priorityLevel)}
                  className="mr-2"
                />
                <span className="text-yellow-600 font-bold">Medium</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="priorityLevel"
                  value="Low"
                  checked={formData.priorityLevel === 'Low'}
                  onChange={handleChange}
                  onBlur={(e) => validateField(e.target.name, formData.priorityLevel)}
                  className="mr-2"
                />
                <span className="text-blue-600 font-bold">Low</span>
              </label>
            </div>
            {errors.priorityLevel && (
              <p className="text-red-500 text-sm mt-1">{errors.priorityLevel}</p>
            )}
          </div>

          {/* Status (Read-only) */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">Status</label>
            <input
              type="text"
              value={formData.status}
              readOnly
              className={`w-full p-3 border border-gray-200 rounded-lg bg-gray-100 ${getStatusColor(formData.status)}`}
            />
          </div>

          {/* Created By */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">Created By</label>
            <input
              type="text"
              name="createdBy"
              value={formData.createdBy}
              onChange={handleChange}
              onBlur={(e) => validateField(e.target.name, e.target.value)}
              className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                errors.createdBy ? 'border-red-500' : 'border-gray-200'
              }`}
              placeholder="Enter your name"
              maxLength="20"
            />
            {errors.createdBy && (
              <p className="text-red-500 text-sm mt-1">{errors.createdBy}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={(e) => validateField(e.target.name, e.target.value)}
              className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                errors.email ? 'border-red-500' : 'border-gray-200'
              }`}
              placeholder="Enter your email"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-center">
            <button
              type="submit"
              className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors duration-200 font-medium"
            >
              Update Schedule
            </button>
          </div>
        </form>
      </div>
      <style jsx>{`
      .modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
  animation: fadeIn 0.3s ease-in-out;
}

.modal-box {
  background-color: #fff;
  padding: 2rem;
  border-radius: 1.5rem;
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.25);
  max-width: 600px;
  width: 100%;
  animation: scaleIn 0.25s ease;
  border: 1px solid #e5e7eb;
}

.modal-title {
  font-size: 1.75rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #111827;
}

.modal-details {
  color: #374151;
  margin-bottom: 1.5rem;
}

.modal-details p {
  margin-bottom: 0.5rem;
}

.modal-confirm-text {
  font-weight: 600;
  color: #1f2937;
  margin-top: 1rem;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
}

.btn {
  padding: 0.6rem 1.2rem;
  border-radius: 0.5rem;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.btn-cancel {
  background-color: #e5e7eb;
  color: #1f2937;
}

.btn-cancel:hover {
  background-color: #d1d5db;
}

.btn-confirm {
  background-color: #16a34a;
  color: white;
}

.btn-confirm:hover {
  background-color: #15803d;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes scaleIn {
  from { transform: scale(0.95); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

      `}</style>
    </div>
  );
}

export default EditSchedule;