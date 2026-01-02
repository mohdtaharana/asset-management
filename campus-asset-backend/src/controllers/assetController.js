import pool from "../config/db.js";
import path from "path";

/**
 * GET all assets
 * image_url bhi return karega
 */
export const getAssets = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT asset_id, asset_name, asset_type, quantity, condition, location,
             purchase_date, image_url
      FROM assets
      ORDER BY asset_id
    `);

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching assets" });
  }
};

/**
 * GET single asset by ID
 */
export const getAssetById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `SELECT asset_id, asset_name, asset_type, quantity, condition, location,
              purchase_date, image_url
       FROM assets WHERE asset_id=$1`,
      [id]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ message: "Asset not found" });

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching asset" });
  }
};

/**
 * CREATE asset
 * image optional
 */
export const createAsset = async (req, res) => {
  try {
    const { asset_name, asset_type, quantity, condition, location, purchase_date } = req.body;
    let image_url = null;

    if (req.file) {
      image_url = `/uploads/${req.file.filename}`;
    }

    const result = await pool.query(
      `INSERT INTO assets (asset_name, asset_type, quantity, condition, location, purchase_date, image_url)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       RETURNING *`,
      [asset_name, asset_type, quantity, condition, location, purchase_date, image_url]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error creating asset" });
  }
};

/**
 * UPDATE asset
 * image optional
 */
export const updateAsset = async (req, res) => {
  const { id } = req.params;
  const { asset_name, asset_type, quantity, condition, location, purchase_date } = req.body;
  let image_url = null;

  if (req.file) {
    image_url = `/uploads/${req.file.filename}`;
  }

  try {
    // Fixed dynamic query with COALESCE for optional image
    const query = `
      UPDATE assets
      SET asset_name=$1,
          asset_type=$2,
          quantity=$3,
          condition=$4,
          location=$5,
          purchase_date=$6,
          image_url = COALESCE($7, image_url)
      WHERE asset_id=$8
      RETURNING *
    `;

    const params = [asset_name, asset_type, quantity, condition, location, purchase_date, image_url, id];

    const result = await pool.query(query, params);

    if (result.rows.length === 0)
      return res.status(404).json({ message: "Asset not found" });

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating asset" });
  }
};

/**
 * DELETE asset
 */
export const deleteAsset = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("DELETE FROM assets WHERE asset_id=$1 RETURNING *", [id]);
    if (result.rows.length === 0)
      return res.status(404).json({ message: "Asset not found" });

    res.json({ message: "Asset deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error deleting asset" });
  }
};
