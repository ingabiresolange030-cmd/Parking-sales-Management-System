const express = require("express");
const cors = require("cors");
const db = require("./db"); // MySQL connection (mysql2/promise)
const app = express();
// Middleware
app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());

/* =====================================================
  CAR CRUD
===================================================== */

// Get all cars
app.get("/api/cars", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM Car");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch cars" });
  }
});

// Add car
app.post("/api/cars", async (req, res) => {
  const { PlateNumber, DriverName, PhoneNumber } = req.body;

  if (!PlateNumber || !DriverName || !PhoneNumber) {
    return res.status(400).json({ error: "All fields required" });
  }

  try {
    await db.query(
      "INSERT INTO Car (PlateNumber, DriverName, PhoneNumber) VALUES (?, ?, ?)",
      [PlateNumber, DriverName, PhoneNumber]
    );
    res.json({ message: "Car added successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add car" });
  }
});

// Update car
app.put("/api/cars/:plate", async (req, res) => {
  const { plate } = req.params;
  const { DriverName, PhoneNumber } = req.body;

  try {
    const [result] = await db.query(
      "UPDATE Car SET DriverName=?, PhoneNumber=? WHERE PlateNumber=?",
      [DriverName, PhoneNumber, plate]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Car not found" });
    }

    res.json({ message: "Car updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Update failed" });
  }
});

// Delete car
app.delete("/api/cars/:plate", async (req, res) => {
  try {
    await db.query("DELETE FROM Car WHERE PlateNumber=?", [
      req.params.plate,
    ]);
    res.json({ message: "Car deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Delete failed" });
  }
});

/* =====================================================
    PARKING SLOT CRUD
===================================================== */

// Get slots
app.get("/api/parkingslots", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM ParkingSlot");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch slots" });
  }
});

// Add slot
app.post("/api/parkingslots", async (req, res) => {
  const { SlotNumber, SlotStatus } = req.body;

  if (!SlotNumber) {
    return res.status(400).json({ error: "Slot number required" });
  }

  try {
    await db.query(
      "INSERT INTO ParkingSlot (SlotNumber, SlotStatus) VALUES (?, ?)",
      [SlotNumber, SlotStatus || "Available"]
    );
    res.json({ message: "Slot added successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add slot" });
  }
});

// Update slot
app.put("/api/parkingslots/:slot", async (req, res) => {
  const { SlotStatus } = req.body;

  if (!["Available", "Occupied", "Maintenance"].includes(SlotStatus)) {
    return res.status(400).json({ error: "Invalid SlotStatus" });
  }

  try {
    const [result] = await db.query(
      "UPDATE ParkingSlot SET SlotStatus=? WHERE SlotNumber=?",
      [SlotStatus, req.params.slot]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Slot not found" });
    }

    res.json({ message: "Slot updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Update failed" });
  }
});

// Delete slot
app.delete("/api/parkingslots/:slot", async (req, res) => {
  try {
    await db.query("DELETE FROM ParkingSlot WHERE SlotNumber=?", [
      req.params.slot,
    ]);
    res.json({ message: "Slot deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Delete failed" });
  }
});

/* =====================================================
    PARKING RECORD
===================================================== */

app.post("/api/parkingrecords", async (req, res) => {
  const { PlateNumber, SlotNumber } = req.body;

  if (!PlateNumber || !SlotNumber) {
    return res.status(400).json({
      error: "PlateNumber and SlotNumber are required",
    });
  }

  const conn = await db.getConnection(); // ✅ use connection for transaction

  try {
    await conn.beginTransaction();

    // Check slot
    const [slots] = await conn.query(
      "SELECT SlotStatus FROM ParkingSlot WHERE SlotNumber = ? FOR UPDATE",
      [SlotNumber]
    );

    if (slots.length === 0) {
      await conn.rollback();
      return res.status(404).json({ error: "Slot not found" });
    }

    if (slots[0].SlotStatus !== "Available") {
      await conn.rollback();
      return res.status(400).json({ error: "Slot is not available" });
    }

    // Insert record
    const [result] = await conn.query(
      `INSERT INTO ParkingRecord 
       (PlateNumber, SlotNumber, EntryTime, Duration) 
       VALUES (?, ?, NOW(), 0)`,
      [PlateNumber, SlotNumber]
    );

    // Update slot
    await conn.query(
      "UPDATE ParkingSlot SET SlotStatus = 'Occupied' WHERE SlotNumber = ?",
      [SlotNumber]
    );

    await conn.commit();

    res.status(201).json({
      message: "Car parked successfully",
      RecordID: result.insertId,
    });

  } catch (err) {
    await conn.rollback();
    console.error("INSERT ERROR:", err);

    res.status(500).json({
      error: "Failed to add record",
      sqlMessage: err.sqlMessage,
      code: err.code,
    });
  } finally {
    conn.release();
  }
});
app.put("/api/parkingrecords/exit/:id", async (req, res) => {
  const recordId = req.params.id;

  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    const [records] = await conn.query(
      "SELECT * FROM ParkingRecord WHERE RecordID = ? FOR UPDATE",
      [recordId]
    );

    if (records.length === 0) {
      await conn.rollback();
      return res.status(404).json({ error: "Record not found" });
    }

    const record = records[0];

    if (record.ExitTime) {
      await conn.rollback();
      return res.status(400).json({ error: "Car already exited" });
    }

    const exitTime = new Date();
    const entryTime = new Date(record.EntryTime);

    const durationHours = Math.ceil(
      (exitTime - entryTime) / (1000 * 60 * 60)
    );

    const amount = durationHours * 500;

    // Update record
    await conn.query(
      `UPDATE ParkingRecord 
       SET ExitTime = ?, Duration = ? 
       WHERE RecordID = ?`,
      [exitTime, durationHours, recordId]
    );

    // Free slot
    await conn.query(
      "UPDATE ParkingSlot SET SlotStatus = 'Available' WHERE SlotNumber = ?",
      [record.SlotNumber]
    );

    await conn.commit();

    res.json({
      message: "Car exited successfully",
      durationHours,
      amount,
      exitTime,
    });

  } catch (err) {
    await conn.rollback();
    console.error("EXIT ERROR:", err);

    res.status(500).json({
      error: "Exit failed",
      sqlMessage: err.sqlMessage,
      code: err.code,
    });
  } finally {
    conn.release();
  }
});
app.get("/api/parkingrecords", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM ParkingRecord ORDER BY EntryTime DESC"
    );
    res.json(rows);
  } catch (err) {
    console.error("FETCH ERROR:", err);
    res.status(500).json({
      error: "Failed to fetch records",
      details: err.message,
    });
  }
});

