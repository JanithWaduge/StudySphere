const LectureRoom = require('../models/LectureRoom');

// Get all lecture rooms
const getAllLectureRooms = async (req, res) => {
  try {
    const lectureRooms = await LectureRoom.find();
    res.json(lectureRooms);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get a single lecture room by ID
const getLectureRoomById = async (req, res) => {
  try {
    const lectureRoom = await LectureRoom.findById(req.params.id);
    if (!lectureRoom) {
      return res.status(404).json({ message: 'Lecture room not found' });
    }
    res.json(lectureRoom);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Add a new lecture room
const createLectureRoom = async (req, res) => {
  try {
    const lectureRoom = new LectureRoom(req.body);
    await lectureRoom.save();
    res.status(201).json(lectureRoom);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update a lecture room
const updateLectureRoom = async (req, res) => {
  try {
    const lectureRoom = await LectureRoom.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!lectureRoom) {
      return res.status(404).json({ message: 'Lecture room not found' });
    }
    res.json(lectureRoom);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a lecture room
const deleteLectureRoom = async (req, res) => {
  try {
    const lectureRoom = await LectureRoom.findByIdAndDelete(req.params.id);
    if (!lectureRoom) {
      return res.status(404).json({ message: 'Lecture room not found' });
    }
    res.json({ message: 'Lecture room deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Check if a room name exists
const checkRoomName = async (req, res) => {
  try {
    const { roomName } = req.query;
    if (!roomName) {
      return res.status(400).json({ message: 'Room name is required' });
    }

    const existingRoom = await LectureRoom.findOne({ roomName });
    res.json({ exists: !!existingRoom });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Search lecture rooms
const searchLectureRooms = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      const lectureRooms = await LectureRoom.find();
      return res.json(lectureRooms);
    }

    const searchQuery = query.toLowerCase().trim();
    const lectureRooms = await LectureRoom.find();

    const filteredRooms = lectureRooms.filter((room) => {
      // Case-insensitive search for room name
      if (room.roomName.toLowerCase().includes(searchQuery)) {
        return true;
      }

      // Case-insensitive search for location
      if (room.location.toLowerCase().includes(searchQuery)) {
        return true;
      }

      // Case-insensitive search for room type
      if (room.room_type.toLowerCase().includes(searchQuery)) {
        return true;
      }

      // Case-insensitive search for available equipments
      const equipments = room.available_equipments.map((equipment) => equipment.toLowerCase());
      const queryEquipments = searchQuery.split(',').map((q) => q.trim());
      if (queryEquipments.length > 1) {
        // If multiple equipments are searched, check if all match
        return queryEquipments.every((q) => equipments.includes(q));
      } else {
        // Single equipment search
        if (equipments.includes(searchQuery)) {
          return true;
        }
      }

      // Case-insensitive search for seating type
      if (room.seating_type.toLowerCase().includes(searchQuery)) {
        return true;
      }

      // Case-insensitive search for air conditioning
      if (searchQuery === 'air conditioning' && room.air_conditioning) {
        return true;
      }

      // Case-insensitive search for condition
      if (room.condition.toLowerCase().includes(searchQuery)) {
        return true;
      }

      // Search for quantity (e.g., "computers:50")
      const quantityMatch = searchQuery.match(/^(\w+):(\d+)$/);
      if (quantityMatch) {
        const [_, equipment, qty] = quantityMatch;
        const equipmentKey = equipment.charAt(0).toUpperCase() + equipment.slice(1).toLowerCase();
        if (room.available_equipments.includes(equipmentKey) && room.quantity[equipmentKey] == qty) {
          return true;
        }
      }

      // Case-insensitive search for added by
      if (room.addedBy.toLowerCase().includes(searchQuery)) {
        return true;
      }

      return false;
    });

    res.json(filteredRooms);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Generate report
const generateReport = async (req, res) => {
  try {
    const lectureRooms = await LectureRoom.find();
    const totalRooms = lectureRooms.length;
    const avgUtilization =
      totalRooms > 0
        ? lectureRooms.reduce((sum, room) => sum + room.utilization, 0) / totalRooms
        : 0;

    // Calculate additional statistics for the report
    const conditionBreakdown = {
      Excellent: 0,
      Good: 0,
      'Needs to Repair': 0,
    };
    const equipmentUsage = {
      Projectors: 0,
      Whiteboard: 0,
      Smartboard: 0,
      Computers: 0,
      Podium: 0,
      'Audio System': 0,
    };

    lectureRooms.forEach((room) => {
      // Count rooms by condition
      conditionBreakdown[room.condition] = (conditionBreakdown[room.condition] || 0) + 1;

      // Sum quantities for equipment
      if (room.quantity) {
        equipmentUsage.Projectors += Math.max(0, Math.floor(room.quantity.Projectors || 0));
        equipmentUsage.Whiteboard += Math.max(0, Math.floor(room.quantity.Whiteboard || 0));
        equipmentUsage.Smartboard += Math.max(0, Math.floor(room.quantity.Smartboard || 0));
        equipmentUsage.Computers += Math.max(0, Math.floor(room.quantity.Computers || 0));
        equipmentUsage.Podium += Math.max(0, Math.floor(room.quantity.Podium || 0));
      }
      // Count rooms with Audio System
      if (room.available_equipments && room.available_equipments.includes('Audio System')) {
        equipmentUsage['Audio System'] += 1;
      }
    });

    const report = {
      title: 'Lecture Room Utilization Summary Report',
      generatedOn: new Date().toISOString(),
      rooms: lectureRooms,
      summary: {
        totalRooms,
        avgUtilization: avgUtilization.toFixed(2),
        conditionBreakdown,
        equipmentUsage,
      },
    };

    res.json(report);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getAllLectureRooms,
  getLectureRoomById,
  createLectureRoom,
  updateLectureRoom,
  deleteLectureRoom,
  checkRoomName,
  searchLectureRooms,
  generateReport,
};