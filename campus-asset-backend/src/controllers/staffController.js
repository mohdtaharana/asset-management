import pool from "../config/db.js";

// GET all staff
export const getStaff = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM staff ORDER BY staff_id");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching staff" });
  }
};

// CREATE staff
export const createStaff = async (req, res) => {
  const { name, role, department, contact } = req.body;

  try {
    const result = await pool.query(
      "INSERT INTO staff (name, role, department, contact) VALUES ($1,$2,$3,$4) RETURNING *",
      [name, role, department, contact]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error creating staff" });
  }
};

// UPDATE staff
export const updateStaff = async (req, res) => {
  const { id } = req.params;
  const { name, role, department, contact } = req.body;

  try {
    const result = await pool.query(
      `UPDATE staff
       SET name=$1, role=$2, department=$3, contact=$4
       WHERE staff_id=$5 RETURNING *`,
      [name, role, department, contact, id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ message: "Staff not found" });

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating staff" });
  }
};

// DELETE staff
export const deleteStaff = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("DELETE FROM staff WHERE staff_id=$1 RETURNING *", [id]);
    if (result.rows.length === 0)
      return res.status(404).json({ message: "Staff not found" });

    res.json({ message: "Staff deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error deleting staff" });
  }
};
