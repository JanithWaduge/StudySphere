import React from "react";
import { FaGithub, FaLinkedin, FaEnvelope } from "react-icons/fa";

function Footer() {
  return (
    <footer className="bg-gradient-to-r from-yellow-600 via-orange-500 to-yellow-700 text-white pt-10 pb-6 relative">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 text-sm">
        {/* About */}
        <div>
          <h2 className="text-xl font-bold mb-2">📚 StudySphere</h2>
          <p className="text-yellow-100">
            Designed to simplify academic scheduling, empowering institutions through automation.
          </p>
        </div>

        {/* Links */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Quick Links</h3>
          <ul className="space-y-1">
            <li><a href="/courses" className="hover:text-yellow-200 transition">Courses</a></li>
            <li><a href="/lecturers" className="hover:text-yellow-200 transition">Lecturers</a></li>
            <li><a href="/students" className="hover:text-yellow-200 transition">Students</a></li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Connect</h3>
          <div className="flex space-x-4">
            <a href="https://github.com/" target="_blank" rel="noreferrer">
              <FaGithub className="text-xl hover:text-yellow-200 transition" />
            </a>
            <a href="https://linkedin.com/" target="_blank" rel="noreferrer">
              <FaLinkedin className="text-xl hover:text-yellow-200 transition" />
            </a>
            <a href="mailto:info@studysphere.ac">
              <FaEnvelope className="text-xl hover:text-yellow-200 transition" />
            </a>
          </div>
          <p className="mt-2 text-yellow-100">info@studysphere.ac</p>
        </div>
      </div>

      {/* Copyright */}
      <div className="mt-8 text-center text-yellow-200 text-xs">
        © {new Date().getFullYear()} StudySphere. All rights reserved.
      </div>
    </footer>
  );
}

export default Footer;
