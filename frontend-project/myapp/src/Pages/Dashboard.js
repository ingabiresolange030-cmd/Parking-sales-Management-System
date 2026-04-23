import React, { useEffect, useState } from "react";
import axios from "axios";

export default function Dashboard() {
  const [data, setData] = useState({
    totalCars: 0,
    availableSlots: 0,
    occupiedSlots: 0,
    totalIncome: 0
  });

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/dashboard");
      setData(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Dashboard</h2>

      <div style={styles.grid}>
        <div style={styles.card}>
          <h3>Total Cars</h3>
          <p>{data.totalCars}</p>
        </div>

        <div style={styles.card}>
          <h3>Available Slots</h3>
          <p>{data.availableSlots}</p>
        </div>

        <div style={styles.card}>
          <h3>Occupied Slots</h3>
          <p>{data.occupiedSlots}</p>
        </div>

        <div style={styles.card}>
          <h3>Total Income</h3>
          <p>{data.totalIncome} RWF</p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: "30px",
    background: "#f1f5f9",
    minHeight: "100vh"
  },
  title: {
    textAlign: "center",
    marginBottom: "20px"
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "20px"
  },
  card: {
    background: "#fff",
    padding: "20px",
    borderRadius: "10px",
    textAlign: "center",
    boxShadow: "0 4px 10px rgba(0,0,0,0.1)"
  }
};