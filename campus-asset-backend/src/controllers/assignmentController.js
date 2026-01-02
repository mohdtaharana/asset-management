import pool from "../config/db.js";

/**
 * GET all assignments
 * Returns asset_name, staff_name, assigned_date (YYYY-MM-DD)
 */
export const getAssignments = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        a.id,
        ass.asset_name,
        s.name AS staff_name,
        TO_CHAR(a.assigned_date, 'YYYY-MM-DD') AS assigned_date
      FROM assignments a
      JOIN assets ass ON a.asset_id = ass.asset_id
      JOIN staff s ON a.staff_id = s.staff_id
      ORDER BY a.id
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching assignments" });
  }
};

/**
 * GET assignment by ID
 */
export const getAssignmentById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(`
      SELECT
        a.id,
        ass.asset_name,
        s.name AS staff_name,
        TO_CHAR(a.assigned_date, 'YYYY-MM-DD') AS assigned_date
      FROM assignments a
      JOIN assets ass ON a.asset_id = ass.asset_id
      JOIN staff s ON a.staff_id = s.staff_id
      WHERE a.id = $1
    `, [id]);

    if (result.rows.length === 0)
      return res.status(404).json({ message: "Assignment not found" });

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching assignment" });
  }
};

/**
 * CREATE assignment
 * Prevent duplicate assignment of same asset or staff
 */
export const createAssignment = async (req, res) => {
  const { asset_id, staff_id, assigned_date } = req.body;

  try {
    // check if asset or staff already assigned
    const duplicateCheck = await pool.query(
      `SELECT * FROM assignments 
       WHERE asset_id = $1 OR staff_id = $2`,
      [asset_id, staff_id]
    );

    if (duplicateCheck.rows.length > 0) {
      return res.status(400).json({ message: "Asset or Staff is already assigned" });
    }

    const result = await pool.query(
      `INSERT INTO assignments (asset_id, staff_id, assigned_date)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [asset_id, staff_id, assigned_date]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error creating assignment" });
  }
};

/**
 * UPDATE assignment
 * Prevent assigning same asset or staff to multiple assignments
 */
export const updateAssignment = async (req, res) => {
  const { id } = req.params;
  const { asset_id, staff_id, assigned_date } = req.body;

  try {
    // check if another assignment already uses the asset or staff
    const duplicateCheck = await pool.query(
      `SELECT * FROM assignments 
       WHERE id <> $1 AND (asset_id = $2 OR staff_id = $3)`,
      [id, asset_id, staff_id]
    );

    if (duplicateCheck.rows.length > 0) {
      return res.status(400).json({ message: "Asset or Staff is already assigned to another assignment" });
    }

    const result = await pool.query(
      `UPDATE assignments
       SET asset_id = $1,
           staff_id = $2,
           assigned_date = $3
       WHERE id = $4
       RETURNING *`,
      [asset_id, staff_id, assigned_date, id]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ message: "Assignment not found" });

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating assignment" });
  }
};

/**
 * DELETE assignment
 */
export const deleteAssignment = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "DELETE FROM assignments WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ message: "Assignment not found" });

    res.json({ message: "Assignment deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error deleting assignment" });
  }
};
