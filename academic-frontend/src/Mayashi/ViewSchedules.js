import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { EyeIcon, PencilIcon, TrashIcon, XMarkIcon, CheckCircleIcon, MagnifyingGlassIcon } from '@heroicons/react/24/solid';

function ViewSchedules() {
  const navigate = useNavigate();
  const location = useLocation();

  // Read scheduleId from query parameters
  const queryParams = new URLSearchParams(location.search);
  const highlightedScheduleId = queryParams.get('scheduleId') || '';

  // State for schedules, search, and UI
  const [schedules, setSchedules] = useState([]);
  const [filteredSchedules, setFilteredSchedules] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState([]);
  const [showRecentSearches, setShowRecentSearches] = useState(false);
  const [showSearchResultsPopup, setShowSearchResultsPopup] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [scheduleToDelete, setScheduleToDelete] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [deletedEventName, setDeletedEventName] = useState('');

  // Ref for search input and debounce timer
  const searchInputRef = useRef(null);
  const debounceTimeoutRef = useRef(null);

  // Fetch schedules on component mount
  useEffect(() => {
    const fetchSchedules = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get('http://localhost:5000/api/schedules');
        setSchedules(response.data);
        setFilteredSchedules(response.data);
      } catch (err) {
        setError('Failed to fetch schedules');
      } finally {
        setIsLoading(false);
      }
    };
    fetchSchedules();

    // Load recent searches from localStorage
    const storedSearches = JSON.parse(localStorage.getItem('recentSearches')) || [];
    setRecentSearches(storedSearches);
  }, []);

  // Debounced search function
  const filterSchedules = (query) => {
    const queryLower = query.toLowerCase();
    const filtered = schedules.filter((schedule) => {
      const matchesEventName = schedule.eventName.toLowerCase().includes(queryLower);
      const matchesEventType = (schedule.eventType === 'Other' ? schedule.customEventType : schedule.eventType).toLowerCase().includes(queryLower);
      const matchesFaculty = schedule.faculty.toLowerCase().includes(queryLower);
      const matchesDepartment = schedule.department.toLowerCase().includes(queryLower);
      const matchesStatus = schedule.status.toLowerCase().includes(queryLower);

      return matchesEventName || matchesEventType || matchesFaculty || matchesDepartment || matchesStatus;
    });

    return filtered;
  };

  // Handle search input changes with debounce
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      const filtered = filterSchedules(query);
      setFilteredSchedules(filtered);
    }, 300);
  };

  // Handle search submission
  const handleSearchSubmit = () => {
    if (searchQuery.trim() === '') {
      setFilteredSchedules(schedules);
      setShowSearchResultsPopup(false);
      return;
    }

    const updatedSearches = [searchQuery, ...recentSearches.filter((q) => q !== searchQuery)].slice(0, 5);
    setRecentSearches(updatedSearches);
    localStorage.setItem('recentSearches', JSON.stringify(updatedSearches));

    const filtered = filterSchedules(searchQuery);
    setFilteredSchedules(filtered);
    setShowSearchResultsPopup(true);
    setShowRecentSearches(false);
  };

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearchSubmit();
    }
  };

  // Clear search input
  const clearSearch = () => {
    setSearchQuery('');
    setFilteredSchedules(schedules);
    setShowRecentSearches(false);
    setShowSearchResultsPopup(false);
  };

  // Select a recent search
  const selectRecentSearch = (query) => {
    setSearchQuery(query);
    const filtered = filterSchedules(query);
    setFilteredSchedules(filtered);
    setShowSearchResultsPopup(true);
    setShowRecentSearches(false);
  };

  // Close search results popup
  const closeSearchResultsPopup = () => {
    setShowSearchResultsPopup(false);
    setFilteredSchedules(schedules);
    setSearchQuery('');
  };

  // Handle view details
  const handleViewDetails = (schedule) => {
    setSelectedSchedule(schedule);
  };

  // Handle edit
  const handleEdit = (scheduleId) => {
    navigate(`/edit-schedule/${scheduleId}`);
  };

  // Handle delete confirmation
  const handleDeleteConfirm = (schedule) => {
    setScheduleToDelete(schedule);
    setShowDeleteConfirm(true);
  };

  // Handle delete
  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:5000/api/schedules/${scheduleToDelete._id}`);
      setSchedules((prev) => prev.filter((schedule) => schedule._id !== scheduleToDelete._id));
      setFilteredSchedules((prev) => prev.filter((schedule) => schedule._id !== scheduleToDelete._id));
      setDeletedEventName(scheduleToDelete.eventName);
      setShowSuccessModal(true);
      setShowDeleteConfirm(false);
      setSelectedSchedule(null);
    } catch (err) {
      setError('Failed to delete schedule');
    }
  };

  // Handle success modal close
  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    setDeletedEventName('');
  };

  // Navigate to AddSchedule page
  const handleAddSchedule = () => {
    navigate('/add-schedule');
  };

  // Navigate to RoomUtilizationReport page
  const handleViewReports = () => {
    navigate('/room-utilization-report');
  };

  // Function to get priority level color and style
  const getPriorityStyle = (priority) => {
    switch (priority) {
      case 'High':
        return 'bg-red-100 text-red-800 px-2 py-1 rounded-full text-sm font-medium';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-sm font-medium';
      case 'Low':
        return 'bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-medium';
      default:
        return 'bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-sm font-medium';
    }
  };

  // Function to get status style
  const getStatusStyle = (status) => {
    switch (status) {
      case 'Approved':
        return 'bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm font-medium';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-sm font-medium';
      case 'Rejected':
        return 'bg-red-100 text-red-800 px-2 py-1 rounded-full text-sm font-medium';
      default:
        return 'bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-sm font-medium';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200 font-sans">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white shadow-md py-4 px-6">
        <div className="container mx-auto max-w-7xl flex justify-between items-center">
          <div>
          <h1 className="text-4xl font-extrabold text-gray-800 text-center tracking-tight">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-orange-700">
            Schedule Management
          </span>
        </h1> 
            <nav className="text-sm text-gray-600">
              <a href="/admin/dashboard" className="hover:text-orange-600">Dashboard</a>  <span>Schedules</span>
            </nav>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={handleAddSchedule}
              className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-2 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200 font-medium shadow-md"
            >
              Add Schedule
            </button>
            <button
              onClick={handleViewReports}
              className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-2 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200 font-medium shadow-md"
            >
              Reports
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto max-w-7xl py-8 px-4 sm:px-6 lg:px-8">
        {/* Error Message */}
        {error && (
          <div className="fixed top-6 right-6 z-50 animate-fade-in">
            <div className="p-4 rounded-lg shadow-lg text-white bg-red-600 flex items-center space-x-3">
              <p>{error}</p>
              <button onClick={() => setError('')} className="text-white font-bold hover:text-red-200 transition-colors">
                ×
              </button>
            </div>
          </div>
        )}

        {/* Search Bar */}
        <div className="mb-8 bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center space-x-4" ref={searchInputRef}>
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search by event name, event type, faculty, department, or status..."
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={() => setShowRecentSearches(true)}
                onKeyPress={handleKeyPress}
                className="w-full py-3 pl-10 pr-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 bg-gray-50 text-gray-900 placeholder-gray-500"
                aria-label="Search schedules"
              />
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              )}
              {showRecentSearches && recentSearches.length > 0 && (
                <div className="absolute top-full left-0 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-xl z-10 max-h-60 overflow-y-auto">
                  <div className="flex justify-between items-center px-4 py-3 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-700">Recent Searches</span>
                    <button
                      onClick={() => {
                        setRecentSearches([]);
                        localStorage.removeItem('recentSearches');
                        setShowRecentSearches(false);
                      }}
                      className="text-sm text-red-600 hover:text-red-700 transition-colors duration-200"
                    >
                      Clear All
                    </button>
                  </div>
                  {recentSearches.map((search, index) => (
                    <div
                      key={index}
                      onClick={() => selectRecentSearch(search)}
                      className="flex items-center px-4 py-2 hover:bg-gray-50 cursor-pointer transition-colors duration-200"
                    >
                      <MagnifyingGlassIcon className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-700 text-sm">{search}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={handleSearchSubmit}
              className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200 font-medium shadow-md"
            >
              Search
            </button>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
            <div className="bg-white p-8 rounded-xl shadow-2xl max-w-md w-full border border-gray-100 animate-scale-in" role="dialog" aria-label="Confirm deletion">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Confirm Deletion</h2>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete{' '}
                <span className="font-semibold text-orange-600">{scheduleToDelete.eventName}</span>? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
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
                Schedule <span className="font-semibold text-orange-600">{deletedEventName}</span> deleted successfully!
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

        {/* View Details Modal */}
        {selectedSchedule && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
            <div className="bg-white p-8 rounded-xl shadow-2xl max-w-md w-full border border-gray-100 animate-scale-in" role="dialog" aria-label="Schedule details">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">{selectedSchedule.eventName}</h2>
              <div className="space-y-3 text-gray-700">
                <p><strong className="font-medium">Event Type:</strong> {selectedSchedule.eventType === 'Other' ? selectedSchedule.customEventType : selectedSchedule.eventType}</p>
                <p><strong className="font-medium">Room:</strong> {selectedSchedule.roomName}</p>
                <p><strong className="font-medium">Date:</strong> {new Date(selectedSchedule.date).toLocaleDateString()}</p>
                <p><strong className="font-medium">Start Time:</strong> {selectedSchedule.startTime}</p>
                <p><strong className="font-medium">End Time:</strong> {selectedSchedule.endTime}</p>
                <p><strong className="font-medium">Duration:</strong> {selectedSchedule.duration} minutes</p>
                <p>
                  <strong className="font-medium">Recurrence:</strong> {selectedSchedule.recurrence}
                  {selectedSchedule.recurrence === 'Yes' && (
                    <span> ({selectedSchedule.recurrenceFrequency})</span>
                  )}
                </p>
                <p><strong className="font-medium">Faculty:</strong> {selectedSchedule.faculty}</p>
                <p><strong className="font-medium">Department:</strong> {selectedSchedule.department}</p>
                <p><strong className="font-medium">Priority Level:</strong> <span className={getPriorityStyle(selectedSchedule.priorityLevel)}>{selectedSchedule.priorityLevel}</span></p>
                <p><strong className="font-medium">Status:</strong> <span className={getStatusStyle(selectedSchedule.status)}>{selectedSchedule.status}</span></p>
              </div>
              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setSelectedSchedule(null)}
                  className="bg-gray-200 text-gray-800 px-5 py-2 rounded-lg hover:bg-gray-300 transition-all duration-200 font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Search Results Popup */}
        {showSearchResultsPopup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
            <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-4xl max-h-[80vh] overflow-y-auto relative animate-scale-in">
              <button
                onClick={closeSearchResultsPopup}
                className="absolute top-4 right-4 p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition-all duration-200 shadow-sm hover:scale-110"
                aria-label="Close search results"
              >
                <XMarkIcon className="h-5 w-5 text-gray-600" />
              </button>
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                Search Results for "{searchQuery}" ({filteredSchedules.length} found)
              </h2>
              {filteredSchedules.length === 0 ? (
                <p className="text-gray-600 text-center py-4">No schedules found matching your criteria.</p>
              ) : filteredSchedules.length === 1 ? (
                <div className="flex justify-center">
                  <div className={`bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 hover:scale-105 animate-slide-up ${highlightedScheduleId && filteredSchedules[0]._id === highlightedScheduleId ? 'bg-yellow-100 border-yellow-400 shadow-xl' : ''}`}>
                    <h3 className="text-xl font-semibold text-orange-600 mb-4 border-b border-gray-200 pb-2 group relative">
                      {filteredSchedules[0].eventName}
                      <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2">
                        {filteredSchedules[0].eventName}
                      </span>
                    </h3>
                    <div className="space-y-3 text-gray-700 text-sm">
                      <p><strong className="font-medium">Room:</strong> {filteredSchedules[0].roomName}</p>
                      <p><strong className="font-medium">Event Type:</strong> {filteredSchedules[0].eventType === 'Other' ? filteredSchedules[0].customEventType : filteredSchedules[0].eventType}</p>
                      <p><strong className="font-medium">Date:</strong> {new Date(filteredSchedules[0].date).toLocaleDateString()}</p>
                      <p><strong className="font-medium">Time:</strong> {filteredSchedules[0].startTime} - {filteredSchedules[0].endTime}</p>
                      <p className="truncate"><strong className="font-medium">Faculty:</strong> {filteredSchedules[0].faculty}</p>
                      <p className="truncate"><strong className="font-medium">Department:</strong> {filteredSchedules[0].department}</p>
                      <p><strong className="font-medium">Priority:</strong> <span className={getPriorityStyle(filteredSchedules[0].priorityLevel)}>{filteredSchedules[0].priorityLevel}</span></p>
                      <p><strong className="font-medium">Status:</strong> <span className={getStatusStyle(filteredSchedules[0].status)}>{filteredSchedules[0].status}</span></p>
                    </div>
                    <div className="mt-4 flex justify-end space-x-2">
                      <div className="group relative">
                        <button
                          onClick={() => handleViewDetails(filteredSchedules[0])}
                          className="p-2 text-blue-600 hover:text-blue-800 transition-all duration-200"
                          aria-label="View schedule"
                        >
                          <EyeIcon className="h-5 w-5" />
                        </button>
                        <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2">View</span>
                      </div>
                      <div className="group relative">
                        <button
                          onClick={() => handleEdit(filteredSchedules[0]._id)}
                          className="p-2 text-blue-600 hover:text-blue-800 transition-all duration-200"
                          aria-label="Edit schedule"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2">Edit</span>
                      </div>
                      <div className="group relative">
                        <button
                          onClick={() => handleDeleteConfirm(filteredSchedules[0])}
                          className="p-2 text-red-600 hover:text-red-800 transition-all duration-200"
                          aria-label="Delete schedule"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                        <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2">Delete</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredSchedules.map((schedule) => (
                    <div
                      key={schedule._id}
                      className={`bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 hover:scale-105 animate-slide-up ${highlightedScheduleId && schedule._id === highlightedScheduleId ? 'bg-yellow-100 border-yellow-400 shadow-xl' : ''}`}
                    >
                      <h3 className="text-xl font-semibold text-orange-600 mb-4 border-b border-gray-200 pb-2 group relative">
                        {schedule.eventName}
                        <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2">
                          {schedule.eventName}
                        </span>
                      </h3>
                      <div className="space-y-3 text-gray-700 text-sm">
                        <p><strong className="font-medium">Room:</strong> {schedule.roomName}</p>
                        <p><strong className="font-medium">Event Type:</strong> {schedule.eventType === 'Other' ? schedule.customEventType : schedule.eventType}</p>
                        <p><strong className="font-medium">Date:</strong> {new Date(schedule.date).toLocaleDateString()}</p>
                        <p><strong className="font-medium">Time:</strong> {schedule.startTime} - {schedule.endTime}</p>
                        <p className="truncate"><strong className="font-medium">Faculty:</strong> {schedule.faculty}</p>
                        <p className="truncate"><strong className="font-medium">Department:</strong> {schedule.department}</p>
                        <p><strong className="font-medium">Priority:</strong> <span className={getPriorityStyle(schedule.priorityLevel)}>{schedule.priorityLevel}</span></p>
                        <p><strong className="font-medium">Status:</strong> <span className={getStatusStyle(schedule.status)}>{schedule.status}</span></p>
                      </div>
                      <div className="mt-4 flex justify-end space-x-2">
                        <div className="group relative">
                          <button
                            onClick={() => handleViewDetails(schedule)}
                            className="p-2 text-blue-600 hover:text-blue-800 transition-all duration-200"
                            aria-label="View schedule"
                          >
                            <EyeIcon className="h-5 w-5" />
                          </button>
                          <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2">View</span>
                        </div>
                        <div className="group relative">
                          <button
                            onClick={() => handleEdit(schedule._id)}
                            className="p-2 text-blue-600 hover:text-blue-800 transition-all duration-200"
                            aria-label="Edit schedule"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </button>
                          <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2">Edit</span>
                        </div>
                        <div className="group relative">
                          <button
                            onClick={() => handleDeleteConfirm(schedule)}
                            className="p-2 text-red-600 hover:text-red-800 transition-all duration-200"
                            aria-label="Delete schedule"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                          <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2">Delete</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Main Content Card */}
        <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6">
  <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-orange-700">
    Schedule Records
  </span>
</h2>


          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-orange-500 border-solid"></div>
            </div>
          ) : filteredSchedules.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">No schedules found.</p>
              <button
                onClick={handleAddSchedule}
                className="mt-4 bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition-all duration-200 font-medium"
              >
                Add a Schedule
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSchedules.map((schedule) => (
                <div
                  key={schedule._id}
                  className={`bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 hover:scale-105 animate-slide-up ${highlightedScheduleId && schedule._id === highlightedScheduleId ? 'bg-yellow-100 border-yellow-400 shadow-xl' : ''}`}
                >
                  <h3 className="text-xl font-bold text-deep-charcoal mb-4 border-b border-gray-200 pb-2 group relative">
                    {schedule.eventName}
                    <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2">
                      {schedule.eventName}
                    </span>
                  </h3>
                  <div className="space-y-3 text-gray-700 text-sm">
                    <p><strong className="font-medium">Room:</strong> {schedule.roomName}</p>
                    <p><strong className="font-medium">Event Type:</strong> {schedule.eventType === 'Other' ? schedule.customEventType : schedule.eventType}</p>
                    <p><strong className="font-medium">Date:</strong> {new Date(schedule.date).toLocaleDateString()}</p>
                    <p><strong className="font-medium">Time:</strong> {schedule.startTime} - {schedule.endTime}</p>
                    <p className="truncate"><strong className="font-medium">Faculty:</strong> {schedule.faculty}</p>
                    <p className="truncate"><strong className="font-medium">Department:</strong> {schedule.department}</p>
                    <p><strong className="font-medium">Priority:</strong> <span className={getPriorityStyle(schedule.priorityLevel)}>{schedule.priorityLevel}</span></p>
                    <p><strong className="font-medium">Status:</strong> <span className={getStatusStyle(schedule.status)}>{schedule.status}</span></p>
                  </div>
                  <div className="mt-4 flex justify-end space-x-2">
                    <div className="group relative">
                      <button
                        onClick={() => handleViewDetails(schedule)}
                        className="p-2 text-blue-600 hover:text-blue-800 transition-all duration-200"
                        aria-label="View schedule"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </button>
                      <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2">View</span>
                    </div>
                    <div className="group relative">
                      <button
                        onClick={() => handleEdit(schedule._id)}
                        className="p-2 text-blue-600 hover:text-blue-800 transition-all duration-200"
                        aria-label="Edit schedule"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2">Edit</span>
                    </div>
                    <div className="group relative">
                      <button
                        onClick={() => handleDeleteConfirm(schedule)}
                        className="p-2 text-red-600 hover:text-red-800 transition-all duration-200"
                        aria-label="Delete schedule"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                      <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2">Delete</span>
                    </div>
                  </div>
                </div>
              ))}
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
        @keyframes slide-up {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
        .animate-slide-up {
          animation: slide-up 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}

export default ViewSchedules;