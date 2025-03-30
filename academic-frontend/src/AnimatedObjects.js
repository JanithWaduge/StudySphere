// 🔸 components/AnimatedObjects.js
import React from 'react';
import floatingBook from './assets/book.jpg'; // use a transparent PNG of a book
import wavingLecturer from './assets/student.jpg';    // use a cartoon or vector of a lecturer

function AnimatedObjects() {
  return (
    <div className="absolute inset-0 overflow-hidden z-10 pointer-events-none">
      {/* Floating Book - left */}
      <img
        src={floatingBook}
        alt="Floating Book"
        className="absolute w-16 animate-float top-32 left-10 opacity-80"
      />

      {/* Floating Book - right */}
      <img
        src={floatingBook}
        alt="Floating Book"
        className="absolute w-20 animate-float-slow top-64 right-16 opacity-70"
      />

      {/* Waving Lecturer - bottom left */}
      <img
        src={wavingLecturer}
        alt="Lecturer"
        className="absolute w-24 bottom-10 left-10 animate-wave opacity-90"
      />
    </div>
  );
}

export default AnimatedObjects;
