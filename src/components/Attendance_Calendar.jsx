import * as React from "react";
// import dayjs from "dayjs";
import GlobalStyles from '@mui/material/GlobalStyles';
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { PickersDay } from "@mui/x-date-pickers/PickersDay";

export default function AttendanceCalendar({ attendanceData }) {
  // Create quick lookup map: date -> status
  const statusMap = React.useMemo(() => {
    const map = {};
    attendanceData.forEach((d) => {
      map[d.date] = d.status;
    });
    return map;
  }, [attendanceData]);

  function CustomDay(props) {
    const { day, outsideCurrentMonth, ...other } = props;
    const dateKey = day.format("YYYY-MM-DD");
    const status = statusMap[dateKey];

    let bg = "";
    if (status === "Present") bg = "#4caf50";
    if (status === "Absent") bg = "#f44336";
    if (status === "Holiday") bg = "#ff9800";

  function getCalenderClass(status) {
    if (status === "Present") return "bg-gradient-to-br from-green-500 to-green-500 text-neutral-800 hover: bg-green-500 hover:brightness-125";
    if (status === "Absent") return "bg-gradient-to-br from-red-500 to-red-500 text-neutral-800 hover:brightness-125";
    if (status === "Holiday") return "bg-gradient-to-br from-cyan-500 to-cyan-500 text-neutral-800 hover:brightness-125 hover:bg-cyan-400";
    return "text-neutral-300 hover:bg-[#3F3F46] bg-gradient-to-br from-[#252528] via-[#252528] to-[#2c2c30]";
  }

    return (
      <PickersDay
        {...other}
        day={day}
        outsideCurrentMonth={outsideCurrentMonth}
        className= {`w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-8 lg:h-8 rounded-md flex items-center justify-center shrink-0 transition-all duration-200 relative border hover:scale-110 border-transparent ${getCalenderClass(status)}`
          }
        
        sx={{
          // backgroundColor: bg,
          color: bg ? "black" : "white",
          fontSize: 15,
          margin: "2px",
          borderRadius: "5px",
          fontStyle: "bold",
          transition: "all 200ms",
          // "&:hover": {
          //   backgroundColor: bg || "#e0e0e0",
          //   color: "black",
          // }
        }}
      />
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <GlobalStyles
        styles={{
          // This targets the specific class for the Day Labels (M, T, W...)
          ".MuiDayCalendar-weekDayLabel": {
            color: "#ffffff !important",
            fontSize: "1rem !important",
          }
        }}
      />
      <h2 className="text-[#3b82f6] mb-4 text-3xl text-center font-mono font-bold mt-6">Monthly Calendar</h2>
      <DateCalendar
        views={["day"]}
        slots={{
          day: CustomDay
        }}
      />
    </LocalizationProvider>
  );
}
