import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";

const PORT = process.env.PORT;
const app = express();

app.get("/", (req, res) => {
    res.json({ message: "HLS Streaming - Proof of Concept" });
})

app.listen(PORT, () => {
    console.log(`Server is running on PORT ${PORT}`);
})