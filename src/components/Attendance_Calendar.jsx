import * as React from "react";
import dayjs from "dayjs";
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

    return (
      <PickersDay
        {...other}
        day={day}
        outsideCurrentMonth={outsideCurrentMonth}
        sx={{
          backgroundColor: bg,
          color: bg ? "white" : "white",
          fontSize:15,
          margin:"2px",
          fontStyle:"bold",
          "&:hover": {
            backgroundColor: bg || "#e0e0e0",
            color:"black",
          },
            "& .MuiDayCalendar-header > span": {
                color: "white !important",
                fontWeight: "bold",
            }
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
      <DateCalendar
        views={["day"]}
        slots={{
          day: CustomDay
        }}
      />
    </LocalizationProvider>
  );
}
