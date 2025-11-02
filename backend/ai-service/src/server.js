import express from "express";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(express.json());

app.get("/", (req, res) => res.json({ message: "AI Service running 🚀" }));

const PORT = process.env.PORT || 3010;
app.listen(PORT, () => console.log(`AI Service listening on port ${PORT}`));