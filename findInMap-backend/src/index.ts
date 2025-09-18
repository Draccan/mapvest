import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { mapPointsRouter } from "./routes/mapPoints";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/map-points", mapPointsRouter);

app.get("/health", (req, res) => {
    res.json({ status: "ok", message: "MapVest Backend is running" });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
