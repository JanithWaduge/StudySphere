import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import Alert from './Alert';

function EditLectureRoom() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    roomName: '',
    location: '',
    capacity: '',
    room_type: '',
    available_equipments: [],
    quantity: {
      Projectors: 0,
      Whiteboard: 0,
      Smartboard: 0,
      Computers: 0,
      Podium: 0,
    },
    seating_type: '',
    air_conditioning: false,
    power_outlets: '',
    addedBy: '',
    email: '',
    faculty: '',
    utilization: 0,
    updatedAt: '',
  });
  const [validationMessages, setValidationMessages] = useState({
    roomName: '',
    location: '',
    capacity: '',
    power_outlets: '',
    addedBy: '',
    email: '',
    quantity: {
      Projectors: '',
      Whiteboard: '',
      Smartboard: '',
      Computers: '',
      Podium: '',
    },
  });
  const [alert, setAlert] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    const fetchLectureRoom = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/lecture-rooms/${id}`);
        const data = response.data;
        setFormData({
          ...data,
          faculty: data.faculty || '',
          available_equipments: data.available_equipments || [],
          quantity: data.quantity || {
            Projectors: 0,
            Whiteboard: 0,
            Smartboard: 0,
            Computers: 0,
            Podium: 0,
          },
          updatedAt: data.updatedAt || '',
        });
      } catch (error) {
        setAlert({ message: 'Failed to fetch lecture room details', type: 'error' });
      }
    };
    fetchLectureRoom();
  }, [id]);

  const validateRoomName = async (value) => {
    const roomNamePattern = /^[A-G]\d{3,4}$/;
    if (!roomNamePattern.test(value)) {
      setValidationMessages((prev) => ({
        ...prev,
        roomName: 'Room name must start with A-G and have 3 or 4 numbers (e.g., A401 or F1102)',
      }));
      return false;
    }

    let floor, roomNumber;
    if (value.length === 4) {
      floor = parseInt(value.slice(1, 2));
      roomNumber = parseInt(value.slice(2));
    } else {
      floor = parseInt(value.slice(1, 3));
      roomNumber = parseInt(value.slice(3));
    }

    if (floor < 1 || floor > 15) {
      setValidationMessages((prev) => ({
        ...prev,
        roomName: 'Floor number must be between 1 and 15',
      }));
      return false;
    }
    if (roomNumber < 1 || roomNumber > 12) {
      setValidationMessages((prev) => ({
        ...prev,
        roomName: 'Room number must be between 1 and 12',
      }));
      return false;
    }

    setValidationMessages((prev) => ({ ...prev, roomName: '' }));
    return true;
  };

  const validateLocation = (value) => {
    if (value.length > 20) {
      setValidationMessages((prev) => ({
        ...prev,
        location: 'Location must not exceed 20 characters',
      }));
      return false;
    }
    setValidationMessages((prev) => ({ ...prev, location: '' }));
    return true;
  };

  const validateCapacityAndPowerOutlets = (name, value) => {
    const numValue = parseInt(value);
    if (numValue <= 0) {
      setValidationMessages((prev) => ({
        ...prev,
        [name]: `${name === 'capacity' ? 'Capacity' : 'Power Outlets'} must be a positive number`,
      }));
      return false;
    }
    setValidationMessages((prev) => ({ ...prev, [name]: '' }));
    return true;
  };

  const validateQuantity = (resource, value) => {
    const numValue = parseInt(value);
    if (numValue <= 0) {
      setValidationMessages((prev) => ({
        ...prev,
        quantity: {
          ...prev.quantity,
          [resource]: `${resource} quantity must be a positive number`,
        },
      }));
      return false;
    }

    const maxLimits = {
      Projectors: 2,
      Whiteboard: 2,
      Smartboard: 2,
      Computers: 120,
      Podium: 2,
    };

    if (numValue > maxLimits[resource]) {
      setValidationMessages((prev) => ({
        ...prev,
        quantity: {
          ...prev.quantity,
          [resource]: `${resource} quantity cannot exceed ${maxLimits[resource]}`,
        },
      }));
      return false;
    }

    setValidationMessages((prev) => ({
      ...prev,
      quantity: {
        ...prev.quantity,
        [resource]: '',
      },
    }));
    return true;
  };

  const validateAddedBy = (value) => {
    if (value.length > 20) {
      setValidationMessages((prev) => ({
        ...prev,
        addedBy: 'Added By must not exceed 20 characters',
      }));
      return false;
    }
    if (!/^[a-zA-Z\s]*$/.test(value)) {
      setValidationMessages((prev) => ({
        ...prev,
        addedBy: 'Added By must contain only letters and spaces',
      }));
      return false;
    }
    setValidationMessages((prev) => ({ ...prev, addedBy: '' }));
    return true;
  };

  const validateEmail = (value) => {
    if (value.length > 50) {
      setValidationMessages((prev) => ({
        ...prev,
        email: 'Email must not exceed 50 characters',
      }));
      return false;
    }
    if (!value.includes('@') || !value.includes('.com')) {
      setValidationMessages((prev) => ({
        ...prev,
        email: 'Email must contain @ and .com',
      }));
      return false;
    }
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.com$/;
    if (!emailPattern.test(value)) {
      setValidationMessages((prev) => ({
        ...prev,
        email: 'Email can only contain letters, numbers, and standard email characters',
      }));
      return false;
    }
    setValidationMessages((prev) => ({ ...prev, email: '' }));
    return true;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === 'checkbox' && name === 'available_equipments') {
      setFormData((prev) => ({
        ...prev,
        available_equipments: checked
          ? [...prev.available_equipments, value]
          : prev.available_equipments.filter((res) => res !== value),
        quantity: {
          ...prev.quantity,
          [value]: checked ? 1 : 0,
        },
      }));
    } else if (type === 'checkbox' && name === 'air_conditioning') {
      setFormData((prev) => ({ ...prev, air_conditioning: checked }));
    } else if (name.startsWith('quantity_')) {
      const resource = name.replace('quantity_', '');
      setFormData((prev) => ({
        ...prev,
        quantity: {
          ...prev.quantity,
          [resource]: value,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleBlur = async (e) => {
    const { name, value } = e.target;

    if (name === 'roomName') {
      if (!await validateRoomName(value)) {
        setFormData((prev) => ({ ...prev, roomName: '' }));
      }
    } else if (name === 'location') {
      if (!validateLocation(value)) {
        setFormData((prev) => ({ ...prev, location: '' }));
      }
    } else if (name === 'capacity' || name === 'power_outlets') {
      if (value !== '' && !validateCapacityAndPowerOutlets(name, value)) {
        setFormData((prev) => ({ ...prev, [name]: '' }));
      }
    } else if (name.startsWith('quantity_')) {
      const resource = name.replace('quantity_', '');
      if (value !== '' && !validateQuantity(resource, value)) {
        setFormData((prev) => ({
          ...prev,
          quantity: {
            ...prev.quantity,
            [resource]: 0,
          },
        }));
      }
    } else if (name === 'addedBy') {
      if (!validateAddedBy(value)) {
        setFormData((prev) => ({ ...prev, addedBy: '' }));
      }
    } else if (name === 'email') {
      if (value && !validateEmail(value)) {
        setFormData((prev) => ({ ...prev, email: '' }));
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const requiredFields = [
      'roomName',
      'location',
      'capacity',
      'room_type',
      'seating_type',
      'power_outlets',
      'addedBy',
      'email',
      'faculty',
    ];
    for (const field of requiredFields) {
      if (!formData[field]) {
        setAlert({ message: `${field} is required`, type: 'error' });
        return;
      }
    }

    const equipmentsWithQuantity = formData.available_equipments.filter(
      (resource) => resource !== 'Audio System'
    );
    for (const resource of equipmentsWithQuantity) {
      if (!validateQuantity(resource, formData.quantity[resource])) {
        return;
      }
    }

    if (!validateEmail(formData.email)) {
      setFormData((prev) => ({ ...prev, email: '' }));
      return;
    }

    setShowConfirm(true);
  };

  const handleConfirmUpdate = async () => {
    try {
      await axios.put(`http://localhost:5000/api/lecture-rooms/${id}`, formData);
      setAlert({ message: 'Lecture room updated successfully!', type: 'success' });
      setShowConfirm(false);
      setTimeout(() => navigate('/view-records'), 2000);
    } catch (error) {
      setAlert({
        message: `Failed to update lecture room: ${error.response?.data?.message || error.message}`,
        type: 'error',
      });
      setShowConfirm(false);
    }
  };

  const handleCancelUpdate = () => {
    setShowConfirm(false);
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'Not updated yet';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <div
      className="min-h-screen py-12 relative bg-gray-100"
      style={{
        backgroundImage: `url('https://img.freepik.com/free-vector/modern-office-interior-with-flat-design_23-2147902595.jpg')`,
        backgroundSize: 'contain',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="relative z-10 container mx-auto px-4">
        {alert && <Alert message={alert.message} type={alert.type} onClose={() => setAlert(null)} />}
        {showConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Confirm Update
              </h2>
              <p className="text-gray-800 mb-6">
                Are you sure you want to update the{' '}
                <span className="font-bold text-[#FF8C66]">{formData.roomName}</span>{' '}
                Lecture Room Record?
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={handleCancelUpdate}
                  className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  No
                </button>
                <button
                  onClick={handleConfirmUpdate}
                  className="bg-[#FF8C66] text-white px-4 py-2 rounded-lg hover:bg-[#FF7043] transition-colors"
                >
                  Yes
                </button>
              </div>
            </div>
          </div>
        )}
        <h1 className="text-4xl font-bold text-orange-700 text-center mb-10 drop-shadow-lg">
          Edit Lecture Room
        </h1>
        <form
          onSubmit={handleSubmit}
          className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-2xl transition-all duration-300 hover:shadow-xl"
        >
          <div className="mb-6">
            <label className="block text-gray-800 font-semibold mb-2 text-lg">Room Name</label>
            <input
              type="text"
              name="roomName"
              value={formData.roomName}
              onChange={handleChange}
              onBlur={handleBlur}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF8C66] focus:border-transparent transition-all duration-200 shadow-sm hover:shadow-md"
              required
              placeholder="e.g., A401 or F1102"
            />
            {validationMessages.roomName && (
              <p className="text-sm text-red-600 mt-1">{validationMessages.roomName}</p>
            )}
          </div>
          <div className="mb-6">
            <label className="block text-gray-800 font-semibold mb-2 text-lg">Location</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              onBlur={handleBlur}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF8C66] focus:border-transparent transition-all duration-200 shadow-sm hover:shadow-md"
              required
              maxLength={20}
              placeholder="e.g., Building A"
            />
            {validationMessages.location && (
              <p className="text-sm text-red-600 mt-1">{validationMessages.location}</p>
            )}
          </div>
          <div className="mb-6">
            <label className="block text-gray-800 font-semibold mb-2 text-lg">Capacity</label>
            <input
              type="number"
              name="capacity"
              value={formData.capacity}
              onChange={handleChange}
              onBlur={handleBlur}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF8C66] focus:border-transparent transition-all duration-200 shadow-sm hover:shadow-md"
              required
              placeholder="e.g., 50"
            />
            {validationMessages.capacity && (
              <p className="text-sm text-red-600 mt-1">{validationMessages.capacity}</p>
            )}
          </div>
          <div className="mb-6">
            <label className="block text-gray-800 font-semibold mb-2 text-lg">Room Type</label>
            <select
              name="room_type"
              value={formData.room_type}
              onChange={handleChange}
              onBlur={handleBlur}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF8C66] focus:border-transparent transition-all duration-200 shadow-sm hover:shadow-md"
              required
            >
              <option value="">Select Room Type</option>
              <option value="Lecture Hall">Lecture Hall</option>
              <option value="Computer Lab">Computer Lab</option>
              <option value="Auditorium">Auditorium</option>
              <option value="BYOD Lab">BYOD Lab</option>
              <option value="Conference Room">Conference Room</option>
            </select>
          </div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Resources</h2>
          <div className="mb-6">
            <label className="block text-gray-800 font-semibold mb-2 text-lg">Available Equipment</label>
            <div className="grid grid-cols-2 gap-4">
              {['Projectors', 'Whiteboard', 'Smartboard', 'Computers', 'Podium', 'Audio System'].map((resource) => (
                <label key={resource} className="flex items-center">
                  <input
                    type="checkbox"
                    name="available_equipments"
                    value={resource}
                    checked={formData.available_equipments.includes(resource)}
                    onChange={handleChange}
                    className="mr-2 h-5 w-5 text-[#FF8C66] border-gray-300 rounded focus:ring-[#FF8C66] transition-all duration-200"
                  />
                  <span className="text-gray-700 font-medium">{resource}</span>
                </label>
              ))}
            </div>
          </div>
          {formData.available_equipments.length > 0 && (
            <div className="mb-6">
              <label className="block text-gray-800 font-semibold mb-2 text-lg">Equipment Quantities</label>
              <div className="grid grid-cols-2 gap-4">
                {formData.available_equipments
                  .filter((resource) => resource !== 'Audio System')
                  .map((resource) => (
                    <div key={resource} className="flex items-center">
                      <label className="text-gray-700 font-medium mr-2">{resource} Quantity:</label>
                      <input
                        type="number"
                        name={`quantity_${resource}`}
                        value={formData.quantity[resource]}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className="w-20 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF8C66] focus:border-transparent transition-all duration-200 shadow-sm hover:shadow-md"
                        min="1"
                        required
                      />
                      {validationMessages.quantity[resource] && (
                        <p className="text-sm text-red-600 mt-1 ml-2">{validationMessages.quantity[resource]}</p>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          )}
          <div className="mb-6">
            <label className="block text-gray-800 font-semibold mb-2 text-lg">Seating Type</label>
            <select
              name="seating_type"
              value={formData.seating_type}
              onChange={handleChange}
              onBlur={handleBlur}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF8C66] focus:border-transparent transition-all duration-200 shadow-sm hover:shadow-md"
              required
            >
              <option value="">Select Seating Type</option>
              <option value="Fixed Seating">Fixed Seating</option>
              <option value="Flexible Seating">Flexible Seating</option>
              <option value="Lab Workstations">Lab Workstations</option>
            </select>
          </div>
          <div className="mb-6">
            <label className="block text-gray-800 font-semibold mb-2 text-lg">Air Conditioning</label>
            <label className="flex items-center">
              <input
                type="checkbox"
                name="air_conditioning"
                checked={formData.air_conditioning}
                onChange={handleChange}
                className="mr-2 h-5 w-5 text-[#FF8C66] border-gray-300 rounded focus:ring-[#FF8C66] transition-all duration-200"
              />
              <span className="text-gray-700 font-medium">Yes</span>
            </label>
          </div>
          <div className="mb-6">
            <label className="block text-gray-800 font-semibold mb-2 text-lg">Power Outlets</label>
            <input
              type="number"
              name="power_outlets"
              value={formData.power_outlets}
              onChange={handleChange}
              onBlur={handleBlur}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF8C66] focus:border-transparent transition-all duration-200 shadow-sm hover:shadow-md"
              required
              placeholder="e.g., 10"
            />
            {validationMessages.power_outlets && (
              <p className="text-sm text-red-600 mt-1">{validationMessages.power_outlets}</p>
            )}
          </div>
          <div className="mb-6">
            <label className="block text-gray-800 font-semibold mb-2 text-lg">Faculty</label>
            <select
              name="faculty"
              value={formData.faculty}
              onChange={handleChange}
              onBlur={handleBlur}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF8C66] focus:border-transparent transition-all duration-200 shadow-sm hover:shadow-md"
              required
            >
              <option value="">Select Faculty</option>
              <option value="Computing">Computing</option>
              <option value="Engineering">Engineering</option>
              <option value="Science">Science</option>
              <option value="Business">Business</option>
              <option value="Arts">Arts</option>
            </select>
          </div>
          <div className="mb-6">
            <label className="block text-gray-800 font-semibold mb-2 text-lg">Added By (Full Name)</label>
            <input
              type="text"
              name="addedBy"
              value={formData.addedBy}
              onChange={handleChange}
              onBlur={handleBlur}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF8C66] focus:border-transparent transition-all duration-200 shadow-sm hover:shadow-md"
              required
              maxLength={20}
              placeholder="e.g., John Doe"
            />
            {validationMessages.addedBy && (
              <p className="text-sm text-red-600 mt-1">{validationMessages.addedBy}</p>
            )}
          </div>
          <div className="mb-6">
            <label className="block text-gray-800 font-semibold mb-2 text-lg">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF8C66] focus:border-transparent transition-all duration-200 shadow-sm hover:shadow-md"
              required
              placeholder="e.g., john.doe@example.com"
            />
            {validationMessages.email && (
              <p className="text-sm text-red-600 mt-1">{validationMessages.email}</p>
            )}
          </div>
          <div className="mb-6">
            <p className="text-gray-400 font-semibold text-lg">
              Last Updated: {formatDateTime(formData.updatedAt)}
            </p>
          </div>
          <button
            type="submit"
            className="w-full bg-[#FF8C66] text-white py-3 rounded-lg hover:bg-[#FF7043] transition-colors duration-200 font-semibold text-lg shadow-md hover:shadow-lg"
          >
            Update Lecture Room
          </button>
        </form>
      </div>
    </div>
  );
}

export default EditLectureRoom;