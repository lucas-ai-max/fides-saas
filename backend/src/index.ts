import "dotenv/config";
import express from "express";
import cors from "cors";
import compression from "compression";
import { authRouter } from "./routes/auth.js";
import { mobileRouter } from "./routes/mobile.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();
const PORT = process.env.PORT ?? 3001;

app.use(cors({
  origin: true, // Allow all origins for local dev convenience
  credentials: true,
}));
app.use(compression());
app.use(express.json());

app.use("/api/auth", authRouter);
app.use("/api/mobile", mobileRouter);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "fides-backend" });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Backend Fides rodando em http://localhost:${PORT}`);
});
