import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./config/db.js";
import router from "./routes/authRoutes.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json())

connectDB();

app.use("/api", router)

app.get("/", (req, res) => {
    res.status(200).send("endpoint working")
})

app.listen(process.env.PORT, () => {
    console.log(`Serverr running on port ${process.env.PORT}`)
})