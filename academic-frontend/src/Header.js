import { Link } from 'react-router-dom';

function Header() {
  return (
    <nav className="bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-500 text-white py-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center px-4">
        {/* Logo */}
        <h2 className="text-6xl font-bold text-white drop-shadow-md">StudySphere</h2>

        {/* Desktop Menu */}
        <ul className="flex space-x-8 text-lg">
          <li>
            <Link to="/admin/dashboard" className="hover:text-black transition-colors duration-300 text-2xl font-bold">
              Admin Dashboard
            </Link>
          </li>
          <li>
            <Link to="/lecturers" className="hover:text-black transition-colors duration-300 text-2xl font-bold">
              Lecturers
            </Link>
          </li>
          <li>
            <Link to="/courses" className="hover:text-black transition-colors duration-300 text-2xl font-bold">
              Courses
            </Link>
          </li>
          <li>
            <Link to="/students" className="hover:text-black transition-colors duration-300 text-2xl font-bold">
              Students
            </Link>
          </li>
          <li>
            <Link to="/view-all-exams" className="hover:text-black transition-colors duration-300 text-2xl font-bold">
              Exams
            </Link>
          </li>
          <li>
            <Link to="/view-records" className="hover:text-black transition-colors duration-300 text-2xl font-bold">
              Lecture Rooms
            </Link>
          </li>
          <li>
            <Link to="/reports" className="hover:text-black transition-colors duration-300 text-2xl font-bold">
              Reports
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default Header;
