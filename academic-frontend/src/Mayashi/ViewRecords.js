import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import Alert from './Alert';
import { EyeIcon, PencilIcon, TrashIcon, ClockIcon, XMarkIcon, CheckCircleIcon } from '@heroicons/react/24/solid';

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
  const [isLoading, setIsLoading] = useState(true);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [deletedRoomName, setDeletedRoomName] = useState('');
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
    setIsLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/lecture-rooms');
      console.log('Fetched Lecture Rooms:', response.data);
      setLectureRooms(response.data);
      setFilteredRooms(response.data);
    } catch (error) {
      setAlert({ message: 'Failed to fetch lecture rooms', type: 'error' });
      console.error('Error fetching lecture rooms:', error);
    } finally {
      setIsLoading(false);
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
        return 'bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm font-medium';
      case 'Occupied':
        return 'bg-red-100 text-red-800 px-2 py-1 rounded-full text-sm font-medium';
      case 'Under Maintenance':
        return 'bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-sm font-medium';
      default:
        return 'bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-sm font-medium';
    }
  };

  const getConditionClass = (condition) => {
    switch (condition) {
      case 'Excellent':
        return 'bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm font-medium';
      case 'Good':
        return 'bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-sm font-medium';
      case 'Needs to Repair':
        return 'bg-red-100 text-red-800 px-2 py-1 rounded-full text-sm font-medium';
      default:
        return 'bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-sm font-medium';
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
      if (room.roomName.toLowerCase().includes(searchTerm)) return true;
      if (room.location.toLowerCase().includes(searchTerm)) return true;
      const equipments = Array.isArray(room.available_equipments)
        ? room.available_equipments.map((equipment) => equipment.toLowerCase())
        : [];
      const queryEquipments = searchTerm.split(',').map((q) => q.trim());
      if (queryEquipments.length > 1) {
        return queryEquipments.every((q) => equipments.includes(q));
      } else {
        if (equipments.includes(searchTerm)) return true;
      }
      if (room.seating_type.toLowerCase().includes(searchTerm)) return true;
      if (searchTerm === 'air conditioning' && room.air_conditioning) return true;
      if (room.condition.toLowerCase().includes(searchTerm)) return true;
      if (room.faculty && room.faculty.toLowerCase().includes(searchTerm)) return true;
      if (room.addedBy.toLowerCase().includes(searchTerm)) return true;
      if (room.email.toLowerCase().includes(searchTerm)) return true;
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
      setDeletedRoomName(roomToDelete.roomName);
      setShowSuccessModal(true);
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

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    setDeletedRoomName('');
  };

  const handleAddRoom = () => {
    navigate('/add-lecture-room');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200 font-sans">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white shadow-md py-4 px-6">
        <div className="container mx-auto max-w-7xl flex justify-between items-center">
          <div>
          <h1 className="text-4xl font-extrabold text-gray-800 text-center tracking-tight">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-orange-700">
            Rooms & Resources Management
          </span>
        </h1> 
            <nav className="text-sm text-gray-600">
              <Link to="/" className="hover:text-orange-600">Home</Link>  <span>Lecture Rooms</span>
            </nav>
          </div>
          <button
            onClick={handleAddRoom}
            className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-2 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200 font-medium shadow-md"
          >
            Add Room
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto max-w-7xl py-8 px-4 sm:px-6 lg:px-8">
        {alert && <Alert message={alert.message} type={alert.type} onClose={() => setAlert(null)} />}

        {/* Search Bar */}
        <div className="mb-8 bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center space-x-4" ref={searchRef}>
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search by room name, location, faculty, etc."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setShowRecentSearches(true)}
                onKeyPress={handleKeyPress}
                className="w-full py-3 pl-10 pr-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 bg-gray-50 text-gray-900 placeholder-gray-500"
                aria-label="Search lecture rooms"
              />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
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
              {showRecentSearches && recentSearches.length > 0 && (
                <div className="absolute top-full left-0 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-xl z-10 max-h-60 overflow-y-auto">
                  <div className="flex justify-between items-center px-4 py-3 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-700">Recent Searches</span>
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
                      className="flex items-center px-4 py-2 hover:bg-gray-50 cursor-pointer transition-colors duration-200"
                    >
                      <ClockIcon className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-700 text-sm">{search}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={() => handleSearch()}
              className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200 font-medium shadow-md"
            >
              Search
            </button>
          </div>
          {searchError && (
            <p className="text-red-600 text-sm mt-4 text-center">{searchError}</p>
          )}
        </div>

        {/* Confirmation Modal */}
        {showConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
            <div className="bg-white p-8 rounded-xl shadow-2xl max-w-md w-full border border-gray-100 animate-scale-in" role="dialog" aria-label="Confirm deletion">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Confirm Deletion</h2>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete{' '}
                <span className="font-semibold text-orange-600">{roomToDelete.roomName}</span>? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={handleCancelDelete}
                  className="bg-gray-200 text-gray-800 px-5 py-2 rounded-lg hover:bg-gray-300 transition-all duration-200 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="bg-red-600 text-white px-5 py-2 rounded-lg hover:bg-red-700 transition-all duration-200 font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Success Modal */}
        {showSuccessModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
            <div className="bg-white p-8 rounded-xl shadow-2xl max-w-md w-full border border-gray-100 animate-scale-in" role="dialog" aria-label="Deletion success">
              <div className="flex items-center justify-center mb-4">
                <CheckCircleIcon className="h-12 w-12 text-green-500" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 text-center mb-4">Success</h2>
              <p className="text-gray-600 text-center mb-6">
                Lecture room <span className="font-semibold text-orange-600">{deletedRoomName}</span> deleted successfully!
              </p>
              <div className="flex justify-center">
                <button
                  onClick={handleSuccessClose}
                  className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-2 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200 font-medium shadow-md"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Resources Modal */}
        {showResourcesPopup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
            <div className="bg-white p-6 rounded-xl shadow-2xl max-w-md w-full border border-gray-100 animate-scale-in" role="dialog" aria-label="Resources details">
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
                  {showResourcesPopup.seating_type || 'Not Specified'}
                </p>
                <p>
                  <strong className="font-medium text-gray-800">Air Conditioning:</strong>{' '}
                  {showResourcesPopup.air_conditioning ? 'Yes' : 'No'}
                </p>
                <p>
                  <strong className="font-medium text-gray-800">Power Outlets:</strong>{' '}
                  {showResourcesPopup.power_outlets || 'Not Specified'}
                </p>
              </div>
              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setShowResourcesPopup(null)}
                  className="bg-gray-200 text-gray-800 px-5 py-2 rounded-lg hover:bg-gray-300 transition-all duration-200 font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Card */}
        <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6">
  <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-orange-700">
    Room Records
  </span>
</h2>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-orange-500 border-solid"></div>
            </div>
          ) : lectureRooms.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">No lecture rooms found.</p>
              <button
                onClick={handleAddRoom}
                className="mt-4 bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition-all duration-200 font-medium"
              >
                Add a Room
              </button>
            </div>
          ) : showCardView ? (
            <div className="relative">
              <button
                onClick={handleCloseCardView}
                className="absolute top-4 right-4 p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition-all duration-200 shadow-sm hover:scale-110"
                aria-label="Close card view"
              >
                <XMarkIcon className="h-5 w-5 text-gray-600" />
              </button>
              <div className={filteredRooms.length === 1 ? "flex justify-center items-center min-h-[50vh]" : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"}>
                {filteredRooms.map((room) => {
                  const status = getRoomStatus(room);
                  return (
                    <div
                      key={room._id}
                      className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 hover:scale-105"
                    >
                      <h3 className="text-xl font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">{room.roomName}</h3>
                      <div className="space-y-3 text-gray-700 text-sm">
                        <div className="flex justify-between items-center">
                          <p><strong className="font-medium">Location:</strong> {room.location}</p>
                          <span className={getConditionClass(room.condition)}>{room.condition}</span>
                        </div>
                        <p><strong className="font-medium">Capacity:</strong> {room.capacity} seats</p>
                        <p><strong className="font-medium">Room Type:</strong> {room.room_type || 'Not Specified'}</p>
                        <div className="flex items-center">
                          <p><strong className="font-medium">Resources:</strong></p>
                          <button
                            onClick={() => setShowResourcesPopup(room)}
                            className="ml-2 text-blue-600 hover:text-blue-800 transition-colors duration-200"
                            aria-label="View resources"
                          >
                            <EyeIcon className="h-5 w-5" />
                          </button>
                        </div>
                        <p><strong className="font-medium">Status:</strong> <span className={getStatusStyle(status)}>{status}</span></p>
                        <p><strong className="font-medium">Faculty:</strong> {room.faculty || 'Not Specified'}</p>
                        <p><strong className="font-medium">Added By:</strong> {room.addedBy}</p>
                        <p>
                          <strong className="font-medium">Email:</strong>{' '}
                          <a href={`mailto:${room.email}`} className="text-blue-600 hover:underline truncate">{room.email}</a>
                        </p>
                      </div>
                      <div className="mt-4 flex justify-end space-x-2">
                        <div className="group relative">
                          <Link to={`/edit-lecture-room/${room._id}`}>
                            <button className="p-2 text-blue-600 hover:text-blue-800 transition-all duration-200" aria-label="Edit room">
                              <PencilIcon className="h-5 w-5" />
                            </button>
                          </Link>
                          <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2">Edit</span>
                        </div>
                        <div className="group relative">
                          <button
                            onClick={() => handleDeleteConfirm(room)}
                            className="p-2 text-red-600 hover:text-red-800 transition-all duration-200"
                            aria-label="Delete room"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                          <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2">Delete</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full bg-white rounded-xl border border-gray-200">
                <thead className="bg-slate-800 text-white text-xs font-semibold uppercase tracking-wider sticky top-0 z-10">
                  <tr>
                    <th className="p-4 text-left">Room Name</th>
                    <th className="p-4 text-left">Location</th>
                    <th className="p-4 text-left">Capacity</th>
                    <th className="p-4 text-left">Room Type</th>
                    <th className="p-4 text-left">Resources</th>
                    <th className="p-4 text-left">Condition</th>
                    <th className="p-4 text-left">Faculty</th>
                    <th className="p-4 text-left">Added By</th>
                    <th className="p-4 text-left">Email</th>
                    <th className="p-4 text-left">Status</th>
                    <th className="p-4 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {lectureRooms.map((room, index) => {
                    const status = getRoomStatus(room);
                    const isTransparent = status === 'Occupied' || status === 'Under Maintenance';
                    return (
                      <tr
                        key={room._id}
                        className={`${
                          index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                        } hover:bg-gray-100 transition-all duration-200 border-b border-gray-200 ${isTransparent ? 'opacity-60' : ''}`}
                      >
                        <td className="p-4 text-gray-800 font-medium max-w-[150px] truncate">{room.roomName}</td>
                        <td className="p-4 text-gray-600 max-w-[150px] truncate">{room.location}</td>
                        <td className="p-4 text-gray-600">{room.capacity}</td>
                        <td className="p-4 text-gray-600 max-w-[150px] truncate">{room.room_type || 'Not Specified'}</td>
                        <td className="p-4">
                          <button
                            onClick={() => setShowResourcesPopup(room)}
                            className="text-blue-600 hover:text-blue-800 flex items-center transition-all duration-200"
                            aria-label="View resources"
                          >
                            <EyeIcon className="h-5 w-5 mr-1" />
                            View
                          </button>
                        </td>
                        <td className="p-4">
                          <span className={getConditionClass(room.condition)}>{room.condition}</span>
                        </td>
                        <td className="p-4 text-gray-600 max-w-[150px] truncate">{room.faculty || 'Not Specified'}</td>
                        <td className="p-4 text-gray-600 max-w-[150px] truncate">{room.addedBy}</td>
                        <td className="p-4 text-gray-600 max-w-[200px] truncate">
                          <a href={`mailto:${room.email}`} className="text-blue-600 hover:underline">{room.email}</a>
                        </td>
                        <td className="p-4">
                          <button
                            onClick={() => handleStatusClick(room, status)}
                            className={getStatusStyle(status)}
                            disabled={status === 'Under Maintenance'}
                            aria-label={`Room status: ${status}`}
                          >
                            {status}
                          </button>
                        </td>
                        <td className="p-4 flex space-x-2">
                          <div className="group relative">
                            <Link to={`/edit-lecture-room/${room._id}`}>
                              <button className="p-2 text-blue-600 hover:text-blue-800 transition-all duration-200" aria-label="Edit room">
                                <PencilIcon className="h-5 w-5" />
                              </button>
                            </Link>
                            <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2">Edit</span>
                          </div>
                          <div className="group relative">
                            <button
                              onClick={() => handleDeleteConfirm(room)}
                              className="p-2 text-red-600 hover:text-red-800 transition-all duration-200"
                              aria-label="Delete room"
                            >
                              <TrashIcon className="h-5 w-5" />
                            </button>
                            <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2">Delete</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scale-in {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

export default ViewRecords;