import React, { useEffect, useState, useMemo } from "react";
import "./HomePage.css";
import ActionAlerts from "./components/ActionAlerts";
import MonthlyCalendar from "./components/MonthlyCalendar";
import Button from '@mui/material/Button';
import TelegramIcon from '@mui/icons-material/Telegram';
import TelegramButton from "./pages/Telegram";


/* -------------------- HELPERS -------------------- */
function getMonthYear(dateString) {
  return new Date(dateString).toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric"
  });
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

/* ================================================= */
export default function HomePage() {
  const API_BASE = "https://attendance-backend-hhkn.onrender.com";

  const [userId, setUserId] = useState(localStorage.getItem("userId"));
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState("");
  const [sortOrder, setSortOrder] = useState("latest");
  const [statusFilter, setStatusFilter] = useState("All");
  const [alert, setAlert] = useState({
    show: false,
    message: "",
    severity: "info"
  });

  /* =================================================
     1️⃣ LOGIN HANDLING (Telegram deep-link)
     ================================================= */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const uid = params.get("uid");

    if (uid) {
      localStorage.setItem("userId", uid);
      setUserId(uid);
      window.history.replaceState({}, document.title, "/");
    }
  }, []);

  /* =================================================
     2️⃣ FETCH ATTENDANCE DATA
     ================================================= */
  useEffect(() => {
    if (!userId) return;

    setLoading(true);

    fetch(`${API_BASE}/attendance/all?userId=${userId}`)
      .then(res => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
      .then(data => {
        setAttendanceData(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        setAttendanceData([]);
        setAlert({
          show: true,
          severity: "error",
          message: "Session expired. Please login again."
        });
        localStorage.removeItem("userId");
        setUserId(null);
      })
      .finally(() => setLoading(false));
  }, [userId]);

  /* =================================================
     3️⃣ LOGOUT
     ================================================= */
  const handleLogout = () => {
    localStorage.removeItem("userId");
    window.location.href = "/";
  };

  /* =================================================
     4️⃣ METRICS
     ================================================= */
  const workingDays = attendanceData.filter(d => d.status !== "Holiday");
  const totalDays = workingDays.length;
  const presentDays = workingDays.filter(d => d.status === "Present").length;
  const absentDays = workingDays.filter(d => d.status === "Absent").length;
  const percentage =
    totalDays === 0 ? "0.0" : ((presentDays / totalDays) * 100).toFixed(1);

  /* =================================================
     5️⃣ AI SUMMARY (frontend mock)
     ================================================= */
  const handleSummarize = () => {
    if (totalDays === 0) {
      setSummary("No attendance data available yet.");
      return;
    }

    setSummary("Analyzing patterns...");
    setTimeout(() => {
      setSummary(
        `You have maintained ${percentage}% attendance. Try to avoid consecutive absences to stay above the safe limit.`
      );
    }, 1200);
  };

  /* =================================================
     6️⃣ GROUP & SORT DATA
     ================================================= */
  const groupedAttendance = useMemo(() => {
    let data = [...attendanceData];

    if (statusFilter !== "All") {
      data = data.filter(r => r.status === statusFilter);
    }

    data.sort((a, b) =>
      sortOrder === "latest"
        ? new Date(b.date) - new Date(a.date)
        : new Date(a.date) - new Date(b.date)
    );

    return data.reduce((acc, curr) => {
      const key = getMonthYear(curr.date);
      if (!acc[key]) acc[key] = [];
      acc[key].push(curr);
      return acc;
    }, {});
  }, [attendanceData, sortOrder, statusFilter]);

  /* =================================================
     7️⃣ LOGIN SCREEN
     ================================================= */
  if (!userId) {
    return (
      <div className="login-screen">
        <div className="login-box">
          <h1>👋 Welcome</h1>
          <p>
            Please open the dashboard using the link provided by your Telegram
            bot.
          </p>
          <button className="p-3">
            <TelegramButton/>
          </button>
        </div>
      </div>
    );
  }

  /* =================================================
     8️⃣ MAIN UI
     ================================================= */
  return (
    
    <div className="app-container">
      {/* Navbar */}
      <nav className="navbar">
        <div className="brand">
          <span className="logo">📅</span>
          <h1>
            Attendance <span className="highlight">Tracker</span>
          </h1>
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </nav>

      <main className="main-content">
        {alert.show && (
          <ActionAlerts
            message={alert.message}
            severity={alert.severity}
            onClose={() => setAlert({ ...alert, show: false })}
          />
        )}

        {/* Stats */}
        <section className="stats-container">
          <StatCard label="Total Days : " value={totalDays} icon="🗓️" />
          <StatCard label="Present : " value={presentDays} icon="✅" />
          <StatCard label="Absent : " value={absentDays} icon="❌" />
          <StatCard label="Attendance : " value={`${percentage}%`} icon="📈" />
        </section>

        <div className="dashboard-grid">
          {/* LEFT */}
          <aside className="sidebar">
            <div className="card mb-3">
              <MonthlyCalendar attendanceData={attendanceData} />
            </div>

            <div className="card p-3 text-center">
              <h3>✨ AI Insight</h3>
              <button onClick={handleSummarize} disabled={loading}>
                {loading ? "Thinking..." : "Summarize"}
              </button>
              {summary && <p className="ai-result">{summary}</p>}
            </div>
          </aside>

          {/* RIGHT */}
          <section className="card table-wrapper">
            <div className="table-header">
              <h2>Attendance Records</h2>
              <div className="controls">
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                >
                  <option value="All">All</option>
                  <option value="Present">Present</option>
                  <option value="Absent">Absent</option>
                  <option value="Holiday">Holiday</option>
                </select>
                <button
                  onClick={() =>
                    setSortOrder(o => (o === "latest" ? "oldest" : "latest"))
                  }
                >
                  {sortOrder === "latest" ? "⬇ Newest" : "⬆ Oldest"}
                </button>
              </div>
            </div>

            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Reason</th>
                </tr>
              </thead>
              <tbody>
                {Object.keys(groupedAttendance).length === 0 ? (
                  <tr>
                    <td colSpan="3" className="no-data">
                      No records found
                    </td>
                  </tr>
                ) : (
                  Object.entries(groupedAttendance).map(([month, records]) => (
                    <React.Fragment key={month}>
                      <tr className="month-header">
                        <td colSpan="3">{month}</td>
                      </tr>
                      {records.map((r, i) => (
                        <tr key={i}>
                          <td>{formatDate(r.date)}</td>
                          <td>{r.status}</td>
                          <td>{r.reason || "—"}</td>
                        </tr>
                      ))}
                    </React.Fragment>
                  ))
                )}
              </tbody>
            </table>
          </section>
        </div>
      </main>
    </div>
  );
}

/* -------------------- SMALL COMPONENTS -------------------- */
const StatCard = ({ label, value, icon }) => (
  <div className="stat-card">
    <div>
      <span className="label">{label}</span>
      <span className="value">{value}</span>
    </div>
    <div className="icon">{icon}</div>
  </div>
);
