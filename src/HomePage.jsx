import React, { useEffect, useState } from "react";
import "./HomePage.css";
import.meta.env.VITE_API_URL


function HomePage() {
  const [attendanceData, setAttendanceData] = useState([]);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/attendance/all`)
      .then(res => res.json())
      .then(setAttendanceData)
      .catch(console.error);
  }, []);

  const workingDays = attendanceData.filter(d => d.status !== "Holiday");
  const totalDays = workingDays.length;
  const presentDays = workingDays.filter(d => d.status === "Present").length;
  const absentDays = workingDays.filter(d => d.status === "Absent").length;
  const percentage = totalDays === 0 ? 0 : ((presentDays / totalDays) * 100).toFixed(2);
  // ✅ Correct date formatter
  function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });
  }

  return (
    <>
      <header>
        <h1>📘 Attendance Tracker</h1>
        <p>Personal College Attendance Dashboard</p>
      </header>

      <main className="container">
        {/* Summary Cards */}
        <section className="summary">
          <div className="card">
            <h2>Total Days</h2>
            <p>{totalDays}</p>
          </div>

          <div className="card">
            <h2>Present</h2>
            <p>{presentDays}</p>
          </div>

          <div className="card">
            <h2>Absent</h2>
            <p>{absentDays}</p>
          </div>

          <div className="card highlight">
            <h2>Attendance %</h2>
            <p>{percentage}%</p>
          </div>
        </section>

        {/* Attendance Table */}
        <section className="table-section">
          <h2>Attendance Records</h2>

          <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Status</th>
            <th>Reason</th>
          </tr>
        </thead>
        <tbody>
          {attendanceData.map((r, i) => (
            <tr key={i}>
              <td>{formatDate(r.date)}</td>
              <td className={r.status.toLowerCase()}>{r.status}</td>
              <td>{r.reason}</td>
            </tr>
          ))}
        </tbody>
      </table>
        </section>
      </main>

      <footer>
        <p>Built by Satyam • Attendance Tracker Project</p>
      </footer>
    </>
  );
}

export default HomePage;
