import React, { useState, useEffect } from "react";
import axios from "axios";

const API = "http://localhost:5000/api/payments";

// ================= ADD PAYMENT =================
function AddPaymentForm({ onSuccess }) {
  const [formData, setFormData] = useState({
    RecordID: "",
    AmountPaid: ""
  });

  const [error, setError] = useState("");

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.RecordID || !formData.AmountPaid) {
      setError("All fields are required");
      return;
    }

    try {
      await axios.post(API, {
        RecordID: Number(formData.RecordID),
        AmountPaid: Number(formData.AmountPaid)
      });

      setFormData({ RecordID: "", AmountPaid: "" });
      setError("");
      onSuccess();
      alert("Payment Added Successfully");

    } catch (err) {
      console.error(err.response?.data || err);
      setError(err.response?.data?.error || "Failed to add payment");
    }
  };

  return (
    <div style={styles.card}>
      <h2 style={styles.title}>Add Payment</h2>

      {error && <p style={styles.error}>{error}</p>}

      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          style={styles.input}
          name="RecordID"
          placeholder="Record ID"
          value={formData.RecordID}
          onChange={handleChange}
        />

        <input
          style={styles.input}
          name="AmountPaid"
          placeholder="Amount Paid (RWF)"
          value={formData.AmountPaid}
          onChange={handleChange}
        />

        <button style={styles.addBtn}>Add Payment</button>
      </form>
    </div>
  );
}

// ================= MAIN =================
export default function PaymentPage() {
  const [payments, setPayments] = useState([]);

  const fetchPayments = async () => {
    try {
      const res = await axios.get(API);
      console.log("PAYMENTS:", res.data); // debug
      setPayments(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const deletePayment = async (id) => {
    if (!window.confirm("Delete this payment?")) return;

    try {
      await axios.delete(`${API}/${id}`);
      fetchPayments();
      alert("Deleted Successfully");
    } catch (err) {
      console.error(err.response?.data || err);
      alert("Delete Failed");
    }
  };

  return (
    <div style={styles.container}>
      <AddPaymentForm onSuccess={fetchPayments} />

      <h2 style={styles.sectionTitle}>Payment Records</h2>

      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Payment ID</th>
              <th style={styles.th}>Driver Name</th>
              <th style={styles.th}>Plate Number</th>
              <th style={styles.th}>Record ID</th>
              <th style={styles.th}>Amount Paid</th>
              <th style={styles.th}>Payment Date</th>
              <th style={styles.th}>Action</th>
            </tr>
          </thead>

          <tbody>
            {payments.length === 0 ? (
              <tr>
                <td colSpan="7" style={styles.empty}>
                  No payments found
                </td>
              </tr>
            ) : (
              payments.map((p, index) => (
                <tr
                  key={p.PaymentID}
                  style={index % 2 === 0 ? styles.rowEven : styles.rowOdd}
                >
                  <td style={styles.td}>{p.PaymentID}</td>

                  {/* ✅ Driver Name */}
                  <td style={styles.td}>
                    {p.DriverName ? p.DriverName : "N/A"}
                  </td>

                  {/* ✅ Plate Number */}
                  <td style={styles.td}>
                    {p.PlateNumber ? p.PlateNumber : "N/A"}
                  </td>

                  <td style={styles.td}>{p.RecordID}</td>

                  <td style={styles.td}>
                    {p.AmountPaid !== null && p.AmountPaid !== undefined
                      ? p.AmountPaid + " RWF"
                      : "-"}
                  </td>

                  <td style={styles.td}>
                    {p.PaymentDate
                      ? new Date(p.PaymentDate).toLocaleString()
                      : "-"}
                  </td>

                  <td style={styles.td}>
                    <button
                      style={styles.deleteBtn}
                      onClick={() => deletePayment(p.PaymentID)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ================= STYLES =================
const styles = {
  container: {
    padding: "30px",
    background: "#f1f5f9",
    minHeight: "100vh",
    fontFamily: "Arial"
  },

  card: {
    background: "#fff",
    padding: "20px",
    borderRadius: "10px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
    maxWidth: "600px",
    marginBottom: "20px"
  },

  title: {
    marginBottom: "10px",
    color: "#1e3a8a"
  },

  sectionTitle: {
    margin: "20px 0",
    color: "#1e3a8a"
  },

  form: {
    display: "flex",
    gap: "10px"
  },

  input: {
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    flex: "1"
  },

  addBtn: {
    background: "#2563eb",
    color: "#fff",
    border: "none",
    padding: "10px",
    borderRadius: "6px",
    cursor: "pointer"
  },

  deleteBtn: {
    background: "#dc2626",
    color: "#fff",
    border: "none",
    padding: "6px 10px",
    borderRadius: "5px",
    cursor: "pointer"
  },

  tableWrapper: {
    background: "#fff",
    borderRadius: "10px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.05)"
  },

  table: {
    width: "100%",
    borderCollapse: "collapse"
  },

  th: {
    background: "#2563eb",
    color: "#fff",
    padding: "12px"
  },

  td: {
    padding: "10px",
    borderBottom: "1px solid #eee"
  },

  rowEven: {
    background: "#f9fafb"
  },

  rowOdd: {
    background: "#fff"
  },

  empty: {
    textAlign: "center",
    padding: "20px",
    color: "#777"
  },

  error: {
    color: "red"
  }
};