// utils/getAvailableLecturer.js
import Lecturer from "../models/lecturemodel.js";

const getAvailableLecturer = async (department) => {
    return await Lecturer.findOne({
        department: department,
        availabilityStatus: "Available"
    });
};

export default getAvailableLecturer;
