const CoursesTable = ({ rows, onEdit, onDelete }) => {
  return (
    <div className="overflow-x-auto shadow-lg rounded-lg bg-white mt-10 mx-auto max-w-6xl">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-yellow-400 text-black">
          <tr>
            <th className="px-6 py-3 text-left text-sm font-semibold tracking-wider">Course Code</th>
            <th className="px-6 py-3 text-left text-sm font-semibold tracking-wider">Course Name</th>
            <th className="px-6 py-3 text-left text-sm font-semibold tracking-wider">Credit Hours</th>
            <th className="px-6 py-3 text-left text-sm font-semibold tracking-wider">Department</th>
            <th className="px-6 py-3 text-left text-sm font-semibold tracking-wider">Assigned Lecturer</th>
            <th className="px-6 py-3 text-center text-sm font-semibold tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {rows.length > 0 ? (
            rows.map((course, index) => (
              <tr key={index} className="hover:bg-gray-50 transition-all duration-200">
                <td className="px-6 py-4 text-sm text-gray-800">{course.code}</td>
                <td className="px-6 py-4 text-sm text-gray-800">{course.name}</td>
                <td className="px-6 py-4 text-sm text-gray-800">{course.credithours}</td>
                <td className="px-6 py-4 text-sm text-gray-800">{course.department}</td>
                <td className="px-6 py-4 text-sm text-gray-800">
                  {course.assignedlecturer && course.assignedlecturer !== "Lecturer Unavailable" ? (
                    course.assignedlecturer
                  ) : (
                    <span className="text-red-500 font-semibold">Lecturer Unavailable</span>
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-center space-x-2">
                  <button
                    onClick={() => onEdit(course)}
                    className="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded shadow-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(course)}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded shadow-sm"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={6} className="px-6 py-6 text-center text-gray-500 text-sm">
                No Courses Found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default CoursesTable;
