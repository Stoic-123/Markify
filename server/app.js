import express from "express";
import { rateLimit } from "express-rate-limit";
import fileUpload from "express-fileupload";
import cors from "cors";
import waterMarkRoute from "./routes/waterMark.js";
const app = express();
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: "draft-8",
  legacyHeaders: false,
});
app.use(limiter);
app.use(express.json());
app.use(fileUpload());
app.use((req, res, next) => {
  const allowed = ["http://localhost:5173", "http://localhost:4173"];
  const origin = req.headers.origin;
  if (allowed.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
  }
  next();
});
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(
  cors("*", {
    origin: ["http://localhost:5173", "https://markify-wheat.vercel.app/"],
    credentials: true,
  })
);
app.use(waterMarkRoute);
app.get("/", (req, res) => {
  res.send("Hello Express..");
});
app.listen("8080", () => {
  console.log("http://localhost:8080");
});
