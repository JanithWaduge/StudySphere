import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import Alert from './Alert';
import { EyeIcon, PencilIcon, TrashIcon, ClockIcon, XMarkIcon } from '@heroicons/react/24/solid';

function ViewRecords() {
  const navigate = useNavigate();
  const [lectureRooms, setLectureRooms] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState([]);
  const [showRecentSearches, setShowRecentSearches] = useState(false);
  const [alert, setAlert] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState(null);
  const [showCardView, setShowCardView] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [showResourcesPopup, setShowResourcesPopup] = useState(null);
  const searchRef = useRef(null);

  useEffect(() => {
    fetchLectureRooms();
    fetchSchedules();
    const storedSearches = JSON.parse(localStorage.getItem('recentSearches')) || [];
    setRecentSearches(storedSearches);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowRecentSearches(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchLectureRooms = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/lecture-rooms');
      setLectureRooms(response.data);
      setFilteredRooms(response.data);
    } catch (error) {
      setAlert({ message: 'Failed to fetch lecture rooms', type: 'error' });
    }
  };

  const fetchSchedules = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/schedules');
      setSchedules(response.data);
    } catch (error) {
      setAlert({ message: 'Failed to fetch schedules', type: 'error' });
    }
  };

  const getRoomStatus = (room) => {
    if (room.condition === 'Needs to Repair') {
      return 'Under Maintenance';
    }

    const currentTime = new Date();
    const isOccupied = schedules.some((schedule) => {
      if (schedule.roomName !== room.roomName) return false;

      const scheduleDate = new Date(schedule.date);
      const [startHours, startMinutes] = schedule.startTime.split(':').map(Number);
      const [endHours, endMinutes] = schedule.endTime.split(':').map(Number);

      const startTime = new Date(scheduleDate);
      startTime.setHours(startHours, startMinutes, 0, 0);

      const endTime = new Date(scheduleDate);
      endTime.setHours(endHours, endMinutes, 0, 0);

      return currentTime >= startTime && currentTime <= endTime;
    });

    return isOccupied ? 'Occupied' : 'Available';
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Available':
        return 'text-green-600 font-bold flex items-center';
      case 'Occupied':
        return 'text-red-600 font-bold flex items-center';
      case 'Under Maintenance':
        return 'text-yellow-600 font-bold flex items-center';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Available':
        return '✅';
      case 'Occupied':
        return '⛔';
      case 'Under Maintenance':
        return '⚠️';
      default:
        return '';
    }
  };

  const handleStatusClick = (room, status) => {
    if (status === 'Available') {
      navigate(`/add-schedule?roomName=${encodeURIComponent(room.roomName)}`);
    } else if (status === 'Occupied') {
      const currentTime = new Date();
      const occupiedSchedule = schedules.find((schedule) => {
        if (schedule.roomName !== room.roomName) return false;

        const scheduleDate = new Date(schedule.date);
        const [startHours, startMinutes] = schedule.startTime.split(':').map(Number);
        const [endHours, endMinutes] = schedule.endTime.split(':').map(Number);

        const startTime = new Date(scheduleDate);
        startTime.setHours(startHours, startMinutes, 0, 0);

        const endTime = new Date(scheduleDate);
        endTime.setHours(endHours, endMinutes, 0, 0);

        return currentTime >= startTime && currentTime <= endTime;
      });

      if (occupiedSchedule) {
        navigate(`/view-schedules?roomName=${encodeURIComponent(room.roomName)}&scheduleId=${occupiedSchedule._id}&showOccupiedPopup=true`);
      } else {
        navigate(`/view-schedules?roomName=${encodeURIComponent(room.roomName)}&showOccupiedPopup=true`);
      }
    }
  };

  const saveSearchQuery = (query) => {
    if (!query.trim()) return;
    const updatedSearches = [
      query,
      ...recentSearches.filter((q) => q !== query),
    ].slice(0, 5);
    setRecentSearches(updatedSearches);
    localStorage.setItem('recentSearches', JSON.stringify(updatedSearches));
  };

  const handleSearch = (query = searchQuery) => {
    if (!query.trim()) {
      setFilteredRooms(lectureRooms);
      setShowCardView(false);
      setSearchError('');
      setShowRecentSearches(false);
      return;
    }

    saveSearchQuery(query);
    const searchTerm = query.toLowerCase().trim();
    const filtered = lectureRooms.filter((room) => {
      if (room.roomName.toLowerCase().includes(searchTerm)) {
        return true;
      }
      if (room.location.toLowerCase().includes(searchTerm)) {
        return true;
      }
      const equipments = Array.isArray(room.available_equipments)
        ? room.available_equipments.map((equipment) => equipment.toLowerCase())
        : [];
      const queryEquipments = searchTerm.split(',').map((q) => q.trim());
      if (queryEquipments.length > 1) {
        return queryEquipments.every((q) => equipments.includes(q));
      } else {
        if (equipments.includes(searchTerm)) {
          return true;
        }
      }
      if (room.seating_type.toLowerCase().includes(searchTerm)) {
        return true;
      }
      if (searchTerm === 'air conditioning' && room.air_conditioning) {
        return true;
      }
      if (room.condition.toLowerCase().includes(searchTerm)) {
        return true;
      }
      if (room.department && room.department.toLowerCase().includes(searchTerm)) {
        return true;
      }
      if (room.addedBy.toLowerCase().includes(searchTerm)) {
        return true;
      }
      if (room.email.toLowerCase().includes(searchTerm)) {
        return true;
      }
      return false;
    });

    if (filtered.length === 0) {
      setSearchError('No results found for your search.');
      setShowCardView(false);
    } else {
      setFilteredRooms(filtered);
      setShowCardView(true);
      setSearchError('');
    }
    setShowRecentSearches(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleSelectRecentSearch = (query) => {
    setSearchQuery(query);
    handleSearch(query);
  };

  const handleClearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
    setShowRecentSearches(false);
  };

  const handleCloseCardView = () => {
    setShowCardView(false);
    setSearchQuery('');
    setFilteredRooms(lectureRooms);
  };

  const handleDeleteConfirm = (room) => {
    setRoomToDelete(room);
    setShowConfirm(true);
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:5000/api/lecture-rooms/${roomToDelete._id}`);
      setAlert({ message: 'Lecture room deleted successfully!', type: 'success' });
      setShowConfirm(false);
      setRoomToDelete(null);
      fetchLectureRooms();
    } catch (error) {
      setAlert({ message: 'Failed to delete lecture room', type: 'error' });
      setShowConfirm(false);
      setRoomToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setShowConfirm(false);
    setRoomToDelete(null);
  };

  const handleAddRoom = () => {
    navigate('/add-lecture-room'); // Assuming this is the route for adding a room
  };

  const getConditionClass = (condition) => {
    switch (condition) {
      case 'Excellent':
        return 'text-green-600 font-medium';
      case 'Good':
        return 'text-yellow-600 font-medium';
      case 'Needs to Repair':
        return 'text-red-600 font-medium';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-100 via-blue-50 to-gray-200">
      {alert && <Alert message={alert.message} type={alert.type} onClose={() => setAlert(null)} />}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 transition-opacity duration-300">
          <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full border border-gray-200 transform transition-all duration-300 scale-100">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Confirm Deletion</h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Are you sure you want to delete the{' '}
              <span className="font-semibold text-orange-600">{roomToDelete.roomName}</span>{' '}
              lecture room record? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={handleCancelDelete}
                className="bg-gray-200 text-gray-800 px-5 py-2 rounded-lg hover:bg-gray-300 transition-colors duration-200 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="bg-red-600 text-white px-5 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200 font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      {showResourcesPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 transition-opacity duration-300">
          <div className="bg-white p-6 rounded-2xl shadow-2xl max-w-md w-full border border-gray-200 transform transition-all duration-300 scale-100">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Resources Details</h2>
            <div className="space-y-3 text-gray-700">
              <p>
                <strong className="font-medium text-gray-800">Available Equipment:</strong>{' '}
                {Array.isArray(showResourcesPopup.available_equipments) && showResourcesPopup.available_equipments.length > 0
                  ? showResourcesPopup.available_equipments.join(', ')
                  : 'None'}
              </p>
              {Array.isArray(showResourcesPopup.available_equipments) && showResourcesPopup.available_equipments.length > 0 && (
                <div className="ml-4 space-y-2">
                  {showResourcesPopup.available_equipments.map((equipment) => (
                    <p key={equipment}>
                      <strong className="font-medium text-gray-800">{equipment} Quantity:</strong>{' '}
                      {(showResourcesPopup.quantity && showResourcesPopup.quantity[equipment]) || 0}
                    </p>
                  ))}
                </div>
              )}
              <p>
                <strong className="font-medium text-gray-800">Seating Type:</strong>{' '}
                {showResourcesPopup.seating_type || 'N/A'}
              </p>
              <p>
                <strong className="font-medium text-gray-800">Air Conditioning:</strong>{' '}
                {showResourcesPopup.air_conditioning ? 'Yes' : 'No'}
              </p>
              <p>
                <strong className="font-medium text-gray-800">Power Outlets:</strong>{' '}
                {showResourcesPopup.power_outlets || 'N/A'}
              </p>
            </div>
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowResourcesPopup(null)}
                className="bg-gray-200 text-gray-800 px-5 py-2 rounded-lg hover:bg-gray-300 transition-colors duration-200 font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="container mx-auto max-w-7xl">
        <h1 className="text-4xl font-bold mb-6 text-center tracking-tight 
               bg-gradient-to-r from-orange-500 to-orange-700 
               bg-clip-text text-transparent">
          Lecture Room Records
        </h1>
        <div className="flex justify-between items-center mb-10">
          <div className="flex space-x-4 items-center w-full" ref={searchRef}>
            <div className="relative w-3/4">
              <input
                type="text"
                placeholder="Search by room name, location, department, etc."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setShowRecentSearches(true)}
                onKeyPress={handleKeyPress}
                className="w-full py-3 pl-12 pr-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 shadow-sm hover:shadow-md bg-white text-gray-700 placeholder-gray-400"
              />
              <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </span>
              {showRecentSearches && recentSearches.length > 0 && (
                <div className="absolute top-full left-0 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                  <div className="flex justify-between items-center px-4 py-2 border-b border-gray-200">
                    <span className="text-sm font-semibold text-gray-700">Recent Searches</span>
                    <button
                      onClick={handleClearRecentSearches}
                      className="text-sm text-red-600 hover:text-red-700 transition-colors duration-200"
                    >
                      Clear All
                    </button>
                  </div>
                  {recentSearches.map((search, index) => (
                    <div
                      key={index}
                      onClick={() => handleSelectRecentSearch(search)}
                      className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer transition-colors duration-200"
                    >
                      <ClockIcon className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-700 text-sm">{search}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => handleSearch()}
                className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors duration-200 font-medium shadow-sm hover:shadow-md"
              >
                Search
              </button>
              <button
                onClick={handleAddRoom}
                className="bg-[color:#34495E] text-white px-6 py-3 rounded-lg hover:bg-[color:#2c3e50] transition-colors duration-200 font-medium shadow-sm hover:shadow-md"
              >
                Add Room
              </button>
            </div>
          </div>
        </div>
        {searchError && (
          <div className="text-center mb-10">
            <p className="text-gray-600 font-medium text-lg">{searchError}</p>
          </div>
        )}
        {showCardView ? (
          <div className="relative">
            <button
              onClick={handleCloseCardView}
              className="absolute top-4 right-4 p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors duration-200 shadow-sm"
              aria-label="Close card view"
            >
              <XMarkIcon className="h-5 w-5 text-gray-600" />
            </button>
            <div className={filteredRooms.length === 1 ? "flex justify-center items-center min-h-[50vh]" : "flex justify-center"}>
              <div className={filteredRooms.length === 1 ? "w-full max-w-lg" : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl"}>
                {filteredRooms.map((room) => {
                  const status = getRoomStatus(room);
                  return (
                    <div
                      key={room._id}
                      className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 transform hover:-translate-y-1"
                    >
                      <h2 className="text-2xl font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">{room.roomName}</h2>
                      <div className="space-y-4 text-gray-700">
                        <div className="flex justify-between items-center">
                          <p>
                            <strong className="font-medium text-gray-800">Location:</strong> {room.location}
                          </p>
                          <span className={`text-sm font-medium px-2 py-1 rounded-full ${getConditionClass(room.condition)} bg-opacity-10 ${room.condition === 'Excellent' ? 'bg-green-100' : room.condition === 'Good' ? 'bg-yellow-100' : 'bg-red-100'}`}>
                            {room.condition}
                          </span>
                        </div>
                        <p>
                          <strong className="font-medium text-gray-800">Capacity:</strong> {room.capacity} seats
                        </p>
                        <div className="flex items-center">
                          <p>
                            <strong className="font-medium text-gray-800">Resources:</strong>
                          </p>
                          <button
                            onClick={() => setShowResourcesPopup(room)}
                            className="ml-2 text-blue-600 hover:text-blue-800 transition-colors duration-200"
                          >
                            <EyeIcon className="h-5 w-5" />
                          </button>
                        </div>
                        <p>
                          <strong className="font-medium text-gray-800">Status:</strong>{' '}
                          <span className={getStatusStyle(status)}>
                            {getStatusIcon(status)} {status}
                          </span>
                        </p>
                        <p>
                          <strong className="font-medium text-gray-800">Department:</strong>{' '}
                          {room.department || 'Not Specified'}
                        </p>
                        <p>
                          <strong className="font-medium text-gray-800">Added By:</strong> {room.addedBy}
                        </p>
                        <p>
                          <strong className="font-medium text-gray-800">Email:</strong>{' '}
                          <a href={`mailto:${room.email}`} className="text-blue-600 hover:underline">{room.email}</a>
                        </p>
                      </div>
                      <div className="mt-6 flex justify-end space-x-3">
                        <Link to={`/edit-lecture-room/${room._id}`} className="w-24">
                          <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium flex items-center justify-center space-x-2 shadow-sm hover:shadow-md">
                            <PencilIcon className="h-4 w-4" />
                            <span>Edit</span>
                          </button>
                        </Link>
                        <button
                          onClick={() => handleDeleteConfirm(room)}
                          className="w-30 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200 font-medium flex items-center justify-center space-x-2 shadow-sm hover:shadow-md"
                        >
                          <TrashIcon className="h-4 w-4" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto shadow-lg rounded-xl">
            <table className="w-full bg-white rounded-xl border border-gray-200">
              <thead>
                <tr className="bg-deep-charcoal text-white text-sm font-semibold uppercase tracking-wide">
                  <th className="p-4 text-left border-b border-gray-200">Room Name</th>
                  <th className="p-4 text-left border-b border-gray-200">Location</th>
                  <th className="p-4 text-left border-b border-gray-200">Capacity</th>
                  <th className="p-4 text-left border-b border-gray-200">Resources</th>
                  <th className="p-4 text-left border-b border-gray-200">Condition</th>
                  <th className="p-4 text-left border-b border-gray-200">Department</th>
                  <th className="p-4 text-left border-b border-gray-200">Added By</th>
                  <th className="p-4 text-left border-b border-gray-200">Email</th>
                  <th className="p-4 text-left border-b border-gray-200">Status</th>
                  <th className="p-4 text-left border-b border-gray-200">Actions</th>
                </tr>
              </thead>
              <tbody>
                {lectureRooms.map((room, index) => {
                  const status = getRoomStatus(room);
                  return (
                    <tr
                      key={room._id}
                      className={`${
                        index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                      } hover:bg-gray-100 transition-colors duration-200 border-b border-gray-200`}
                    >
                      <td className="p-4 text-gray-800 font-medium">{room.roomName}</td>
                      <td className="p-4 text-gray-600">{room.location}</td>
                      <td className="p-4 text-gray-600">{room.capacity}</td>
                      <td className="p-4 text-gray-600">
                        <button
                          onClick={() => setShowResourcesPopup(room)}
                          className="text-blue-600 hover:text-blue-800 flex items-center transition-colors duration-200"
                        >
                          <EyeIcon className="h-5 w-5 mr-1" />
                          View
                        </button>
                      </td>
                      <td className="p-4">
                        <span className={getConditionClass(room.condition)}>{room.condition}</span>
                      </td>
                      <td className="p-4 text-gray-600">{room.department || 'Not Specified'}</td>
                      <td className="p-4 text-gray-600">{room.addedBy}</td>
                      <td className="p-4 text-gray-600">{room.email}</td>
                      <td className="p-4">
                        <button
                          onClick={() => handleStatusClick(room, status)}
                          className={getStatusStyle(status)}
                          disabled={status === 'Under Maintenance'}
                        >
                          {getStatusIcon(status)} {status}
                        </button>
                      </td>
                      <td className="p-4 flex space-x-3">
                        <Link to={`/edit-lecture-room/${room._id}`}>
                          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium flex items-center space-x-2 shadow-sm hover:shadow-md">
                            <PencilIcon className="h-4 w-4" />
                            <span>Edit</span>
                          </button>
                        </Link>
                        <button
                          onClick={() => handleDeleteConfirm(room)}
                          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200 font-medium flex items-center space-x-2 shadow-sm hover:shadow-md"
                        >
                          <TrashIcon className="h-4 w-4" />
                          <span>Delete</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default ViewRecords;