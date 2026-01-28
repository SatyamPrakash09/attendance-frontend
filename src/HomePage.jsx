import React, { useEffect, useState, useMemo } from "react";
import "./HomePage.css";
import ActionAlerts from "./components/ActionAlerts";
import Button from '@mui/material/Button';
import Avatar from "@mui/material/Avatar";
import TelegramIcon from '@mui/icons-material/Telegram';
import { deepPurple } from '@mui/material/colors';
import GitHubIcon from '@mui/icons-material/GitHub';
import TelegramButton from "./pages/Telegram";
import AttendanceCalendar from "./components/Attendance_Calendar";
import Tooltip from "./components/tooltip";


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
  // const[userName,setUserName] = useState("Not Found")
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


  let userName = "User";
  if (workingDays.length > 0) {
    userName = workingDays[0]?.name || "User";
  }

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
            <TelegramButton />
          </button>
        </div>
      </div>
    );
  }

  /* =================================================
     8️⃣ MAIN UI
     ================================================= */
  return (

    <div className="app-container bg-linear-to-b from-[#0D0D0F] to-[#1a1a1e]">
      {/* Navbar */}
      <nav className="navbar bg-[#0D0D0F]">
        <div className="brand ">
          <span className="logo"></span>
          <h1>
            Attendance <span className="highlight">Tracker</span>
          </h1>
        </div>
        <div className="flex gap-4 justify-center">
          <div className="flex items-center gap-3 text-lg text-white">

            <Tooltip
              text={userName}
              position="bottom"
            >
              <Avatar sx={{ bgcolor: deepPurple[400] }}>
                {userName ? userName.charAt(0).toUpperCase() : "?"}
              </Avatar>
            </Tooltip>

          </div>
          <Tooltip text="Frontend Github" position="bottom">
            <a target="_blank" href="https://github.com/SatyamPrakash09/attendance-frontend"><GitHubIcon style={{ width: 30, height: 30 }} className="mt-1.5" /></a>
          </Tooltip>
          <button className="px-4 py-2 rounded-2xl cursor-pointer text-red-600/80 hover:bg-red-400/40 hover:text-red-500/90 transition duration-200 border border-[#2A2B2F]" onClick={handleLogout}>
            Logout
          </button>
        </div>

      </nav>

      <main className="main-content">
        {alert.show && (
          <ActionAlerts
            message={alert.message}
            severity={alert.severity}
            onClose={() => setAlert({ ...alert, show: false })}
          />
        )}

        <div className="py-8 md:py-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <span className="bg-[#22D3EE]/10 text-[#22D3EE] text-[10px] font-bold px-2 py-1 rounded uppercase tracking-widest border border-[#22D3EE]/20">
                Attendance Tracker
              </span>
              <span className="text-gray-500 text-sm font-medium">V 1.0</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-100 tracking-tight wrap-break-words">
              THE YEAR <span className="text-[#22D3EE]">{new Date().getFullYear()}</span>
            </h1>
            <p className="text-gray-400 mt-2 font-medium max-w-xl text-sm md:text-base">
              An efficient web-telegram-based attendance tracker featuring dynamic status cards and visual data summaries to help students manage academic records.
            </p>
          </div>

          {/* Stats */}

          <section className="flex gap-3 md:gap-8 mb-12 justify-center flex-wrap sm:flex-nowrap">
            <StatCard label="Total Days" value={totalDays} />
            <StatCard label="Present" value={presentDays} />
            <StatCard label="Absent" value={absentDays} />
            <StatCard label="Attendance" value={`${percentage}%`} />
          </section>

        </div>


        <div className="dashboard-grid">
          {/* LEFT */}
          <aside className="sidebar">
            <div className="card mb-3 border border-white/5 bg-linear-to-b from-[#1c1c21] to-[#16161A]">
              <AttendanceCalendar attendanceData={attendanceData} />
            </div>

            <div className="card p-3 text-center border border-white/5 bg-linear-to-b from-[#1c1c21] to-[#16161A]">
              <h3>✨ AI Insight</h3>
              <button onClick={handleSummarize} disabled={loading}>
                {loading ? "Thinking..." : "Summarize"}
              </button>
              {summary && <p className="ai-result">{summary}</p>}
            </div>
          </aside>

          {/* RIGHT */}
          <section className="card table-wrapper bg-[#16161A] border border-[#2A2B2F]">
            <div className="table-header">
              <h2 className="text-3xl text-[#3b82f6] font-mono font-bold">Attendance Records</h2>
              <div className="controls flex gap-10">

                <select className="block w-24 px-3 py-2 bg-neutral-secondary-medium border border-default-medium rounded-2xl text-heading text-sm rounded-base focus:ring-brand focus:border-brand shadow-xs placeholder:text-body"
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                >
                  <option className="bg-slate-900" value="All">All</option>
                  <option className="bg-slate-900" value="Present">Present</option>
                  <option className="bg-slate-900" value="Absent">Absent</option>
                  <option className="bg-slate-900" value="Holiday">Holiday</option>
                </select>
                <button
                  className="border w-24 border-default-medium rounded-2xl px-3 py-2"
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
                  <th className="bg-[#1c1c21] py-4">Date</th>
                  <th className="bg-[#1c1c21] py-4">Status</th>
                  <th className="bg-[#1c1c21] py-4">Reason</th>
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
                      <tr className="month-header border-[#434655]">
                        <td className="bg-[#171720] border-t border-t-[#334155] " colSpan="3">{month}</td>
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
const StatCard = ({ label, value }) => {

  const color =
    label === "Total Days" ? "text-yellow-500" :
      label === "Present" ? "text-green-500" :
        label === "Absent" ? "text-red-500" :
          label === "Attendance" && parseInt(value) > 95 ? "drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]" :
            "text-neutral-300";

  return (
    <div className="bg-linear-to-br from-[#232329] to-[#16161A] border border-white/5 rounded-xl p-3 md:p-4 flex flex-col items-center min-w-22.5 md:min-w-25 shadow-sm">
      <span className={`text-xl md:text-2xl font-black ${color}`}>
        {value}
      </span>
      <span className="text-[9px] md:text-[10px] font-bold text-gray-500 uppercase tracking-widest">
        {label}
      </span>
    </div>
  )
};