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
    if (status === "Present") return "day present";
    if (status === "Absent") return "day absent";
    if (status === "Holiday") return "day holiday";
    return "day";
  }

  return (
    <section className="calendar">
      <h2>Monthly Calendar</h2>

      <div className="calendar-header">
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
            <div key={i} className={getClass(status)}>
              <span className="date">{date.getDate()}</span>
              {status && <span className="status">{status}</span>}
            </div>
          );
        })}
      </div>
    </section>
  );
}
