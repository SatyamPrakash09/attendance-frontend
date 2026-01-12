import React, { useEffect, useState, useMemo } from "react";
import "./HomePage.css";
import ActionAlerts from "./components/ActionAlerts";
import MonthlyCalendar from "./components/MonthlyCalendar";

function getMonthYear(dateString) {
  return new Date(dateString).toLocaleDateString("en-IN", {
    timeZone: "Asia/Kolkata",
    month: "long",
    year: "numeric"
  });
}

function HomePage() {
  const [attendanceData, setAttendanceData] = useState([]);
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [sortOrder, setSortOrder] = useState("latest"); // latest | oldest
  const [statusFilter, setStatusFilter] = useState("All");
  const [alert, setAlert] = useState({
  show: false,
  message: "",
  severity: "success" // success | error | warning | info
  });




  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/attendance/all`)
      .then(res => res.json())
      .then(setAttendanceData)
      .catch(()=>{
        setAlert({
          show:true,
          severity:"error",
          message:"❌ Backend not reachable"
        })
      });
  }, []);

  async function handleSummarize() {
  setLoading(true);
  setSummary("");

  try {
    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/attendance/summarize`,
      { method: "POST" }
    );

    const data = await res.json();
    setSummary(data.summary);

  } catch (err) {
    setSummary(`Failed to generate summary: ${err}`);
  } finally {
    setLoading(false);
  }
  }



  const workingDays = attendanceData.filter(d => d.status !== "Holiday");
  const totalDays = workingDays.length;
  const presentDays = workingDays.filter(d => d.status === "Present").length;
  const absentDays = workingDays.filter(d => d.status === "Absent").length;
  const percentage =
    totalDays === 0 ? 0 : ((presentDays / totalDays) * 100).toFixed(2);

  useEffect(()=>{
    if(totalDays == 0){
      return
    }
    if(percentage < 80){
      setAlert({
        severity:"error",
        message:`Attendace Below 80%: (${percentage}) !!!!!!!!!!!`,
        show: true
      })
    }else if(percentage < 85){
      setAlert({
        severity:"warning",
        message:`Attendance below 85%: (${percentage}) . Imporve it!!`,
        show:true
      })
    }else if(percentage < 90){
      setAlert({
        severity:"info",
        message:`Attendance Below 90 %: (${percentage}) `,
        show:true
      })
    }else if(percentage >= 90 ){
      setAlert({
        severity: "success",
        message:`Attendace is above 90%: (${percentage}) ...... Great👍`,
        show:true
      })
    }else{
      setAlert({
        severity:"success",
        message:"",
        show:true

      })
    }  
  },[percentage,totalDays])


  function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });
  }
  const groupedAttendance = useMemo(() => {
    let data = [...attendanceData];

    // 1️⃣ Filter
    if (statusFilter !== "All") {
      data = data.filter(r => r.status === statusFilter);
    }

    // 2️⃣ Sort
    data.sort((a, b) => {
      const diff = new Date(a.date) - new Date(b.date);
      return sortOrder === "latest" ? -diff : diff;
    });

    // 3️⃣ Group by Month-Year
    const groups = {};

    for (const record of data) {
      const monthKey = getMonthYear(record.date);
      if (!groups[monthKey]) {
        groups[monthKey] = [];
      }
      groups[monthKey].push(record);
    }

    return groups;
  }, [attendanceData, sortOrder, statusFilter]);



  return (
    <>
      <main className="container">
      <ActionAlerts
        message={alert.show ? alert.message : ""}
        severity={alert.severity}
        onClose={() => setAlert({ ...alert, show: false })}
      />
      </main>
      <header>
        <h1 className="text-2xl font-bold stroke-yellow-500">📘 Attendance Tracker</h1>
        <p>Personal College Attendance Dashboard</p>
      </header>

      <main className="container">
        {/* Summary Cards */}
        <div className="container1">
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
        </div>
    <div className="container2"></div>
        {/* AI Summary Section */}
        <section className="ai-section">
          <button className="summarize-btn" onClick={handleSummarize}>
            {loading ? "Summarizing " : "Summarize Attendance"}
          </button>

          {summary && (
            <div className="ai-summary">
              <h3>AI Summary</h3>
              <p>{summary}</p>
            </div>
          )}
        </section>
        <section className="bg-[#212121] rounded-2xl ">
          <MonthlyCalendar attendanceData={attendanceData} />
        </section>
        {/* Attendance Table */}

        <section className="table-section">
          <h2 className="text-2xl font-bold">Attendance Records</h2>
          <div className="table-controls">
            <button
              className="toggle-btn"
              onClick={() =>
                setSortOrder(prev => (prev === "latest" ? "oldest" : "latest"))
              }
            >
              {sortOrder === "latest" ? "Show Oldest First" : "Show Latest First"}
            </button>

            <select
              className="filter-select"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option value="All">All</option>
              <option value="Present">Present</option>
              <option value="Absent">Absent</option>
              <option value="Holiday">Holiday</option>
            </select>
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
              {Object.entries(groupedAttendance).map(([month, records]) => (
                <React.Fragment key={month}>
                  {/* Month Header Row */}
                  <tr className="month-row">
                    <td colSpan="3">{month}</td>
                  </tr>

                  {/* Records under the month */}
                  {records.map((r) => (
                    <tr key={r.date}>
                      <td>{formatDate(r.date)}</td>
                      <td className={r.status.toLowerCase()}>{r.status}</td>
                      <td>{r.reason}</td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>

          </table>
        </section>
      </main>

      <footer>
        <p className="bottom_link"> <span> <a href="https://github.com/SatyamPrakash09" target="__blank">Built by Satyam </a> </span> • <span><a href="https://github.com/SatyamPrakash09/Attendance-backend" target="__blank">Attendance Tracker Project</a></span></p>
      </footer>
    </>
  );
}

export default HomePage;
