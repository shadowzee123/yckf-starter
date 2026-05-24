import express from "express";
import dotenv from "dotenv";
import helmet from "helmet";
import cors from "cors";

dotenv.config();

import authRoutes from "./routes/auth";
import webhookRoutes from "./routes/webhooks";
import adminRoutes from "./routes/admin"; // <-- ADD THIS
import courseRoutes from "./routes/courses";
import studentRoutes from "./routes/student";
import certificateRoutes from "./routes/certificates";
import paymentRoutes from "./routes/payments";
import botRoutes from "./routes/bots";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(helmet());
app.use(cors());

// optional request logger to help debugging
app.use((req, _res, next) => {
  console.log(`${new Date().toISOString()} -> ${req.method} ${req.path}`);
  next();
});

app.use(
  express.json({
    verify: (req: any, _res, buf) => {
      if (buf && buf.length) req.rawBody = buf.toString("utf8");
    },
  })
);
app.use(express.urlencoded({ extended: true }));

app.get("/", (_req, res) => res.send("YCKF Backend — Running"));

app.use("/api/auth", authRoutes);
app.use("/api/webhooks", webhookRoutes);
app.use("/api/admin", adminRoutes); // <-- MOUNT admin routes here
app.use("/api/courses", courseRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/certificates", certificateRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/bots", botRoutes);

app.listen(PORT, () => console.log(`? Server running on port ${PORT}`));

export default app;