app.delete("/api/parkingrecords/:id", async (req, res) => {
  const id = req.params.id;

  try {
    // Check record first
    const [records] = await db.query(
      "SELECT * FROM ParkingRecord WHERE RecordID=?",
      [id]
    );

    if (records.length === 0) {
      return res.status(404).json({ error: "Record not found" });
    }

    const record = records[0];

    // If car has not exited, free the slot
    if (!record.ExitTime) {
      await db.query(
        "UPDATE ParkingSlot SET SlotStatus='Available' WHERE SlotNumber=?",
        [record.SlotNumber]
      );
    }

    // Delete record
    await db.query(
      "DELETE FROM ParkingRecord WHERE RecordID=?",
      [id]
    );

    res.json({ message: "Record deleted successfully" });

  } catch (err) {
    console.error("DELETE ERROR:", err);

    res.status(500).json({
      error: "Delete failed",
      sqlMessage: err.sqlMessage
    });
  }
});

app.put("/api/parkingrecords/:id", async (req, res) => {
  const id = req.params.id;
  const { ExitTime } = req.body;

  if (!ExitTime) {
    return res.status(400).json({ error: "ExitTime is required" });
  }

  try {

    const [records] = await db.query(
      "SELECT * FROM ParkingRecord WHERE RecordID=?",
      [id]
    );

    if (records.length === 0) {
      return res.status(404).json({ error: "Record not found" });
    }

    const record = records[0];

    const entryTime = new Date(record.EntryTime);
    const exitTime = new Date(ExitTime);


    if (isNaN(exitTime)) {
      return res.status(400).json({ error: "Invalid ExitTime format" });
    }

    if (exitTime < entryTime) {
      return res.status(400).json({ error: "Exit time cannot be before entry time" });
    }

    const duration = Math.ceil(
      (exitTime - entryTime) / (1000 * 60 * 60)
    );


    const totalPaid = duration * 500;

    console.log("Duration:", duration);
    console.log("TotalPaid:", totalPaid);

    await db.query(
      `UPDATE ParkingRecord 
       SET ExitTime=?, Duration=?, TotalPaid=? 
       WHERE RecordID=?`,
      [exitTime, duration, totalPaid, id]
    );

    res.json({
      message: "Record updated successfully",
      duration,
      totalPaid
    });

  } catch (err) {
    console.error("UPDATE ERROR:", err);

    res.status(500).json({
      error: "Update failed",
      sqlMessage: err.sqlMessage
    });
  }
});
app.get("/api/dashboard", async (req, res) => {
  try {
   
    const [[cars]] = await db.query("SELECT COUNT(*) AS totalCars FROM Car");


    const [[available]] = await db.query(
      "SELECT COUNT(*) AS available FROM ParkingSlot WHERE SlotStatus='Available'"
    );

    const [[occupied]] = await db.query(
      "SELECT COUNT(*) AS occupied FROM ParkingSlot WHERE SlotStatus='Occupied'"
    );

    const [[income]] = await db.query(
      "SELECT SUM(AmountPaid) AS totalIncome FROM Payment"
    );

    res.json({
      totalCars: cars.totalCars,
      availableSlots: available.available,
      occupiedSlots: occupied.occupied,
      totalIncome: income.totalIncome || 0,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Dashboard error" });
  }
});

app.get("/api/payments", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        p.PaymentID,
        p.RecordID,
        p.AmountPaid,
        p.PaymentDate,
        r.PlateNumber,
        c.DriverName
      FROM Payment p
      JOIN ParkingRecord r ON p.RecordID = r.RecordID
      LEFT JOIN Car c ON r.PlateNumber = c.PlateNumber
      ORDER BY p.PaymentDate DESC
    `);

    res.json(rows);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch payments" });
  }
});
app.post("/api/payments", async (req, res) => {
  const { RecordID, AmountPaid } = req.body;

  if (!RecordID || !AmountPaid) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    // Check record exists
    const [records] = await db.query(
      "SELECT * FROM ParkingRecord WHERE RecordID=?",
      [RecordID]
    );

    if (records.length === 0) {
      return res.status(404).json({ error: "Parking record not found" });
    }

    // Insert payment
    const [result] = await db.query(
      `INSERT INTO Payment (RecordID, AmountPaid, PaymentDate)
       VALUES (?, ?, NOW())`,
      [RecordID, AmountPaid]
    );

    res.status(201).json({
      message: "Payment added successfully",
      PaymentID: result.insertId
    });

  } catch (err) {
    console.error("INSERT ERROR:", err);
    res.status(500).json({
      error: "Failed to add payment",
      details: err.sqlMessage
    });
  }
});
app.delete("/api/payments/:id", async (req, res) => {
  const id = req.params.id;

  try {
    const [result] = await db.query(
      "DELETE FROM Payment WHERE PaymentID=?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Payment not found" });
    }

    res.json({ message: "Payment deleted successfully" });

  } catch (err) {
    console.error("DELETE ERROR:", err);
    res.status(500).json({
      error: "Delete failed",
      details: err.sqlMessage
    });
  }
});

app.put("/api/parkingrecords/:id", async (req, res) => {
  const id = req.params.id;
  const { ExitTime } = req.body;

  if (!ExitTime) {
    return res.status(400).json({ error: "ExitTime is required" });
  }

  try {
    // 1. Get record
    const [records] = await db.query(
      "SELECT * FROM ParkingRecord WHERE RecordID = ?",
      [id]
    );

    if (records.length === 0) {
      return res.status(404).json({ error: "Record not found" });
    }

    const record = records[0];

    const entryTime = new Date(record.EntryTime);
    const exitTime = new Date(ExitTime);

    if (isNaN(exitTime)) {
      return res.status(400).json({ error: "Invalid ExitTime" });
    }

    // 2. Calculate duration (minimum 1 hour)
    const duration = Math.max(
      1,
      Math.ceil((exitTime - entryTime) / (1000 * 60 * 60))
    );

    // 3. Calculate total
    const totalPaid = duration * 500;

    // 4. Update ParkingRecord
    await db.query(
      `UPDATE ParkingRecord 
       SET ExitTime = ?, Duration = ? 
       WHERE RecordID = ?`,
      [exitTime, duration, id]
    );

    // 5. Insert or update Payment
    await db.query(
      `INSERT INTO Payment (RecordID, AmountPaid, PaymentDate)
       VALUES (?, ?, NOW())
       ON DUPLICATE KEY UPDATE 
       AmountPaid = VALUES(AmountPaid),
       PaymentDate = NOW()`,
      [id, totalPaid]
    );

    // 6. Free slot
    await db.query(
      "UPDATE ParkingSlot SET SlotStatus='Available' WHERE SlotNumber=?",
      [record.SlotNumber]
    );

    res.json({
      message: "Updated successfully",
      duration,
      totalPaid
    });

  } catch (err) {
    console.error("UPDATE ERROR:", err);
    res.status(500).json({
      error: "Update failed",
      details: err.message
    });
  }
});
app.get("/api/report", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        pr.RecordID,
        pr.PlateNumber,
        c.DriverName,
        pr.EntryTime,
        pr.ExitTime,
        pr.Duration,
        IFNULL(p.AmountPaid, 0) AS AmountPaid,
        p.PaymentDate
      FROM ParkingRecord pr
      LEFT JOIN Payment p ON pr.RecordID = p.RecordID
      LEFT JOIN Car c ON pr.PlateNumber = c.PlateNumber
      ORDER BY pr.EntryTime DESC
    `);

    res.json(rows);

  } catch (err) {
    console.error("REPORT ERROR:", err);
    res.status(500).json({
      error: "Failed to fetch report"
    });
  }
});
app.get("/api/report/today", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        pr.RecordID,
        pr.PlateNumber,
        c.DriverName,
        pr.EntryTime,
        pr.ExitTime,
        pr.Duration,
        IFNULL(p.AmountPaid, 0) AS AmountPaid
      FROM ParkingRecord pr
      LEFT JOIN Payment p ON pr.RecordID = p.RecordID
      LEFT JOIN Car c ON pr.PlateNumber = c.PlateNumber
      WHERE DATE(pr.EntryTime) = CURDATE()
      ORDER BY pr.EntryTime DESC
    `);

    res.json(rows);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch today report" });
  }
});

/* =====================================================
   START SERVER
===================================================== */

app.listen(5000, () => {
  console.log(" Server running on http://localhost:5000");
});