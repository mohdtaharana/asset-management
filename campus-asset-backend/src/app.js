import express from "express";
import cors from "cors";
import path from "path";
import assetRoutes from "./routes/assetRoutes.js";
import staffRoutes from "./routes/staffRoutes.js";
import assignmentRoutes from "./routes/assignmentRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());

// Serve uploads folder using absolute path
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Routes
app.use("/api/assets", assetRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/assignments", assignmentRoutes);

// Optional root route
app.get("/", (req, res) => {
  res.send("Campus Asset Management Backend is running!");
});

export default app;
