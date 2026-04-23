import React, { useEffect, useState } from "react";
import axios from "axios";

const API = "http://localhost:5000/api/report";

export default function DailyReport() {
  const [data, setData] = useState([]);
  const [todayData, setTodayData] = useState([]);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  useEffect(() => {
    fetchData();

    // ✅ Live clock
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const fetchData = async () => {
    try {
      const res = await axios.get(API);
      setData(res.data);

      const today = new Date().toDateString();

      const filtered = res.data.filter(item => {
        const entryDate = new Date(item.EntryTime).toDateString();
        return entryDate === today;
      });

      setTodayData(filtered);

    } catch (err) {
      console.error(err);
    }
  };

  // ✅ FORMAT DATE (ENTRY/EXIT)
  const formatDateTime = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ✅ FORMAT LIVE CLOCK
  const formatNow = (date) => {
    return new Date(date).toLocaleString("en-GB", {
      weekday: "long",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    });
  };

  // ✅ STATS
  const totalCars = todayData.length;

  const totalIncome = todayData.reduce(
    (sum, item) => sum + Number(item.AmountPaid || 0),
    0
  );

  const totalExited = todayData.filter(i => i.ExitTime).length;
  const totalParked = todayData.filter(i => !i.ExitTime).length;

  return (
    <div style={styles.container}>

      {/* ✅ LIVE DATE TIME */}
      <div style={styles.header}>
        <h3 style={styles.datetime}>{formatNow(currentDateTime)}</h3>
      </div>

      <h2 style={styles.title}>
        Daily Parking Report ({new Date().toLocaleDateString()})
      </h2>

      {/* ✅ STAT CARDS */}
      <div style={styles.grid}>
        <div style={styles.card}>
          <h4>Total Entries</h4>
          <h2>{totalCars}</h2>
        </div>

        <div style={styles.card}>
          <h4>Cars Parked</h4>
          <h2>{totalParked}</h2>
        </div>

        <div style={styles.card}>
          <h4>Cars Exited</h4>
          <h2>{totalExited}</h2>
        </div>

        <div style={styles.card}>
          <h4>Today's Income</h4>
          <h2>{totalIncome} RWF</h2>
        </div>
      </div>

      {/* ✅ TABLE */}
      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th>Plate</th>
              <th>Entry Time</th>
              <th>Exit Time</th>
              <th>Duration</th>
              <th>Amount</th>
            </tr>
          </thead>

          <tbody>
            {todayData.length > 0 ? (
              todayData.map((item, i) => (
                <tr key={i}>
                  <td>{item.PlateNumber}</td>
                  <td>{formatDateTime(item.EntryTime)}</td>
                  <td>{formatDateTime(item.ExitTime)}</td>
                  <td>
                    {item.Duration ? item.Duration + " hrs" : "-"}
                  </td>
                  <td>
                    {item.AmountPaid
                      ? item.AmountPaid + " RWF"
                      : "-"}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" style={{ textAlign: "center" }}>
                  No records for today
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ==================== STYLES ====================
const styles = {
  container: {
    padding: "25px",
    background: "#f1f5f9",
    minHeight: "100vh"
  },

  header: {
    display: "flex",
    justifyContent: "flex-end",
    marginBottom: "10px"
  },

  datetime: {
    background: "#1e3a8a",
    color: "#fff",
    padding: "8px 15px",
    borderRadius: "8px",
    fontSize: "14px"
  },

  title: {
    marginBottom: "20px",
    color: "#1e3a8a"
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "20px",
    marginBottom: "25px"
  },

  card: {
    background: "#fff",
    padding: "20px",
    borderRadius: "12px",
    textAlign: "center",
    boxShadow: "0 5px 15px rgba(0,0,0,0.1)"
  },

  tableWrapper: {
    background: "#fff",
    borderRadius: "10px",
    overflow: "hidden",
    boxShadow: "0 3px 10px rgba(0,0,0,0.1)"
  },

  table: {
    width: "100%",
    borderCollapse: "collapse"
  }
};