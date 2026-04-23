import React, { useState, useEffect } from "react";
import axios from "axios";

const API = "http://localhost:5000/api/parkingslots";

// ================= ADD SLOT =================
function AddParkingSlotForm({ onSuccess }) {
  const [formData, setFormData] = useState({
    SlotNumber: "",
    SlotStatus: "Available",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.SlotNumber) {
      setError("Slot number is required");
      return;
    }

    try {
      setLoading(true);
      await axios.post(API, formData);

      setFormData({ SlotNumber: "", SlotStatus: "Available" });
      setError("");
      onSuccess();
      alert("Slot added successfully");

    } catch (err) {
      setError(err.response?.data?.error || "Failed to add slot");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.card}>
      <h2 style={styles.title}> Add Parking Slot</h2>

      {error && <p style={styles.error}>{error}</p>}

      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          type="number"
          name="SlotNumber"
          placeholder="Slot Number"
          value={formData.SlotNumber}
          onChange={handleChange}
          style={styles.input}
        />

        <select
          name="SlotStatus"
          value={formData.SlotStatus}
          onChange={handleChange}
          style={styles.select}
        >
          <option value="Available">Available</option>
          <option value="Occupied">Occupied</option>
        </select>

        <button style={styles.addBtn}>
          {loading ? "Saving..." : "Add Slot"}
        </button>
      </form>
    </div>
  );
}

// ================= MAIN =================
export default function ParkingSlot() {
  const [slots, setSlots] = useState([]);

  const fetchSlots = async () => {
    try {
      const res = await axios.get(API);
      setSlots(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchSlots();
  }, []);

  const handleEdit = (index, value) => {
    const updated = [...slots];
    updated[index].SlotStatus = value;
    setSlots(updated);
  };

  const updateSlot = async (slot) => {
    try {
      await axios.put(`${API}/${slot.SlotNumber}`, {
        SlotStatus: slot.SlotStatus,
      });

      alert("Updated successfully");
      fetchSlots();

    } catch (err) {
      alert("Update failed");
    }
  };

  const deleteSlot = async (slotNumber) => {
    if (!window.confirm("Delete this slot?")) return;

    try {
      await axios.delete(`${API}/${slotNumber}`);
      fetchSlots();
      alert("Deleted successfully");

    } catch (err) {
      alert("Delete failed");
    }
  };

  return (
    <div style={styles.container}>
      <AddParkingSlotForm onSuccess={fetchSlots} />

      <h2 style={styles.sectionTitle}>Parking Slots</h2>

      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Slot Number</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>

          <tbody>
            {slots.length === 0 ? (
              <tr>
                <td colSpan="3" style={styles.empty}>
                  No parking slots available
                </td>
              </tr>
            ) : (
              slots.map((slot, index) => (
                <tr
                  key={index}
                  style={index % 2 === 0 ? styles.rowEven : styles.rowOdd}
                >
                  <td style={styles.td}>{slot.SlotNumber}</td>

                  <td style={styles.td}>
                    <select
                      value={slot.SlotStatus}
                      onChange={(e) =>
                        handleEdit(index, e.target.value)
                      }
                      style={{
                        ...styles.selectTable,
                        backgroundColor:
                          slot.SlotStatus === "Available"
                            ? "#dcfce7"
                            : "#fee2e2",
                        color:
                          slot.SlotStatus === "Available"
                            ? "#166534"
                            : "#991b1b",
                      }}
                    >
                      <option value="Available">Available</option>
                      <option value="Occupied">Occupied</option>
                    </select>
                  </td>

                  <td style={styles.td}>
                    <button
                      style={styles.updateBtn}
                      onClick={() => updateSlot(slot)}
                    >
                      Update
                    </button>

                    <button
                      style={styles.deleteBtn}
                      onClick={() => deleteSlot(slot.SlotNumber)}
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
    fontFamily: "Arial",
  },

  card: {
    background: "#fff",
    padding: "20px",
    borderRadius: "10px",
    maxWidth: "500px",
    margin: "auto",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  },

  title: {
    marginBottom: "10px",
    color: "#1e3a8a",
  },

  sectionTitle: {
    textAlign: "center",
    marginTop: "30px",
    color: "#1e3a8a",
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },

  input: {
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #ccc",
  },

  select: {
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #ccc",
  },

  addBtn: {
    background: "#2563eb",
    color: "#fff",
    border: "none",
    padding: "10px",
    borderRadius: "6px",
    cursor: "pointer",
  },

  tableWrapper: {
    background: "#fff",
    marginTop: "20px",
    borderRadius: "10px",
    overflow: "hidden",
    boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
  },

  th: {
    background: "#2563eb",
    color: "#fff",
    padding: "12px",
  },

  td: {
    padding: "10px",
    borderBottom: "1px solid #eee",
    textAlign: "center",
  },

  rowEven: {
    background: "#f9fafb",
  },

  rowOdd: {
    background: "#fff",
  },

  selectTable: {
    padding: "6px",
    borderRadius: "4px",
    border: "1px solid #ccc",
  },

  updateBtn: {
    background: "#16a34a",
    color: "#fff",
    border: "none",
    padding: "6px 10px",
    marginRight: "5px",
    borderRadius: "4px",
    cursor: "pointer",
  },

  deleteBtn: {
    background: "#dc2626",
    color: "#fff",
    border: "none",
    padding: "6px 10px",
    borderRadius: "4px",
    cursor: "pointer",
  },

  error: {
    color: "red",
  },

  empty: {
    padding: "20px",
    textAlign: "center",
    color: "#777",
  },
};