import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();  // important, load .env

const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false  // must for Neon remote DB
  }
});

export default pool;
