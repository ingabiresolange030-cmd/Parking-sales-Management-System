import React, { useState, useEffect } from "react";
import axios from "axios";

const API = "http://localhost:5000/api/parkingrecords";

const formatDate = (date) =>
  date ? new Date(date).toISOString().slice(0, 19).replace("T", " ") : null;

// ==================== ADD FORM ====================
function AddParkingRecordForm({ onSuccess }) {
  const [formData, setFormData] = useState({
    PlateNumber: "",
    SlotNumber: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.PlateNumber || !formData.SlotNumber) {
      setError("Plate number and slot number are required");
      return;
    }

    try {
      setLoading(true);

      await axios.post(API, {
        PlateNumber: formData.PlateNumber.trim(),
        SlotNumber: Number(formData.SlotNumber)
      });

      setFormData({ PlateNumber: "", SlotNumber: "" });
      setError("");
      onSuccess();
      alert("Record Added Successfully");

    } catch (err) {
      console.error(err.response?.data || err);
      setError(err.response?.data?.error || "Failed to add record");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.card}>
      <h2 style={styles.title}>Add Parking Record</h2>

      {error && <p style={styles.error}>{error}</p>}

      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          style={styles.input}
          name="PlateNumber"
          placeholder="Plate Number"
          value={formData.PlateNumber}
          onChange={handleChange}
        />

        <input
          style={styles.input}
          name="SlotNumber"
          placeholder="Slot Number"
          value={formData.SlotNumber}
          onChange={handleChange}
        />

        <button style={styles.addBtn} disabled={loading}>
          {loading ? "Saving..." : "Add Record"}
        </button>
      </form>
    </div>
  );
}

// ==================== MAIN ====================
export default function ParkingRecord() {
  const [records, setRecords] = useState([]);

  const fetchRecords = async () => {
    const res = await axios.get(API);
    setRecords(res.data);
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const handleExitChange = (id, value) => {
    setRecords(prev =>
      prev.map(r =>
        r.RecordID === id ? { ...r, ExitTime: value } : r
      )
    );
  };

  const updateRecord = async (record) => {
    if (!record.ExitTime) {
      alert("Select Exit Time first");
      return;
    }

    try {
      await axios.put(`${API}/${record.RecordID}`, {
        ExitTime: formatDate(record.ExitTime)
      });

      alert("Updated");
      fetchRecords();

    } catch (err) {
      console.error(err.response?.data || err);
      alert("Update Failed");
    }
  };

  const deleteRecord = async (id) => {
    if (!window.confirm("Delete this record?")) return;

    try {
      await axios.delete(`${API}/${id}`);
      fetchRecords();
      alert("Deleted");

    } catch (err) {
      console.error(err);
      alert("Delete Failed");
    }
  };

  return (
    <div style={styles.container}>
      <AddParkingRecordForm onSuccess={fetchRecords} />

      <h2 style={styles.sectionTitle}>Parking Records</h2>

      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Plate</th>
              <th style={styles.th}>Slot</th>
              <th style={styles.th}>Entry</th>
              <th style={styles.th}>Exit</th>
              <th style={styles.th}>Duration</th>
              <th style={styles.th}>Total Paid</th>
              <th style={styles.th}>Action</th>
            </tr>
          </thead>

          <tbody>
            {records.map((r, index) => (
              <tr
                key={r.RecordID}
                style={index % 2 === 0 ? styles.rowEven : styles.rowOdd}
              >
                <td style={styles.td}>{r.PlateNumber}</td>
                <td style={styles.td}>{r.SlotNumber}</td>
                <td style={styles.td}>
                  {new Date(r.EntryTime).toLocaleString()}
                </td>

                <td style={styles.td}>
                  <input
                    style={styles.inputTable}
                    type="datetime-local"
                    value={
                      r.ExitTime
                        ? new Date(r.ExitTime).toISOString().slice(0, 16)
                        : ""
                    }
                    onChange={(e) =>
                      handleExitChange(r.RecordID, e.target.value)
                    }
                  />
                </td>

                <td style={styles.td}>
                  {r.Duration !== null && r.Duration !== undefined
                    ? r.Duration + " hrs"
                    : "-"}
                </td>

                <td style={styles.td}>
                  {r.TotalPaid !== null && r.TotalPaid !== undefined
                    ? r.TotalPaid + " RWF"
                    : "-"}
                </td>

                <td style={styles.td}>
                  <button
                    style={styles.updateBtn}
                    onClick={() => updateRecord(r)}
                  >
                    Update
                  </button>

                  <button
                    style={styles.deleteBtn}
                    onClick={() => deleteRecord(r.RecordID)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ==================== STYLES ====================
const styles = {
  container: {
    padding: "30px",
    background: "#f1f5f9",
    minHeight: "100vh",
    fontFamily: "Arial"
  },

  title: {
    marginBottom: "10px",
    color: "#1e3a8a"
  },

  sectionTitle: {
    margin: "20px 0",
    color: "#1e3a8a"
  },

  card: {
    background: "#fff",
    padding: "20px",
    borderRadius: "10px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
    maxWidth: "600px"
  },

  form: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap"
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
    padding: "10px 15px",
    borderRadius: "6px",
    cursor: "pointer"
  },

  updateBtn: {
    background: "#16a34a",
    color: "#fff",
    border: "none",
    padding: "6px 10px",
    marginRight: "5px",
    borderRadius: "5px",
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
    overflowX: "auto",
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
    padding: "12px",
    textAlign: "left"
  },

  td: {
    padding: "10px",
    borderBottom: "1px solid #e5e7eb"
  },

  rowEven: {
    background: "#f9fafb"
  },

  rowOdd: {
    background: "#ffffff"
  },

  inputTable: {
    padding: "6px",
    borderRadius: "4px",
    border: "1px solid #ccc"
  },

  error: {
    color: "red"
  }
};