import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaEye, FaEdit, FaTrash, FaSearch, FaTimes } from 'react-icons/fa';

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
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [scheduleToDelete, setScheduleToDelete] = useState(null);

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
    if (searchQuery.trim() === '') return;

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
      setShowDeleteConfirm(false);
      setSelectedSchedule(null);
      setSuccessMessage('Schedule deleted successfully.');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError('Failed to delete schedule');
    }
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
        return 'text-red-600 font-bold';
      case 'Medium':
        return 'text-yellow-600 font-bold';
      case 'Low':
        return 'text-blue-600 font-bold';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <header className="bg-white shadow-lg rounded-lg py-6 px-8 mb-10">
        <h1 className="text-4xl font-extrabold text-gray-800 text-center tracking-tight">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-orange-700">
            Schedule Records
          </span>
        </h1>
      </header>

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

      {/* Success Message */}
      {successMessage && (
        <div className="fixed top-6 right-6 z-50 animate-fade-in">
          <div className="p-4 rounded-lg shadow-lg text-white bg-green-600 flex items-center space-x-3">
            <p>{successMessage}</p>
            <button onClick={() => setSuccessMessage('')} className="text-white font-bold hover:text-green-200 transition-colors">
              ×
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Popup */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full border border-gray-200 animate-scale-in">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Confirm Deletion</h2>
            <p className="text-gray-700 mb-6">Are you sure you want to delete this schedule?</p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowDeleteConfirm(false)}
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

      {/* View Details Popup */}
      {selectedSchedule && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full border border-gray-200 relative animate-scale-in">
            <button
              onClick={() => setSelectedSchedule(null)}
              className="absolute top-4 right-4 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 transition-colors duration-200"
            >
              <span className="text-lg font-bold">×</span>
            </button>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">{selectedSchedule.eventName}</h2>
            <div className="space-y-3 text-gray-700">
              <p><strong>Event Type:</strong> {selectedSchedule.eventType === 'Other' ? selectedSchedule.customEventType : selectedSchedule.eventType}</p>
              <p><strong>Date:</strong> {new Date(selectedSchedule.date).toLocaleDateString()}</p>
              <p><strong>Start Time:</strong> {selectedSchedule.startTime}</p>
              <p><strong>Duration:</strong> {selectedSchedule.duration} minutes</p>
              <p><strong>End Time:</strong> {selectedSchedule.endTime}</p>
              <p>
                <strong>Recurrence:</strong> {selectedSchedule.recurrence}
                {selectedSchedule.recurrence === 'Yes' && (
                  <span> ({selectedSchedule.recurrenceFrequency})</span>
                )}
              </p>
            </div>
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setSelectedSchedule(null)}
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors duration-200 font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search Results Popup */}
      {showSearchResultsPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[80vh] overflow-y-auto relative animate-scale-in">
            <button
              onClick={closeSearchResultsPopup}
              className="absolute top-4 right-4 bg-red-500 text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-red-600 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105"
            >
              <FaTimes className="text-lg" />
            </button>
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              {searchQuery ? `Search Results for "${searchQuery}"` : 'Current Occupied Schedules'} ({filteredSchedules.length} found)
            </h2>
            {filteredSchedules.length === 0 ? (
              <p className="text-gray-600 text-center py-4">No schedules found matching your criteria.</p>
            ) : filteredSchedules.length === 1 ? (
              <div className="flex justify-center">
                <div className={`bg-gray-50 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 border border-gray-100 w-full max-w-md ${highlightedScheduleId && filteredSchedules[0]._id === highlightedScheduleId ? 'bg-yellow-100 border-yellow-400 shadow-xl' : ''}`}>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">{filteredSchedules[0].eventName}</h3>
                  <p className="text-gray-600 mb-1"><strong>Room:</strong> {filteredSchedules[0].roomName}</p>
                  <div className="flex items-center space-x-2 mb-1">
                    <p className="text-gray-600"><strong>Event:</strong> {filteredSchedules[0].eventName}</p>
                    <FaEye
                      className="text-blue-600 hover:text-blue-800 cursor-pointer transition-colors duration-200"
                      onClick={() => handleViewDetails(filteredSchedules[0])}
                    />
                  </div>
                  <p className="text-gray-600 mb-1"><strong>Faculty:</strong> {filteredSchedules[0].faculty}</p>
                  <p className="text-gray-600 mb-1"><strong>Department:</strong> {filteredSchedules[0].department}</p>
                  <p className="text-gray-600 mb-4">
                    <strong>Priority Level:</strong> <span className={getPriorityStyle(filteredSchedules[0].priorityLevel)}>{filteredSchedules[0].priorityLevel}</span>
                  </p>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleEdit(filteredSchedules[0]._id)}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center"
                    >
                      <FaEdit className="mr-2" /> Edit
                    </button>
                    <button
                      onClick={() => handleDeleteConfirm(filteredSchedules[0])}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200 flex items-center"
                    >
                      <FaTrash className="mr-2" /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSchedules.map((schedule) => (
                  <div
                    key={schedule._id}
                    className={`bg-gray-50 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 border border-gray-100 ${highlightedScheduleId && schedule._id === highlightedScheduleId ? 'bg-yellow-100 border-yellow-400 shadow-xl' : ''}`}
                  >
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">{schedule.eventName}</h3>
                    <p className="text-gray-600 mb-1"><strong>Room:</strong> {schedule.roomName}</p>
                    <div className="flex items-center space-x-2 mb-1">
                      <p className="text-gray-600"><strong>Event:</strong> {schedule.eventName}</p>
                      <FaEye
                        className="text-blue-600 hover:text-blue-800 cursor-pointer transition-colors duration-200"
                        onClick={() => handleViewDetails(schedule)}
                      />
                    </div>
                    <p className="text-gray-600 mb-1"><strong>Faculty:</strong> {schedule.faculty}</p>
                    <p className="text-gray-600 mb-1"><strong>Department:</strong> {schedule.department}</p>
                    <p className="text-gray-600 mb-4">
                      <strong>Priority Level:</strong> <span className={getPriorityStyle(schedule.priorityLevel)}>{schedule.priorityLevel}</span>
                    </p>
                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleEdit(schedule._id)}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center"
                      >
                        <FaEdit className="mr-2" /> Edit
                      </button>
                      <button
                        onClick={() => handleDeleteConfirm(schedule)}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200 flex items-center"
                      >
                        <FaTrash className="mr-2" /> Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="container mx-auto max-w-6xl bg-white p-8 rounded-2xl shadow-xl">
        {/* Search Bar, Search Button, Add Schedule Button, and Reports Button */}
        <div className="flex flex-col sm:flex-row items-center mb-10 space-y-4 sm:space-y-0 sm:space-x-4 relative">
          <div className="relative w-full sm:w-3/4">
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={() => setShowRecentSearches(true)}
              onBlur={() => setTimeout(() => setShowRecentSearches(false), 200)}
              onKeyPress={handleKeyPress}
              placeholder="Search by event name, event type, faculty, department, or status..."
              className="w-full p-4 pl-12 pr-12 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all duration-200 shadow-sm hover:shadow-md"
              ref={searchInputRef}
            />
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-12 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FaTimes />
              </button>
            )}
            <button
              onClick={handleSearchSubmit}
              className="absolute right-0 top-0 h-full px-5 bg-orange-600 text-white rounded-r-lg hover:bg-orange-700 transition-colors duration-200"
            >
              <FaSearch />
            </button>
            {showRecentSearches && recentSearches.length > 0 && (
              <div className="absolute top-full left-0 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-2 z-10 max-h-48 overflow-y-auto animate-fade-in">
                <div className="p-3 text-sm text-gray-500 border-b border-gray-200 font-medium">Recent Searches</div>
                {recentSearches.map((query, index) => (
                  <div
                    key={index}
                    onClick={() => selectRecentSearch(query)}
                    className="p-3 text-gray-700 hover:bg-gray-100 cursor-pointer transition-colors duration-150"
                  >
                    {query}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="flex space-x-4">
            <button
              onClick={handleAddSchedule}
              className="bg-deep-charcoal text-white px-6 py-2 rounded-lg hover:bg-cool-teal transition-colors duration-200 font-semibold shadow-md hover:shadow-lg"
            >
              Add New Schedule
            </button>
            <button
              onClick={handleViewReports}
              className="bg-deep-charcoal text-white px-6 py-2 rounded-lg hover:bg-cool-teal transition-colors duration-200 font-semibold shadow-md hover:shadow-lg"
            >
              Reports
            </button>
          </div>
        </div>

        {/* Schedules Display (Card View) */}
        {!showSearchResultsPopup && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              <div className="flex justify-center items-center py-10 col-span-3">
                <svg className="animate-spin h-8 w-8 text-orange-600" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
              </div>
            ) : filteredSchedules.length === 0 ? (
              <p className="text-gray-600 text-center col-span-3 py-10">No schedules available.</p>
            ) : (
              filteredSchedules.map((schedule) => (
                <div
                  key={schedule._id}
                  className={`bg-gray-50 p-6 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 transform hover:-translate-y-1 ${highlightedScheduleId && schedule._id === highlightedScheduleId ? 'bg-yellow-100 border-yellow-400 shadow-xl' : ''}`}
                >
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">{schedule.eventName}</h3>
                  <p className="text-gray-600 mb-1"><strong>Room:</strong> {schedule.roomName}</p>
                  <div className="flex items-center space-x-2 mb-1">
                    <p className="text-gray-600"><strong>Event:</strong> {schedule.eventName}</p>
                    <FaEye
                      className="text-blue-600 hover:text-blue-800 cursor-pointer transition-colors duration-200"
                      onClick={() => handleViewDetails(schedule)}
                    />
                  </div>
                  <p className="text-gray-600 mb-1"><strong>Faculty:</strong> {schedule.faculty}</p>
                  <p className="text-gray-600 mb-1"><strong>Department:</strong> {schedule.department}</p>
                  <p className="text-gray-600 mb-4">
                    <strong>Priority Level:</strong> <span className={getPriorityStyle(schedule.priorityLevel)}>{schedule.priorityLevel}</span>
                  </p>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleEdit(schedule._id)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center shadow-sm hover:shadow-md"
                    >
                      <FaEdit className="mr-2" /> Edit
                    </button>
                    <button
                      onClick={() => handleDeleteConfirm(schedule)}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200 flex items-center shadow-sm hover:shadow-md"
                    >
                      <FaTrash className="mr-2" /> Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Custom Tailwind Animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scaleIn {
          from {
            transform: scale(0.95);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }

        .animate-fade-in {
          animation: fadeIn 0.3s ease-in-out;
        }

        .animate-scale-in {
          animation: scaleIn 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
}

export default ViewSchedules;