import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Dashboard from "./Pages/Dashboard";
import Car from "./Pages/Car";
import ParkingSlot from "./Pages/ParkingSlot";
import ParkingRecord from "./Pages/ParkingRecord";
import PaymentPage from "./Pages/Payment";
import Report from "./Pages/Report";

export default function App() {
  return (
    <Router>
      <div style={styles.app}>

        {/* SIDEBAR */}
        <div style={styles.sidebar}>
          <h2 style={styles.logo}>Parking System</h2>

          <nav>
            <Link to="/" style={styles.link}>Dashboard</Link>
            <Link to="/Car" style={styles.link}>Cars</Link>
            <Link to="/ParkingSlot" style={styles.link}>Parking Slots</Link>
            <Link to="/ParkingRecord" style={styles.link}>Parking Records</Link>
            <Link to="/payment" style={styles.link}>Payments</Link>
            <Link to="/Report" style={styles.link}>Reports</Link>
          </nav>
        </div>

        {/* CONTENT */}
        <div style={styles.content}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/Car" element={<Car />} />
            <Route path="/ParkingSlot" element={<ParkingSlot />} />
            <Route path="/ParkingRecord" element={<ParkingRecord />} />
            <Route path="/payment" element={<PaymentPage />} />
            <Route path="/Report" element={<Report />} />
          </Routes>
        </div>

      </div>
    </Router>
  );
}

const styles = {
  app: {
    display: "flex",
    height: "100vh",
    overflow: "hidden"
  },

  // ✅ Sidebar fixed but scrollable
  sidebar: {
    width: "230px",
    background: "#1e3a8a",
    color: "#fff",
    padding: "20px",
    position: "fixed",
    top: 0,
    left: 0,
    bottom: 0,
    overflowY: "auto"
  },

  logo: {
    marginBottom: "25px",
    textAlign: "center"
  },

  link: {
    display: "block",
    color: "#fff",
    textDecoration: "none",
    marginBottom: "12px",
    padding: "10px",
    borderRadius: "6px",
    transition: "0.3s"
  },

 
  linkHover: {
    background: "#2563eb"
  },

  content: {
    marginLeft: "230px",   // match sidebar width
    padding: "20px",
    width: "calc(100% - 230px)",
    height: "100vh",
    overflowY: "auto",     // 🔥 THIS FIXES HIDDEN CONTENT
    background: "#f1f5f9"
  }
};