import React from "react";

const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const generateCalendar = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const calendar = [];
  let dayCounter = 1;

  for (let i = 0; i < 6; i++) {
    const week = [];
    for (let j = 0; j < 7; j++) {
      if ((i === 0 && j < firstDay) || dayCounter > daysInMonth) {
        week.push(null);
      } else {
        week.push(dayCounter++);
      }
    }
    calendar.push(week);
  }

  return calendar;
};

const Calendar = () => {
  const calendar = generateCalendar();
  const today = new Date().getDate();

  return (
    <div className="fixed bottom-6 right-6 w-80 bg-white border border-orange-300 rounded-xl shadow-xl p-4 z-50">
      <h2 className="text-lg font-bold text-orange-600 text-center mb-2">
        {new Date().toLocaleString("default", { month: "long", year: "numeric" })}
      </h2>
      <div className="grid grid-cols-7 gap-1 text-xs font-medium text-gray-600 text-center">
        {days.map((day, idx) => (
          <div key={idx} className="uppercase">{day[0]}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-sm mt-1">
        {calendar.map((week, i) =>
          week.map((date, j) => (
            <div
              key={`${i}-${j}`}
              className={`h-7 flex items-center justify-center rounded-md
                ${date === today ? "bg-orange-500 text-white font-semibold" : "hover:bg-orange-100"}
                ${!date ? "opacity-0 cursor-default" : ""}
              `}
            >
              {date}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Calendar;
