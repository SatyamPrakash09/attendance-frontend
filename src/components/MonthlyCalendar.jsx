import "./MonthlyCalendar.css";

function getMonthDays(year, month) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const days = [];
  const startOffset = firstDay.getDay();

  // empty cells before month starts
  for (let i = 0; i < startOffset; i++) {
    days.push(null);
  }

  // actual days
  for (let d = 1; d <= lastDay.getDate(); d++) {
    days.push(new Date(year, month, d));
  }

  return days;
}

export default function MonthlyCalendar({ attendanceData }) {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();

  // Map: YYYY-MM-DD -> status
  const attendanceMap = {};
  attendanceData.forEach(d => {
    attendanceMap[d.date] = d.status;
  });

  const days = getMonthDays(year, month);

  function formatKey(date) {
    return date.toLocaleDateString("en-CA", {
      timeZone: "Asia/Kolkata"
    });
  }

  function getClass(status) {
    if (status === "Present") return "bg-green-500 text-neutral-800 hover: bg-green-500 hover:brightness-125";
    if (status === "Absent") return "bg-red-500 text-neutral-800 hover:brightness-125";
    if (status === "Holiday") return "bg-cyan-400 text-neutral-800 hover:brightness-125 hover:bg-cyan-400";
    return "text-neutral-300 hover:bg-[#3F3F46] bg-gradient-to-br from-[#252528] via-[#252528] to-[#2c2c30]";
  }

  return (
    <section className="calendar">
      <h2 className="text-[#3b82f6] mb-4 text-3xl text-center font-mono font-bold">Monthly Calendar</h2>

      <div className="calendar-header ">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
          <div key={d}>{d}</div>
        ))}
      </div>

      <div className="calendar-grid">
        {days.map((date, i) => {
          if (!date) return <div key={i} />;

          const key = formatKey(date);
          const status = attendanceMap[key];

          return (
            <div key={i} className={`w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-8 lg:h-8 rounded-md flex items-center justify-center shrink-0
          transition-all duration-200 relative 
          border
          hover:scale-110
          border-transparent
           ${getClass(status)}`}>
              <span className="date">{date.getDate()}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
