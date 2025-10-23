import express from "express";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(express.json());

app.get("/", (req, res) => res.json({ message: "Booking Service running 🚀" }));

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => console.log(`Booking Service listening on port ${PORT}`));