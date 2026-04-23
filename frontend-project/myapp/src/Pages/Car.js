import React, { useState, useEffect } from "react";
import axios from "axios";

const API = "http://localhost:5000/api/cars";

// ================= ADD FORM =================
function AddCarForm({ onSuccess }) {
  const [formData, setFormData] = useState({
    PlateNumber: "",
    DriverName: "",
    PhoneNumber: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.PlateNumber || !formData.DriverName || !formData.PhoneNumber) {
      setError("All fields are required");
      return;
    }

    try {
      setLoading(true);
      await axios.post(API, formData);

      setFormData({ PlateNumber: "", DriverName: "", PhoneNumber: "" });
      setError("");
      onSuccess();
      alert("Car added successfully");

    } catch (err) {
      setError(err.response?.data?.error || "Failed to add car");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.card}>
      <h2 style={styles.title}> Add New Car</h2>

      {error && <p style={styles.error}>{error}</p>}

      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          name="PlateNumber"
          placeholder="Plate Number"
          value={formData.PlateNumber}
          onChange={handleChange}
          style={styles.input}
        />

        <input
          name="DriverName"
          placeholder="Driver Name"
          value={formData.DriverName}
          onChange={handleChange}
          style={styles.input}
        />

        <input
          name="PhoneNumber"
          placeholder="Phone Number"
          value={formData.PhoneNumber}
          onChange={handleChange}
          style={styles.input}
        />

        <button style={styles.addBtn}>
          {loading ? "Saving..." : "Add Car"}
        </button>
      </form>
    </div>
  );
}

// ================= MAIN =================
export default function Car() {
  const [cars, setCars] = useState([]);

  const fetchCars = async () => {
    try {
      const res = await axios.get(API);
      setCars(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCars();
  }, []);

  const handleEdit = (index, field, value) => {
    const updated = [...cars];
    updated[index][field] = value;
    setCars(updated);
  };

  const updateCar = async (car) => {
    try {
      await axios.put(`${API}/${car.PlateNumber}`, {
        DriverName: car.DriverName,
        PhoneNumber: car.PhoneNumber,
      });

      alert("Updated successfully");
      fetchCars();

    } catch (err) {
      alert("Update failed");
    }
  };

  const deleteCar = async (plate) => {
    if (!window.confirm("Delete this car?")) return;

    try {
      await axios.delete(`${API}/${plate}`);
      fetchCars();
      alert("Deleted successfully");

    } catch (err) {
      alert("Delete failed");
    }
  };

  return (
    <div style={styles.container}>
      <AddCarForm onSuccess={fetchCars} />

      <h2 style={styles.sectionTitle}> Car List</h2>

      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Plate</th>
              <th style={styles.th}>Driver</th>
              <th style={styles.th}>Phone</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>

          <tbody>
            {cars.length === 0 ? (
              <tr>
                <td colSpan="4" style={styles.empty}>
                  No cars available
                </td>
              </tr>
            ) : (
              cars.map((car, index) => (
                <tr key={index} style={index % 2 === 0 ? styles.rowEven : styles.rowOdd}>
                  <td style={styles.td}>{car.PlateNumber}</td>

                  <td style={styles.td}>
                    <input
                      value={car.DriverName}
                      onChange={(e) =>
                        handleEdit(index, "DriverName", e.target.value)
                      }
                      style={styles.inputTable}
                    />
                  </td>

                  <td style={styles.td}>
                    <input
                      value={car.PhoneNumber}
                      onChange={(e) =>
                        handleEdit(index, "PhoneNumber", e.target.value)
                      }
                      style={styles.inputTable}
                    />
                  </td>

                  <td style={styles.td}>
                    <button
                      style={styles.updateBtn}
                      onClick={() => updateCar(car)}
                    >
                      Update
                    </button>

                    <button
                      style={styles.deleteBtn}
                      onClick={() => deleteCar(car.PlateNumber)}
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
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    maxWidth: "600px",
    margin: "auto",
  },

  title: {
    marginBottom: "10px",
    color: "#1e3a8a",
  },

  sectionTitle: {
    marginTop: "30px",
    marginBottom: "10px",
    color: "#1e3a8a",
    textAlign: "center",
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
    fontSize: "14px",
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
  },

  rowEven: {
    background: "#f9fafb",
  },

  rowOdd: {
    background: "#fff",
  },

  inputTable: {
    width: "90%",
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
    textAlign: "center",
    padding: "20px",
    color: "#777",
  },
};