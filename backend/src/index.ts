import express from "express";
import dotenv from "dotenv";
import helmet from "helmet";
import cors from "cors";
import authRoutes from "./routes/auth";
import adminRoutes from "./routes/admin";
import courseRoutes from "./routes/courses";
import studentRoutes from "./routes/student";
import certificateRoutes from "./routes/certificates";
import paymentRoutes from "./routes/payments";
import botRoutes from "./routes/bots";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (_req, res) => res.send("YCKF Backend - Running"));
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/certificates", certificateRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/bots", botRoutes);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

export default app;
